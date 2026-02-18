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

$error = null;
$success = null;

// Procesar formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = trim($_POST['name']);
    $price = floatval($_POST['price']);

    // Procesar imagen
    $imageName = null;

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

    // Intentar crear producto
    if (!$productModel->create($name, $price, $imageName)) {
        // Producto duplicado
        $error = "Este producto ya existe. Elige otro nombre.";
    } else {
        // Producto creado correctamente
        $success = "Producto creado correctamente.";
    }
}
?>

<div class="content-box">

    <h2 class="admin-title">Añadir producto</h2>

    <?php if ($error): ?>
        <p class="error-msg"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>

    <?php if ($success): ?>
        <p class="success-msg"><?= htmlspecialchars($success) ?></p>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data" class="admin-form">

        <label>Nombre del producto</label>
        <input type="text" name="name" required>

        <label>Precio (€)</label>
        <input type="number" step="0.01" name="price" required>

        <label>Seleccionar imagen existente</label>
        <select name="image_select" class="image-select">
            <option value="">-- Ninguna --</option>
            <?php
            $images = scandir(__DIR__ . '/../../assets/images/');
            foreach ($images as $img) {
                if ($img === '.' || $img === '..') continue;
                echo "<option value='$img'>$img</option>";
            }
            ?>
        </select>

        <label>O subir nueva imagen</label>
        <input type="file" name="image_upload" accept="image/*">

        <button type="submit" class="btn-save">Guardar</button>

    </form>

</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>