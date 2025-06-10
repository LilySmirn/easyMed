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

            // Найти соответствующие стандарты из таблицы standard (обновленная структура)
            $sql = "SELECT s.standard_id, s.name, s.standard_type AS type_name, s.standard_status AS status_name, s.cr_m_id AS cr_m_id
                    FROM standard s
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

                // Добавить cr_m_id если статус = "Рекомендация"
                if ($row['status_name'] === 'Рекомендация') {
                    $standard->cr_m_id = $row['cr_m_id'];
                }

                // Найти соответствующие examination и treatment для каждого стандарта
                $standard_id = $row['standard_id'];

                // Найти examinations (обновленная структура)
                $sql_exams = "SELECT e.examination_id, e.name, e.comment, e.age_id, e.examination_stage, 
                                     e.is_required, e.is_qualitative, e.is_stationary, e.category_name, e.cr_db_id, e.S_CODE, e.uur, e.udd, e.group_id
                              FROM examination e
                              JOIN standard_data_link sdl ON e.examination_id = sdl.examination_id
                              WHERE sdl.standard_id = ?";
                $stmt_exams = $conn->prepare($sql_exams);
                $stmt_exams->bind_param("i", $standard_id);
                $stmt_exams->execute();
                $result_exams = $stmt_exams->get_result();

                while ($exam = $result_exams->fetch_assoc()) {
                    // Получить возрастную группу
                    $age_name = getAgeName($conn, $exam['age_id']);
                    
                    $exam_obj = (object) [
                        'name' => $exam['name'],
                        'age' => $age_name,
                        'comment' => $exam['comment'],
                        'stage' => $exam['examination_stage'],
                        'is_required' => $exam['is_required'],
                        'category_name' => $exam['category_name'],
                        'is_qualitative' => $exam['is_qualitative'],
                        'is_stationary' => $exam['is_stationary'],
                        'cr_db_id' => $exam['cr_db_id'],
                        'S_CODE' => $exam['S_CODE'],
                        'group_id' => $exam['group_id']
                    ];
                    
                    // Добавить pers информацию
                    if (!empty($exam['uur']) || !empty($exam['udd'])) {
                        $exam_obj->pers = (object) [
                            'уур' => $exam['uur'],
                            'удд' => $exam['udd']
                        ];
                    }
                    
                    $standard->examinations[] = $exam_obj;
                }
                $stmt_exams->close();

                // Найти treatments (обновленная структура)
                $sql_treatments = "SELECT t.treatment_id, t.name, t.comment, t.age_id, t.treatment_type, 
                                          t.plan, t.duration, t.is_qualitative, t.is_stationary, t.cr_db_id, 
                                          t.S_CODE, t.uur, t.udd, t.group_id, t.is_offlabel
                                   FROM treatment t
                                   JOIN standard_data_link sdl ON t.treatment_id = sdl.treatment_id
                                   WHERE sdl.standard_id = ?";
                $stmt_treatments = $conn->prepare($sql_treatments);
                $stmt_treatments->bind_param("i", $standard_id);
                $stmt_treatments->execute();
                $result_treatments = $stmt_treatments->get_result();

                while ($treatment = $result_treatments->fetch_assoc()) {
                    // Получить возрастную группу
                    $age_name = getAgeName($conn, $treatment['age_id']);
                    
                    // Получить дополнительный текст из cr_text, если есть cr_db_id
                    $cr_text = '';
                    if (!empty($treatment['cr_db_id'])) {
                        $cr_text = getCrText($conn, $treatment['cr_db_id']);
                    }
                    
                    $treatment_obj = (object) [
                        'name' => $treatment['name'],
                        'comment' => $treatment['comment'],
                        'age' => $age_name,
                        'plan' => $treatment['plan'],
                        'duration' => $treatment['duration'],
                        'cr_m_id' => '', // Заполнить если необходимо
                        'cr_db_id' => $treatment['cr_db_id'],
                        'is_qualitative' => $treatment['is_qualitative'],
                        'S_CODE' => $treatment['S_CODE'],
                        'type' => $treatment['treatment_type'],
                        'is_stationary' => $treatment['is_stationary'],
                        'group_id' => $treatment['group_id']
                    ];
                    
                    // Добавить дополнительные поля для лекарств
                    if ($treatment['treatment_type'] === 'drug') {
                        $treatment_obj->is_offlabel = $treatment['is_offlabel'];
                    }
                    
                    // Добавить pers информацию
                    if (!empty($treatment['uur']) || !empty($treatment['udd'])) {
                        $treatment_obj->pers = (object) [
                            'уур' => $treatment['uur'],
                            'удд' => $treatment['udd']
                        ];
                    }
                    
                    $standard->treatments[] = $treatment_obj;
                }
                $stmt_treatments->close();

                $mkb_part->standards[] = $standard;
            }
            $stmt->close();
        }

        // Функция для получения названия возрастной группы
        function getAgeName($conn, $age_id) {
            $age_name = '';
            $sql = "SELECT name FROM age WHERE age_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $age_id);
            $stmt->execute();
            $stmt->bind_result($age_name);
            $stmt->fetch();
            $stmt->close();
            return $age_name ?? '';
        }

        // Функция для получения текста из cr_text
        function getCrText($conn, $cr_db_id) {
            $text = '';
            $sql = "SELECT text FROM cr_text WHERE cr_db_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $cr_db_id);
            $stmt->execute();
            $stmt->bind_result($text);
            $stmt->fetch();
            $stmt->close();
            return $text ?? '';
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
    echo json_encode(['result' => 'denied: autentification failed']); // Пользователь не найден
    $conn->close();
}

?>