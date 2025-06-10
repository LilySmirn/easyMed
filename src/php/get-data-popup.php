<?php
$servername = "localhost"; // Хост, скорее всего, "localhost"
$username = "u3100553_default"; // Имя пользователя MySQL u3100553_default
$password = "9g6Gpiyp70NOM9Iu"; // Пароль от базы данных 9g6Gpiyp70NOM9Iu
$dbname = "u3100553_test_10.06"; // Имя базы данных u3100553_test-db

// Создаем соединение
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверяем соединение
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$conn->set_charset("utf8");

$inputUsername = $_GET['username'] ?? '';
$inputPassword = $_GET['password'] ?? '';
$code = $_GET['code'] ?? '';

if (empty($inputUsername) || empty($inputPassword)) {
    echo json_encode(['result' => 'denied: no username or password']);
    exit;
}

// Подготавливаем SQL-запрос для поиска пользователя по имени
$stmt = $conn->prepare("SELECT password FROM user WHERE username = ?");
$stmt->bind_param("s", $inputUsername);
$stmt->execute();
$stmt->bind_result($dbPassword);
$stmt->fetch();
$stmt->close();

if ($dbPassword) {
    // Проверяем, совпадает ли пароль
    if ($dbPassword === $inputPassword) {

        if (empty($code)) {
            echo json_encode(['error' => 'No code provided']);
            exit;
        }

        // Найти все mkb_id для данного code
        $sql = "SELECT mkb_id FROM mkb WHERE code = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $result = $stmt->get_result();

        $mkb_ids = [];
        while ($row = $result->fetch_assoc()) {
            $mkb_ids[] = $row['mkb_id'];
        }
        $stmt->close();

        if (empty($mkb_ids)) {
            echo json_encode(['error' => 'No MKB records found for the provided code']);
            exit;
        }

        // Найти все standard_id из mkb_standard_link для найденных mkb_id
        $sql = "SELECT DISTINCT standard_id FROM mkb_standard_link WHERE mkb_id IN (" . implode(',', array_fill(0, count($mkb_ids), '?')) . ")";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(str_repeat('i', count($mkb_ids)), ...$mkb_ids);
        $stmt->execute();
        $result = $stmt->get_result();

        $standard_ids = [];
        while ($row = $result->fetch_assoc()) {
            $standard_ids[] = $row['standard_id'];
        }
        $stmt->close();

        if (empty($standard_ids)) {
            echo json_encode(['error' => 'No standards found for the provided code']);
            exit;
        }

        // Найти стандарты со статусом "Рекомендация" и получить их cr_m_id
        $sql = "SELECT cr_m_id FROM standard WHERE standard_id IN (" . implode(',', array_fill(0, count($standard_ids), '?')) . ") AND standard_status = 'Рекомендация'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(str_repeat('i', count($standard_ids)), ...$standard_ids);
        $stmt->execute();
        $result = $stmt->get_result();

        $cr_m_ids = [];
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['cr_m_id'])) {
                $cr_m_ids[] = $row['cr_m_id'];
            }
        }
        $stmt->close();

        if (empty($cr_m_ids)) {
            echo json_encode(['error' => 'No recommendations found for the provided code']);
            exit;
        }

        // Найти все записи из cr_text для найденных cr_m_id
        $sql = "SELECT cr_db_id, text, comment FROM cr_text WHERE cr_m_id IN (" . implode(',', array_fill(0, count($cr_m_ids), '?')) . ")";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(str_repeat('s', count($cr_m_ids)), ...$cr_m_ids);
        $stmt->execute();
        $result = $stmt->get_result();

        $response = new stdClass();
        while ($row = $result->fetch_assoc()) {
            $response->{$row['cr_db_id']} = (object) [
                'text' => $row['text'],
                'comment' => $row['comment']
            ];
        }
        $stmt->close();

        $conn->close();

        // Возвращаем объект в формате JSON
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response, JSON_UNESCAPED_UNICODE);

    } else {
        echo json_encode(['result' => 'deny']);
    }
} else {
    echo json_encode(['result' => 'denied: autentification failed']); // Пользователь не найден
    $conn->close();
}

?> 