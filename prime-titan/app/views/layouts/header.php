<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/product.php';
?>
<!DOCTYPE html>
<html lang="<?= $_SESSION['user']['language'] ?? 'es' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PrimeTitan</title>
    <link rel="stylesheet" href="<?= BASE_URL; ?>assets/css/header.css">
    <link rel="stylesheet" href="<?= BASE_URL; ?>assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <?php if (isset($extra_css)) echo $extra_css; ?>
</head>
<body class="<?= $_SESSION['user']['theme'] ?? 'light' ?>">

<script>
    window.USER_ID = <?= isset($_SESSION['user']) ? $_SESSION['user']['id'] : 'null'; ?>;
    window.BASE_URL = "<?= BASE_URL; ?>";
</script>

<header class="main-header">
    <button class="menu-btn" id="menuBtn">☰</button>

    <div class="logo-container">
        <a href="<?= BASE_URL ?>index.php">
            <img src="<?= BASE_URL ?>assets/icons/logo.png" class="logo-img" alt="PrimeTitan">
        </a>
    </div>

    <nav class="main-navbar" id="mainNavbar">
        <button class="close-btn" id="closeBtn">&times;</button>
        
        <ul class="nav-main-links">
            <li><a href="<?= BASE_URL ?>index.php"><?php renderIcon('home-2.svg'); ?> <span><?= __t('home') ?></span></a></li>
            <li><a href="<?= BASE_URL ?>cart.php"><?php renderIcon('shopping-cart.svg'); ?> <span><?= __t('cart') ?></span></a></li>
            <li><a href="<?= BASE_URL ?>wishlist.php"><?php renderIcon('heart-star.svg'); ?> <span><?= __t('wishlist') ?></span></a></li>

            <?php if (isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin'): ?>
                <li><a href="<?= BASE_URL ?>admin/admin_products.php"><?php renderIcon('package.svg'); ?> <span><?= __t('products') ?></span></a></li>
                <li><a href="<?= BASE_URL ?>admin/users.php"><?php renderIcon('user.svg'); ?> <span><?= __t('users') ?></span></a></li>
                <li><a href="<?= BASE_URL ?>admin/admin_exercises.php"><?php renderIcon('barbell.svg'); ?> <span><?= __t('admin_exercises') ?></span></a></li>
            <?php endif; ?>
        </ul>
    </nav>

    <div class="nav-user-section">
        <?php if (isset($_SESSION['user'])): ?>
            <div class="user-dropdown-container" id="userMenuBtn">
                <div class="user-trigger">
                    <span class="user-name-label"><?= $_SESSION['user']['username'] ?></span>
                    <img src="<?= BASE_URL ?>assets/images/<?= $_SESSION['user']['avatar'] ?>" class="user-avatar" alt="Avatar">
                </div>
                <div class="dropdown-content" id="userDropdown">
                    <a href="<?= BASE_URL ?>profile.php"><?= __t('profile') ?></a>
                    <a href="<?= BASE_URL ?>preferences.php"><?= __t('preferences') ?></a>
                    <a href="<?= BASE_URL ?>exercises.php"><?= __t('exercises') ?></a>
                    <hr>
                    <a href="<?= BASE_URL ?>logout.php" class="logout-link"><?= __t('logout') ?></a>
                </div>
            </div>
        <?php else: ?>
            <a href="<?= BASE_URL ?>login.php" class="login-navbar-btn"><?= __t('login') ?></a>
        <?php endif; ?>
    </div>
</header>

<div class="overlay" id="overlay"></div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const closeBtn = document.getElementById("closeBtn");
    const mainNavbar = document.getElementById("mainNavbar");
    const overlay = document.getElementById("overlay");
    const userBtn = document.getElementById("userMenuBtn");
    const dropdown = document.getElementById("userDropdown");

    // Abrir/Cerrar Side Menu
    if (menuBtn && mainNavbar) {
        menuBtn.addEventListener("click", () => {
            mainNavbar.classList.add("active");
            overlay.classList.add("active");
        });
    }

    const closeMenu = () => {
        mainNavbar.classList.remove("active");
        overlay.classList.remove("active");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    // Dropdown Usuario
    if (userBtn && dropdown) {
        userBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("show");
        });
        document.addEventListener("click", () => dropdown.classList.remove("show"));
    }
});
</script>

<script>
    // Esto permite que los archivos JS conozcan las rutas
    window.BASE_URL = '<?= BASE_URL ?>';
    window.USER_ID = '<?= $_SESSION['user']['id'] ?? "guest" ?>';
</script>
