<?php
declare(strict_types=1);

class AdminController
{
    public static function dashboard(): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');

        $stats = [
            'total_bookings'   => 0,
            'pending_payments' => 0,
            'confirmed_today'  => 0,
            'total_revenue'    => 0, // Left 0 for super_admin
            'today_revenue'    => 0, // Left 0 for super_admin
            'total_parcels'    => 0,
            'active_schedules' => 0,
            'total_companies'  => 0,
        ];

        $pendingPayments = [];
        $departures      = [];

        if ($auth['role'] === 'super_admin') {
            $stats['total_bookings']  = (int) Database::query("SELECT COUNT(*) FROM bookings WHERE status != 'cancelled'")->fetchColumn();
            $stats['pending_payments']= (int) Database::query("SELECT COUNT(*) FROM payments WHERE status = 'pending'")->fetchColumn();
            $stats['confirmed_today'] = (int) Database::query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND DATE(created_at) = CURDATE()")->fetchColumn();
            $stats['total_parcels']   = (int) Database::query("SELECT COUNT(*) FROM parcel_shipments")->fetchColumn();
            $stats['active_schedules']= (int) Database::query("SELECT COUNT(*) FROM schedules WHERE travel_date >= CURDATE() AND status = 'scheduled'")->fetchColumn();
            $stats['total_companies'] = (int) Database::query("SELECT COUNT(*) FROM companies WHERE is_active = 1")->fetchColumn();

            $pendingPayments = Database::query(
                "SELECT p.id, p.amount, p.method, p.created_at,
                        b.booking_ref, u.full_name AS passenger, u.phone
                 FROM payments p
                 JOIN bookings b ON p.booking_id = b.id
                 JOIN users u    ON b.user_id = u.id
                 WHERE p.status = 'pending'
                 ORDER BY p.created_at ASC
                 LIMIT 10"
            )->fetchAll();

            $departures = Database::query(
                "SELECT s.id, s.departure_time, s.shift, s.status, s.booked_seats, s.available_seats,
                        c.name AS company_name, oc.name AS origin_city, dc.name AS dest_city,
                        b.plate_number, b.bus_type
                 FROM schedules s
                 JOIN routes r    ON s.route_id = r.id
                 JOIN companies c ON r.company_id = c.id
                 JOIN cities oc   ON r.origin_city_id = oc.id
                 JOIN cities dc   ON r.dest_city_id = dc.id
                 JOIN buses b     ON s.bus_id = b.id
                 WHERE s.travel_date = CURDATE()
                 ORDER BY s.departure_time ASC
                 LIMIT 20"
            )->fetchAll();

        } else if ($auth['role'] === 'company_admin') {
            $cId = (int) $auth['company_id'];

            $stats['total_bookings']  = (int) Database::query("SELECT COUNT(*) FROM bookings bk JOIN schedules s ON bk.schedule_id = s.id JOIN routes r ON s.route_id = r.id WHERE bk.status != 'cancelled' AND r.company_id = ?", [$cId])->fetchColumn();
            $stats['pending_payments']= (int) Database::query("SELECT COUNT(*) FROM payments p JOIN bookings bk ON p.booking_id = bk.id JOIN schedules s ON bk.schedule_id = s.id JOIN routes r ON s.route_id = r.id WHERE p.status = 'pending' AND r.company_id = ?", [$cId])->fetchColumn();
            $stats['confirmed_today'] = (int) Database::query("SELECT COUNT(*) FROM bookings bk JOIN schedules s ON bk.schedule_id = s.id JOIN routes r ON s.route_id = r.id WHERE bk.status = 'confirmed' AND DATE(bk.created_at) = CURDATE() AND r.company_id = ?", [$cId])->fetchColumn();
            $stats['total_revenue']   = (float) Database::query("SELECT COALESCE(SUM(p.amount),0) FROM payments p JOIN bookings bk ON p.booking_id = bk.id JOIN schedules s ON bk.schedule_id = s.id JOIN routes r ON s.route_id = r.id WHERE p.status = 'approved' AND r.company_id = ?", [$cId])->fetchColumn();
            $stats['today_revenue']   = (float) Database::query("SELECT COALESCE(SUM(p.amount),0) FROM payments p JOIN bookings bk ON p.booking_id = bk.id JOIN schedules s ON bk.schedule_id = s.id JOIN routes r ON s.route_id = r.id WHERE p.status = 'approved' AND DATE(p.approved_at) = CURDATE() AND r.company_id = ?", [$cId])->fetchColumn();
            $stats['total_parcels']   = (int) Database::query("SELECT COUNT(*) FROM parcel_shipments WHERE company_id = ?", [$cId])->fetchColumn();
            $stats['active_schedules']= (int) Database::query("SELECT COUNT(*) FROM schedules s JOIN routes r ON s.route_id = r.id WHERE s.travel_date >= CURDATE() AND s.status = 'scheduled' AND r.company_id = ?", [$cId])->fetchColumn();
            $stats['total_companies'] = 1;

            $pendingPayments = Database::query(
                "SELECT p.id, p.amount, p.method, p.created_at,
                        bk.booking_ref, u.full_name AS passenger, u.phone
                 FROM payments p
                 JOIN bookings bk ON p.booking_id = bk.id
                 JOIN schedules s ON bk.schedule_id = s.id
                 JOIN routes r    ON s.route_id = r.id
                 JOIN users u     ON bk.user_id = u.id
                 WHERE p.status = 'pending' AND r.company_id = ?
                 ORDER BY p.created_at ASC
                 LIMIT 10",
                [$cId]
            )->fetchAll();

            $departures = Database::query(
                "SELECT s.id, s.departure_time, s.shift, s.status, s.booked_seats, s.available_seats,
                        c.name AS company_name, oc.name AS origin_city, dc.name AS dest_city,
                        b.plate_number, b.bus_type
                 FROM schedules s
                 JOIN routes r    ON s.route_id = r.id
                 JOIN companies c ON r.company_id = c.id
                 JOIN cities oc   ON r.origin_city_id = oc.id
                 JOIN cities dc   ON r.dest_city_id = dc.id
                 JOIN buses b     ON s.bus_id = b.id
                 WHERE s.travel_date = CURDATE() AND r.company_id = ?
                 ORDER BY s.departure_time ASC
                 LIMIT 20",
                [$cId]
            )->fetchAll();
        }

        Response::success([
            'stats'           => $stats,
            'pending_payments'=> $pendingPayments,
            'todays_departures'=> $departures,
        ]);
    }

    public static function pendingPayments(): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');

        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;

        if ($auth['role'] === 'company_admin') {
            $totalQuery = "SELECT COUNT(*) FROM payments p JOIN bookings b ON p.booking_id = b.id JOIN schedules s ON b.schedule_id = s.id JOIN routes r ON s.route_id = r.id WHERE p.status = 'pending' AND r.company_id = " . (int)$auth['company_id'];
        } elseif ($auth['role'] === 'branch_admin') {
            $totalQuery = "SELECT COUNT(*) FROM payments p JOIN bookings b ON p.booking_id = b.id JOIN schedules s ON b.schedule_id = s.id WHERE p.status = 'pending' AND s.origin_branch_id = " . (int)$auth['branch_id'];
        } else {
            $totalQuery = "SELECT COUNT(*) FROM payments WHERE status = 'pending'";
        }
        $total = (int) Database::query($totalQuery)->fetchColumn();

        $where = "WHERE p.status = 'pending'";
        $params = [];
        if ($auth['role'] === 'company_admin') {
            $where .= " AND r.company_id = ?";
            $params[] = (int) $auth['company_id'];
        } elseif ($auth['role'] === 'branch_admin') {
            $where .= " AND s.origin_branch_id = ?";
            $params[] = (int) $auth['branch_id'];
        }
        $params[] = $limit;
        $params[] = $offset;

        $payments = Database::query(
            "SELECT p.*, b.booking_ref, b.passenger_count,
                    u.full_name AS passenger_name, u.phone,
                    s.travel_date, s.departure_time,
                    c.name AS company_name,
                    oc.name AS origin_city, dc.name AS dest_city
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             JOIN users u    ON b.user_id = u.id
             JOIN schedules s ON b.schedule_id = s.id
             JOIN routes r    ON s.route_id = r.id
             JOIN companies c ON r.company_id = c.id
             JOIN cities oc   ON r.origin_city_id = oc.id
             JOIN cities dc   ON r.dest_city_id = dc.id
             $where
             ORDER BY p.created_at ASC
             LIMIT ? OFFSET ?",
            $params
        )->fetchAll();

        // Attach receipts
        foreach ($payments as &$pay) {
            $pay['receipts'] = Database::query(
                'SELECT * FROM payment_receipts WHERE payment_id = ?', [$pay['id']]
            )->fetchAll();
        }

        Response::paginate($payments, $total, $page, $limit);
    }

    public static function allBookings(): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin', 'branch_admin');

        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $status = $_GET['status'] ?? '';
        $limit  = 25;
        $offset = ($page - 1) * $limit;

        $where  = "WHERE 1=1";
        $params = [];

        if ($status) {
            $where .= " AND bk.status = ?";
            $params[] = $status;
        }

        if ($auth['role'] === 'company_admin') {
            $where .= " AND r.company_id = ?";
            $params[] = (int) $auth['company_id'];
        } elseif ($auth['role'] === 'branch_admin') {
            $where .= " AND s.origin_branch_id = ?";
            $params[] = (int) $auth['branch_id'];
        }

        $params[] = $limit;
        $params[] = $offset;

        $totalQueryParams = [];
        if ($status) $totalQueryParams[] = $status;
        if ($auth['role'] === 'company_admin') $totalQueryParams[] = (int) $auth['company_id'];
        elseif ($auth['role'] === 'branch_admin') $totalQueryParams[] = (int) $auth['branch_id'];

        $total = (int) Database::query(
            "SELECT COUNT(*) FROM bookings bk
             JOIN schedules s ON bk.schedule_id = s.id
             JOIN routes r ON s.route_id = r.id
             $where", $totalQueryParams
        )->fetchColumn();

        $bookings = Database::query(
            "SELECT bk.*, u.full_name, u.phone,
                s.travel_date, s.departure_time,
                c.name AS company_name,
                oc.name AS origin_city, dc.name AS dest_city
             FROM bookings bk
             JOIN users u      ON bk.user_id = u.id
             JOIN schedules s  ON bk.schedule_id = s.id
             JOIN routes r     ON s.route_id = r.id
             JOIN companies c  ON r.company_id = c.id
             JOIN cities oc    ON r.origin_city_id = oc.id
             JOIN cities dc    ON r.dest_city_id = dc.id
             $where
             ORDER BY bk.created_at DESC
             LIMIT ? OFFSET ?",
            $params
        )->fetchAll();

        Response::paginate($bookings, $total, $page, $limit);
    }

    public static function allParcels(): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin', 'branch_admin');

        $status = $_GET['status'] ?? '';
        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = 25;
        $offset = ($page - 1) * $limit;

        $where  = "WHERE 1=1";
        $params = [];

        if ($status) {
            $where .= " AND ps.status = ?";
            $params[] = $status;
        }

        if ($auth['role'] === 'company_admin') {
            $where .= " AND ps.company_id = ?";
            $params[] = (int) $auth['company_id'];
        } elseif ($auth['role'] === 'branch_admin') {
            $where .= " AND (ps.origin_branch_id = ? OR ps.dest_branch_id = ?)";
            $params[] = (int) $auth['branch_id'];
            $params[] = (int) $auth['branch_id'];
        }

        $params[] = $limit;
        $params[] = $offset;

        $totalQueryParams = [];
        if ($status) $totalQueryParams[] = $status;
        if ($auth['role'] === 'company_admin') {
            $totalQueryParams[] = (int) $auth['company_id'];
        } elseif ($auth['role'] === 'branch_admin') {
            $totalQueryParams[] = (int) $auth['branch_id'];
            $totalQueryParams[] = (int) $auth['branch_id'];
        }

        $total = (int) Database::query(
            "SELECT COUNT(*) FROM parcel_shipments ps $where", $totalQueryParams
        )->fetchColumn();

        $parcels = Database::query(
            "SELECT ps.*, ob.name AS origin_branch, db.name AS dest_branch,
                oc.name AS origin_city, dc.name AS dest_city, c.name AS company_name
             FROM parcel_shipments ps
             JOIN branches ob ON ps.origin_branch_id = ob.id
             JOIN branches db ON ps.dest_branch_id = db.id
             JOIN cities oc   ON ob.city_id = oc.id
             JOIN cities dc   ON db.city_id = dc.id
             JOIN companies c ON ps.company_id = c.id
             $where ORDER BY ps.created_at DESC LIMIT ? OFFSET ?",
            $params
        )->fetchAll();

        Response::paginate($parcels, $total, $page, $limit);
    }

    public static function createCompany(array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin');
        CompanyController::store($body);
    }

    public static function deleteCompany(int $id): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin');

        Database::query("UPDATE companies SET is_active = 0, deleted_at = NOW() WHERE id = ?", [$id]);
        
        // Soft-delete cascades
        Database::query("UPDATE branches SET is_active = 0 WHERE company_id = ?", [$id]);
        Database::query("UPDATE routes SET is_active = 0 WHERE company_id = ?", [$id]);
        Database::query("UPDATE buses SET is_active = 0 WHERE company_id = ?", [$id]);
        Database::query("UPDATE admins SET is_active = 0, deleted_at = NOW() WHERE company_id = ?", [$id]);
        
        // Cancel all future unbooked schedules for this company
        Database::query(
            "UPDATE schedules s 
             JOIN routes r ON s.route_id = r.id 
             SET s.status = 'cancelled' 
             WHERE r.company_id = ? AND s.travel_date >= CURDATE() AND s.status IN ('scheduled', 'boarding') AND s.booked_seats = 0", 
            [$id]
        );

        Response::success(null, 'Company deleted');
    }

    public static function createRoute(array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin');

        $body = Validator::validate($body, [
            'company_id' => 'required|numeric',
            'origin_city_id' => 'required|numeric',
            'dest_city_id' => 'required|numeric',
            'price_standard' => 'required|numeric',
            'price_vip' => 'required|numeric',
            'estimated_duration_minutes' => 'required|numeric'
        ]);

        try {
            Database::query(
                'INSERT INTO routes (company_id, origin_city_id, dest_city_id, distance_km, price_standard, price_vip, price_luxury, estimated_duration_minutes)
                 VALUES (?,?,?,?,?,?,?,?)',
                [
                    $body['company_id'], $body['origin_city_id'], $body['dest_city_id'],
                    $body['distance_km'] ?? 0, $body['price_standard'], $body['price_vip'],
                    $body['price_luxury'] ?? null, $body['estimated_duration_minutes']
                ]
            );
            Response::success(['id' => (int) Database::lastInsertId()], 'Route created', 201);
        } catch (Exception $e) {
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                Response::error('This route already exists for this company', 409);
            }
            throw $e;
        }
    }

    public static function deleteRoute(int $id): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin');
        Database::query("UPDATE routes SET is_active = 0 WHERE id = ?", [$id]);
        Response::success(null, 'Route deactivated');
    }

    public static function createBus(array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');

        $body = Validator::validate($body, [
            'company_id' => 'required|numeric',
            'plate_number' => 'required',
            'bus_type' => 'required',
            'total_seats' => 'required|numeric'
        ]);

        if ($auth['role'] === 'company_admin') {
            RoleMiddleware::requireCompany($auth, (int)$body['company_id']);
        }

        // Enforce company_class: reject bus_type that conflicts with the company's fleet class.
        // VIP company → only VIP or Luxury buses allowed.
        // Standard company → only Standard, Coaster, or Minibus allowed.
        $comp = Database::query(
            'SELECT company_class FROM companies WHERE id = ? AND is_active = 1',
            [(int)$body['company_id']]
        )->fetch();
        if (!$comp) Response::error('Company not found', 404);

        $isVipType = in_array($body['bus_type'], ['VIP', 'Luxury'], true);
        if ($comp['company_class'] === 'vip' && !$isVipType) {
            Response::error(
                'This company only operates VIP/Luxury buses. Cannot add a ' . $body['bus_type'] . ' bus.',
                422
            );
        }
        if ($comp['company_class'] === 'standard' && $isVipType) {
            Response::error(
                'This company only operates Standard/Coaster/Minibus buses. Cannot add a ' . $body['bus_type'] . ' bus.',
                422
            );
        }

        // Auto-generate bus_signature if not provided
        $signature = $body['bus_signature'] ?? null;
        if (!$signature) {
            // Derive prefix from company abbreviation + type code
            $abbr = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', ($body['company_abbreviation'] ?? 'BUS')), 0, 3));
            $typeMap = ['VIP' => 'VIP', 'Standard' => 'STD', 'Luxury' => 'LUX', 'Coaster' => 'CST', 'Minibus' => 'MNB'];
            $typeCode = $typeMap[$body['bus_type']] ?? 'STD';
            // Find next sequence number for this company+type
            $count = (int) Database::query(
                "SELECT COUNT(*) FROM buses WHERE company_id = ? AND bus_type = ?",
                [(int)$body['company_id'], $body['bus_type']]
            )->fetchColumn();
            $signature = "$abbr-$typeCode-" . str_pad((string)($count + 1), 2, '0', STR_PAD_LEFT);
        }

        Database::query(
            'INSERT INTO buses (company_id, branch_id, plate_number, bus_signature, name, bus_type, total_seats)
             VALUES (?,?,?,?,?,?,?)',
            [
                $body['company_id'], $body['branch_id'] ?? null, $body['plate_number'],
                $signature, $body['name'] ?? null, $body['bus_type'], $body['total_seats'],
            ]
        );
        Response::success(['id' => (int) Database::lastInsertId(), 'bus_signature' => $signature], 'Bus created', 201);
    }

    /** Mark a bus as faulty (under maintenance) — removes it from all future schedule generation */
    public static function markBusFaulty(int $busId): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');
        Database::query("UPDATE buses SET is_faulty = 1 WHERE id = ?", [$busId]);

        // Cancel all future UNBOARDED schedules assigned to this bus
        Database::query(
            "UPDATE schedules SET status = 'cancelled'
             WHERE bus_id = ?
               AND travel_date >= CURDATE()
               AND status IN ('scheduled', 'boarding')
               AND booked_seats = 0",
            [$busId]
        );
        Response::success(null, 'Bus marked as faulty; empty future schedules cancelled');
    }

    /** Restore a bus from faulty state */
    public static function markBusOperational(int $busId): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');
        Database::query("UPDATE buses SET is_faulty = 0 WHERE id = ?", [$busId]);
        Response::success(null, 'Bus restored to operational');
    }

    /** List all buses for a company, including faulty ones */
    public static function listBuses(): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');

        $companyId = (int) ($_GET['company_id'] ?? ($auth['company_id'] ?? 0));
        
        // Security override: prevent company admin from passing someone else's company_id
        if ($auth['role'] === 'company_admin') {
            $companyId = (int) $auth['company_id'];
        }

        $where = $companyId ? 'WHERE b.company_id = ?' : 'WHERE 1=1';
        $params = $companyId ? [$companyId] : [];

        $buses = Database::query(
            "SELECT b.*, c.name AS company_name
             FROM buses b
             JOIN companies c ON c.id = b.company_id
             $where
             ORDER BY b.company_id, b.bus_type, b.bus_signature",
            $params
        )->fetchAll();

        Response::success($buses);
    }


    public static function createAdmin(array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');

        $body = Validator::validate($body, [
            'full_name' => 'required',
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required'
        ]);

        // Company admins can only create branch admins for their own company
        if ($auth['role'] === 'company_admin') {
            if ($body['role'] !== 'branch_admin') {
                Response::error('You can only create branch admins', 403);
            }
            // Force company_id to the caller's own company (ignore any client-supplied value)
            $body['company_id'] = (int) $auth['company_id'];
        }

        // Validate company_id for company_admin and branch_admin roles
        if (in_array($body['role'], ['company_admin', 'branch_admin'], true)) {
            if (empty($body['company_id'])) {
                Response::error('company_id is required for this role', 422);
            }
        }

        // Validate branch_id for branch_admin role
        if ($body['role'] === 'branch_admin' && empty($body['branch_id'])) {
            Response::error('branch_id is required for branch admin', 422);
        }

        // Check for duplicate email
        $existing = Database::query('SELECT id FROM admins WHERE email = ? AND deleted_at IS NULL', [$body['email']])->fetch();
        if ($existing) {
            Response::error('An admin with this email already exists', 409);
        }

        $hash = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        Database::query(
            'INSERT INTO admins (full_name, email, password_hash, role, company_id, branch_id)
             VALUES (?,?,?,?,?,?)',
            [
                $body['full_name'], $body['email'], $hash, $body['role'],
                !empty($body['company_id']) ? (int)$body['company_id'] : null,
                !empty($body['branch_id'])  ? (int)$body['branch_id']  : null,
            ]
        );
        Response::success(['id' => (int) Database::lastInsertId()], 'Admin created', 201);
    }

    public static function listAdmins(): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin', 'company_admin');

        // Scope by company for company_admin — they should only see their own company's admins
        $where  = 'WHERE a.deleted_at IS NULL';
        $params = [];
        if ($auth['role'] === 'company_admin') {
            $where  .= ' AND a.company_id = ?';
            $params[] = (int) $auth['company_id'];
        }

        $admins = Database::query(
            "SELECT a.id, a.full_name, a.email, a.role, a.is_active, a.last_login,
                    c.name AS company_name, b.name AS branch_name
             FROM admins a
             LEFT JOIN companies c ON a.company_id = c.id
             LEFT JOIN branches b  ON a.branch_id = b.id
             $where
             ORDER BY a.role ASC, a.full_name ASC",
            $params
        )->fetchAll();

        Response::success($admins);
    }

    public static function deleteAdmin(int $id): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin');

        // Prevent self-deletion
        if ($id === (int)$auth['id']) {
            Response::error('You cannot delete yourself', 400);
        }

        Database::query("UPDATE admins SET is_active = 0, deleted_at = NOW() WHERE id = ?", [$id]);
        Response::success(null, 'Admin deleted');
    }
}