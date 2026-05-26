<?php
/**
 * CamerBus — PDO Database Connection (Singleton)
 */
declare(strict_types=1);

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $host   = env('DB_HOST', 'localhost');
            $port   = env('DB_PORT', '3306');
            $name   = env('DB_NAME', 'camerbus');
            $user   = env('DB_USER', 'root');
            $pass   = env('DB_PASS', '');

            $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database connection failed']);
                exit;
            }
        }
        return self::$instance;
    }

    public static function query(string $sql, array $params = []): PDOStatement
    {
        $stmt = self::getInstance()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function lastInsertId(): string
    {
        return self::getInstance()->lastInsertId();
    }

    public static function beginTransaction(): void { self::getInstance()->beginTransaction(); }
    public static function commit(): void           { self::getInstance()->commit(); }
    public static function rollback(): void         { self::getInstance()->rollBack(); }
}
