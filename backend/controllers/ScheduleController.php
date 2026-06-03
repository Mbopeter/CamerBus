<?php
declare(strict_types=1);

class ScheduleController
{
    public static function show(int $id): void
    {
        $schedule = Database::query(
            'SELECT s.*,
                r.price_standard, r.price_vip, r.price_luxury, r.distance_km,
                c.name AS company_name, c.logo_url, c.rating,
                oc.name AS origin_city, dc.name AS dest_city,
                ob.name AS origin_branch, ob.address AS origin_address,
                db.name AS dest_branch,   db.address AS dest_address,
                b.plate_number, b.bus_type, b.total_seats
             FROM schedules s
             JOIN routes r    ON s.route_id = r.id
             JOIN companies c ON r.company_id = c.id
             JOIN cities oc   ON r.origin_city_id = oc.id
             JOIN cities dc   ON r.dest_city_id = dc.id
             JOIN branches ob ON s.origin_branch_id = ob.id
             JOIN branches db ON s.dest_branch_id = db.id
             JOIN buses b     ON s.bus_id = b.id
             WHERE s.id = ?', [$id]
        )->fetch();

        if (!$schedule) Response::error('Schedule not found', 404);
        Response::success($schedule);
    }

    public static function store(array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');

        $body = Validator::validate($body, [
            'route_id' => 'required|numeric',
            'bus_id' => 'required|numeric',
            'origin_branch_id' => 'required|numeric',
            'dest_branch_id' => 'required|numeric',
            'travel_date' => 'required',
            'departure_time' => 'required',
            'shift' => 'required'
        ]);

        // Get bus seat count for available_seats
        $bus = Database::query('SELECT total_seats FROM buses WHERE id = ?', [$body['bus_id']])->fetch();
        if (!$bus) Response::error('Bus not found', 404);

        Database::query(
            'INSERT INTO schedules (route_id, bus_id, origin_branch_id, dest_branch_id,
                travel_date, departure_time, estimated_arrival_time, shift, available_seats)
             VALUES (?,?,?,?,?,?,?,?,?)',
            [
                $body['route_id'], $body['bus_id'], $body['origin_branch_id'],
                $body['dest_branch_id'], $body['travel_date'], $body['departure_time'],
                $body['estimated_arrival_time'] ?? null, $body['shift'], $bus['total_seats'],
            ]
        );

        Response::success(['id' => (int) Database::lastInsertId()], 'Schedule created', 201);
    }

    public static function markDeparted(int $id): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin', 'branch_admin');
        Database::query("UPDATE schedules SET status = 'departed' WHERE id = ?", [$id]);
        Response::success(null, 'Marked as departed');
    }
}
