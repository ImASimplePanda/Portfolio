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

// Función de traducción ES -> EN 
function translate_es_to_en(string $text): string {
    
    return $text; 
}

// Procesar formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name_es        = trim($_POST['name_es']);
    $description_es = trim($_POST['description_es'] ?? '');
    $price          = floatval($_POST['price']);

    // Traducciones automáticas
    $name_en        = translate_es_to_en($name_es);
    $description_en = $description_es !== '' ? translate_es_to_en($description_es) : '';

    // Procesar imagen
    $imageName = null;

    // Si sube una nueva imagen
    if (!empty($_FILES['image_upload']['name'])) {
        $imageName  = basename($_FILES['image_upload']['name']);
        $targetPath = __DIR__ . '/../assets/images/' . $imageName;
        move_uploaded_file($_FILES['image_upload']['tmp_name'], $targetPath);
    }
    // Si selecciona una existente
    else if (!empty($_POST['image_select'])) {
        $imageName = $_POST['image_select'];
    }

    // Intentar crear producto
    if (!$productModel->create($name_es, $name_en, $description_es, $description_en, $price, $imageName)) {
        $error = __t('product_exists'); // Producto duplicado
    } else {
        $success = __t('product_created'); // Producto creado
    }
}
?>

<div class="content-box">

    <h2 class="admin-title"><?= __t('add_product') ?></h2>

    <?php if ($error): ?>
        <p class="error-msg"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>

    <?php if ($success): ?>
        <p class="success-msg"><?= htmlspecialchars($success) ?></p>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data" class="admin-form">

        <label><?= __t('product_name') ?> </label>
        <input type="text" name="name_es" required>

        <label><?= __t('description') ?> </label>
        <textarea name="description_es" rows="4"></textarea>

        <label><?= __t('price') ?> (€)</label>
        <input type="number" step="0.01" name="price" required>

        <label><?= __t('select_existing_image') ?></label>
        <select name="image_select" class="image-select">
            <option value="">-- <?= __t('none') ?> --</option>
            <?php
            $images = scandir(__DIR__ . '/../../assets/images/');
            foreach ($images as $img) {
                if ($img === '.' || $img === '..') continue;
                echo "<option value='$img'>$img</option>";
            }
            ?>
        </select>

        <label><?= __t('upload_new_image') ?></label>
        <input type="file" name="image_upload" accept="image/*">

        <button type="submit" class="btn-save"><?= __t('save') ?></button>

    </form>

</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>
