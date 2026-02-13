<?php
session_start();
require_once __DIR__ . '/../../app/config/database.php';

if (!isset($_SESSION['user'])) {
    echo "NO_USER";
    exit;
}

$user_id = $_SESSION['user']['id'];
$product_id = $_POST['product_id'];
$rating = $_POST['rating'];

// Comprobar si ya votó
$stmt = $db->prepare("SELECT * FROM ratings WHERE user_id = ? AND product_id = ?");
$stmt->execute([$user_id, $product_id]);

if ($stmt->fetch()) {
    // Actualizar voto
    $stmt = $db->prepare("UPDATE ratings SET rating = ? WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$rating, $user_id, $product_id]);
} else {
    // Insertar voto nuevo
    $stmt = $db->prepare("INSERT INTO ratings (user_id, product_id, rating) VALUES (?, ?, ?)");
    $stmt->execute([$user_id, $product_id, $rating]);
}

echo "OK";