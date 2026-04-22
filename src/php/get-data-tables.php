<?php
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

$inputUsername = $_GET['username'] ?? '';
$inputPassword = $_GET['password'] ?? '';
$code = $_GET['code'] ?? '';
$cr_id = $_GET['cr_id'] ?? '';

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

        // --- NEW LOGIC: handle cr_id if present ---
        if (!empty($cr_id)) {
            $sql = "SELECT tables_object_string FROM cr_table WHERE cr_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $cr_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();
            $conn->close();

            if ($row && !empty($row['tables_object_string'])) {
                $drugTables = json_decode($row['tables_object_string'], true);
                $response = [
                    'crID' => $cr_id,
                    'sections' => [
                        'drugTables' => $drugTables
                    ]
                ];
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
                exit;
            } else {
                // Return null when cr_id is not found
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(null);
                $conn->close();
                exit;
            }
        } else {
            // Return null when no cr_id is provided
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(null);
            $conn->close();
            exit;
        }
        // --- END NEW LOGIC ---

    } else {
        echo json_encode(['result' => 'deny']);
    }
} else {
    echo json_encode(['result' => 'denied: autentification failed']); // Пользователь не найден
    $conn->close();
}

?>
