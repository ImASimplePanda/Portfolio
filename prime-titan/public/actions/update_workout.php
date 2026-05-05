<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$id = $_POST['id'] ?? null;
$field = $_POST['field'] ?? null; // 'sets' o 'reps'
$value = $_POST['value'] ?? null;
$user_id = $_SESSION['user']['id'];

// Lista blanca: Permitimos SOLO estos campos
$allowed_fields = ['sets', 'reps', 'weight'];

if ($id && in_array($field, $allowed_fields) && is_numeric($value)) {
    try {
        // Preparamos la consulta. Nota: $field es seguro porque está en el array $allowed_fields
        $sql = "UPDATE user_workouts SET $field = ? WHERE id = ? AND user_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$value, $id, $user_id]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
}
?>