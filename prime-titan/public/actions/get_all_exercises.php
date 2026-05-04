<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

if (!isset($db)) {
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

try {
    $lang = $_SESSION['user']['language'] ?? 'es';
    $nameField = ($lang === 'en') ? 'name_en' : 'name_es';
    
    // Usamos $db en lugar de $pdo
    $stmt = $db->query("SELECT id, $nameField AS name, muscle_group, image_url FROM exercises_library");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>