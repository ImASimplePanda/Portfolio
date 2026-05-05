<?php
session_start();
require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/Exercise.php';

// Solo admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$exerciseModel = new Exercise($db);

// Función traducción
function translate_es_to_en(string $text): string {
    if (empty($text)) return '';
    $url = "https://api.mymemory.translated.net/get?q=" . urlencode($text) . "&langpair=es|en";
    $response = @file_get_contents($url);
    $data = json_decode($response, true);
    return $data['responseData']['translatedText'] ?? $text;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name_es      = trim($_POST['name_es']);
    $muscle_group = $_POST['muscle_group'];
    
    // Traducción automática
    $name_en = translate_es_to_en($name_es);

    // Procesar imagen
    $imageName = null;
    if (!empty($_FILES['image_upload']['name'])) {
        $imageName = basename($_FILES['image_upload']['name']);
        move_uploaded_file($_FILES['image_upload']['tmp_name'], __DIR__ . '/../../assets/images/' . $imageName);
    } else if (!empty($_POST['image_select'])) {
        $imageName = $_POST['image_select'];
    }

    if ($exerciseModel->create($name_es, $name_en, $muscle_group, $imageName)) {
        header("Location: " . BASE_URL . "admin/admin_exercises.php");
        exit;
    }
}

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/admin-products.css">';
require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="content-box">
    <h2 class="admin-title"><?= __t('add_exercise') ?></h2>

    <form method="POST" enctype="multipart/form-data" class="admin-form">
        <label><?= __t('name') ?> </label>
        <input type="text" name="name_es" placeholder="Ej: Press de Banca" required>

        <label><?= __t('muscle_group') ?> </label>
        <select name="muscle_group" required>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="legs">Legs</option>
            <option value="shoulders">Shoulders</option>
            <option value="arms">Arms</option>
        </select>

        <label><?= __t('select_existing_image') ?></label>
        <select name="image_select" class="image-select">
            <option value="">-- --</option>
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