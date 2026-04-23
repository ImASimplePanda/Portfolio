<?php

require_once __DIR__ . '/../../app/config/database.php'; 
require_once __DIR__ . '/../../app/models/Product.php';

header('Content-Type: application/json');

try {
    // Usamos la variable $db que viene de database.php
    $productModel = new Product($db); 
    $products = $productModel->getAll();

    echo json_encode($products);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
exit;