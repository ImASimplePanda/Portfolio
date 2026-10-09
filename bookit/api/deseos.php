<?php
require __DIR__ . '/../inc/boot.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
csrf_check();

$book = libro_id((int) ($_POST['book'] ?? 0));
$u = user();

if (!$u) {
    $_SESSION['wish_pending'] = $book['id'] ?? null;
    $_SESSION['volver'] = isset($book['slug']) ? 'libro/' . $book['slug'] : 'deseados';
    if (is_ajax()) json_out(['ok' => false, 'login' => true, 'error' => 'Entra en tu cuenta para guardar deseados.', 'redirect' => url('entrar?motivo=deseados')]);
    redirect('entrar?motivo=deseados');
}
if (!$book) {
    if (is_ajax()) json_out(['ok' => false, 'error' => 'Ese libro ya no está en el catálogo.'], 404);
    redirect('deseados');
}

$st = db()->prepare('SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?');
$st->execute([$u['id'], $book['id']]);
$row = $st->fetchColumn();
if ($row) {
    db()->prepare('DELETE FROM wishlist WHERE id = ?')->execute([$row]);
    $on = false;
} else {
    db()->prepare('INSERT INTO wishlist (user_id, book_id, creado) VALUES (?,?,?)')->execute([$u['id'], $book['id'], now()]);
    $on = true;
}
$msg = $on ? '«' . $book['titulo'] . '» guardado en deseados.' : '«' . $book['titulo'] . '» quitado de deseados.';

if (is_ajax()) json_out(['ok' => true, 'on' => $on, 'msg' => $msg]);

flash($msg);
$ref = $_SERVER['HTTP_REFERER'] ?? '';
$host = parse_url($ref, PHP_URL_HOST);
header('Location: ' . ($host === ($_SERVER['HTTP_HOST'] ?? '') ? $ref : url('deseados')), true, 303);
