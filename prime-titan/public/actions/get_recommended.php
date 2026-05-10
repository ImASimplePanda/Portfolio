<?php
// Script para obtener ejercicios recomendados por grupo muscular
session_start();
require_once __DIR__ . '/../../app/config/database.php';
header('Content-Type: application/json');

$muscle = $_GET['muscle'] ?? '';
$user_id = $_SESSION['user']['id'] ?? null;
$lang = $_SESSION['user']['language'] ?? 'es';
$columna = ($lang === 'en') ? 'name_en' : 'name_es';

// Validar parámetros requeridos
if (!$muscle || !$user_id) {
    echo json_encode([]);
    exit;
}

try {
    // Consultar ejercicios recomendados no incluidos en el entrenamiento del usuario
    $sql = "SELECT id, $columna AS name, image_url 
            FROM exercises_library 
            WHERE muscle_group = ? 
            AND is_recommended = 1
            AND id NOT IN (SELECT exercise_id FROM user_workouts WHERE user_id = ?)";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$muscle, $user_id]);
    $exercises = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($exercises);
} catch (Exception $e) {
    // Manejar errores
    echo json_encode(['error' => $e->getMessage()]);
}
?>