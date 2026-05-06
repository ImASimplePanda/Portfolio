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
$exercises = $exerciseModel->getAll(); // Ahora devuelve 'name' automáticamente

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/admin-products.css">';
require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="content-box">
    <h2 class="admin-title"><?= __t('exercise_management') ?></h2>

    <a href="<?= BASE_URL; ?>admin/admin_exercises_add.php" class="btn-add">
        + <?= __t('add_exercise') ?>
    </a>

    <div class="product-list">
        <?php foreach ($exercises as $e): ?>
            <div class="product-item">
                <img src="<?= BASE_URL; ?>assets/images/<?= $e['image_url']; ?>" class="product-img">
                
                <div class="product-info">
                    <p class="product-name"><?= htmlspecialchars($e['name']); ?></p>
                </div>

                <div class="product-actions">
                    <a href="<?= BASE_URL; ?>admin/admin_exercises_edit.php?id=<?= $e['id']; ?>" class="btn-edit">
                        <?= __t('edit') ?>
                    </a>

                    <a href="<?= BASE_URL; ?>admin/admin_exercises_delete.php?id=<?= $e['id']; ?>" 
                       class="btn-delete"
                       onclick="return confirm('<?= __t('confirm_delete') ?>');">
                        <?= __t('delete') ?>
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>