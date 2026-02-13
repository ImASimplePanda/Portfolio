<?php
session_start();
require_once __DIR__ . '/../app/config/config.php';
require_once __DIR__ . '/../app/config/database.php';

// Cargar CSS específico del carrito ANTES del header
$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/cart.css">';

require_once BASE_DIR . '/views/layouts/header.php';

// Si no hay usuario, redirigir
if (!isset($_SESSION['user'])) {
    header("Location: " . BASE_URL . "login.php");
    exit;
}

$userId = $_SESSION['user']['id'];
?>

<div class="page-wrapper">

    <div class="content-box">

        <div class="cart-wrapper">

            <h2 class="cart-title">Mi carrito</h2>

            <div id="cart-container"></div>

            <div class="cart-total">
                Total: <span id="cart-total-price">0€</span>
            </div>

            <button id="buy-btn" class="buy-btn">Comprar</button>

        </div>

    </div>

    <?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>

</div>