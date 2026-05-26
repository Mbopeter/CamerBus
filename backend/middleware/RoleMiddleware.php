<?php
declare(strict_types=1);

class RoleMiddleware
{
    public static function requireRole(array $payload, string ...$roles): void
    {
        $userRole = $payload['role'] ?? '';
        if (!in_array($userRole, $roles, true)) {
            Response::error('Insufficient permissions', 403);
            exit;
        }
    }

    public static function requireCompany(array $payload, int $companyId): void
    {
        if ($payload['role'] === 'super_admin') return;
        if ((int)($payload['company_id'] ?? 0) !== $companyId) {
            Response::error('Access denied to this company', 403);
            exit;
        }
    }

    public static function requireBranch(array $payload, int $branchId): void
    {
        if ($payload['role'] === 'super_admin') return;
        if ($payload['role'] === 'company_admin') return;
        if ((int)($payload['branch_id'] ?? 0) !== $branchId) {
            Response::error('Access denied to this branch', 403);
            exit;
        }
    }
}
