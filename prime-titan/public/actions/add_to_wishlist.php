<?php
session_start();

require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';

// Asegurarnos de responder en JSON
header('Content-Type: application/json');

// Si no hay usuario en sesión
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => __t('login_required')]);
    exit;
}

$user_id = $_SESSION['user']['id'];

// Recibir ID por POST
if (!isset($_POST['id'])) {
    echo json_encode(['success' => false, 'message' => 'No ID provided']);
    exit;
}

$product_id = intval($_POST['id']);

// Verificar que el producto existe
$stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
$stmt->execute([$product_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Invalid product']);
    exit;
}

// Verificar si ya está en wishlist
$stmt = $db->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
$stmt->execute([$user_id, $product_id]);
$exists = $stmt->fetch();

if ($exists) {
    echo json_encode(['success' => true, 'message' => __t('already_in_wishlist'), 'saved' => true]);
} else {
    // Insertar nuevo
    $stmt = $db->prepare("INSERT INTO wishlist (user_id, product_id, quantity) VALUES (?, ?, 1)");
    if ($stmt->execute([$user_id, $product_id])) {
        echo json_encode(['success' => true, 'message' => __t('added_to_fav'), 'saved' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
}
exit;