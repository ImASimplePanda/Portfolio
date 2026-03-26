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
                <?php foreach($products as $product): 
                    // El modelo ya nos da el nombre traducido en 'name'
                    $productName = htmlspecialchars($product['name']);
                    $productId = $product['id'];
                ?>
                    <div class="product-card">
                        <!-- Imagen y Título -->
                        <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($product['image']); ?>" alt="<?= $productName ?>">
                        <h3><?= $productName ?></h3>
                        <p><?= number_format($product['price'], 2); ?>€</p>

                        <!-- Sistema de Estrellas (Rating) -->
                        <div class="rating <?= $isGuest ? 'not-logged' : '' ?>" data-product="<?= $productId ?>">
                            <i class="fa fa-star star" data-value="1"></i>
                            <i class="fa fa-star star" data-value="2"></i>
                            <i class="fa fa-star star" data-value="3"></i>
                            <i class="fa fa-star star" data-value="4"></i>
                            <i class="fa fa-star star" data-value="5"></i>
                        </div>

                        <!-- Información del Rating -->
                        <div class="rating-info" id="rating-info-<?= $productId ?>">
                            <small><?= __t('loading_rating') ?></small>
                        </div>

                        <!-- Acciones: Carrito y Favoritos -->
                        <div class="product-actions">
                            <button class="add-to-cart"
                                data-id="<?= $productId ?>"
                                data-name="<?= $productName ?>"
                                data-price="<?= $product['price'] ?>"
                                data-image="<?= $product['image'] ?>">
                                🛒 <?= __t('add_to_cart') ?>
                            </button>

                            <button class="add-to-fav" data-id="<?= $productId ?>">
                                ❤️ <?= __t('favorite') ?>
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

<script>
    // Configuración base
    window.BASE_URL = "<?= BASE_URL ?>";
    window.USER_ID = "<?= $_SESSION['user']['id'] ?? 'guest' ?>";

    // Traducciones para el Carrito (Mensaje de éxito)
    window.CART_ADDED = "<?= __t('cart_added') ?>"; 
    window.CART_EMPTY = "<?= __t('cart_empty') ?>";
    window.CART_QTY = "<?= __t('cart_qty') ?>";
    window.CART_REMOVE = "<?= __t('cart_remove') ?>";

    // Traducciones para las Valoraciones (Estrellas)
    window.AVERAGE_RATING_LABEL = "<?= __t('average_rating') ?>";
    window.VOTES_LABEL = "<?= __t('votes') ?>";
    window.LOADING_RATING = "<?= __t('loading_rating') ?>";
</script>

        <?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>
    </div> 

    <script src="<?= BASE_URL ?>assets/js/fav.js"></script>
    <script src="<?= BASE_URL ?>assets/js/rating.js"></script>
    
</body>