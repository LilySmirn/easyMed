<?php
header('Content-Type: application/json; charset=utf-8');
$servername = "localhost"; // Хост, скорее всего, "localhost"
$username = "u2791988_default"; // Имя пользователя MySQL
$password = "hylm55YwXBWUEE35"; // Пароль от базы данных
$dbname = "u2791988_default"; // Имя базы данных

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

echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>