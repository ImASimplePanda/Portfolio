<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/product.php';



?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jeremi</title>

    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/style.css">

    <?php
    if (isset($extra_css)) echo $extra_css;
    ?>



</head>


<body>

<script>
    window.USER_ID = <?php echo isset($_SESSION['user']) ? $_SESSION['user']['id'] : 'null'; ?>;
    window.BASE_URL = "<?php echo BASE_URL; ?>";
</script>


<header class="header">
    <!-- Menu hamburguesa -->
    <button class="menu-btn" id="menuBtn">☰</button>

    <!-- Logo-->
    <div class="logo-container">
        <h1 class="logo">PrimeTitan</h1>
    </div>

    <!-- Perfil usuario -->
        <?php
        if (isset($_SESSION['user'])) {
        ?>
            <div class="profile-container" id="profileContainer">
                <img 
                    src="<?php echo BASE_URL; ?>assets/images/<?php echo $_SESSION['user']['avatar']; ?>" 
                    alt="Perfil" 
                    class="profile-pic" 
                    id="profilePic"
                >
                <div class="profile-dropdown" id="profileDropdown">
                    <ul>
                        <li><a href="<?php echo BASE_URL; ?>profile.php">Mi perfil</a></li>
                        <li><a href="/perfil.php">Preferencias</a></li>
                        <li><a href="<?php echo BASE_URL; ?>logout.php">Cerrar sesión</a></li>
                    </ul>
                </div>
            </div>
        <?php
        }
        ?>

</header>

<!-- Menu lateral -->
<nav class="side-menu" id="sideMenu">
    <button class="close-btn" id="closeBtn">✕</button>
    <ul>
        <li><a href="<?php echo BASE_URL; ?>index.php">🏠 Inicio</a></li>
        <li><a href="<?php echo BASE_URL; ?>cart.php">🛒 Carrito</a></li>
        <li><a href="<?php echo BASE_URL; ?>wishlist.php">❤️ Lista de deseados</a></li>

        <?php
        // Si hay usuario logueado
        if (isset($_SESSION['user'])) {

            // Si es admin, mostrar Productos y Usuarios
            if ($_SESSION['user']['role'] === 'admin') {
                ?>
                <li><a href="<?php echo BASE_URL; ?>admin/admin_products.php">📦 Productos</a></li>
                <li><a href="<?php echo BASE_URL; ?>admin/users.php">👥 Usuarios</a></li>
                <?php
            }

        } else {
            // Si no hay usuario logueado
            ?>
            <li><a href="<?php echo BASE_URL; ?>login.php">👤 Iniciar sesión</a></li>
            <?php
        }
        ?>
    </ul>
</nav>

<div class="overlay" id="overlay"></div>