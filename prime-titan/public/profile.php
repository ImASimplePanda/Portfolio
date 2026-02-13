<?php
session_start();

include __DIR__ . '/../app/views/layouts/header.php';


// Si no hay sesión, redirige al login
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

// Traer usuario de la sesión
$user = $_SESSION['user'];

?>

<div class="page-wrapper">
    <div class="content-box profile-box">

        <div class="profile-card">

            <div class="profile-avatar-wrapper">
                <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($user['avatar']) ?>" 
                    class="profile-avatar" id="avatarPreview">
            </div>

            <button class="change-avatar-btn" onclick="document.getElementById('avatarInput').click()">
                Cambiar foto
            </button>

            <form id="avatarForm" action="actions/update_avatar.php" method="POST" enctype="multipart/form-data">
                <input type="file" name="avatar" id="avatarInput" accept="image/*" hidden>
            </form>



            <div class="profile-username">
                <?= htmlspecialchars($user['username']) ?>
            </div>

            <div class="profile-info">

                <div class="profile-item">
                    <span class="label">Email</span>
                    <span class="value"><?= htmlspecialchars($user['email']) ?></span>
                </div>

                <div class="profile-item">
                    <span class="label">Miembro desde</span>
                    <span class="value"><?= date('d/m/Y', strtotime($user['created_at'])) ?></span>
                </div>

                <div class="profile-item">
                    <span class="label">Ubicación actual</span>
                    <span class="value" id="geo-location">Detectando ubicación...</span>
                </div>

            </div>


        </div>


    </div>
</div>

<?php

include __DIR__ . '/../app/views/layouts/footer.php';
?>

<script>
document.getElementById("avatarInput").addEventListener("change", () => {
    document.getElementById("avatarForm").submit();
});
</script>

