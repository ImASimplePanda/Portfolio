<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$u = user();
if (!$u) { $_SESSION['volver'] = 'cuenta'; redirect('entrar'); }

$st = db()->prepare('SELECT o.*, (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS n FROM orders o WHERE o.user_id = ? ORDER BY o.id DESC');
$st->execute([$u['id']]);
$orders = $st->fetchAll();

page_start([
    'title' => 'Mi cuenta · Bookit',
    'desc' => 'Tus reservas y pedidos en Bookit.',
    'path' => '/cuenta',
    'nav' => 'cuenta',
    'noindex' => true,
]);
?>
<header class="pagehead">
  <h1 class="pagehead__title">Hola, <?= e($u['nombre']) ?></h1>
  <p class="pagehead__sub"><?= e($u['email']) ?></p>
</header>
<div class="page">
  <div class="account-head">
    <h2>Reservas y pedidos</h2>
    <form method="post" action="<?= e(url('salir')) ?>">
      <?= csrf_field() ?>
      <button class="btn btn--ghost" type="submit"><?= icon('sign-out') ?><span class="btn__label">Salir</span></button>
    </form>
  </div>
  <?php if (!$orders): ?>
  <div class="empty">
    <h3 class="empty__title">Aún no has reservado nada.</h3>
    <p>Cuando apartes un libro o hagas un pedido, aparecerá aquí con su código para recogerlo.</p>
    <a class="btn btn--ink" href="<?= e(url('catalogo')) ?>"><span class="btn__label">Ir al catálogo</span></a>
  </div>
  <?php else: ?>
  <ul class="orders">
    <?php foreach ($orders as $o): ?>
    <li class="order">
      <a class="order__code" href="<?= e(url('pedido/' . $o['codigo'])) ?>"><?= e($o['codigo']) ?></a>
      <div>
        <p><strong><?= $o['entrega'] === 'recogida' ? 'Recoger en tienda' : 'Envío a casa' ?></strong> · <?= (int) $o['n'] ?> <?= (int) $o['n'] === 1 ? 'libro' : 'libros' ?></p>
        <p class="order__meta"><?= e(ucfirst($o['estado'])) ?> · <?= e(date('d/m/Y', strtotime($o['creado']))) ?></p>
      </div>
      <span class="price"><?= money((int) $o['total_cent']) ?></span>
    </li>
    <?php endforeach; ?>
  </ul>
  <?php endif; ?>
</div>
<?php page_end(); ?>
