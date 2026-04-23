<body>
    <div class="page-wrapper">
        <?php 
            include __DIR__ . '/../app/views/layouts/header.php';
            // Mantenemos la lógica de sesión para las variables JS
            $isGuest = !isset($_SESSION['user']);
        ?>

        <div class="content-box">
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="<?= __t('search_products') ?>..." class="search-input">
            </div>

            <div id="react-product-app">
                <p>Cargando catálogo...</p> 
            </div>
        </div>

        <script>
            // Mantenemos tus configuraciones globales para que React las use
            window.BASE_URL = "<?= BASE_URL ?>";
            window.USER_ID = "<?= $_SESSION['user']['id'] ?? 'guest' ?>";
            window.CART_ADDED = "<?= __t('cart_added') ?>"; 
            window.CART_EMPTY = "<?= __t('cart_empty') ?>";
            window.CART_QTY = "<?= __t('cart_qty') ?>";
            window.CART_REMOVE = "<?= __t('cart_remove') ?>";
            window.IS_GUEST = <?= $isGuest ? 'true' : 'false' ?>;
        </script>

        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

        <script type="text/babel" src="<?= BASE_URL ?>assets/js/ProductApp.jsx"></script>

        <?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>
    </div> 
</body>