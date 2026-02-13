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

    <h2 class="admin-title">Gestión de Productos</h2>

    <!-- Botón añadir -->
    <a href="<?php echo BASE_URL; ?>admin/admin_products_add.php" class="btn-add">+ Añadir producto</a>

    <div class="product-list">
        <?php foreach ($products as $p): ?>
            <div class="product-item">

                <img src="<?php echo BASE_URL; ?>assets/images/<?php echo $p['image']; ?>" class="product-img">

                <div class="product-info">
                    <p class="product-name"><?php echo htmlspecialchars($p['name']); ?></p>
                    <p class="product-price"><?php echo number_format($p['price'], 2); ?>€</p>
                </div>

                <div class="product-actions">
                    <a href="<?php echo BASE_URL; ?>admin/admin_products_edit.php?id=<?php echo $p['id']; ?>" class="btn-edit">Editar</a>
                    <a 
                    href="<?php echo BASE_URL; ?>admin/admin_products_delete.php?id=<?php echo $p['id']; ?>" 
                    class="btn-delete"
                    onclick="return confirm('¿Seguro que quieres eliminar este producto?');">Eliminar
                </a>
                </div>

            </div>
        <?php endforeach; ?>
    </div>

</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>