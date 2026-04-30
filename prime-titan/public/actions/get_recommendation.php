<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user']['id']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit;
}

$lang = $_SESSION['user']['language'] ?? 'es';
$nameCol = ($lang === 'en') ? 'name_en' : 'name_es';

$muscle = $_POST['muscle'] ?? '';
$day = $_POST['day'] ?? 0;
$user_id = $_SESSION['user']['id'];

try {
    // Buscamos un ejercicio del músculo que NO esté en user_workouts para ese día
    $sql = "SELECT id, image_url, $nameCol AS name 
            FROM exercises_library 
            WHERE muscle_group = :muscle 
            AND id NOT IN (
                SELECT exercise_id FROM user_workouts 
                WHERE user_id = :user_id AND day_of_week = :day
            )
            ORDER BY RAND() LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['muscle' => $muscle, 'user_id' => $user_id, 'day' => $day]);
    $exercise = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($exercise) {
        echo json_encode(['success' => true, 'exercise' => $exercise]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No hay ejercicios nuevos']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}