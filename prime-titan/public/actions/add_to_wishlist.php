<?php
session_start();

require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';

// Si no hay usuario, no permitir
if (!isset($_SESSION['user'])) {
    echo "NO_USER";
    exit;
}

$user_id = $_SESSION['user']['id'];

// Recibir ID por POST
if (!isset($_POST['id'])) {
    echo "NO_ID";
    exit;
}

$product_id = intval($_POST['id']);

// Verificar que el producto existe
$stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
$stmt->execute([$product_id]);
if (!$stmt->fetch()) {
    echo "INVALID_PRODUCT";
    exit;
}

// Verificar si ya está en wishlist
$stmt = $db->prepare("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?");
$stmt->execute([$user_id, $product_id]);
$exists = $stmt->fetch();

if ($exists) {
    // Aumentar cantidad
    $stmt = $db->prepare("UPDATE wishlist SET quantity = quantity WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$user_id, $product_id]);
} else {
    // Insertar nuevo
    $stmt = $db->prepare("INSERT INTO wishlist (user_id, product_id, quantity) VALUES (?, ?, 1)");
    $stmt->execute([$user_id, $product_id]);
}

echo "OK";
exit;