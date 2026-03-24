<?php
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/models/rating.php';

header('Content-Type: application/json');

session_start();

if (!isset($_GET['product_id'])) {
    echo json_encode(["error" => "INVALID_PRODUCT"]);
    exit;
}

$productId = intval($_GET['product_id']);
$ratingModel = new Rating($db);

// Obtener promedio y total de votos
$data = $ratingModel->getAverageRating($productId);
$avg = floatval($data['average']);
$total = intval($data['votes']);

$html = "<span>({$total} " . __t('votes') . ")</span>";

// Comprobar si el usuario ha votado
$hasVoted = false;

if (isset($_SESSION['user'])) {
    
    $userSession = $_SESSION['user'];

    if (is_array($userSession)) {
        // Si es array tipo ["admin"] o ["username" => "admin"]
        $userId = reset($userSession);
    } else {
        // Si es string normal
        $userId = $userSession;
    }

    $already = $ratingModel->userHasVoted($userId, $productId);
    $hasVoted = $already ? true : false;
}

// Devolvemos la respuesta
echo json_encode([
    "html"      => $html,
    "average"   => $avg,
    "hasVoted"  => $hasVoted
]);