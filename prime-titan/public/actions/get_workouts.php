<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';
header('Content-Type: application/json');

// 1. Obtener idioma de la sesión (por defecto 'es' si no existe)
$lang = $_SESSION['user']['language'] ?? 'es';

// 2. Lista blanca: Solo permitimos estas dos opciones. 
// Si alguien intenta enviar otra cosa, por defecto será 'name_es'.
$columna_nombre = ($lang === 'en') ? 'name_en' : 'name_es';

$user_id = $_SESSION['user']['id'];

// 3. Construimos la consulta insertando la variable $columna_nombre
// Seleccionamos la columna necesaria y la renombramos como 'name' 
// para que tu React no tenga que cambiar nada.
$sql = "SELECT uw.id, uw.day_of_week, uw.sets, uw.reps, e.$columna_nombre AS name, e.image_url 
        FROM user_workouts uw 
        JOIN exercises_library e ON uw.exercise_id = e.id 
        WHERE uw.user_id = ?";

try {
    $stmt = $db->prepare($sql);
    $stmt->execute([$user_id]);
    $workouts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($workouts);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>