<?php
require 'config/env.php';
loadEnv(__DIR__ . '/.env');

$host   = env('DB_HOST', 'localhost');
$port   = env('DB_PORT', '3306');
$name   = env('DB_NAME', 'camerbus');
$user   = env('DB_USER', 'root');
$pass   = env('DB_PASS', '');

$dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "Successfully connected to $name at $host:$port as $user\n";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
