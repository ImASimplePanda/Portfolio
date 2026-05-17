<?php
// Script para obtener ejercicios recomendados por grupo muscular
session_start();
require_once __DIR__ . '/../../app/config/database.php';
header('Content-Type: application/json');

$muscle = trim(mb_strtolower($_GET['muscle'] ?? ''));
$user_id = $_SESSION['user']['id'] ?? null;
$lang = $_SESSION['user']['language'] ?? 'es';
$columna = ($lang === 'en') ? 'name_en' : 'name_es';

// Mapeo de grupos musculares que pueden estar guardados en inglés o en español
$muscle_map = [
    'pecho' => ['chest', 'pecho'],
    'espalda' => ['back', 'espalda'],
    'pierna' => ['legs', 'pierna'],
    'isquios' => ['hamstrings', 'isquios'],
    'hombro' => ['shoulders', 'hombro'],
    'biceps' => ['biceps'],
    'triceps' => ['triceps'],
    'abs' => ['abs'],
    'chest' => ['chest', 'pecho'],
    'back' => ['back', 'espalda'],
    'legs' => ['legs', 'pierna'],
    'hamstrings' => ['hamstrings', 'isquios'],
    'shoulders' => ['shoulders', 'hombro'],
];

// Validar parámetros requeridos
if (!$muscle || !$user_id) {
    echo json_encode([]);
    exit;
}

$muscle_values = $muscle_map[$muscle] ?? [$muscle];
$placeholders = implode(',', array_fill(0, count($muscle_values), '?'));

try {
    // Consultar ejercicios recomendados no incluidos en el entrenamiento del usuario
    $sql = "SELECT id, $columna AS name, image_url 
            FROM exercises_library 
            WHERE muscle_group IN ($placeholders) 
            AND is_recommended = 1
            AND id NOT IN (SELECT exercise_id FROM user_workouts WHERE user_id = ?)";
    
    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge($muscle_values, [$user_id]));
    $exercises = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($exercises);
} catch (Exception $e) {
    // Manejar errores
    echo json_encode(['error' => $e->getMessage()]);
}
?>