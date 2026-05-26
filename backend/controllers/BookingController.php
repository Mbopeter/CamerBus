<?php
declare(strict_types=1);

class BookingController
{
    public static function store(array $body): void
    {
        $auth = AuthMiddleware::handle();
        $userId = (int) $auth['sub'];

        $required = ['schedule_id', 'seat_ids'];
        foreach ($required as $f) {
            if (empty($body[$f])) Response::error("Field '$f' required", 422);
        }

        $scheduleId = (int) $body['schedule_id'];
        $seatIds    = (array) $body['seat_ids'];

        $schedule = Database::query(
            'SELECT s.*, r.price_standard, r.price_vip, b.bus_type
             FROM schedules s JOIN routes r ON s.route_id = r.id JOIN buses b ON s.bus_id = b.id
             WHERE s.id = ? AND s.status NOT IN (\'cancelled\',\'arrived\')', [$scheduleId]
        )->fetch();

        if (!$schedule) Response::error('Schedule not found or unavailable', 404);
        if ($schedule['available_seats'] < count($seatIds)) {
            Response::error('Not enough available seats', 409);
        }

        // Check seats not already booked
        foreach ($seatIds as $seatId) {
            $taken = Database::query(
                'SELECT id FROM booking_seats
                 WHERE seat_id = ? AND schedule_id = ?
                   AND booking_id IN (SELECT id FROM bookings WHERE status NOT IN (\'cancelled\'))',
                [$seatId, $scheduleId]
            )->fetch();
            if ($taken) Response::error("Seat $seatId is already booked", 409);
        }

        // Calculate total
        $pricePerSeat = $schedule['bus_type'] === 'VIP' ? $schedule['price_vip']
                      : ($schedule['bus_type'] === 'Luxury' ? ($schedule['price_luxury'] ?? $schedule['price_vip'])
                      : $schedule['price_standard']);
        $total = $pricePerSeat * count($seatIds);

        Database::beginTransaction();
        try {
            $ref = QRGenerator::generateBookingRef();
            Database::query(
                'INSERT INTO bookings (booking_ref, user_id, schedule_id, total_amount, passenger_count, status)
                 VALUES (?,?,?,?,?,\'pending\')',
                [$ref, $userId, $scheduleId, $total, count($seatIds)]
            );
            $bookingId = (int) Database::lastInsertId();

            foreach ($seatIds as $i => $seatId) {
                $heldUntil = date('Y-m-d H:i:s', time() + 900); // 15 min hold
                Database::query(
                    'INSERT INTO booking_seats (booking_id, seat_id, schedule_id, passenger_name, is_held, held_until)
                     VALUES (?,?,?,?,1,?)',
                    [$bookingId, (int)$seatId, $scheduleId, $body['passengers'][$i]['name'] ?? null, $heldUntil]
                );
            }

            // Decrement available seats
            Database::query(
                'UPDATE schedules SET available_seats = available_seats - ?, booked_seats = booked_seats + ?
                 WHERE id = ?',
                [count($seatIds), count($seatIds), $scheduleId]
            );

            // Insert payment record
            Database::query(
                'INSERT INTO payments (booking_id, amount, method, status) VALUES (?,?,?,\'pending\')',
                [$bookingId, $total, $body['payment_method'] ?? 'mtn_momo']
            );

            Database::commit();

            $booking = Database::query('SELECT * FROM bookings WHERE id = ?', [$bookingId])->fetch();
            $payment = Database::query('SELECT * FROM payments WHERE booking_id = ?', [$bookingId])->fetch();

            Response::success([
                'booking'    => $booking,
                'payment'    => $payment,
                'amount'     => $total,
                'seat_count' => count($seatIds),
            ], 'Booking created successfully', 201);

        } catch (\Throwable $e) {
            Database::rollback();
            Response::error('Booking failed: ' . $e->getMessage(), 500);
        }
    }

    public static function show(string $ref): void
    {
        $auth   = AuthMiddleware::handle();
        $userId = (int) $auth['sub'];

        $booking = Database::query(
            'SELECT bk.*,
                s.travel_date, s.departure_time, s.shift, s.status AS schedule_status,
                r.price_standard, r.price_vip,
                c.name AS company_name, c.logo_url,
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
             WHERE bk.booking_ref = ? AND bk.deleted_at IS NULL', [$ref]
        )->fetch();

        if (!$booking) Response::error('Booking not found', 404);

        // User can only see own booking (admin can see all)
        if ($auth['role'] === 'user' && (int)$booking['user_id'] !== $userId) {
            Response::error('Access denied', 403);
        }

        // Get seats
        $seats = Database::query(
            'SELECT bs.*, se.seat_number, se.seat_type, se.seat_position
             FROM booking_seats bs JOIN seats se ON se.id = bs.seat_id
             WHERE bs.booking_id = ?', [$booking['id']]
        )->fetchAll();

        // Get payment
        $payment = Database::query('SELECT * FROM payments WHERE booking_id = ?', [$booking['id']])->fetch();

        // Get tickets
        $tickets = Database::query('SELECT * FROM tickets WHERE booking_id = ?', [$booking['id']])->fetchAll();

        $booking['seats']   = $seats;
        $booking['payment'] = $payment;
        $booking['tickets'] = $tickets;

        Response::success($booking);
    }

    public static function byUser(int $userId): void
    {
        $auth = AuthMiddleware::handle();
        if ($auth['role'] === 'user' && (int)$auth['sub'] !== $userId) {
            Response::error('Access denied', 403);
        }

        $bookings = Database::query(
            'SELECT bk.*,
                s.travel_date, s.departure_time, s.shift,
                c.name AS company_name, c.logo_url,
                oc.name AS origin_city, dc.name AS dest_city,
                ob.name AS origin_branch, db.name AS dest_branch
             FROM bookings bk
             JOIN schedules s ON bk.schedule_id = s.id
             JOIN routes r    ON s.route_id = r.id
             JOIN companies c ON r.company_id = c.id
             JOIN cities oc   ON r.origin_city_id = oc.id
             JOIN cities dc   ON r.dest_city_id = dc.id
             JOIN branches ob ON s.origin_branch_id = ob.id
             JOIN branches db ON s.dest_branch_id = db.id
             WHERE bk.user_id = ? AND bk.deleted_at IS NULL
             ORDER BY bk.created_at DESC', [$userId]
        )->fetchAll();

        Response::success($bookings);
    }

    public static function cancel(string $ref): void
    {
        $auth   = AuthMiddleware::handle();
        $userId = (int) $auth['sub'];

        $booking = Database::query(
            'SELECT * FROM bookings WHERE booking_ref = ? AND deleted_at IS NULL', [$ref]
        )->fetch();

        if (!$booking) Response::error('Booking not found', 404);
        if ($auth['role'] === 'user' && (int)$booking['user_id'] !== $userId) {
            Response::error('Access denied', 403);
        }
        if ($booking['status'] === 'cancelled') Response::error('Booking already cancelled', 409);

        Database::beginTransaction();
        try {
            Database::query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [$booking['id']]);
            // Release seats
            Database::query(
                'UPDATE schedules SET available_seats = available_seats + ?, booked_seats = booked_seats - ?
                 WHERE id = ?',
                [$booking['passenger_count'], $booking['passenger_count'], $booking['schedule_id']]
            );
            Database::commit();
            Response::success(null, 'Booking cancelled');
        } catch (\Throwable $e) {
            Database::rollback();
            Response::error('Cancellation failed: ' . $e->getMessage(), 500);
        }
    }
}
