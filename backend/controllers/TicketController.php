<?php
declare(strict_types=1);

class TicketController
{
    public static function show(string $code): void
    {
        $ticket = Database::query(
            'SELECT t.*,
                bk.booking_ref, bk.user_id,
                bs.passenger_name, bs.passenger_id_no, bs.emergency_contact,
                se.seat_number, se.seat_type,
                s.travel_date, s.departure_time, s.shift,
                c.name AS company_name, c.logo_url,
                oc.name AS origin_city, dc.name AS dest_city,
                ob.name AS origin_branch, db.name AS dest_branch,
                b.plate_number, b.bus_type,
                u.full_name AS account_name, u.phone AS passenger_phone
             FROM tickets t
             JOIN bookings bk ON t.booking_id = bk.id
             JOIN booking_seats bs ON t.booking_seat_id = bs.id
             JOIN seats se ON bs.seat_id = se.id
             JOIN schedules s  ON bk.schedule_id = s.id
             JOIN routes r     ON s.route_id = r.id
             JOIN companies c  ON r.company_id = c.id
             JOIN cities oc    ON r.origin_city_id = oc.id
             JOIN cities dc    ON r.dest_city_id = dc.id
             JOIN branches ob  ON s.origin_branch_id = ob.id
             JOIN branches db  ON s.dest_branch_id = db.id
             JOIN buses b      ON s.bus_id = b.id
             JOIN users u      ON bk.user_id = u.id
             WHERE t.ticket_code = ?', [$code]
        )->fetch();

        if (!$ticket) Response::error('Ticket not found', 404);

        // Generate QR URL
        $ticket['qr_url'] = QRGenerator::generate($ticket['ticket_code']);

        Response::success($ticket);
    }

    public static function validate(string $code, array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin', 'branch_admin');

        $ticket = Database::query('SELECT * FROM tickets WHERE ticket_code = ?', [$code])->fetch();
        if (!$ticket) Response::error('Ticket not found', 404);

        if ($ticket['status'] === 'used') {
            Response::error('Ticket already used at ' . $ticket['used_at'], 409);
        }
        if ($ticket['status'] === 'cancelled') {
            Response::error('Ticket is cancelled', 409);
        }
        if ($ticket['status'] === 'expired') {
            Response::error('Ticket has expired', 410);
        }

        // Verify JWT payload
        try {
            JWT::decode($ticket['qr_payload']);
        } catch (RuntimeException $e) {
            Response::error('Invalid ticket QR: ' . $e->getMessage(), 400);
        }

        Database::query(
            "UPDATE tickets SET status = 'used', used_at = NOW(), validated_by = ? WHERE ticket_code = ?",
            [$auth['sub'], $code]
        );

        Response::success([
            'ticket_code' => $code,
            'validated_at' => date('Y-m-d H:i:s'),
        ], '✅ Ticket valid — passenger may board');
    }
}
