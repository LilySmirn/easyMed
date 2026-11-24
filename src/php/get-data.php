<?php
/**
 * Legacy MKB data endpoint (same behavior as get-data-main.php).
 * Reads SQNS DB and returns old CRM Soft main-data shape with split standards.
 */

require_once __DIR__ . '/_db.php';

$inputUsername = $_GET['username'] ?? '';
$inputPassword = $_GET['password'] ?? '';
$code = $_GET['code'] ?? '';

$conn = newPhpConnectSqns();
newPhpAuthenticate($conn, $inputUsername, $inputPassword);

if ($code === '') {
    echo json_encode(['error' => 'No code provided']);
    $conn->close();
    exit;
}

$mkbObj = newPhpLoadMkbWithStandards($conn, $code);
$conn->close();

if ($mkbObj === null) {
    echo json_encode(['error' => 'No MKB records found for the provided code']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($mkbObj, JSON_UNESCAPED_UNICODE);
?>
