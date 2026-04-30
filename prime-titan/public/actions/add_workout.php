<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user']['id']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit;
}

$user_id = $_SESSION['user']['id'];
$exercise_id = $_POST['exercise_id'] ?? null;
$day = $_POST['day'] ?? null;

try {
    $stmt = $pdo->prepare("INSERT INTO user_workouts (user_id, exercise_id, day_of_week) VALUES (?, ?, ?)");
    $stmt->execute([$user_id, $exercise_id, $day]);
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}