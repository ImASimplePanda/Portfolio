<?php
session_start();
require_once __DIR__ . '/../app/config/config.php';
require_once __DIR__ . '/../app/config/database.php';
require_once __DIR__ . '/../app/models/product.php';

// LÓGICA DE SESIÓN Y REDIRECCIÓN
if (!isset($_SESSION['user'])) {
    header("Location: " . BASE_URL . "login.php");
    exit;
}

$user_id = $_SESSION['user']['id']; 
$lang = (isset($_SESSION['user']['language']) && $_SESSION['user']['language'] === 'en') ? 'en' : 'es';
$name_col = "name_" . $lang; 

// LÓGICA DE ACCIONES
if (isset($_GET['action'])) {
    $id = $_GET['id'];
    
    if ($_GET['action'] === 'plus') {
        $stmt = $db->prepare("UPDATE wishlist SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $id]);
    }
    
    if ($_GET['action'] === 'minus') {
        $stmt = $db->prepare("UPDATE wishlist SET quantity = GREATEST(quantity - 1, 1) WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $id]);
    }
    
    if ($_GET['action'] === 'remove') {
        $stmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $id]);
    }

    header("Location: wishlist.php");
    exit;
}

// OBTENCIÓN DE DATOS
$stmt = $db->prepare("
    SELECT w.product_id AS id, w.quantity, p.$name_col AS name, p.price, p.image
    FROM wishlist w
    JOIN products p ON p.id = w.product_id
    WHERE w.user_id = ?
");
$stmt->execute([$user_id]);
$wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/wishlist.css">';
require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="page-wrapper">
    <main class="wishlist-wrapper">
        <div class="wishlist-box">
            <h2 class="wishlist-title"><?= __t('wishlist_title') ?></h2>

            <?php if (empty($wishlist)): ?>
                <p class="wishlist-empty"><?= __t('wishlist_empty') ?></p>
            <?php else: ?>
                <div class="wishlist-grid">
                    <?php foreach ($wishlist as $item): ?>
                        <div class="cart-item"> 
                            <img src="<?= BASE_URL ?>assets/images/<?= $item['image']; ?>" class="cart-img">
                            
                            <div class="cart-info">
                                <p class="cart-item-name"><strong><?= $item['name']; ?></strong></p>
                                <p class="cart-item-price"><?= number_format($item['price'], 2); ?>€</p>
                                
                                <div class="wishlist-qty-row">
                                    <a href="wishlist.php?action=minus&id=<?= $item['id']; ?>" class="qty-btn-dark">-</a>
                                    <span class="qty-text">Cantidad: <?= $item['quantity']; ?></span>
                                    <a href="wishlist.php?action=plus&id=<?= $item['id']; ?>" class="qty-btn-dark">+</a>
                                </div>

                                <div class="wishlist-actions-row">
                                    <button class="add-from-wishlist btn-action-dark" 
                                            data-id="<?= $item['id']; ?>" 
                                            data-name="<?= $item['name']; ?>"
                                            data-price="<?= $item['price']; ?>"
                                            data-image="<?= $item['image']; ?>"
                                            data-quantity="<?= $item['quantity']; ?>">
                                        <?= __t('add'); ?>
                                    </button>

                                    <a href="wishlist.php?action=remove&id=<?= $item['id']; ?>" class="btn-remove-dark">
                                        <?= __t('remove'); ?>
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </main>

    <?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>
</div>