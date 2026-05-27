<?php
declare(strict_types=1);

class RouteController
{
    public static function search(): void
    {
        $fromCity       = trim($_GET['from']           ?? '');
        $toCity         = trim($_GET['to']             ?? '');
        $date           = trim($_GET['date']           ?? date('Y-m-d'));
        $companyId      = (int) ($_GET['company']      ?? 0);
        $originBranchId = (int) ($_GET['origin_branch']?? 0);
        $destBranchId   = (int) ($_GET['dest_branch']  ?? 0);

        $shiftFilter = null;
        $timeFilter = null;
        // Strip datetime if passed (from home shift selector) and extract shift or time
        if (strlen($date) > 10) {
            $extra = substr($date, 11); // Extract after 'T'
            if (in_array($extra, ['day', 'night'])) {
                $shiftFilter = $extra;
            } else {
                $timeFilter = substr($extra, 0, 5); // Extract HH:MM
            }
            $date = substr($date, 0, 10);
        }

        if (!$fromCity || !$toCity) {
            if (!$originBranchId || !$destBranchId) {
                Response::error('from and to cities or branch IDs are required', 422);
            }
        }

        // 1. Resolve Cities
        $resolvedOriginCityId = 0;
        $resolvedDestCityId   = 0;

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
        } elseif ($originBranchId && $destBranchId) {
            $ob = Database::query('SELECT city_id FROM branches WHERE id = ?', [$originBranchId])->fetch();
            $db = Database::query('SELECT city_id FROM branches WHERE id = ?', [$destBranchId])->fetch();
            if ($ob && $db) {
                $resolvedOriginCityId = $ob['city_id'];
                $resolvedDestCityId   = $db['city_id'];
            }
        }

        // 2. Lazy-generate schedules (ensures buses are always available)
        if ($resolvedOriginCityId && $resolvedDestCityId) {
            self::autoSeedAllCompaniesForRoute($resolvedOriginCityId, $resolvedDestCityId);
            self::generateMissingSchedules(
                $resolvedOriginCityId, $resolvedDestCityId,
                $companyId, $date, $originBranchId, $destBranchId
            );
        }

        // 3. Fetch schedules — strict filters applied here
        $params = [];
        $sql = 'SELECT s.*,
                    r.price_standard, r.price_vip, r.price_luxury, r.distance_km, r.estimated_duration_minutes,
                    c.id AS company_id, c.name AS company_name, c.logo_url, c.rating,
                    c.mtn_name, c.mtn_number, c.orange_name, c.orange_number,
                    c.bank_name, c.bank_account, c.bank_account_name,
                    oc.name AS origin_city, dc.name AS dest_city,
                    ob.id AS origin_branch_id, ob.name AS origin_branch, ob.address AS origin_branch_address,
                    db.id AS dest_branch_id,   db.name AS dest_branch,   db.address AS dest_branch_address,
                    b.plate_number, b.bus_signature, b.bus_type, b.total_seats, b.amenities,
                    b.is_faulty
                FROM schedules s
                JOIN routes r      ON s.route_id = r.id
                JOIN companies c   ON r.company_id = c.id
                JOIN cities oc     ON r.origin_city_id = oc.id
                JOIN cities dc     ON r.dest_city_id = dc.id
                JOIN branches ob   ON s.origin_branch_id = ob.id
                JOIN branches db   ON s.dest_branch_id = db.id
                JOIN buses b       ON s.bus_id = b.id
                WHERE s.travel_date = ?
                  AND s.status NOT IN (\'cancelled\', \'arrived\', \'departed\')
                  AND s.available_seats > 0
                  AND c.is_active = 1
                  AND b.is_active = 1
                  AND b.is_faulty = 0';
        $params[] = $date;

        // ── STRICT TIME FILTER ───────────────────────────────────────────────
        // If the date is today, remove any schedule whose departure time has
        // already passed. We add a 5-minute grace window so passengers can still
        // book right as the bus is about to board.
        if ($date === date('Y-m-d')) {
            $sql .= ' AND s.departure_time > DATE_ADD(NOW(), INTERVAL -5 MINUTE)';
        }

        if ($fromCity && $toCity) {
            $sql .= ' AND r.origin_city_id = ? AND r.dest_city_id = ?';
            $params[] = $resolvedOriginCityId;
            $params[] = $resolvedDestCityId;
        }

        // Apply shift filter if a shift was passed
        if ($shiftFilter) {
            $sql .= ' AND s.shift = ?';
            $params[] = $shiftFilter;
        } elseif ($timeFilter) {
            // Apply exact time filter
            $sql .= ' AND s.departure_time LIKE ?';
            $params[] = $timeFilter . '%';
        }

        // User wants to ALWAYS see all companies for the given cities regardless of specific branch/company selection
        // if ($companyId)      { $sql .= ' AND c.id = ?';                   $params[] = $companyId; }
        // if ($originBranchId) { $sql .= ' AND s.origin_branch_id = ?';     $params[] = $originBranchId; }
        // if ($destBranchId)   { $sql .= ' AND s.dest_branch_id = ?';       $params[] = $destBranchId; }

        $sql .= ' ORDER BY s.departure_time ASC';
        $schedules = Database::query($sql, $params)->fetchAll();

        foreach ($schedules as &$s) {
            $s['amenities']     = $s['amenities'] ? json_decode($s['amenities'], true) : [];
            $s['is_faulty']     = (bool) ($s['is_faulty'] ?? false);
            // Expose a display-friendly bus signature (fallback to plate)
            $s['bus_display_id'] = $s['bus_signature'] ?? $s['plate_number'];
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

    /**
     * Ensure every active route always has schedules for the requested date.
     *
     * Rules:
     *  - ALL routes → Day shift (10:00 AM) + Night shift (8:00 PM)
     *  - A faulty bus is skipped and the next available bus is used instead
     *  - Each time-slot gets a DIFFERENT bus from the pool (rotation)
     *  - A schedule is only created if no valid one already exists for that slot
     */
    private static function generateMissingSchedules(
        int $originCityId, int $destCityId,
        int $companyId, string $date,
        int $reqOriginBranchId = 0, int $reqDestBranchId = 0
    ): void {
        $sql    = 'SELECT r.id, r.estimated_duration_minutes, r.company_id
                   FROM routes r
                   JOIN companies c ON r.company_id = c.id
                   WHERE r.origin_city_id = ? AND r.dest_city_id = ?
                     AND r.is_active = 1 AND c.is_active = 1';
        $params = [$originCityId, $destCityId];
        // Generate for ALL companies to satisfy user requirement
        // if ($companyId) { $sql .= ' AND r.company_id = ?'; $params[] = $companyId; }
        $routes = Database::query($sql, $params)->fetchAll();

        foreach ($routes as $route) {
            $duration  = (int) $route['estimated_duration_minutes'];
            $compId    = (int) $route['company_id'];

            // Universal fixed shifts: 10am Day and 8pm Night
            $times = ['10:00:00', '20:00:00'];

            // Resolve branches
            $obId = self::resolveBranch($reqOriginBranchId, $compId, $originCityId);
            $dbId = self::resolveBranch($reqDestBranchId,   $compId, $destCityId);
            if (!$obId || !$dbId) continue;

            // Fetch ALL active, non-faulty buses for this company — ordered so
            // we can rotate them across time slots
            $buses = Database::query(
                'SELECT id, total_seats FROM buses
                 WHERE company_id = ? AND is_active = 1 AND is_faulty = 0
                 ORDER BY id ASC',
                [$compId]
            )->fetchAll();

            if (empty($buses)) continue;

            $busCount = count($buses);
            $slotIdx  = 0; // Used for bus rotation

            foreach ($times as $time) {
                // Check if a valid (non-faulty-bus) schedule already exists
                $exists = Database::query(
                    'SELECT s.id FROM schedules s
                     JOIN buses b ON b.id = s.bus_id
                     WHERE s.route_id = ? AND s.travel_date = ?
                       AND s.departure_time = ?
                       AND s.origin_branch_id = ? AND s.dest_branch_id = ?
                       AND s.status NOT IN (\'cancelled\')
                       AND b.is_faulty = 0',
                    [$route['id'], $date, $time, $obId, $dbId]
                )->fetch();

                if ($exists) { $slotIdx++; continue; }

                // Pick bus by rotation — skip any that became faulty
                $bus = null;
                for ($attempt = 0; $attempt < $busCount; $attempt++) {
                    $candidate = $buses[($slotIdx + $attempt) % $busCount];
                    // Double-check not faulty (belt-and-suspenders, already filtered above)
                    $bus = $candidate;
                    break;
                }

                if (!$bus) { $slotIdx++; continue; }

                // Compute shift label
                $hour  = (int) substr($time, 0, 2);
                $shift = $hour >= 20 ? 'night' : 'day';

                // Compute estimated arrival
                $depTs     = strtotime("$date $time");
                $arrTs     = $depTs + ($duration * 60);
                $arrTime   = date('H:i:s', $arrTs);

                Database::query(
                    'INSERT INTO schedules
                       (route_id, bus_id, origin_branch_id, dest_branch_id,
                        travel_date, departure_time, estimated_arrival_time,
                        shift, available_seats, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'scheduled\')',
                    [
                        $route['id'], $bus['id'], $obId, $dbId,
                        $date, $time, $arrTime,
                        $shift, $bus['total_seats'],
                    ]
                );

                $slotIdx++;
            }
        }
    }

    /**
     * Resolve a branch ID for a company/city combination.
     * Prefers the explicitly requested branch; falls back to first active branch.
     */
    private static function resolveBranch(int $requestedId, int $companyId, int $cityId): ?int
    {
        if ($requestedId) {
            $row = Database::query(
                'SELECT id FROM branches WHERE id = ? AND company_id = ? AND is_active = 1',
                [$requestedId, $companyId]
            )->fetch();
            if ($row) return (int) $row['id'];
        }
        $row = Database::query(
            'SELECT id FROM branches WHERE company_id = ? AND city_id = ? AND is_active = 1 LIMIT 1',
            [$companyId, $cityId]
        )->fetch();
        return $row ? (int) $row['id'] : null;
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

    private static function autoSeedAllCompaniesForRoute(int $originCityId, int $destCityId): void
    {
        $companies = Database::query('SELECT id, name FROM companies WHERE is_active = 1')->fetchAll();
        $originCity = Database::query('SELECT name FROM cities WHERE id = ?', [$originCityId])->fetch();
        $destCity   = Database::query('SELECT name FROM cities WHERE id = ?', [$destCityId])->fetch();
        if (!$originCity || !$destCity) return;
        
        foreach ($companies as $c) {
            $compId = (int) $c['id'];
            $compName = $c['name'];
            
            // 1. Ensure branch exists in origin city
            $ob = Database::query('SELECT id FROM branches WHERE company_id = ? AND city_id = ?', [$compId, $originCityId])->fetch();
            if (!$ob) {
                Database::query(
                    'INSERT INTO branches (company_id, city_id, name, address, is_active) VALUES (?, ?, ?, ?, 1)',
                    [$compId, $originCityId, "$compName {$originCity['name']} Branch", "Main road, {$originCity['name']}"]
                );
            }
            
            // 2. Ensure branch exists in dest city
            $db = Database::query('SELECT id FROM branches WHERE company_id = ? AND city_id = ?', [$compId, $destCityId])->fetch();
            if (!$db) {
                Database::query(
                    'INSERT INTO branches (company_id, city_id, name, address, is_active) VALUES (?, ?, ?, ?, 1)',
                    [$compId, $destCityId, "$compName {$destCity['name']} Branch", "Main road, {$destCity['name']}"]
                );
            }
            
            // 3. Ensure company has at least one bus
            $bus = Database::query('SELECT id FROM buses WHERE company_id = ? AND is_active = 1 AND is_faulty = 0 LIMIT 1', [$compId])->fetch();
            if (!$bus) {
                Database::query(
                    'INSERT INTO buses (company_id, plate_number, name, bus_type, total_seats, is_active) VALUES (?, ?, ?, ?, ?, 1)',
                    [$compId, 'CE-' . rand(1000, 9999) . '-' . chr(rand(65,90)), "$compName Express", 'VIP', 70]
                );
            }
            
            // 4. Ensure route exists
            $route = Database::query(
                'SELECT id FROM routes WHERE company_id = ? AND origin_city_id = ? AND dest_city_id = ?',
                [$compId, $originCityId, $destCityId]
            )->fetch();
            
            if (!$route) {
                $refRoute = Database::query(
                    'SELECT distance_km, price_standard, price_vip, price_luxury, estimated_duration_minutes 
                     FROM routes WHERE origin_city_id = ? AND dest_city_id = ? LIMIT 1',
                    [$originCityId, $destCityId]
                )->fetch();
                
                $distance = $refRoute ? $refRoute['distance_km'] : 350;
                $duration = $refRoute ? $refRoute['estimated_duration_minutes'] : 300;
                $pStd     = $refRoute ? $refRoute['price_standard'] : 5000;
                $pVip     = $refRoute ? $refRoute['price_vip'] : 8000;
                $pLux     = $refRoute ? $refRoute['price_luxury'] : 10000;
                
                Database::query(
                    'INSERT INTO routes (company_id, origin_city_id, dest_city_id, distance_km, price_standard, price_vip, price_luxury, estimated_duration_minutes, is_active) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
                    [$compId, $originCityId, $destCityId, $distance, $pStd, $pVip, $pLux, $duration]
                );
            }
        }
    }
}