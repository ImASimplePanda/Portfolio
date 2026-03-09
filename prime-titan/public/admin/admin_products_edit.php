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

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/admin-products.css">';
require_once BASE_DIR . '/views/layouts/header.php';

$productModel = new Product($db);

$id = $_GET['id'];
$product = $productModel->getById($id);

if (!$product) {
    echo "<p>" . __t('product_not_found') . "</p>";
    exit;
}

// Procesar formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = $_POST['name'];
    $price = $_POST['price'];
    $image = $_POST['image'];

    $productModel->update($id, $name, $price, $image);

    header("Location: " . BASE_URL . "admin/admin_products.php");
    exit;
}

$imageName = $product['image'];

// Si sube una nueva imagen
if (!empty($_FILES['image_upload']['name'])) {
    $imageName = basename($_FILES['image_upload']['name']);
    $targetPath = __DIR__ . '/../../assets/images/' . $imageName;
    move_uploaded_file($_FILES['image_upload']['tmp_name'], $targetPath);
}
// Si selecciona una existente
else if (!empty($_POST['image_select'])) {
    $imageName = $_POST['image_select'];
}
?>

<div class="content-box">

    <h2 class="admin-title"><?= __t('edit_product') ?></h2>

    <form method="POST" enctype="multipart/form-data" class="admin-form">

        <label><?= __t('product_name') ?></label>
        <input type="text" name="name" value="<?= $product['name']; ?>" required>

        <label><?= __t('price') ?> (€)</label>
        <input type="number" step="0.01" name="price" value="<?= $product['price']; ?>" required>

        <label><?= __t('current_image') ?></label>
        <p style="font-size:4vw; color:#555;"><?= $product['image']; ?></p>

        <label><?= __t('select_existing_image') ?></label>
        <select name="image_select" class="image-select">
            <option value="">-- <?= __t('keep_current') ?> --</option>
            <?php
            $images = scandir(__DIR__ . '/../../assets/images/');
            foreach ($images as $img) {
                if ($img === '.' || $img === '..') continue;
                $selected = ($product['image'] === $img) ? 'selected' : '';
                echo "<option value='$img' $selected>$img</option>";
            }
            ?>
        </select>

        <label><?= __t('upload_new_image') ?></label>
        <input type="file" name="image_upload" accept="image/*">

        <button type="submit" class="btn-save"><?= __t('save_changes') ?></button>

    </form>

</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>




<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>