<body>
    <div class="page-wrapper">
        <?php 
            include __DIR__ . '/../app/views/layouts/header.php';
        
            // Crear objeto Product
            $productModel = new Product($db);

            // Obtener todos los productos
            $products = $productModel->getAll();
        ?>


        <div class="content-box">

            <div class="search-container">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Buscar productos..." 
                    class="search-input"
                >
            </div>

            <!-- Productos -->
            <div class="products">
                <?php foreach($products as $product): ?>
                    <div class="product-card">

                        <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($product['image']); ?>" alt="<?= htmlspecialchars($product['name']); ?>">

                        <h3><?= htmlspecialchars($product['name']); ?></h3>
                        <p>$<?= number_format($product['price'], 2); ?></p>

                        <!-- Valoracion -->
                        <div class="rating" data-product="<?= $product['id'] ?>">
                            <i class="star" data-value="1">★</i>
                            <i class="star" data-value="2">★</i>
                            <i class="star" data-value="3">★</i>
                            <i class="star" data-value="4">★</i>
                            <i class="star" data-value="5">★</i>
                        </div>

                        <div class="rating-info" id="rating-info-<?= $product['id'] ?>">
                            Cargando valoración...
                        </div>

                        <div class="product-actions">
                            <button class="add-to-cart"
                                data-id="<?= $product['id'] ?>"
                                data-name="<?= htmlspecialchars($product['name']) ?>"
                                data-price="<?= $product['price'] ?>"
                                data-image="<?= $product['image'] ?>">
                                🛒 Añadir al carrito
                            </button>

                            <button class="add-to-fav" data-id="<?= $product['id'] ?>">
                                ❤️ Favorito
                            </button>
                        </div>

                    </div>
                <?php endforeach; ?>
            </div>
        </div>


        <div class="carousel-container">
            <div class="carousel-track">

                <?php foreach ($products as $product): ?>
                <div class="carousel-item">
                    <img src="<?= BASE_URL ?>assets/images/<?= $product['image'] ?>" alt="">
                    <p class="carousel-name"><?= $product['name'] ?></p>
                    <p class="carousel-price"><?= number_format($product['price'], 2) ?>€</p>
                </div>
                <?php endforeach; ?>

            </div>

            <button class="carousel-btn prev">‹</button>
            <button class="carousel-btn next">›</button>
        </div>

        <?php include __DIR__ . '/../app/views/layouts/footer.php'; ?>
    </div> 

</body>
<script src="<?php echo BASE_URL; ?>assets/js/fav.js"></script>
