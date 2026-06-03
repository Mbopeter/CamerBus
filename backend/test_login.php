<?php
// First get token
$ch = curl_init('http://localhost:8000/api/auth/admin-login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@camerbus.cm', 'password' => 'password123']));
$res = json_decode(curl_exec($ch), true);
$token = $res['data']['tokens']['access_token'];
curl_close($ch);

echo "Got token.\n";

// Now try create admin
$ch = curl_init('http://localhost:8000/api/admin/admins');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'full_name'  => 'Test Admin',
    'email'      => 'testadmin@nsoboyz.cm',
    'password'   => 'password123',
    'role'       => 'company_admin',
    'company_id' => 1,
    'branch_id'  => null,
]));
$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $code\n";
echo "Response: $response\n";
