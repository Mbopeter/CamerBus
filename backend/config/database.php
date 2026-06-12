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
                echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
                exit;
            }
        }
        return self::$instance;
    }

    public static function query(string $sql, array $params = []): PDOStatement
    {
        try {
            $stmt = self::getInstance()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            // 2006: MySQL server has gone away
            // 2013: Lost connection to MySQL server during query
            if (strpos($msg, '2006') !== false || strpos($msg, '2013') !== false) {
                self::$instance = null; // Reset connection
                $stmt = self::getInstance()->prepare($sql);
                $stmt->execute($params);
                return $stmt;
            }
            throw $e;
        }
    }

    public static function lastInsertId(): string
    {
        return self::getInstance()->lastInsertId();
    }

    public static function beginTransaction(): void
    {
        try {
            self::getInstance()->beginTransaction();
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            if (strpos($msg, '2006') !== false || strpos($msg, '2013') !== false) {
                self::$instance = null;
                self::getInstance()->beginTransaction();
            } else {
                throw $e;
            }
        }
    }
    public static function commit(): void           { self::getInstance()->commit(); }
    public static function rollback(): void         { self::getInstance()->rollBack(); }
}
