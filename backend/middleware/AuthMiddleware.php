<?php
declare(strict_types=1);

class AuthMiddleware
{
    public static function handle(): array
    {
        $token = self::extractToken();
        if (!$token) {
            Response::error('Authorization token required', 401);
            exit;
        }
        try {
            $payload = JWT::decode($token);
            if (($payload['type'] ?? '') !== 'access') {
                Response::error('Invalid token type', 401);
                exit;
            }
            return $payload;
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 401);
            exit;
        }
    }

    public static function optional(): ?array
    {
        $token = self::extractToken();
        if (!$token) return null;
        try {
            $payload = JWT::decode($token);
            return ($payload['type'] ?? '') === 'access' ? $payload : null;
        } catch (RuntimeException) {
            return null;
        }
    }

    private static function extractToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['HTTP_BEARER']
            ?? getallheaders()['Authorization']
            ?? '';
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }
}
