<?php
declare(strict_types=1);

class ParcelController
{
    public static function store(array $body): void
    {
        $auth = AuthMiddleware::optional();

        $body = Validator::validate($body, [
            'sender_name' => 'required',
            'sender_phone' => 'required',
            'receiver_name' => 'required',
            'receiver_phone' => 'required',
            'origin_branch_id' => 'required|numeric',
            'dest_branch_id' => 'required|numeric',
            'company_id' => 'required|numeric',
            'description' => 'required'
        ]);

        $originBranchId = (int) $body['origin_branch_id'];
        $destBranchId   = (int) $body['dest_branch_id'];

        // Calculate shipping cost
        $originBranch = Database::query(
            'SELECT b.*, ci.id AS city_id FROM branches b JOIN cities ci ON ci.id = b.city_id WHERE b.id = ?',
            [$originBranchId]
        )->fetch();
        $destBranch = Database::query(
            'SELECT b.*, ci.id AS city_id FROM branches b JOIN cities ci ON ci.id = b.city_id WHERE b.id = ?',
            [$destBranchId]
        )->fetch();

        if (!$originBranch || !$destBranch) Response::error('Invalid branch IDs', 404);

        $weight      = (float) ($body['weight_kg'] ?? 1.0);
        $priceData   = PriceCalculator::calculate($originBranch['city_id'], $destBranch['city_id']);
        $shippingCost = max(500, round($weight * ($priceData['standard'] / 70)));

        $tracking = QRGenerator::generateTrackingNumber();

        // Auto-assign an available (non-faulty) bus for this company for parcel tracking
        $assignedBus = Database::query(
            'SELECT id, bus_signature FROM buses
             WHERE company_id = ? AND is_active = 1 AND is_faulty = 0
             ORDER BY RAND() LIMIT 1',
            [(int) $body['company_id']]
        )->fetch();
        $assignedBusId = $assignedBus ? (int) $assignedBus['id'] : null;

        Database::beginTransaction();
        try {
            Database::query(
                'INSERT INTO parcel_shipments
                    (tracking_number, sender_id, sender_name, sender_phone,
                     receiver_name, receiver_phone, origin_branch_id, dest_branch_id,
                     company_id, assigned_bus_id, description, weight_kg, dimensions, is_fragile,
                     declared_value, shipping_cost, payment_method, status)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'received\')',
                [
                    $tracking, $auth ? (int)$auth['sub'] : null,
                    $body['sender_name'], $body['sender_phone'],
                    $body['receiver_name'], $body['receiver_phone'],
                    $originBranchId, $destBranchId,
                    (int) $body['company_id'], $assignedBusId, $body['description'],
                    $weight, $body['dimensions'] ?? null,
                    (int) ($body['is_fragile'] ?? 0), $body['declared_value'] ?? null,
                    $shippingCost, $body['payment_method'] ?? 'cash',
                ]
            );
            $parcelId = (int) Database::lastInsertId();

            // Create initial tracking event
            Database::query(
                'INSERT INTO parcel_tracking (parcel_id, status, location, description)
                 VALUES (?,\'received\',?,\'Package received at origin branch\')',
                [$parcelId, $originBranch['name']]
            );

            Database::commit();

            Response::success([
                'tracking_number' => $tracking,
                'parcel_id'       => $parcelId,
                'shipping_cost'   => $shippingCost,
            ], 'Parcel shipment created', 201);

        } catch (\Throwable $e) {
            Database::rollback();
            Response::error('Failed to create parcel: ' . $e->getMessage(), 500);
        }
    }

    public static function show(string $trackingOrId): void
    {
        // Public endpoint — no auth required for tracking
        $col     = is_numeric($trackingOrId) ? 'ps.id' : 'ps.tracking_number';
        $parcel  = Database::query(
            "SELECT ps.*,
                ob.name AS origin_branch_name, ob.address AS origin_address,
                db.name AS dest_branch_name,   db.address AS dest_address,
                oc.name AS origin_city, dc.name AS dest_city,
                c.name AS company_name, c.logo_url,
                b.bus_signature, b.plate_number AS bus_plate, b.bus_type AS bus_type_name
             FROM parcel_shipments ps
             JOIN branches ob  ON ps.origin_branch_id = ob.id
             JOIN branches db  ON ps.dest_branch_id = db.id
             JOIN cities oc    ON ob.city_id = oc.id
             JOIN cities dc    ON db.city_id = dc.id
             JOIN companies c  ON ps.company_id = c.id
             LEFT JOIN buses b ON ps.assigned_bus_id = b.id
             WHERE $col = ?", [$trackingOrId]
        )->fetch();

        if (!$parcel) Response::error('Parcel not found', 404);

        $history = Database::query(
            'SELECT * FROM parcel_tracking WHERE parcel_id = ? ORDER BY created_at ASC',
            [$parcel['id']]
        )->fetchAll();

        $parcel['tracking_history'] = $history;
        Response::success($parcel);
    }

    public static function byUser(int $userId): void
    {
        $auth = AuthMiddleware::handle();
        if ($auth['role'] === 'user' && (int)$auth['sub'] !== $userId) {
            Response::error('Access denied', 403);
        }

        $parcels = Database::query(
            'SELECT ps.*,
                ob.name AS origin_branch, db.name AS dest_branch,
                oc.name AS origin_city, dc.name AS dest_city,
                c.name AS company_name
             FROM parcel_shipments ps
             JOIN branches ob ON ps.origin_branch_id = ob.id
             JOIN branches db ON ps.dest_branch_id = db.id
             JOIN cities oc   ON ob.city_id = oc.id
             JOIN cities dc   ON db.city_id = dc.id
             JOIN companies c ON ps.company_id = c.id
             WHERE ps.sender_id = ?
             ORDER BY ps.created_at DESC', [$userId]
        )->fetchAll();

        Response::success($parcels);
    }

    public static function updateStatus(int $id, array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'company_admin', 'branch_admin');

        $validStatuses = ['received','in_transit','arrived','ready_for_pickup','collected','returned'];
        if (!in_array($body['status'] ?? '', $validStatuses, true)) {
            Response::error('Invalid status. Must be one of: ' . implode(', ', $validStatuses), 422);
        }

        $parcel = Database::query('SELECT * FROM parcel_shipments WHERE id = ?', [$id])->fetch();
        if (!$parcel) Response::error('Parcel not found', 404);

        Database::beginTransaction();
        try {
            Database::query('UPDATE parcel_shipments SET status = ? WHERE id = ?', [$body['status'], $id]);
            Database::query(
                'INSERT INTO parcel_tracking (parcel_id, status, location, description, updated_by)
                 VALUES (?,?,?,?,?)',
                [
                    $id, $body['status'],
                    $body['location'] ?? null,
                    $body['description'] ?? 'Status updated',
                    (int) $auth['sub'],
                ]
            );

            // Notify sender if they have an account
            if ($parcel['sender_id']) {
                $statusLabels = [
                    'in_transit'      => ['en' => 'Your parcel is in transit', 'fr' => 'Votre colis est en transit'],
                    'arrived'         => ['en' => 'Your parcel has arrived!',  'fr' => 'Votre colis est arrivé!'],
                    'ready_for_pickup'=> ['en' => 'Your parcel is ready for pickup', 'fr' => 'Votre colis est prêt à être récupéré'],
                    'collected'       => ['en' => 'Your parcel has been collected', 'fr' => 'Votre colis a été collecté'],
                ];
                $msg = $statusLabels[$body['status']] ?? ['en' => 'Parcel update', 'fr' => 'Mise à jour colis'];
                Database::query(
                    'INSERT INTO notifications (user_id, type, title, title_fr, body, body_fr, data)
                     VALUES (?,\'parcel_update\',?,?,?,?,?)',
                    [
                        $parcel['sender_id'],
                        '📦 ' . $msg['en'], '📦 ' . $msg['fr'],
                        'Tracking: ' . $parcel['tracking_number'], 'Suivi: ' . $parcel['tracking_number'],
                        json_encode(['tracking_number' => $parcel['tracking_number'], 'status' => $body['status']]),
                    ]
                );
            }

            Database::commit();
            Response::success(null, 'Parcel status updated');
        } catch (\Throwable $e) {
            Database::rollback();
            Response::error('Update failed: ' . $e->getMessage(), 500);
        }
    }
}