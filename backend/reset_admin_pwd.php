<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=camerbus', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $hash = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("UPDATE admins SET password_hash = ? WHERE email = 'admin@camerbus.cm'");
    $stmt->execute([$hash]);
    echo "Password updated successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
