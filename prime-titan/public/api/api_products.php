<?php
// Aseguramos que la sesión esté activa antes de cualquier otra cosa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../app/config/database.php'; 
require_once __DIR__ . '/../../app/models/Product.php';

header('Content-Type: application/json');

try {
    // 1. Verificamos EXACTAMENTE dónde tienes guardado el ID del usuario
    // Si tu sesión guarda el usuario en $_SESSION['user']['id'], esto funcionará:
    $user_id = 0;
    if (isset($_SESSION['user']) && isset($_SESSION['user']['id'])) {
        $user_id = $_SESSION['user']['id'];
    }

    // 2. Usamos la conexión (asegúrate de que en database.php se llame $db o $pdo)
    // Si tu archivo database.php crea $db, usa $db. Si crea $pdo, usa $pdo.
    $conexion = (isset($db)) ? $db : $pdo;

    $productModel = new Product($conexion); 
    $products = $productModel->getAll($user_id);

    echo json_encode($products);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
exit;