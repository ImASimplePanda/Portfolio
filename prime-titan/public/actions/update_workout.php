<?php
session_start();
require_once '../../config/database.php';
header('Content-Type: application/json');

// 1. Verificación de sesión
if (!isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$id = $_POST['id'] ?? null;
$field = $_POST['field'] ?? null;
$value = $_POST['value'] ?? null;
$user_id = $_SESSION['user']['id']; // Obtenemos el ID del usuario logueado

// 2. Seguridad: Campos permitidos
$allowed_fields = ['sets', 'reps'];

if (!in_array($field, $allowed_fields) || !$id) {
    echo json_encode(['success' => false, 'message' => 'Invalid field']);
    exit;
}

// 3. Update con restricción de usuario (WHERE id = ? AND user_id = ?)
$stmt = $db->prepare("UPDATE user_workouts SET $field = ? WHERE id = ? AND user_id = ?");

// "iii" significa tres enteros (value, id, user_id)
$stmt->bind_param("iii", $value, $id, $user_id);

if ($stmt->execute()) {
    // Verificamos si realmente se actualizó algo
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró el registro o no tienes permiso']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta']);
}
?>