<?php
/**
 * Drug / appendix tables for CRM Soft.
 * Reads SQNS cr_table by cr_id (same as SQNS cr_m_id) and wraps into old drugTables envelope.
 */

require_once __DIR__ . '/_db.php';

$inputUsername = $_GET['username'] ?? '';
$inputPassword = $_GET['password'] ?? '';
$cr_id = $_GET['cr_id'] ?? '';

$conn = newPhpConnectSqns();
newPhpAuthenticate($conn, $inputUsername, $inputPassword);

if ($cr_id === '') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(null);
    $conn->close();
    exit;
}

$sql = 'SELECT table_data FROM cr_table WHERE cr_m_id = ?';
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $cr_id);
$stmt->execute();
$stmt->bind_result($tableData);
$stmt->fetch();
$stmt->close();
$conn->close();

if ($tableData === null || $tableData === '') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(null);
    exit;
}

$tables = json_decode($tableData, true);
if ($tables === null && $tableData !== '[]') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(null);
    exit;
}

$response = newPhpWrapDrugTables($cr_id, is_array($tables) ? $tables : []);

header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
