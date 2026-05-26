<?php
declare(strict_types=1);

class CompanyController
{
    public static function index(): void
    {
        $companies = Database::query(
            'SELECT c.*,
                COUNT(DISTINCT b.id) AS branch_count,
                COUNT(DISTINCT r.id) AS route_count,
                COUNT(DISTINCT bs.id) AS bus_count
             FROM companies c
             LEFT JOIN branches b ON b.company_id = c.id AND b.is_active = 1
             LEFT JOIN routes r   ON r.company_id = c.id AND r.is_active = 1
             LEFT JOIN buses bs   ON bs.company_id = c.id AND bs.is_active = 1
             WHERE c.is_active = 1 AND c.deleted_at IS NULL
             GROUP BY c.id
             ORDER BY c.rating DESC, c.name ASC'
        )->fetchAll();

        Response::success($companies, 'Companies retrieved');
    }

    public static function show(int $id): void
    {
        $company = Database::query(
            'SELECT * FROM companies WHERE id = ? AND is_active = 1 AND deleted_at IS NULL', [$id]
        )->fetch();

        if (!$company) Response::error('Company not found', 404);

        // Load branches grouped by city
        $branches = Database::query(
            'SELECT b.*, ci.name AS city_name, ci.region
             FROM branches b
             JOIN cities ci ON ci.id = b.city_id
             WHERE b.company_id = ? AND b.is_active = 1
             ORDER BY ci.name, b.name', [$id]
        )->fetchAll();

        // Load routes
        $routes = Database::query(
            'SELECT r.*, oc.name AS origin_city, dc.name AS dest_city
             FROM routes r
             JOIN cities oc ON oc.id = r.origin_city_id
             JOIN cities dc ON dc.id = r.dest_city_id
             WHERE r.company_id = ? AND r.is_active = 1', [$id]
        )->fetchAll();

        $company['branches'] = $branches;
        $company['routes']   = $routes;
        Response::success($company);
    }

    public static function store(array $body): void
    {
        $auth = AuthMiddleware::handle();
        RoleMiddleware::requireRole($auth, 'super_admin');

        $required = ['name', 'slug'];
        foreach ($required as $f) {
            if (empty($body[$f])) Response::error("Field '$f' required", 422);
        }

        Database::query(
            'INSERT INTO companies (name, slug, description, hq_city, phone, email,
              mtn_name, mtn_number, orange_name, orange_number,
              bank_name, bank_account, bank_account_name)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                $body['name'], $body['slug'], $body['description'] ?? null,
                $body['hq_city'] ?? null, $body['phone'] ?? null, $body['email'] ?? null,
                $body['mtn_name'] ?? null, $body['mtn_number'] ?? null,
                $body['orange_name'] ?? null, $body['orange_number'] ?? null,
                $body['bank_name'] ?? null, $body['bank_account'] ?? null, $body['bank_account_name'] ?? null,
            ]
        );

        $id = (int) Database::lastInsertId();
        Response::success(['id' => $id], 'Company created', 201);
    }
}
