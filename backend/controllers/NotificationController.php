<?php
declare(strict_types=1);

class NotificationController
{
    public static function index(): void
    {
        $auth   = AuthMiddleware::handle();
        $userId = (int) $auth['sub'];
        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;

        $total = (int) Database::query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = ?', [$userId]
        )->fetchColumn();

        $notifications = Database::query(
            'SELECT * FROM notifications WHERE user_id = ?
             ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [$userId, $limit, $offset]
        )->fetchAll();

        Response::paginate($notifications, $total, $page, $limit);
    }

    public static function markRead(int $id): void
    {
        $auth = AuthMiddleware::handle();
        Database::query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [$id, (int)$auth['sub']]
        );
        Response::success(null, 'Marked as read');
    }

    public static function markAllRead(): void
    {
        $auth = AuthMiddleware::handle();
        Database::query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [(int)$auth['sub']]
        );
        Response::success(null, 'All notifications marked as read');
    }
}
