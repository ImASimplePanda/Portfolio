<?php
session_start();
require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/Exercise.php';

$exerciseModel = new Exercise($db);
$id = $_GET['id'];
$ex = $exerciseModel->getById($id);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name_es = $_POST['name_es'];
    $name_en = $_POST['name_en'];
    $muscle = $_POST['muscle_group'];
    $image = (!empty($_FILES['image_upload']['name'])) ? $_FILES['image_upload']['name'] : $_POST['image_select'];
    
    $exerciseModel->update($id, $name_es, $name_en, $muscle, $image);
    header("Location: " . BASE_URL . "admin/admin_exercises.php");
    exit;
}

require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="content-box">
    <h2 class="admin-title"><?= __t('edit_exercise') ?></h2>
    <form method="POST" enctype="multipart/form-data" class="admin-form">
        <label>Nombre (ES)</label>
        <input type="text" name="name_es" value="<?= htmlspecialchars($ex['name_es']); ?>" required>

        <label>Name (EN)</label>
        <input type="text" name="name_en" value="<?= htmlspecialchars($ex['name_en']); ?>" required>

        <label><?= __t('muscle_group') ?></label>
        <select name="muscle_group">
            <option value="chest" <?= $ex['muscle_group'] == 'chest' ? 'selected' : '' ?>>Chest</option>
            <option value="back" <?= $ex['muscle_group'] == 'back' ? 'selected' : '' ?>>Back</option>
            </select>
        
        <button type="submit" class="btn-save"><?= __t('save_changes') ?></button>
    </form>
</div>