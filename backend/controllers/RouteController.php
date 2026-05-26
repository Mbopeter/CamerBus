<?php
declare(strict_types=1);

class RouteController
{
    public static function search(): void
    {
        $fromCity  = trim($_GET['from']       ?? '');
        $toCity    = trim($_GET['to']         ?? '');
        $date      = trim($_GET['date']       ?? date('Y-m-d'));
        $companyId = (int) ($_GET['company']  ?? 0);
        $originBranchId = (int) ($_GET['origin_branch'] ?? 0);
        $destBranchId   = (int) ($_GET['dest_branch'] ?? 0);

        if (!$fromCity || !$toCity) {
            if (!$originBranchId || !$destBranchId) {
                Response::error('from and to cities or branch IDs are required', 422);
            }
        }

        // 1. Resolve Cities & Trigger Lazy Schedule Generation
        $resolvedOriginCityId = 0;
        $resolvedDestCityId = 0;

        if ($fromCity && $toCity) {
            $originCity = is_numeric($fromCity)
                ? Database::query('SELECT * FROM cities WHERE id = ?', [(int)$fromCity])->fetch()
                : Database::query('SELECT * FROM cities WHERE name LIKE ?', ["%$fromCity%"])->fetch();

            $destCity = is_numeric($toCity)
                ? Database::query('SELECT * FROM cities WHERE id = ?', [(int)$toCity])->fetch()
                : Database::query('SELECT * FROM cities WHERE name LIKE ?', ["%$toCity%"])->fetch();

            if (!$originCity) Response::error("Origin city '$fromCity' not found", 404);
            if (!$destCity)   Response::error("Destination city '$toCity' not found", 404);
            
            $resolvedOriginCityId = $originCity['id'];
            $resolvedDestCityId   = $destCity['id'];
        } else if ($originBranchId && $destBranchId) {
            $ob = Database::query('SELECT city_id FROM branches WHERE id = ?', [$originBranchId])->fetch();
            $db = Database::query('SELECT city_id FROM branches WHERE id = ?', [$destBranchId])->fetch();
            if ($ob && $db) {
                $resolvedOriginCityId = $ob['city_id'];
                $resolvedDestCityId   = $db['city_id'];
            }
        }

        if ($resolvedOriginCityId && $resolvedDestCityId) {
            self::generateMissingSchedules($resolvedOriginCityId, $resolvedDestCityId, $companyId, $date, $originBranchId, $destBranchId);
        }

        // 2. Fetch Schedules
        $params = [];
        $sql = 'SELECT s.*, 
                    r.price_standard, r.price_vip, r.price_luxury, r.distance_km, r.estimated_duration_minutes,
                    c.id AS company_id, c.name AS company_name, c.logo_url, c.rating,
                    c.mtn_name, c.mtn_number, c.orange_name, c.orange_number,
                    c.bank_name, c.bank_account, c.bank_account_name,
                    oc.name AS origin_city, dc.name AS dest_city,
                    ob.id AS origin_branch_id, ob.name AS origin_branch, ob.address AS origin_branch_address,
                    db.id AS dest_branch_id,   db.name AS dest_branch,   db.address AS dest_branch_address,
                    b.plate_number, b.bus_type, b.total_seats, b.amenities
                FROM schedules s
                JOIN routes r      ON s.route_id = r.id
                JOIN companies c   ON r.company_id = c.id
                JOIN cities oc     ON r.origin_city_id = oc.id
                JOIN cities dc     ON r.dest_city_id = dc.id
                JOIN branches ob   ON s.origin_branch_id = ob.id
                JOIN branches db   ON s.dest_branch_id = db.id
                JOIN buses b       ON s.bus_id = b.id
                WHERE s.travel_date = ?
                  AND s.status NOT IN (\'cancelled\', \'arrived\')
                  AND s.available_seats > 0
                  AND c.is_active = 1';
        $params[] = $date;

        // Time Validation: Filter past times if travel_date is today
        if ($date === date('Y-m-d')) {
            $sql .= ' AND s.departure_time > ?';
            $params[] = date('H:i:s');
        }

        if ($fromCity && $toCity) {
            $sql .= ' AND r.origin_city_id = ? AND r.dest_city_id = ?';
            $params[] = $resolvedOriginCityId;
            $params[] = $resolvedDestCityId;
        }

        if ($companyId) { $sql .= ' AND c.id = ?'; $params[] = $companyId; }
        if ($originBranchId) { $sql .= ' AND s.origin_branch_id = ?'; $params[] = $originBranchId; }
        if ($destBranchId) { $sql .= ' AND s.dest_branch_id = ?'; $params[] = $destBranchId; }

        $sql .= ' ORDER BY s.departure_time ASC';
        $schedules = Database::query($sql, $params)->fetchAll();

        foreach ($schedules as &$s) {
            $s['amenities'] = $s['amenities'] ? json_decode($s['amenities'], true) : [];
        }

        if (!isset($originCity) || !$originCity) {
            $originCity = $originBranchId
                ? Database::query('SELECT ci.* FROM branches b JOIN cities ci ON ci.id = b.city_id WHERE b.id = ?', [$originBranchId])->fetch()
                : null;
        }
        if (!isset($destCity) || !$destCity) {
            $destCity = $destBranchId
                ? Database::query('SELECT ci.* FROM branches b JOIN cities ci ON ci.id = b.city_id WHERE b.id = ?', [$destBranchId])->fetch()
                : null;
        }

        Response::success([
            'origin_city'      => $originCity ?? null,
            'destination_city' => $destCity ?? null,
            'date'             => $date,
            'schedules'        => $schedules,
            'count'            => count($schedules),
        ]);
    }

    private static function generateMissingSchedules(int $originCityId, int $destCityId, int $companyId, string $date, int $reqOriginBranchId = 0, int $reqDestBranchId = 0): void
    {
        $sql = 'SELECT r.id, r.estimated_duration_minutes, r.company_id 
                FROM routes r JOIN companies c ON r.company_id = c.id 
                WHERE r.origin_city_id = ? AND r.dest_city_id = ? AND r.is_active = 1 AND c.is_active = 1';
        $params = [$originCityId, $destCityId];
        if ($companyId) {
            $sql .= ' AND r.company_id = ?';
            $params[] = $companyId;
        }
        $routes = Database::query($sql, $params)->fetchAll();

        foreach ($routes as $route) {
            $duration = (int)$route['estimated_duration_minutes'];
            
            // Shift logic based on duration
            if ($duration >= 360) {
                $times = ['10:00:00', '20:00:00'];
            } else {
                $times = ['06:00:00', '08:00:00', '10:00:00', '12:00:00', '14:00:00', '16:00:00', '18:00:00'];
            }

            foreach ($times as $time) {
                // Determine origin branch
                $obId = null;
                if ($reqOriginBranchId) {
                    $check = Database::query('SELECT id FROM branches WHERE id = ? AND company_id = ? AND is_active = 1', [$reqOriginBranchId, $route['company_id']])->fetch();
                    if ($check) $obId = $reqOriginBranchId;
                }
                if (!$obId) {
                    $ob = Database::query('SELECT id FROM branches WHERE company_id = ? AND city_id = ? AND is_active = 1 LIMIT 1', [$route['company_id'], $originCityId])->fetch();
                    if ($ob) $obId = $ob['id'];
                }

                // Determine dest branch
                $dbId = null;
                if ($reqDestBranchId) {
                    $check = Database::query('SELECT id FROM branches WHERE id = ? AND company_id = ? AND is_active = 1', [$reqDestBranchId, $route['company_id']])->fetch();
                    if ($check) $dbId = $reqDestBranchId;
                }
                if (!$dbId) {
                    $db = Database::query('SELECT id FROM branches WHERE company_id = ? AND city_id = ? AND is_active = 1 LIMIT 1', [$route['company_id'], $destCityId])->fetch();
                    if ($db) $dbId = $db['id'];
                }

                $bus = Database::query('SELECT id, total_seats FROM buses WHERE company_id = ? AND is_active = 1 LIMIT 1', [$route['company_id']])->fetch();

                if ($obId && $dbId && $bus) {
                    $exists = Database::query(
                        'SELECT id FROM schedules WHERE route_id = ? AND travel_date = ? AND departure_time = ? AND origin_branch_id = ? AND dest_branch_id = ?',
                        [$route['id'], $date, $time, $obId, $dbId]
                    )->fetch();

                    if (!$exists) {
                        $shift = (int)substr($time, 0, 2) >= 18 ? 'night' : 'morning';
                        Database::query(
                            'INSERT INTO schedules (route_id, bus_id, origin_branch_id, dest_branch_id, travel_date, departure_time, shift, available_seats, status)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'scheduled\')',
                            [$route['id'], $bus['id'], $obId, $dbId, $date, $time, $shift, $bus['total_seats']]
                        );
                    }
                }
            }
        }
    }

    public static function byCompany(int $companyId): void
    {
        $routes = Database::query(
            'SELECT r.*, oc.name AS origin_city, dc.name AS dest_city
             FROM routes r
             JOIN cities oc ON oc.id = r.origin_city_id
             JOIN cities dc ON dc.id = r.dest_city_id
             WHERE r.company_id = ? AND r.is_active = 1
             ORDER BY oc.name, dc.name', [$companyId]
        )->fetchAll();
        Response::success($routes);
    }
}
