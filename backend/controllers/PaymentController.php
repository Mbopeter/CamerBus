<?php
declare(strict_types=1);

class PaymentController
{
    public static function store(array $body): void
    {
        $auth = AuthMiddleware::handle();

        $required = ['booking_id', 'method'];
        foreach ($required as $f) {
            if (empty($body[$f])) Response::error("Field '$f' required", 422);
        }

        $bookingId = (int) $body['booking_id'];
        $booking   = Database::query('SELECT * FROM bookings WHERE id = ?', [$bookingId])->fetch();
        if (!$booking) Response::error('Booking not found', 404);

        // Check user owns booking
        if ($auth['role'] === 'user' && (int)$booking['user_id'] !== (int)$auth['sub']) {
            Response::error('Access denied', 403);
        }

        $existing = Database::query('SELECT id FROM payments WHERE booking_id = ?', [$bookingId])->fetch();
        if ($existing) {
            Database::query(
                'UPDATE payments SET method = ?, payer_name = ?, payer_phone = ?, transaction_ref = ? WHERE id = ?',
                [
                    $body['method'], $body['payer_name'] ?? null,
                    $body['payer_phone'] ?? null, $body['transaction_ref'] ?? null,
                    $existing['id'],
                ]
            );
            Response::success(['payment_id' => $existing['id']], 'Payment updated');
            return; // ← CRITICAL: prevent fall-through to INSERT
        }

        Database::query(
            'INSERT INTO payments (booking_id, amount, method, payer_name, payer_phone, transaction_ref)
             VALUES (?,?,?,?,?,?)',
            [
                $bookingId, $booking['total_amount'], $body['method'],
                $body['payer_name'] ?? null, $body['payer_phone'] ?? null,
                $body['transaction_ref'] ?? null,
            ]
        );
        Response::success(['payment_id' => (int) Database::lastInsertId()], 'Payment record created', 201);
    }

    public static function show(int $id): void
    {
        $auth    = AuthMiddleware::handle();
        $payment = Database::query(
            'SELECT p.*, b.booking_ref, b.user_id, b.total_amount
             FROM payments p JOIN bookings b ON p.booking_id = b.id
             WHERE p.id = ?', [$id]
        )->fetch();

        if (!$payment) Response::error('Payment not found', 404);
        if ($auth['role'] === 'user' && (int)$payment['user_id'] !== (int)$auth['sub']) {
            Response::error('Access denied', 403);
        }

        $receipts = Database::query(
            'SELECT * FROM payment_receipts WHERE payment_id = ?', [$id]
        )->fetchAll();
        $payment['receipts'] = $receipts;

        Response::success($payment);
    }

    public static function uploadProof(int $id): void
    {
        $auth    = AuthMiddleware::handle();
        $payment = Database::query('SELECT p.*, b.user_id FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE p.id = ?', [$id])->fetch();
        if (!$payment) Response::error('Payment not found', 404);
        if ($auth['role'] === 'user' && (int)$payment['user_id'] !== (int)$auth['sub']) {
            Response::error('Access denied', 403);
        }

        if (empty($_FILES['receipt'])) Response::error('No file uploaded', 422);

        try {
            $path = ImageUpload::upload($_FILES['receipt'], 'receipts');
            Database::query(
                'INSERT INTO payment_receipts (payment_id, file_path, file_type, file_size)
                 VALUES (?,?,?,?)',
                [$id, $path, $_FILES['receipt']['type'], $_FILES['receipt']['size']]
            );
            Response::success(['file_path' => $path], 'Receipt uploaded');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public static function approve(int $id, array $body): void
    {
        $auth  = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin', 'branch_admin');

        $payment = Database::query(
            'SELECT p.*, s.origin_branch_id 
             FROM payments p 
             JOIN bookings b ON p.booking_id = b.id 
             JOIN schedules s ON b.schedule_id = s.id 
             WHERE p.id = ?', 
            [$id]
        )->fetch();

        if (!$payment) Response::error('Payment not found', 404);
        if ($payment['status'] === 'approved') Response::error('Already approved', 409);

        // Scope check for branch admin
        if ($auth['role'] === 'branch_admin' && (int)$payment['origin_branch_id'] !== (int)$auth['branch_id']) {
            Response::error('You can only approve payments for departures from your branch', 403);
        }

        Database::beginTransaction();
        try {
            Database::query(
                "UPDATE payments SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?",
                [$auth['sub'], $id]
            );
            Database::query(
                "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
                [$payment['booking_id']]
            );

            // Generate tickets for each seat
            self::generateTickets($payment['booking_id']);

            Database::commit();

            // Notify user
            self::notifyUser($payment['booking_id'], 'payment_approved');

            Response::success(null, 'Payment approved. Tickets generated.');
        } catch (\Throwable $e) {
            Database::rollback();
            Response::error('Approval failed: ' . $e->getMessage(), 500);
        }
    }

    public static function reject(int $id, array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin', 'branch_admin');

        $payment = Database::query(
            'SELECT p.*, s.origin_branch_id 
             FROM payments p 
             JOIN bookings b ON p.booking_id = b.id 
             JOIN schedules s ON b.schedule_id = s.id 
             WHERE p.id = ?', 
            [$id]
        )->fetch();

        if (!$payment) Response::error('Payment not found', 404);

        if ($auth['role'] === 'branch_admin' && (int)$payment['origin_branch_id'] !== (int)$auth['branch_id']) {
            Response::error('You can only reject payments for departures from your branch', 403);
        }

        Database::query(
            "UPDATE payments SET status = 'rejected', rejected_reason = ? WHERE id = ?",
            [$body['reason'] ?? 'Payment rejected by admin', $id]
        );
        Database::query(
            "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
            [$payment['booking_id']]
        );

        self::notifyUser($payment['booking_id'], 'payment_rejected');
        Response::success(null, 'Payment rejected');
    }

    private static function generateTickets(int $bookingId): void
    {
        $booking = Database::query(
            'SELECT bk.*,
                s.travel_date, s.departure_time,
                c.name AS company_name,
                oc.name AS origin_city, dc.name AS dest_city,
                ob.name AS origin_branch, db.name AS dest_branch,
                b.plate_number, b.bus_type
             FROM bookings bk
             JOIN schedules s ON bk.schedule_id = s.id
             JOIN routes r    ON s.route_id = r.id
             JOIN companies c ON r.company_id = c.id
             JOIN cities oc   ON r.origin_city_id = oc.id
             JOIN cities dc   ON r.dest_city_id = dc.id
             JOIN branches ob ON s.origin_branch_id = ob.id
             JOIN branches db ON s.dest_branch_id = db.id
             JOIN buses b     ON s.bus_id = b.id
             WHERE bk.id = ?', [$bookingId]
        )->fetch();

        $seats = Database::query(
            'SELECT bs.*, se.seat_number, se.seat_type, u.full_name AS passenger_name
             FROM booking_seats bs
             JOIN seats se ON se.id = bs.seat_id
             JOIN bookings bk ON bk.id = bs.booking_id
             JOIN users u ON u.id = bk.user_id
             WHERE bs.booking_id = ?', [$bookingId]
        )->fetchAll();

        foreach ($seats as $seat) {
            $code    = QRGenerator::generateTicketCode();
            $payload = QRGenerator::generateTicketPayload([
                'ticket_code'      => $code,
                'booking_ref'      => $booking['booking_ref'],
                'passenger'        => $seat['passenger_name'],
                'route'            => $booking['origin_city'] . ' → ' . $booking['dest_city'],
                'departure_branch' => $booking['origin_branch'],
                'arrival_branch'   => $booking['dest_branch'],
                'seat'             => $seat['seat_number'],
                'departure'        => $booking['travel_date'] . 'T' . $booking['departure_time'],
                'bus_plate'        => $booking['plate_number'],
                'company'          => $booking['company_name'],
            ]);

            Database::query(
                'INSERT INTO tickets (ticket_code, booking_id, booking_seat_id, qr_payload, status)
                 VALUES (?,?,?,?,\'valid\')',
                [$code, $bookingId, $seat['id'], $payload]
            );
        }
    }

    private static function notifyUser(int $bookingId, string $type): void
    {
        $booking = Database::query(
            'SELECT bk.user_id, bk.booking_ref FROM bookings bk WHERE bk.id = ?', [$bookingId]
        )->fetch();
        if (!$booking) return;

        $messages = [
            'payment_approved' => [
                'en' => ['title' => '✅ Payment Approved!', 'body' => 'Your booking ' . $booking['booking_ref'] . ' is confirmed. Your QR ticket is ready.'],
                'fr' => ['title' => '✅ Paiement Approuvé!', 'body' => 'Votre réservation ' . $booking['booking_ref'] . ' est confirmée. Votre billet QR est prêt.'],
            ],
            'payment_rejected' => [
                'en' => ['title' => '❌ Payment Rejected', 'body' => 'Your payment for ' . $booking['booking_ref'] . ' was rejected. Please contact support.'],
                'fr' => ['title' => '❌ Paiement Refusé', 'body' => 'Votre paiement pour ' . $booking['booking_ref'] . ' a été refusé.'],
            ],
        ];

        $msg = $messages[$type] ?? $messages['payment_approved'];
        Database::query(
            'INSERT INTO notifications (user_id, type, title, title_fr, body, body_fr, data)
             VALUES (?,?,?,?,?,?,?)',
            [
                $booking['user_id'], $type,
                $msg['en']['title'], $msg['fr']['title'],
                $msg['en']['body'],  $msg['fr']['body'],
                json_encode(['booking_ref' => $booking['booking_ref']]),
            ]
        );
    }
}
