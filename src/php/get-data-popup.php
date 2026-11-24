<?php
/**
 * Popup / CR text data for CRM Soft.
 * Reads SQNS mkb_cr_text + cr_text_data and reshapes to old keyed object.
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

$sql = 'SELECT cr_text_id FROM mkb_cr_text WHERE mkb_code = ?';
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $code);
$stmt->execute();
$result = $stmt->get_result();

$cr_text_ids = [];
while ($row = $result->fetch_assoc()) {
    $cr_text_ids[] = $row['cr_text_id'];
}
$stmt->close();

if (empty($cr_text_ids)) {
    $conn->close();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(new stdClass(), JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = 'SELECT text_data FROM cr_text_data WHERE id IN (' . implode(',', array_fill(0, count($cr_text_ids), '?')) . ')';
$stmt = $conn->prepare($sql);
$stmt->bind_param(str_repeat('i', count($cr_text_ids)), ...$cr_text_ids);
$stmt->execute();
$result = $stmt->get_result();

$mergedArray = [];
while ($row = $result->fetch_assoc()) {
    if (!empty($row['text_data'])) {
        $textDataArray = json_decode($row['text_data'], true);
        if (is_array($textDataArray)) {
            $mergedArray = array_merge($mergedArray, $textDataArray);
        }
    }
}
$stmt->close();
$conn->close();

$response = newPhpPopupFromSqnsText($mergedArray);

header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
