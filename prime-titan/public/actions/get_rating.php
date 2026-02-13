<?php
require_once __DIR__ . '/../../app/config/database.php';

header('Content-Type: application/json');

$product_id = $_GET['product_id'] ?? null;

if (!$product_id) {
    echo json_encode(["error" => "Missing product_id"]);
    exit;
}

$stmt = $db->prepare("SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM ratings WHERE product_id = ?");
$stmt->execute([$product_id]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "average" => round($data['avg_rating'] ?? 0, 1),
    "count" => $data['total'] ?? 0
]);