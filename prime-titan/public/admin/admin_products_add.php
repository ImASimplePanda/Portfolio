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

$productModel = new Product($db);
$error = null;
$success = null;

// Función de traducción
function translate_es_to_en(string $text): string {
    if (empty($text)) return '';
    $url = "https://api.mymemory.translated.net/get?q=" . urlencode($text) . "&langpair=es|en";
    $response = @file_get_contents($url);
    $data = json_decode($response, true);
    if (isset($data['responseData']['translatedText'])) {
        return $data['responseData']['translatedText'];
    }
    return $text; 
}

// Procesar formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name_es        = trim($_POST['name_es']);
    $description_es = trim($_POST['description_es'] ?? '');
    $price          = floatval($_POST['price']);

    // Traducciones
    $name_en        = translate_es_to_en($name_es);
    $description_en = ($description_es !== '') ? translate_es_to_en($description_es) : '';

    // Procesar imagen
    $imageName = null;
    if (!empty($_FILES['image_upload']['name'])) {
        $imageName  = basename($_FILES['image_upload']['name']);
        $targetPath = '../assets/images/' . $imageName;
        move_uploaded_file($_FILES['image_upload']['tmp_name'], $targetPath);
    } else if (!empty($_POST['image_select'])) {
        $imageName = $_POST['image_select'];
    }

    // Guardar
    if (!$productModel->create($name_es, $name_en, $description_es, $description_en, $price, $imageName)) {
        $error = __t('product_exists'); 
    } else {
        $success = __t('product_created'); 
    }
}

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/admin-products.css">';
require_once BASE_DIR . '/views/layouts/header.php';
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
        <label><?= __t('product_name') ?></label>
        <input type="text" name="name_es" placeholder="<?= __t('placeholder_name_product') ?>" required>

        <label><?= __t('description') ?></label>
        <textarea name="description_es" rows="4" placeholder="<?= __t('placeholder_description_product') ?>"></textarea>

        <label><?= __t('price') ?> (€)</label>
        <input type="number" step="0.01" name="price" required>

        <label><?= __t('select_existing_image') ?></label>
        <select name="image_select">
            <option value="">-- <?= __t('none') ?> --</option>
            <?php
            $imgPath = __DIR__ . '/../../assets/images/';
            if (is_dir($imgPath)) {
                $images = scandir($imgPath);
                foreach ($images as $img) {
                    if ($img === '.' || $img === '..' || is_dir($imgPath . $img)) continue;
                    echo "<option value='$img'>$img</option>";
                }
            }
            ?>
        </select>

        <label><?= __t('upload_new_image') ?></label>
        <input type="file" name="image_upload" accept="image/*">

        <button type="submit" class="btn-save"><?= __t('save') ?></button>
    </form>
</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>