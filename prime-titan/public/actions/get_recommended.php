<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';
header('Content-Type: application/json');

$muscle = $_GET['muscle'] ?? '';
$user_id = $_SESSION['user']['id'] ?? null;
$lang = $_SESSION['user']['language'] ?? 'es';
$columna = ($lang === 'en') ? 'name_en' : 'name_es';

if (!$muscle || !$user_id) {
    echo json_encode([]);
    exit;
}

try {
    // 1. muscle_group = ? : Filtra por el músculo seleccionado
    // 2. is_recommended = 1 : Solo trae los que tú has marcado como recomendados
    // 3. NOT IN : Excluye los que el usuario ya tiene en su rutina
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
    // Es buena práctica no mostrar el error real al usuario final por seguridad, 
    // pero para desarrollo puedes dejarlo así:
    echo json_encode(['error' => $e->getMessage()]);
}
?>