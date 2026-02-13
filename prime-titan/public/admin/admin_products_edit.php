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
    echo "<p>Producto no encontrado.</p>";
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

    <h2 class="admin-title">Editar producto</h2>

    <form method="POST" enctype="multipart/form-data" class="admin-form">

        <label>Nombre del producto</label>
        <input type="text" name="name" value="<?php echo $product['name']; ?>" required>

        <label>Precio (€)</label>
        <input type="number" step="0.01" name="price" value="<?php echo $product['price']; ?>" required>

        <label>Imagen actual</label>
        <p style="font-size:4vw; color:#555;"><?php echo $product['image']; ?></p>

        <label>Seleccionar imagen existente</label>
        <select name="image_select" class="image-select">
            <option value="">-- Mantener actual --</option>
            <?php
            $images = scandir(__DIR__ . '/../../assets/images/');
            foreach ($images as $img) {
                if ($img === '.' || $img === '..') continue;
                $selected = ($product['image'] === $img) ? 'selected' : '';
                echo "<option value='$img' $selected>$img</option>";
            }
            ?>
        </select>

        <label>O subir nueva imagen</label>
        <input type="file" name="image_upload" accept="image/*">

        <button type="submit" class="btn-save">Guardar cambios</button>

    </form>

</div>




<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>