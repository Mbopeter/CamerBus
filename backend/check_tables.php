<?php
require 'config/env.php';
require 'config/database.php';

$admins = Database::query("SELECT * FROM admins")->fetchAll(PDO::FETCH_ASSOC);
$companies = Database::query("SELECT * FROM companies")->fetchAll(PDO::FETCH_ASSOC);

echo "ADMINS:\n";
print_r($admins);

echo "\nCOMPANIES:\n";
print_r($companies);
