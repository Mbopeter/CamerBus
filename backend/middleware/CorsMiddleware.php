<?php
/**
 * CamerBus — CORS Middleware
 */
declare(strict_types=1);

class CorsMiddleware
{
    public static function handle(): void
    {
        $allowedOrigins = env('ALLOWED_ORIGINS', '*');

        header('Access-Control-Allow-Origin: ' . $allowedOrigins);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: application/json; charset=UTF-8');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
