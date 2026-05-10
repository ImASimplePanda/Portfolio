<?php
ob_start(); // Captura cualquier error para que no ensucie el JSON
header('Content-Type: application/json');
session_start();

// Ajusta la ruta a la base de datos
require_once __DIR__ . '/../app/config/database.php'; 

$response = ["success" => false];

// Obtener ID de usuario
$user_id = null;
if (isset($_SESSION['user'])) {
    $user_id = is_array($_SESSION['user']) ? $_SESSION['user']['id'] : $_SESSION['user']->id;
}

$product_id = $_POST['id'] ?? null;

if ($user_id && $product_id) {
    if (isset($db)) {
        try {
            $query = "DELETE FROM wishlist WHERE user_id = :u AND product_id = :p";
            $stmt = $db->prepare($query);
            $stmt->execute([':u' => $user_id, ':p' => $product_id]);
            
            $response["success"] = true;
        } catch (Exception $e) {
            $response["error"] = $e->getMessage();
        }
    } else {
        $response["error"] = "Conexión \$db no definida";
    }
} else {
    $response["error"] = "Faltan datos";
}

ob_clean(); // Borra cualquier Warning de PHP que haya saltado antes
echo json_encode($response);
exit;