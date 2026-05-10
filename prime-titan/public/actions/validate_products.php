<?php
require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

// Obtener los datos enviados por el JS
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$ids = $data['ids'] ?? [];

if (empty($ids)) {
    echo json_encode([]);
    exit;
}

try {
    // Consultar qué IDs existen realmente en la tabla
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $db->prepare("SELECT id FROM products WHERE id IN ($placeholders)");
    $stmt->execute($ids);

    // Devolver array de strings 
    $validIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $validIds = array_map('strval', $validIds);
    
    echo json_encode($validIds);
} catch (Exception $e) {
    // Si hay error en la DB, devolvemos array vacío para no romper el JS
    echo json_encode([]);
}