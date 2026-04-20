<?php
$servername = "localhost"; // Хост, скорее всего, "localhost"
$username = "u3100553_default"; // Имя пользователя MySQL u3100553_default
$password = "9g6Gpiyp70NOM9Iu"; // Пароль от базы данных 9g6Gpiyp70NOM9Iu
$dbname = "u3100553_test-db"; // Имя базы данных u3100553_test-db

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
    echo json_encode(['result' => 'deny']);
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

        // Создаем основной объект mkb
        $mkb = (object) [
            'child' => (object) [],
            'grownup' => (object) [],
        ];

        // Ищем записи в таблице mkb по code
        $sql = "SELECT * FROM mkb WHERE code = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $result = $stmt->get_result();

        $child_mkb_id = null;
        $grownup_mkb_id = null;

        while ($row = $result->fetch_assoc()) {
            if ($row['age_id'] == 1) {
                $mkb->child->code = $row['code'];
                $mkb->child->name = $row['name'];
                $child_mkb_id = $row['mkb_id'];
            } elseif ($row['age_id'] == 2) {
                $mkb->grownup->code = $row['code'];
                $mkb->grownup->name = $row['name'];
                $grownup_mkb_id = $row['mkb_id'];
            }
        }

        $stmt->close();

        if (empty($child_mkb_id) && empty($grownup_mkb_id)) {
            echo json_encode(['error' => 'No MKB records found for the provided code']);
            exit;
        }

        // Function to retrieve and populate standards, examinations, and treatments
        function populateStandards($conn, &$mkb_part, $mkb_id)
        {
            $mkb_part->standards = [];

            // Найти соответствующие standard_ids из mkb_standard_link
            $sql = "SELECT standard_id FROM mkb_standard_link WHERE mkb_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $mkb_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $standard_ids = [];
            while ($row = $result->fetch_assoc()) {
                $standard_ids[] = $row['standard_id'];
            }
            $stmt->close();

            if (empty($standard_ids)) {
                return;
            }

            // Найти соответствующие стандарты из таблицы standard
            $sql = "SELECT s.standard_id, s.name, st.name AS type_name, ss.name AS status_name 
            FROM standard s
            JOIN standard_type st ON s.standard_type_id = st.standard_type_id
            JOIN standard_status ss ON s.standard_status_id = ss.standard_status_id
            WHERE s.standard_id IN (" . implode(',', array_fill(0, count($standard_ids), '?')) . ")";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param(str_repeat('i', count($standard_ids)), ...$standard_ids);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($row = $result->fetch_assoc()) {
                $standard = (object) [
                    'name' => $row['name'],
                    'type' => $row['type_name'],
                    'status' => $row['status_name'],
                    'examinations' => [],
                    'treatments' => [],
                ];

                // Найти соответствующие examination и treatment для каждого стандарта
                $standard_id = $row['standard_id'];

                // Найти examinations
                $sql_exams = "SELECT e.examination_id, e.name, e.comment, e.examination_type_id, e.examination_stage_id, e.is_required, e.is_qualitative
                      FROM examination e
                      JOIN standard_data_link sdl ON e.examination_id = sdl.examination_id
                      WHERE sdl.standard_id = ?";
                $stmt_exams = $conn->prepare($sql_exams);
                $stmt_exams->bind_param("i", $standard_id);
                $stmt_exams->execute();
                $result_exams = $stmt_exams->get_result();

                while ($exam = $result_exams->fetch_assoc()) {
                    $standard->examinations[] = (object) [
                        'id' => $exam['examination_id'],
                        'name' => $exam['name'],
                        'comment' => $exam['comment'],
                        'examination_type_id' => $exam['examination_type_id'],
                        'examination_stage_id' => $exam['examination_stage_id'],
                        'is_required' => $exam['is_required'],
                        'is_qualitative' => $exam['is_qualitative'],
                    ];
                }
                $stmt_exams->close();

                // Найти treatments
                $sql_treatments = "SELECT t.treatment_id, t.name, t.comment, t.treatment_type_id, t.plan, t.duration, t.is_qualitative
                           FROM treatment t
                           JOIN standard_data_link sdl ON t.treatment_id = sdl.treatment_id
                           WHERE sdl.standard_id = ?";
                $stmt_treatments = $conn->prepare($sql_treatments);
                $stmt_treatments->bind_param("i", $standard_id);
                $stmt_treatments->execute();
                $result_treatments = $stmt_treatments->get_result();

                while ($treatment = $result_treatments->fetch_assoc()) {
                    $standard->treatments[] = (object) [
                        'id' => $treatment['treatment_id'],
                        'name' => $treatment['name'],
                        'comment' => $treatment['comment'],
                        'treatment_type_id' => $treatment['treatment_type_id'],
                        'plan' => $treatment['plan'],
                        'duration' => $treatment['duration'],
                        'is_qualitative' => $treatment['is_qualitative'],
                    ];
                }
                $stmt_treatments->close();

                $mkb_part->standards[] = $standard;
            }
            $stmt->close();
        }

        // Populate standards, examinations, and treatments for child and grownup
        if (isset($child_mkb_id)) {
            populateStandards($conn, $mkb->child, $child_mkb_id);
        }

        if (isset($grownup_mkb_id)) {
            populateStandards($conn, $mkb->grownup, $grownup_mkb_id);
        }

        $conn->close();

        // Возвращаем объект mkb в формате JSON
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($mkb, JSON_UNESCAPED_UNICODE);

    } else {
        echo json_encode(['result' => 'deny']);
    }
} else {
    echo json_encode(['result' => 'deny']); // Пользователь не найден
    $conn->close();
}

?>