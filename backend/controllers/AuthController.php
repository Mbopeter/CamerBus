<?php
declare(strict_types=1);

class AuthController
{
    public static function register(array $body): void
    {
        $required = ['full_name', 'phone', 'password'];
        foreach ($required as $field) {
            if (empty($body[$field])) Response::error("Field '$field' is required", 422);
        }

        $phone = trim($body['phone']);
        $existing = Database::query('SELECT id FROM users WHERE phone = ? AND deleted_at IS NULL', [$phone])->fetch();
        if ($existing) Response::error('Phone number already registered', 409);

        $hash = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        Database::query(
            'INSERT INTO users (full_name, email, phone, password_hash, language) VALUES (?, ?, ?, ?, ?)',
            [$body['full_name'], $body['email'] ?? null, $phone, $hash, $body['language'] ?? 'fr']
        );

        $userId = (int) Database::lastInsertId();
        $user   = Database::query('SELECT id, full_name, phone, email, language FROM users WHERE id = ?', [$userId])->fetch();

        $tokens = self::generateTokens($user, 'user');
        Response::success(['user' => $user, 'tokens' => $tokens], 'Registration successful', 201);
    }

    public static function login(array $body): void
    {
        if (empty($body['phone']) || empty($body['password'])) {
            Response::error('Phone and password are required', 422);
        }

        $user = Database::query(
            'SELECT * FROM users WHERE phone = ? AND deleted_at IS NULL AND is_active = 1',
            [trim($body['phone'])]
        )->fetch();

        if (!$user || !password_verify($body['password'], $user['password_hash'])) {
            Response::error('Invalid credentials', 401);
        }

        // Update FCM token if provided
        if (!empty($body['fcm_token'])) {
            Database::query('UPDATE users SET fcm_token = ? WHERE id = ?', [$body['fcm_token'], $user['id']]);
        }

        unset($user['password_hash']);
        $tokens = self::generateTokens($user, 'user');
        Response::success(['user' => $user, 'tokens' => $tokens], 'Login successful');
    }

    public static function adminLogin(array $body): void
    {
        if (empty($body['email']) || empty($body['password'])) {
            Response::error('Email and password are required', 422);
        }

        $admin = Database::query(
            'SELECT * FROM admins WHERE email = ? AND deleted_at IS NULL AND is_active = 1',
            [trim($body['email'])]
        )->fetch();

        if (!$admin || !password_verify($body['password'], $admin['password_hash'])) {
            Response::error('Invalid admin credentials', 401);
        }

        Database::query('UPDATE admins SET last_login = NOW() WHERE id = ?', [$admin['id']]);

        unset($admin['password_hash']);
        $tokens = self::generateTokens($admin, 'admin');
        Response::success(['admin' => $admin, 'tokens' => $tokens], 'Admin login successful');
    }

    public static function refresh(array $body): void
    {
        if (empty($body['refresh_token'])) Response::error('Refresh token required', 422);
        try {
            $payload = JWT::decode($body['refresh_token']);
            if (($payload['type'] ?? '') !== 'refresh') Response::error('Invalid token type', 401);

            $newPayload = $payload;
            unset($newPayload['iat'], $newPayload['exp'], $newPayload['type']);
            $accessToken = JWT::encode($newPayload);
            Response::success(['access_token' => $accessToken]);
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 401);
        }
    }

    public static function logout(array $body): void
    {
        // Stateless JWT — client deletes token
        // If user_id provided, clear FCM token
        if (!empty($body['user_id'])) {
            Database::query('UPDATE users SET fcm_token = NULL WHERE id = ?', [$body['user_id']]);
        }
        Response::success(null, 'Logged out successfully');
    }

    private static function generateTokens(array $user, string $entity): array
    {
        $payload = [
            'sub'        => $user['id'],
            'entity'     => $entity,
            'role'       => $user['role'] ?? 'user',
            'company_id' => $user['company_id'] ?? null,
            'branch_id'  => $user['branch_id'] ?? null,
        ];
        return [
            'access_token'  => JWT::encode($payload),
            'refresh_token' => JWT::encode($payload, true),
            'expires_in'    => (int) env('JWT_ACCESS_EXPIRE', 900),
        ];
    }
}
