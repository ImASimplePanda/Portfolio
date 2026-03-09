<?php
include __DIR__ . '/../app/views/layouts/header.php';

if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}

$user = $_SESSION['user'];
?>

<div class="page-wrapper">
    <div class="content-box">

        <div class="profile-box">
            <h2 class="profile-title"><?= __t('preferences') ?></h2>

            <div class="profile-card">

                <form action="actions/update_preferences.php" method="POST" style="width:100%; display:flex; flex-direction:column; gap:20px;">

                    <!-- Tema -->
                    <div class="profile-item">
                        <span class="label"><?= __t('theme') ?></span>
                        <select name="theme" class="pref-select" onchange="this.form.submit()">
                            <option value="light" <?= (($user['theme'] ?? 'light') === 'light') ? 'selected' : '' ?>>
                                <?= __t('light') ?>
                            </option>

                            <option value="dark" <?= (($user['theme'] ?? 'light') === 'dark') ? 'selected' : '' ?>>
                                <?= __t('dark') ?>
                            </option>
                        </select>
                    </div>

                    <!-- Idioma -->
                    <div class="profile-item">
                        <span class="label"><?= __t('language') ?></span>
                        <select name="language" class="pref-select" onchange="this.form.submit()">
                            <option value="es" <?= (($user['language'] ?? 'es') === 'es') ? 'selected' : '' ?>>
                                Español
                            </option>

                            <option value="en" <?= (($user['language'] ?? 'es') === 'en') ? 'selected' : '' ?>>
                                English
                            </option>
                        </select>
                    </div>

                </form>

            </div>
        </div>

    </div>
</div>

<?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>
