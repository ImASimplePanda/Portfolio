<?php
ob_start();
session_start();
require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/Exercise.php';

// Definir la ruta física real de las imágenes
$img_folder_path = $_SERVER['DOCUMENT_ROOT'] . BASE_URL . 'assets/images/';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$exerciseModel = new Exercise($db);

// Función que traduce texto de español a inglés usando la API MyMemory
function translate_es_to_en(string $text): string {
    if (empty($text)) return '';
    $opts = ["http" => ["method" => "GET", "header" => "User-Agent: PHP\r\n"]];
    $context = stream_context_create($opts);
    $url = "https://api.mymemory.translated.net/get?q=" . urlencode($text) . "&langpair=es|en";
    $response = @file_get_contents($url, false, $context);
    $data = json_decode($response, true);
    return $data['responseData']['translatedText'] ?? $text;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name_es = trim($_POST['name_es']);
    $muscle_group = $_POST['muscle_group'];
    $is_recommended = isset($_POST['is_recommended']) ? (int)$_POST['is_recommended'] : 0;
    $name_en = translate_es_to_en($name_es);

    // Procesar imagen
    $imageName = 'default_exercise.png'; 

    // Si selecciona una existente
    if (!empty($_POST['image_select'])) {
        $imageName = $_POST['image_select'];
    }

    // Si sube una nueva
    if (!empty($_FILES['image_upload']['name'])) {
        $tempName = basename($_FILES['image_upload']['name']);
        $targetPath = $img_folder_path . $tempName; 
        if (move_uploaded_file($_FILES['image_upload']['tmp_name'], $targetPath)) {
            $imageName = $tempName;
        }
    }

    if ($exerciseModel->create($name_es, $name_en, $muscle_group, $imageName, $is_recommended)) {
        echo "<script>window.location.href = '" . BASE_URL . "admin/admin_exercises.php';</script>";
        exit;
    }
}

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/exercises.css">';
require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="content-box">
    <h2 class="admin-title"><?= __t('add_exercise') ?></h2>

    <form method="POST" enctype="multipart/form-data" class="admin-form">
        <label><?= __t('name') ?></label>
        <input type="text" name="name_es" required>

        <label><?= __t('muscle_group') ?></label>
        <select name="muscle_group" required>
            <option value="chest"><?= __t('chest') ?></option>
            <option value="back"><?= __t('back') ?></option>
            <option value="legs"><?= __t('legs') ?></option>
            <option value="shoulders"><?= __t('shoulders') ?></option>
            <option value="biceps"><?= __t('biceps') ?></option>
            <option value="triceps"><?= __t('triceps') ?></option>
            <option value="abs"><?= __t('abs') ?></option>
        </select>

        <label><?= __t('is_recommended') ?></label>
        <select name="is_recommended">
            <option value="0"><?= __t('no') ?></option>
            <option value="1"><?= __t('yes') ?></option>
        </select>

        <label><?= __t('select_existing_image') ?></label>
        <select name="image_select" class="image-select">
            <option value="">-- <?= __t('none') ?> --</option>
            <?php
            if (is_dir($img_folder_path)) {
                $images = scandir($img_folder_path);
                foreach ($images as $img) {
                    if (in_array($img, ['.', '..'])) continue;
                    $ext = strtolower(pathinfo($img, PATHINFO_EXTENSION));
                    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
                    if (in_array($ext, $allowed)) {
                        echo "<option value='$img'>$img</option>";
                    }
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