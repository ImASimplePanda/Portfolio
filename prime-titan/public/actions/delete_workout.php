<?php
session_start();
// Asegúrate de que esta ruta apunta correctamente a tu archivo de conexión
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

// Obtener el ID del entrenamiento a borrar
$id = $_POST['id'] ?? null;
$user_id = $_SESSION['user']['id'] ?? null;

if ($id && $user_id) {
    try {
        // En PDO, preparamos la sentencia con ?
        $stmt = $db->prepare("DELETE FROM user_workouts WHERE id = ? AND user_id = ?");
        
        // Ejecutamos pasando el array de valores directamente.
        // Esto sustituye al bind_param de MySQLi.
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