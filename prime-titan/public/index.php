<body>
    <div class="page-wrapper">
        <?php 
            include __DIR__ . '/../app/views/layouts/header.php';
            $isGuest = !isset($_SESSION['user']);
        ?>

        <div class="content-box">
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="<?= __t('search_products') ?>..." class="search-input">
            </div>

            <div id="react-product-app">
                <p><?php echo __t('loading_catalog'); ?></p> 
            </div>
        </div>

        <script src="<?php echo BASE_URL; ?>assets/js/fav.js"></script>

        <script>
            // Configuración base
            window.BASE_URL = "<?= BASE_URL ?>";
            window.USER_ID = "<?= $_SESSION['user']['id'] ?? 'guest' ?>";
            window.CURRENT_LANGUAGE = "<?= $_SESSION['user']['language'] ?? 'es' ?>";
            window.IS_GUEST = <?= !isset($_SESSION['user']) ? 'true' : 'false' ?>;

            // Etiquetas de traducción (Usando tus claves exactas)
            window.TXT_SEARCH = "<?= __t('search_products') ?>";
            window.TXT_ADD_TO_CART = "<?= __t('add_to_cart') ?>";
            window.TXT_FAVORITE = "<?= __t('favorite') ?>";
            window.TXT_SAVED = "<?= __t('saved') ?>";
            window.TXT_LOADING = "<?= __t('loading_rating') ?>";
        </script>

        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

        <script type="text/babel" src="<?= BASE_URL ?>assets/js/ProductApp.jsx"></script>

        <?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>
    </div> 
</body>