<?php
$servername = "localhost"; // Хост, скорее всего, "localhost"
$username = "u3100553_default"; // Имя пользователя MySQL u3100553_default
$password = "9g6Gpiyp70NOM9Iu"; // Пароль от базы данных 9g6Gpiyp70NOM9Iu
$dbname = "u2791988_10_06_25_DB"; // Имя базы данных u3100553_test-db

// Создаем соединение
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверяем соединение
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$inputUsername = $_GET['username'] ?? '';
$inputPassword = $_GET['password'] ?? '';
$userIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];

if (empty($inputUsername) || empty($inputPassword)) {
    echo json_encode(['result' => 'deny']);
    exit;
}

// Подготавливаем SQL-запрос для поиска пользователя по имени
$stmt = $conn->prepare("SELECT password, IP FROM user WHERE username = ?");
$stmt->bind_param("s", $inputUsername);
$stmt->execute();
$stmt->bind_result($dbPassword, $dbIP);
$stmt->fetch();
$stmt->close();

if ($dbPassword) {
    // Проверяем, совпадает ли пароль
    if ($dbPassword === $inputPassword) {
        if ($dbIP !== null && $dbIP !== $userIP) {
            echo json_encode(['result' => 'denyIP']);
            exit;
        }
        echo json_encode(['result' => 'access']);
    } else {
        echo json_encode(['result' => 'deny']);
    }
} else {
    echo json_encode(['result' => 'deny']); // Пользователь не найден
}

$conn->close();
?>