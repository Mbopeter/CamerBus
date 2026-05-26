<?php
define('ROOT_PATH', __DIR__);
require_once ROOT_PATH . '/config/env.php';
loadEnv(ROOT_PATH . '/.env');
require_once ROOT_PATH . '/config/database.php';

Database::query("INSERT INTO branches (company_id, city_id, name, address, phone, is_active) VALUES (3, 6, 'Half Mile - Limbe', 'Half Mile Limbe', '677000000', 1)");
echo 'Branch added!';
