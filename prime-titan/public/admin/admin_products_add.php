<?php
ob_start(); // Prevenir errores de headers
session_start();

require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/product.php';

// Definir la ruta física real de las imágenes usando tus constantes
$img_folder_path = $_SERVER['DOCUMENT_ROOT'] . BASE_URL . 'assets/images/';

// Solo admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$productModel = new Product($db);
$error = null;
$success = null;

// Función que traduce texto de español a inglés usando la API MyMemory
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

    // PROCESAR IMAGEN 
    $imageName = 'default.png'; 

    // Si elige una existente del desplegable
    if (!empty($_POST['image_select'])) {
        $imageName = $_POST['image_select'];
    }

    // Si sube una nueva imagen 
    if (!empty($_FILES['image_upload']['name'])) {
        $tempName = basename($_FILES['image_upload']['name']);
        $targetPath = $img_folder_path . $tempName;
        
        if (move_uploaded_file($_FILES['image_upload']['tmp_name'], $targetPath)) {
            $imageName = $tempName;
        }
    }

    // Guardar en Base de Datos
    if (!$productModel->create($name_es, $name_en, $description_es, $description_en, $price, $imageName)) {
        $error = __t('product_exists'); 
    } else {
        $success = __t('product_created');
        // Redirigir tras 2 segundos para ver el mensaje de éxito
        echo "<script>setTimeout(() => { window.location.href = '" . BASE_URL . "admin/admin_products.php'; }, 2000);</script>";
    }
}

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/admin-products.css">';
require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="content-box">
    <h2 class="admin-title"><?= __t('add_product') ?></h2>

    <?php if ($error): ?>
        <p class="error-msg" style="color:red; background: #ffe6e6; padding: 10px; border-radius: 5px;"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>

    <?php if ($success): ?>
        <p class="success-msg" style="color:green; background: #e6ffec; padding: 10px; border-radius: 5px;"><?= htmlspecialchars($success) ?></p>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data" class="admin-form">
        <label><?= __t('product_name') ?></label>
        <input type="text" name="name_es" placeholder="<?= __t('placeholder_name_product') ?>" required>

        <label><?= __t('description') ?></label>
        <textarea name="description_es" rows="4" placeholder="<?= __t('placeholder_description_product') ?>"></textarea>

        <label><?= __t('price') ?> (€)</label>
        <input type="number" step="0.01" name="price" required>

        <label><?= __t('select_existing_image') ?></label>
        <select name="image_select" class="image-select" style="width: 100%; padding: 10px; border-radius: 8px; margin-bottom: 20px;">
            <option value="">-- <?= __t('none') ?> --</option>
            <?php
            // Usamos la ruta absoluta calculada arriba para el scandir
            if (is_dir($img_folder_path)) {
                $images = scandir($img_folder_path);
                foreach ($images as $img) {
                    if (in_array($img, ['.', '..'])) continue;
                    
                    $ext = strtolower(pathinfo($img, PATHINFO_EXTENSION));
                    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
                    
                    if (in_array($ext, $allowed)) {
                        echo "<option value='" . htmlspecialchars($img) . "'>$img</option>";
                    }
                }
            } else {
                echo "<option disabled>Error: Carpeta de imágenes no encontrada</option>";
            }
            ?>
        </select>

        <label><?= __t('upload_new_image') ?></label>
        <input type="file" name="image_upload" accept="image/*" style="margin-bottom: 20px;">

        <button type="submit" class="btn-save"><?= __t('save') ?></button>
    </form>
</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>