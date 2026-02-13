<?php
session_start();
require_once __DIR__ . '/../app/config/config.php';
require_once __DIR__ . '/../app/config/database.php';
require_once __DIR__ . '/../app/models/product.php';

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/wishlist.css">';
require_once BASE_DIR . '/views/layouts/header.php';

// Si no hay usuario, redirigir
if (!isset($_SESSION['user'])) {
    header("Location: " . BASE_URL . "login.php");
    exit;
}

$user_id = $_SESSION['user']['id']; 


// Aumentar cantidad
if (isset($_GET['action']) && $_GET['action'] === 'plus') {
    $id = $_GET['id'];
    $stmt = $db->prepare("UPDATE wishlist SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$user_id, $id]);
    header("Location: wishlist.php");
    exit;
}

// Disminuir cantidad
if (isset($_GET['action']) && $_GET['action'] === 'minus') {
    $id = $_GET['id'];
    $stmt = $db->prepare("UPDATE wishlist SET quantity = GREATEST(quantity - 1, 1) WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$user_id, $id]);
    header("Location: wishlist.php");
    exit;
}

// Eliminar
if (isset($_GET['action']) && $_GET['action'] === 'remove') {
    $id = $_GET['id'];
    $stmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$user_id, $id]);
    header("Location: wishlist.php");
    exit;
}

// Añadir al carrito
if (isset($_GET['action']) && $_GET['action'] === 'add_to_cart') {
    $id = $_GET['id'];

    // Obtener item de wishlist
    $stmt = $db->prepare("
        SELECT w.quantity, p.name, p.price, p.image
        FROM wishlist w
        JOIN products p ON p.id = w.product_id
        WHERE w.user_id = ? AND w.product_id = ?
    ");
    $stmt->execute([$user_id, $id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($item) {
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }

        if (!isset($_SESSION['cart'][$id])) {
            $_SESSION['cart'][$id] = [
                'id' => $id,
                'name' => $item['name'],
                'price' => $item['price'],
                'image' => $item['image'],
                'quantity' => $item['quantity']
            ];
        } else {
            $_SESSION['cart'][$id]['quantity'] += $item['quantity'];
        }
    }

    header("Location: wishlist.php");
    exit;
}


// Obtener wishlist desde db

$stmt = $db->prepare("
    SELECT w.product_id AS id, w.quantity, p.name, p.price, p.image
    FROM wishlist w
    JOIN products p ON p.id = w.product_id
    WHERE w.user_id = ?
");
$stmt->execute([$user_id]);
$wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>


<div class="page-wrapper">

    <main class="wishlist-wrapper">

        <div class="wishlist-box">

            <h2 class="wishlist-title">Lista de deseados</h2>

            <?php if (empty($wishlist)): ?>
                <p class="wishlist-empty">Tu lista está vacía</p>
            <?php else: ?>

                <?php foreach ($wishlist as $item): ?>
                    <div class="wishlist-item">

                        <img src="<?php echo BASE_URL; ?>assets/images/<?php echo $item['image']; ?>" class="wishlist-img">

                        <div class="wishlist-info">
                            <p class="wishlist-name"><?php echo $item['name']; ?></p>
                            <p class="wishlist-price">
                                <?php echo number_format($item['price'] * $item['quantity'], 2); ?>€
                                <span style="font-size:3.5vw; color:#777;">
                                    (<?php echo number_format($item['price'], 2); ?>€ c/u)
                                </span>
                            </p>

                            <div class="wishlist-qty">
                                <a href="wishlist.php?action=minus&id=<?php echo $item['id']; ?>" class="qty-btn">-</a>
                                <span class="qty-number"><?php echo $item['quantity']; ?></span>
                                <a href="wishlist.php?action=plus&id=<?php echo $item['id']; ?>" class="qty-btn">+</a>
                            </div>

                            <button 
                                class="btn-cart add-from-wishlist"
                                data-id="<?php echo $item['id']; ?>"
                                data-name="<?php echo $item['name']; ?>"
                                data-price="<?php echo $item['price']; ?>"
                                data-image="<?php echo $item['image']; ?>"
                                data-quantity="<?php echo $item['quantity']; ?>"
                            >
                                Añadir al carrito
                            </button>

                            <a href="wishlist.php?action=remove&id=<?php echo $item['id']; ?>" class="btn-remove">
                                Eliminar
                            </a>
                        </div>

                    </div>
                <?php endforeach; ?>

            <?php endif; ?>

        </div>

    </main>

    <?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>

</div>