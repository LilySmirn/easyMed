<?php
/**
 * Auto-login check for CRM Soft against SQNS user table.
 * Same result codes as old php/auto-login.php: access | deny | denyIP.
 */

require_once __DIR__ . '/_db.php';

$inputUsername = $_GET['username'] ?? '';
$inputPassword = $_GET['password'] ?? '';
$userIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];

$conn = newPhpConnectSqns();
$result = newPhpAuthenticateWithIp($conn, $inputUsername, $inputPassword, $userIP);
$conn->close();

echo json_encode(['result' => $result]);
?>
