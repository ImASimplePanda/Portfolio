<?php
ob_start();
session_start();

require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/product.php';

// 1. Definir la ruta física de las imágenes correctamente
// Según tu config, desde la raíz del proyecto sería: public/assets/images
$img_folder_path = $_SERVER['DOCUMENT_ROOT'] . BASE_URL . 'assets/images/';

// Solo admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$productModel = new Product($db);
$id = $_GET['id'] ?? null;
$product = $productModel->getById($id);

if (!$product) {
    echo "Producto no encontrado.";
    exit;
}

// PROCESAR FORMULARIO
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $price = $_POST['price'];
    $imageToSave = $product['image']; // Valor por defecto

    // Prioridad 1: Subida de archivo nuevo
    if (!empty($_FILES['image_upload']['name'])) {
        $imageName = basename($_FILES['image_upload']['name']);
        $targetPath = $img_folder_path . $imageName;
        if (move_uploaded_file($_FILES['image_upload']['tmp_name'], $targetPath)) {
            $imageToSave = $imageName;
        }
    } 
    // Prioridad 2: Selección de imagen existente
    else if (!empty($_POST['image_select'])) {
        $imageToSave = $_POST['image_select'];
    }

    $productModel->update($id, $name, $price, $imageToSave);
    
    // Redirección limpia
    echo "<script>window.location.href = '" . BASE_URL . "admin/admin_products.php';</script>";
    exit;
}

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/admin-products.css">';
require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="content-box">
    <h2 class="admin-title">Editar Producto</h2>

    <form method="POST" enctype="multipart/form-data" class="admin-form">
        <label>Nombre del producto</label>
        <input type="text" name="name" value="<?= htmlspecialchars($product['name']); ?>" required>

        <label>Precio (€)</label>
        <input type="number" step="0.01" name="price" value="<?= $product['price']; ?>" required>

        <label>Imagen actual: <span style="color: #007bff;"><?= $product['image']; ?></span></label>

        <label>Seleccionar una imagen ya subida:</label>
        <select name="image_select" class="image-select">
            <option value="">-- Mantener actual --</option>
            <?php
            // Listar archivos de la carpeta
            if (is_dir($img_folder_path)) {
                $images = scandir($img_folder_path);
                foreach ($images as $img) {
                    if (in_array($img, ['.', '..'])) continue;
                    
                    $ext = strtolower(pathinfo($img, PATHINFO_EXTENSION));
                    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
                    
                    if (in_array($ext, $allowed)) {
                        $selected = ($product['image'] === $img) ? 'selected' : '';
                        echo "<option value=\"$img\" $selected>$img</option>";
                    }
                }
            } else {
                echo "<option disabled>Carpeta no encontrada en: $img_folder_path</option>";
            }
            ?>
        </select>

        <label>O subir una nueva:</label>
        <input type="file" name="image_upload" accept="image/*">

        <button type="submit" class="btn-save">Guardar Cambios</button>
    </form>
</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>