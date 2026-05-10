<?php
// Script para obtener todos los ejercicios de la biblioteca
session_start();
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

// Verificar conexión a la base de datos
if (!isset($db)) {
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

try {
    // Determinar el idioma del usuario
    $lang = $_SESSION['user']['language'] ?? 'es';
    $nameField = ($lang === 'en') ? 'name_en' : 'name_es';

    // Consultar ejercicios de la biblioteca
    $stmt = $db->query("SELECT id, $nameField AS name, muscle_group, image_url FROM exercises_library");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    // Manejar errores
    echo json_encode(['error' => $e->getMessage()]);
}
?>