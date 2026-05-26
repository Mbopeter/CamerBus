<?php

class BranchController
{
    public static function index(): void
    {
        $cityId    = (int) ($_GET['city'] ?? 0);
        $companyId = (int) ($_GET['company'] ?? 0);

        $sql    = 'SELECT b.*, ci.name AS city_name, ci.region, c.name AS company_name
                   FROM branches b
                   JOIN cities ci ON ci.id = b.city_id
                   JOIN companies c ON c.id = b.company_id
                   WHERE b.is_active = 1';
        $params = [];

        if ($cityId)    { $sql .= ' AND b.city_id = ?';    $params[] = $cityId; }
        if ($companyId) { $sql .= ' AND b.company_id = ?'; $params[] = $companyId; }

        $sql .= ' ORDER BY ci.name, b.name';
        $branches = Database::query($sql, $params)->fetchAll();
        Response::success($branches);
    }

    public static function show(int $id): void
    {
        $branch = Database::query(
            'SELECT b.*, ci.name AS city_name, c.name AS company_name
             FROM branches b
             JOIN cities ci ON ci.id = b.city_id
             JOIN companies c ON c.id = b.company_id
             WHERE b.id = ? AND b.is_active = 1', [$id]
        )->fetch();

        if (!$branch) Response::error('Branch not found', 404);
        Response::success($branch);
    }

    public static function byCompany(int $companyId): void
    {
        $branches = Database::query(
            'SELECT b.*, ci.name AS city_name, ci.region
             FROM branches b
             JOIN cities ci ON ci.id = b.city_id
             WHERE b.company_id = ? AND b.is_active = 1
             ORDER BY ci.name, b.name', [$companyId]
        )->fetchAll();
        Response::success($branches);
    }
}
