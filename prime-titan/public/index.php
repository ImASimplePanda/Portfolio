<body>
    <div class="page-wrapper">
        <?php 
            include __DIR__ . '/../app/views/layouts/header.php';
        
            // Crear objeto Product
            $productModel = new Product($db);

            // Obtener todos los productos
            $products = $productModel->getAll();

            // Verificamos si el usuario NO está logueado para aplicar la clase CSS
            $isGuest = !isset($_SESSION['user']);
        ?>

        <div class="content-box">

            <div class="search-container">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="<?= __t('search_products') ?>..."
                    class="search-input"
                >
            </div>

            <div class="products">
                <?php foreach($products as $product): ?>
                    <div class="product-card">

                        <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($product['image']); ?>" alt="<?= htmlspecialchars($product['name']); ?>">

                        <h3><?= htmlspecialchars($product['name']); ?></h3>
                        <p>$<?= number_format($product['price'], 2); ?></p>

                        <div class="rating <?= $isGuest ? 'not-logged' : '' ?>" data-product="<?= $product['id'] ?>">
                            <i class="fa fa-star star" data-value="1"></i>
                            <i class="fa fa-star star" data-value="2"></i>
                            <i class="fa fa-star star" data-value="3"></i>
                            <i class="fa fa-star star" data-value="4"></i>
                            <i class="fa fa-star star" data-value="5"></i>
                        </div>

                        <div class="rating-info" id="rating-info-<?= $product['id'] ?>">
                            <small><?= __t('loading_rating') ?></small>
                        </div>

                        <div class="product-actions">
                            <button class="add-to-cart"
                                data-id="<?= $product['id'] ?>"
                                data-name="<?= htmlspecialchars($product['name']) ?>"
                                data-price="<?= $product['price'] ?>"
                                data-image="<?= $product['image'] ?>">
                                🛒 <?= __t('add_to_cart') ?>
                            </button>

                            <button class="add-to-fav" data-id="<?= $product['id'] ?>">
                                ❤️ <?= __t('favorite') ?>
                            </button>
                        </div>

                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <script>
            // Definimos las variables globales para que los archivos .js las reconozcan
            window.BASE_URL = "<?= BASE_URL ?>";
            window.AVERAGE_RATING_LABEL = "<?= __t('average_rating') ?>";
            window.VOTES_LABEL = "<?= __t('votes') ?>";
        </script>

        <?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>
    </div> 

    <script src="<?= BASE_URL ?>assets/js/fav.js"></script>
    <script src="<?= BASE_URL ?>assets/js/rating.js"></script>
    
</body>