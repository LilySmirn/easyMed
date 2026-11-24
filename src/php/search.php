<?php
/**
 * MKB search suggestions for CRM Soft.
 * Uses the same search DB as SQNS search.php (API_TEST.mkb).
 * Accepts frontend param `q` (also honors `search`).
 */

require_once __DIR__ . '/_db.php';

header('Content-Type: application/json; charset=utf-8');

$query = $_GET['q'] ?? ($_GET['search'] ?? '');

if ($query === '') {
    echo json_encode([]);
    exit;
}

$conn = newPhpConnectSearch();

$sql = 'SELECT name, code FROM mkb WHERE LOWER(name) LIKE LOWER(?) OR LOWER(code) LIKE LOWER(?) LIMIT 100';
$stmt = $conn->prepare($sql);
$searchTerm = '%' . $query . '%';
$stmt->bind_param('ss', $searchTerm, $searchTerm);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'name' => $row['name'],
        'code' => $row['code'],
    ];
}

$stmt->close();
$conn->close();

echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>
