<?php
session_start();
require_once __DIR__ . '/../app/config/database.php';
require_once __DIR__ . '/../app/config/config.php'; 

// Si no hay usuario, fuera
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}
?>

<head>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/exercises.css">
</head>

<body>
    <div class="page-wrapper">
        <?php 
            include __DIR__ . '/../app/views/layouts/header.php';
        ?>

        <div class="content-box">
            <div class="section-header">
                <h1><?= __t('my_exercises') ?></h1>
            </div>

            <div id="react-workout-app">
                <p><?= __t('loading_exercises') ?>...</p> 
            </div>
        </div>

        <script>
            // Configuración base para el app de ejercicios
            window.BASE_URL = "<?= BASE_URL ?>";
            window.USER_ID = "<?= $_SESSION['user']['id'] ?>";
            window.CURRENT_LANGUAGE = "<?= $_SESSION['user']['language'] ?? 'es' ?>";

            // Etiquetas de traducción necesarias
            window.TXT_LOADING = "<?= __t('loading_catalog') ?>";
            window.TXT_ADD = "<?= __t('add') ?>";
            window.TXT_RECOMMENDED = "<?= __t('recommended') ?>";
        </script>

        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

        <script type="text/babel" src="<?= BASE_URL ?>assets/js/Workout.jsx"></script>

        <?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>
    </div> 
</body>