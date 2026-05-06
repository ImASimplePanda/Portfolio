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

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/exercises.css">';
require_once BASE_DIR . '/views/layouts/header.php';

$exerciseModel = new Exercise($db);
$id = $_GET['id'];
$ex = $exerciseModel->getById($id);

if (!$ex) {
    echo "<p>" . __t('exercise_not_found') . "</p>";
    exit;
}

// Procesar formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name_es = $_POST['name_es'];
    // Traducción automática
    $name_en = translate_es_to_en($name_es);
    
    $muscle = $_POST['muscle_group'];
    
    // Lógica de imagen
    $imageName = $ex['image_url'];
    if (!empty($_FILES['image_upload']['name'])) {
        $imageName = basename($_FILES['image_upload']['name']);
        $targetPath = __DIR__ . '/../../assets/images/' . $imageName;
        move_uploaded_file($_FILES['image_upload']['tmp_name'], $targetPath);
    } 
    else if (!empty($_POST['image_select'])) {
        $imageName = $_POST['image_select'];
    }

    $exerciseModel->update($id, $name_es, $name_en, $muscle, $imageName);

    header("Location: " . BASE_URL . "admin/admin_exercises.php");
    exit;
}
?>

<div class="content-box">

    <h2 class="admin-title"><?= __t('edit_exercise') ?></h2>

    <form method="POST" enctype="multipart/form-data" class="admin-form">

        <label><?= __t('name') ?></label>
        <input type="text" name="name_es" value="<?= htmlspecialchars($ex['name_es']); ?>" required>

        <label><?= __t('muscle_group') ?></label>
        <select name="muscle_group">
            <?php 
            $groups = ['chest', 'back', 'legs', 'shoulders', 'arms'];
            foreach ($groups as $g): 
            ?>
                <option value="<?= $g ?>" <?= $ex['muscle_group'] == $g ? 'selected' : '' ?>><?= ucfirst($g) ?></option>
            <?php endforeach; ?>
        </select>

        <label><?= __t('current_image') ?></label>
        <p style="font-size:4vw; color:#555;"><?= htmlspecialchars($ex['image_url']); ?></p>

        <label><?= __t('select_existing_image') ?></label>
        <select name="image_select" class="image-select">
            <option value="">-- <?= __t('keep_current') ?> --</option>
            <?php
            $dir = __DIR__ . '/../../assets/images/';
            $images = scandir($dir);
            foreach ($images as $img) {
                if ($img === '.' || $img === '..' || is_dir($dir . $img)) continue;
                $selected = ($ex['image_url'] === $img) ? 'selected' : '';
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