<?php
/**
 * CamerBus — JWT Helper (no external library, pure PHP)
 */
declare(strict_types=1);

class JWT
{
    private static string $secret = '';
    private static int    $accessExpire  = 900;
    private static int    $refreshExpire = 604800;

    public static function init(): void
    {
        self::$secret        = env('JWT_SECRET', 'camerbus_secret');
        self::$accessExpire  = (int) env('JWT_ACCESS_EXPIRE',  900);
        self::$refreshExpire = (int) env('JWT_REFRESH_EXPIRE', 604800);
    }

    public static function encode(array $payload, bool $isRefresh = false): string
    {
        self::init();
        $header = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['iat'] = time();
        $payload['exp'] = time() + ($isRefresh ? self::$refreshExpire : self::$accessExpire);
        $payload['type'] = $isRefresh ? 'refresh' : 'access';
        $body      = self::base64UrlEncode(json_encode($payload));
        $signature = self::sign("$header.$body");
        return "$header.$body.$signature";
    }

    public static function decode(string $token): array
    {
        self::init();
        $parts = explode('.', $token);
        if (count($parts) !== 3) throw new RuntimeException('Invalid token format');

        [$header, $payload, $signature] = $parts;

        $expectedSig = self::sign("$header.$payload");
        if (!hash_equals($expectedSig, $signature)) {
            throw new RuntimeException('Invalid token signature');
        }

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data || !isset($data['exp'])) throw new RuntimeException('Invalid token payload');
        if ($data['exp'] < time())           throw new RuntimeException('Token has expired');

        return $data;
    }

    public static function encodeTicket(array $payload): string
    {
        self::init();
        $header    = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256', 'purpose' => 'ticket']));
        $payload['iat'] = time();
        $payload['exp'] = time() + 86400 * 7; // tickets valid 7 days
        $body      = self::base64UrlEncode(json_encode($payload));
        $signature = self::sign("$header.$body");
        return "$header.$body.$signature";
    }

    private static function sign(string $data): string
    {
        return self::base64UrlEncode(hash_hmac('sha256', $data, self::$secret, true));
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}
