<?php
declare(strict_types=1);

class Response
{
    public static function success(mixed $data = null, string $message = 'Success', int $code = 200): void
    {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data'    => $data,
            'time'    => round((microtime(true) - APP_START) * 1000, 2) . 'ms',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, int $code = 400, mixed $errors = null): void
    {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function paginate(array $data, int $total, int $page, int $perPage): void
    {
        http_response_code(200);
        echo json_encode([
            'success'     => true,
            'data'        => $data,
            'pagination'  => [
                'total'        => $total,
                'per_page'     => $perPage,
                'current_page' => $page,
                'last_page'    => (int) ceil($total / $perPage),
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
