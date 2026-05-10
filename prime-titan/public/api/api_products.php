<?php
// Aseguramos que la sesión esté activa antes de cualquier otra cosa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../app/config/database.php'; 
require_once __DIR__ . '/../../app/models/Product.php';

header('Content-Type: application/json');

try {
    // Verificamos dónde está guardado el ID del usuario
    $user_id = 0;
    if (isset($_SESSION['user']) && isset($_SESSION['user']['id'])) {
        $user_id = $_SESSION['user']['id'];
    }

    // Usamos la conexión
    $conexion = (isset($db)) ? $db : $pdo;

    $productModel = new Product($conexion); 
    $products = $productModel->getAll($user_id);

    echo json_encode($products);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
exit;