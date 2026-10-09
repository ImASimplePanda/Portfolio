<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$u = user();
$list = [];
if ($u) {
    $st = db()->prepare('SELECT b.* FROM wishlist w JOIN books b ON b.id = w.book_id WHERE w.user_id = ? ORDER BY w.id DESC');
    $st->execute([$u['id']]);
    $list = $st->fetchAll();
}
$wish = array_map(fn($b) => (int) $b['id'], $list);

page_start([
    'title' => 'Deseados · Bookit',
    'desc' => 'Los libros que has guardado para más adelante.',
    'path' => '/deseados',
    'nav' => 'deseados',
    'col' => 'clasicos',
    'noindex' => true,
]);
?>
<header class="pagehead">
  <h1 class="pagehead__title">Deseados</h1>
  <p class="pagehead__sub"><?= $u ? ($list ? count($list) . ' ' . (count($list) === 1 ? 'libro guardado' : 'libros guardados') . ' para más adelante.' : 'Los libros que guardes aparecerán aquí.') : 'Guarda libros para más adelante y tenlos a mano en el móvil y en el ordenador.' ?></p>
</header>
<div class="page">
<?php if (!$u): ?>
  <div class="empty">
    <h2 class="empty__title">Entra para ver tus deseados.</h2>
    <p>Los deseados se guardan en tu cuenta, así no se pierden si cambias de dispositivo.</p>
    <a class="btn btn--ink" href="<?= e(url('entrar?motivo=deseados')) ?>"><span class="btn__label">Entrar o crear cuenta</span></a>
  </div>
<?php elseif (!$list): ?>
  <div class="empty">
    <div class="empty__cover"><?= cover(['slug' => '', 'titulo' => 'Para luego', 'autor' => 'Tu lista', 'coleccion' => 'clasicos', 'stock' => 0, 'salida' => null], ['link' => false]) ?></div>
    <h2 class="empty__title">Todavía no has guardado ninguno.</h2>
    <p>Pulsa el corazón de cualquier libro y lo tendrás aquí.</p>
    <a class="btn btn--ink" href="<?= e(url('catalogo')) ?>"><span class="btn__label">Ir al catálogo</span></a>
  </div>
<?php else: ?>
  <ul class="grid" data-wishgrid>
    <?php foreach ($list as $b): ?>
    <li class="card" style="view-transition-name: w-<?= (int) $b['id'] ?>; view-transition-class: line">
      <?= cover($b, ['tabindex' => -1]) ?>
      <div class="card__body">
        <h2 class="card__title"><a href="<?= e(url('libro/' . $b['slug'])) ?>"><?= e($b['titulo']) ?></a></h2>
        <p class="card__author"><?= e($b['autor']) ?></p>
        <div class="card__row"><span class="price"><?= money((int) $b['precio_cent']) ?></span><?= estado_libro($b) ?></div>
      </div>
      <div class="card__actions">
        <?= add_form($b, 'btn btn--ink', es_preventa($b) ? 'Reservar' : 'Añadir') ?>
        <?= wish_button($b, $wish) ?>
      </div>
    </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>
</div>
<?php page_end(); ?>
