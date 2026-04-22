<?php
header('Content-Type: application/json; charset=utf-8');
$servername = "localhost";
$username = "u2791988_default";
$password = "hylm55YwXBWUEE35";
$dbname = "u2791988_10_06_25_DB";

// Создаем соединение
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверяем соединение
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$conn->set_charset("utf8");

// Get the search query from the URL
$query = $_GET['q'] ?? '';

if (empty($query)) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT name, code FROM mkb WHERE LOWER(name) LIKE LOWER(?) OR LOWER(code) LIKE LOWER(?) LIMIT 100";
$stmt = $conn->prepare($sql);
$searchTerm = '%' . $query . '%';
$stmt->bind_param("ss", $searchTerm, $searchTerm);
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

// Encrypt the data before sending
$key = "secretKey"; // Same key as in crypto.js
$method = "AES-256-CBC";
$iv = openssl_random_pseudo_bytes(16);

// Convert data to JSON string
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data, JSON_UNESCAPED_UNICODE);

// // Encrypt the data
// $encrypted = openssl_encrypt(
//     $jsonData,
//     $method,
//     $key,
//     OPENSSL_RAW_DATA,
//     $iv
// );

// // Combine IV and encrypted data
// $combined = $iv . $encrypted;

// // Encode the result in base64
// $result = base64_encode($combined);

// echo $result;
?>