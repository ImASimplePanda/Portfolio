<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$code = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) ($_GET['c'] ?? '')));
$st = db()->prepare('SELECT * FROM orders WHERE codigo = ?');
$st->execute([$code]);
$o = $st->fetch();
$u = user();
$mine = $o && (in_array($code, $_SESSION['pedidos'] ?? [], true) || ($u && (int) $o['user_id'] === (int) $u['id']));
if (!$o || !$mine) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    exit;
}
$items = db()->prepare('SELECT * FROM order_items WHERE order_id = ?');
$items->execute([$o['id']]);
$items = $items->fetchAll();
$recogida = $o['entrega'] === 'recogida';
$first = libro_id((int) $items[0]['book_id']);

page_start([
    'title' => 'Pedido ' . $code . ' · Bookit',
    'desc' => 'Resguardo de tu pedido en Bookit.',
    'path' => '/pedido/' . $code,
    'col' => $first['coleccion'] ?? 'narrativa',
    'noindex' => true,
]);
?>
<div class="ticket">
  <div class="ticket__card">
    <p class="ticket__band"><?= $recogida ? 'Apartado en el mostrador' : 'Pedido con envío a casa' ?></p>
    <div class="ticket__body">
      <h1 class="ticket__title"><?= $recogida ? 'Hecho. Te lo guardamos con tu nombre.' : 'Pedido registrado.' ?></h1>
      <p><span class="visually-hidden">Código de pedido: </span><span class="ticket__code"><?= e($code) ?></span></p>
      <p>
        <?php if ($recogida): ?>
          Di este código en la tienda. Te avisamos al <?= e($o['telefono']) ?> cuando esté listo y lo pagas al recogerlo.
        <?php else: ?>
          Te escribiremos a <?= e($o['email']) ?> con el enlace de pago. <mark class="pendiente">Pendiente: pasarela de pago</mark>
        <?php endif; ?>
      </p>
      <ul class="ticket__list">
        <?php foreach ($items as $it): ?>
        <li><span><?= (int) $it['qty'] ?> × <?= e($it['titulo']) ?><?= $it['tipo'] === 'preventa' ? ' (preventa)' : '' ?></span><span class="price"><?= money($it['qty'] * $it['precio_cent']) ?></span></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <p class="ticket__foot"><span>Total</span><span><?= money((int) $o['total_cent']) ?></span></p>
  </div>
  <p style="margin-top: var(--s6)"><a class="btn btn--ink" href="<?= e(url('catalogo')) ?>"><span class="btn__label">Seguir mirando</span></a></p>
</div>
<?php page_end(); ?>
