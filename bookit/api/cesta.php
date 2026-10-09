<?php
require __DIR__ . '/../inc/boot.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
csrf_check();

$action = $_POST['action'] ?? '';
$book = libro_id((int) ($_POST['book'] ?? 0));
$back = function (): string {
    $ref = $_SERVER['HTTP_REFERER'] ?? '';
    $host = parse_url($ref, PHP_URL_HOST);
    return ($host && $host === ($_SERVER['HTTP_HOST'] ?? '') ? parse_url($ref, PHP_URL_PATH) . (parse_url($ref, PHP_URL_QUERY) ? '?' . parse_url($ref, PHP_URL_QUERY) : '') : url('cesta'));
};
$fail = function (string $msg, int $code = 422) use ($back) {
    if (is_ajax()) json_out(['ok' => false, 'error' => $msg], $code);
    flash($msg, 'error');
    header('Location: ' . $back(), true, 303);
    exit;
};

if (!$book) $fail('Ese libro ya no está en el catálogo.', 404);

$pre = es_preventa($book);
if ($action === 'add' && !$pre && (int) $book['stock'] === 0) $fail('«' . $book['titulo'] . '» está agotado ahora mismo.');

$cart = cart_id(true);
$line = null;

switch ($action) {
    case 'add':
        $qty = max(1, (int) ($_POST['qty'] ?? 1));
        $st = db()->prepare('SELECT COALESCE(SUM(qty),0) FROM cart_items WHERE cart_id = ? AND book_id = ?');
        $st->execute([$cart, $book['id']]);
        if (!$pre && (int) $st->fetchColumn() + $qty > (int) $book['stock']) {
            $fail('Ya tienes en la cesta todos los ejemplares de «' . $book['titulo'] . '» que nos quedan.');
        }
        cart_set($cart, (int) $book['id'], $qty, true);
        if (($_POST['entrega'] ?? '') === 'recogida') $_SESSION['entrega'] = 'recogida';
        $msg = $pre ? '«' . $book['titulo'] . '» reservado en tu cesta.' : '«' . $book['titulo'] . '» en la cesta.';
        break;
    case 'update':
        $qty = (int) ($_POST['qty'] ?? 1);
        if (!$pre && $qty > (int) $book['stock']) $fail(((int) $book['stock'] === 1 ? 'Solo nos queda 1' : 'Solo nos quedan ' . (int) $book['stock']) . ' de «' . $book['titulo'] . '».');
        cart_set($cart, (int) $book['id'], $qty);
        $msg = $qty > 0 ? 'Cantidad actualizada.' : '«' . $book['titulo'] . '» quitado de la cesta.';
        break;
    case 'remove':
        cart_set($cart, (int) $book['id'], 0);
        $msg = '«' . $book['titulo'] . '» quitado de la cesta.';
        break;
    default:
        $fail('Acción no válida.', 400);
}

$goCart = ($_POST['ir'] ?? '') === 'cesta';

if (is_ajax()) {
    $lines = cart_lines();
    $sub = array_sum(array_map(fn($l) => $l['qty'] * $l['precio_cent'], $lines));
    $q = 0;
    foreach ($lines as $l) if ((int) $l['id'] === (int) $book['id']) $q = (int) $l['qty'];
    json_out([
        'ok' => true,
        'msg' => $msg,
        'count' => cart_count(),
        'qty' => $q,
        'subtotal' => money($sub),
        'redirect' => $goCart ? url('cesta') : null,
    ]);
}

if ($goCart) redirect('cesta');
flash($msg);
header('Location: ' . $back(), true, 303);
