<?php
session_start();
require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/product.php';

// Solo admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$extra_css = '
<link rel="stylesheet" href="' . BASE_URL . 'assets/css/admin-products.css">
';

require_once BASE_DIR . '/views/layouts/header.php';

// Modelo
$productModel = new Product($db);
$products = $productModel->getAll();
?>

<div class="content-box">

    <h2 class="admin-title"><?= __t('product_management') ?></h2>


    <a href="<?= BASE_URL; ?>admin/admin_products_add.php" class="btn-add">
        + <?= __t('add_product') ?>
    </a>

    <div class="product-list">
        <?php foreach ($products as $p): ?>
            <div class="product-item">

                <img src="<?= BASE_URL; ?>assets/images/<?= $p['image']; ?>" class="product-img">

                <div class="product-info">
                    <p class="product-name"><?= htmlspecialchars($p['name']); ?></p>
                    <p class="product-price"><?= number_format($p['price'], 2); ?>€</p>
                </div>

                <div class="product-actions">
                    <a href="<?= BASE_URL; ?>admin/admin_products_edit.php?id=<?= $p['id']; ?>" class="btn-edit">
                        <?= __t('edit') ?>
                    </a>

                    <a 
                        href="<?= BASE_URL; ?>admin/admin_products_delete.php?id=<?= $p['id']; ?>" 
                        class="btn-delete"
                        onclick="return confirm('<?= __t('confirm_delete_product') ?>');">
                        <?= __t('delete') ?>
                    </a>
                </div>

            </div>
        <?php endforeach; ?>
    </div>

</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>
