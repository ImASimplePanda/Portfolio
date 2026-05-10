<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

// Obtener el ID del entrenamiento a borrar
$id = $_POST['id'] ?? null;
$user_id = $_SESSION['user']['id'] ?? null;

if ($id && $user_id) {
    try {
        $stmt = $db->prepare("DELETE FROM user_workouts WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        // Si hay un error, lo devolvemos como JSON para que React lo entienda
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID de entrenamiento o sesión no válida']);
}
?>