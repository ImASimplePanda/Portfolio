<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user']['id'])) {
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$lang = $_SESSION['user']['language'] ?? 'es';
$nameCol = ($lang === 'en') ? 'name_en' : 'name_es';

try {
    $stmt = $pdo->prepare("
        SELECT u.*, e.image_url, e.$nameCol AS name 
        FROM user_workouts u
        JOIN exercises_library e ON u.exercise_id = e.id
        WHERE u.user_id = :user_id
        ORDER BY u.day_of_week ASC
    ");
    $stmt->execute(['user_id' => $_SESSION['user']['id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}