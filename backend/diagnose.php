<?php
define('ROOT_PATH', __DIR__);
define('APP_START', microtime(true));

require_once 'config/env.php';
loadEnv(__DIR__ . '/.env');
require_once 'helpers/Response.php';
require_once 'config/database.php';

// Test 1: admin login
$admin = Database::query('SELECT id, email, password_hash, role FROM admins WHERE email = ?', ['admin@camerbus.cm'])->fetch();
echo "Admin found: " . ($admin ? 'YES' : 'NO') . "\n";
if ($admin) {
    echo "Role: " . $admin['role'] . "\n";
    $valid = password_verify('password123', $admin['password_hash']);
    echo "Password valid: " . ($valid ? 'YES' : 'NO') . "\n";
}

// Test 2: schedules for today
$schedules = Database::query('SELECT COUNT(*) as cnt FROM schedules WHERE travel_date = CURDATE()')->fetch();
echo "Schedules today: " . $schedules['cnt'] . "\n";

// Test 3: active routes
$routes = Database::query('SELECT COUNT(*) as cnt FROM routes WHERE is_active=1')->fetch();
echo "Active routes: " . $routes['cnt'] . "\n";

// Test 4: active buses
$buses = Database::query('SELECT COUNT(*) as cnt FROM buses WHERE is_active=1 AND is_faulty=0')->fetch();
echo "Active buses: " . $buses['cnt'] . "\n";

// Test 5: Limbe to Bambui route specifically
$limbe  = Database::query("SELECT id FROM cities WHERE name LIKE '%Limbe%' OR name_fr LIKE '%Limb%' LIMIT 1")->fetch();
$bambui = Database::query("SELECT id FROM cities WHERE name LIKE '%Bambui%' LIMIT 1")->fetch();
echo "Limbe city ID: " . ($limbe ? $limbe['id'] : 'NOT FOUND') . "\n";
echo "Bambui city ID: " . ($bambui ? $bambui['id'] : 'NOT FOUND') . "\n";

// Test 6: Limbe-Bambui route exists?
if ($limbe && $bambui) {
    $route = Database::query('SELECT COUNT(*) as cnt FROM routes WHERE origin_city_id=? AND dest_city_id=?', [$limbe['id'], $bambui['id']])->fetch();
    echo "Limbe->Bambui routes: " . $route['cnt'] . "\n";
}

// Test 7: Does company_class column exist?
try {
    $test = Database::query('SELECT company_class FROM companies LIMIT 1')->fetch();
    echo "company_class column: EXISTS (value=" . ($test['company_class'] ?? 'null') . ")\n";
} catch (Exception $e) {
    echo "company_class column: MISSING - " . $e->getMessage() . "\n";
}

echo "\nDone.\n";
