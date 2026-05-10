<?php
// Script para agregar un ejercicio al entrenamiento del usuario
session_start();
require_once __DIR__ . '/../../app/config/database.php';
header('Content-Type: application/json');

// Verificar si el usuario está logueado
if (!isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$user_id = $_SESSION['user']['id'];
$exercise_id = $_POST['exercise_id'] ?? null;
$day = $_POST['day'] ?? null;

// Validar datos del POST
if (!$exercise_id || $day === null) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    // Insertar el ejercicio en la base de datos
    $sql = "INSERT INTO user_workouts (user_id, exercise_id, day_of_week, sets, reps) VALUES (?, ?, ?, 3, 10)";
    $stmt = $db->prepare($sql);
    $stmt->execute([$user_id, $exercise_id, $day]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // Manejar errores
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>