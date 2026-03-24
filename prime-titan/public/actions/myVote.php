<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/rating.php';

session_start();

if (!isset($_SESSION['user'])) {
    echo json_encode(["error" => "NO_USER"]);
    exit;
}

$productId = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
$ratingValue = isset($_POST['rating']) ? intval($_POST['rating']) : 0;

if ($productId === 0 || $ratingValue === 0) {
    echo json_encode(["error" => "Faltan datos", "post" => $_POST]);
    exit;
}

// Obtener el Username 
$userSession = $_SESSION['user'];
$userId = is_array($userSession) ? reset($userSession) : $userSession;

$ratingModel = new Rating($db);

// Se revisa si ya votó
if ($ratingModel->userHasVoted($userId, $productId)) {
    echo json_encode(["error" => "ALREADY_VOTED"]);
    exit;
}

// Guardar
if ($ratingModel->saveVote($userId, $productId, $ratingValue)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "DB_REJECTED", "debug" => "Revisa si el usuario '$userId' existe en la tabla users"]);
}