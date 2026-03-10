<?php
session_start();

// Si no hay sesión, redirige al login
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

include __DIR__ . '/../app/views/layouts/header.php';

// Traer usuario de la sesión
$user = $_SESSION['user'];
?>

<div class="page-wrapper">
    <div class="content-box profile-box">

        <div class="profile-card">

            <!-- Avatar -->
            <div class="profile-avatar-wrapper">
                <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($user['avatar']) ?>" 
                     class="profile-avatar" id="avatarPreview">
            </div>

            <!-- Botón cambiar foto -->
            <button class="change-avatar-btn" onclick="document.getElementById('avatarInput').click()">
                <?= __t('change_photo') ?>
            </button>

            <!-- Formulario oculto -->
            <form id="avatarForm" action="actions/update_avatar.php" method="POST" enctype="multipart/form-data">
                <input type="file" name="avatar" id="avatarInput" accept="image/*" hidden>
            </form>

            <!-- Nombre -->
            <div class="profile-username">
                <?= htmlspecialchars($user['username']) ?>
            </div>

            <!-- Información -->
            <div class="profile-info">

                <div class="profile-item">
                    <span class="label"><?= __t('email') ?></span>
                    <span class="value"><?= htmlspecialchars($user['email']) ?></span>
                </div>

                <div class="profile-item">
                    <span class="label"><?= __t('member_since') ?></span>
                    <span class="value"><?= date('d/m/Y', strtotime($user['created_at'])) ?></span>
                </div>

                <div class="profile-item">
                    <span class="label"><?= __t('current_location') ?></span>
                    <span class="value" id="geo-location"><?= __t('detecting_location') ?></span>
                </div>

                <!-- Mapa -->
                <div id="map" class="profile-map"></div>

            </div>

        </div>

    </div>
</div>

<?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>

<!-- Leaflet -->
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<!-- Script cambiar foto -->
<script>
document.getElementById("avatarInput").addEventListener("change", () => {
    document.getElementById("avatarForm").submit();
});
</script>

<!-- Script geolocalización + mapa -->
<script src="<?= BASE_URL ?>assets/js/ubication.js"></script>
