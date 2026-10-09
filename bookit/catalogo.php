<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$col = col_valida($_GET['col'] ?? null);
$q = trim(mb_substr((string) ($_GET['q'] ?? ''), 0, 80));
$disp = in_array($_GET['disp'] ?? '', ['stock', 'preventa'], true) ? $_GET['disp'] : '';
$orden = in_array($_GET['orden'] ?? '', ['precio', 'precio-desc', 'titulo'], true) ? $_GET['orden'] : '';

$lista = libros(['col' => $col, 'q' => $q, 'disp' => $disp, 'orden' => $orden]);
$wish = wish_ids();

if ($disp === 'preventa' && !$col) {
    $h1 = 'Preventa';
    $sub = 'Resérvalos antes de que lleguen. No pagas nada hasta recogerlos.';
} elseif ($col) {
    $h1 = COLECCIONES[$col]['nombre'];
    $sub = count(libros(['col' => $col])) . ' títulos en esta colección.';
} else {
    $h1 = 'Catálogo';
    $sub = 'Todo lo que tenemos en la tienda y lo que está por llegar.';
}

$base = $col ? 'catalogo/' . $col : 'catalogo';
$qs = fn(array $over) => ($s = http_build_query(array_filter(array_merge(['q' => $q, 'disp' => $disp, 'orden' => $orden], $over), fn($v) => $v !== '' && $v !== null))) ? '?' . $s : '';

page_start([
    'title' => ($q ? 'Resultados para «' . $q . '»' : $h1) . ' · Bookit',
    'desc' => $col
        ? COLECCIONES[$col]['nombre'] . ' en Bookit: cómpralos con envío a casa o apártalos y recógelos en la tienda.'
        : 'Catálogo de Bookit: narrativa, novela negra, ensayo, clásicos e infantil. Compra online o reserva y recoge en tienda.',
    'path' => '/' . $base,
    'col' => $col ?? 'narrativa',
    'nav' => $disp === 'preventa' && !$col ? 'preventa' : 'catalogo',
    'noindex' => $q !== '' || $orden !== '',
]);
?>
<header class="pagehead">
  <h1 class="pagehead__title"><?= e($h1) ?></h1>
  <p class="pagehead__sub"><?= e($sub) ?></p>
  <div class="filters">
    <nav class="chips" aria-label="Colecciones">
      <a class="chip" href="<?= e(url('catalogo' . $qs([]))) ?>"<?= !$col ? ' aria-current="true"' : '' ?>>Todas</a>
      <?php foreach (COLECCIONES as $k => $c): ?>
      <a class="chip" href="<?= e(url('catalogo/' . $k . $qs([]))) ?>"<?= $col === $k ? ' aria-current="true"' : '' ?>>
        <span class="switch__chip" data-col="<?= e($k) ?>" aria-hidden="true"></span><?= e($c['corto']) ?>
      </a>
      <?php endforeach; ?>
    </nav>
    <form class="filters__row" method="get" action="<?= e(url($base)) ?>" data-filters>
      <div class="field field--grow">
        <label class="field__label" for="f-q">Título o autor</label>
        <input class="input" id="f-q" name="q" type="search" value="<?= e($q) ?>" enterkeyhint="search" autocomplete="off">
      </div>
      <div class="field">
        <label class="field__label" for="f-disp">Disponibilidad</label>
        <select class="input" id="f-disp" name="disp">
          <option value="">Todo</option>
          <option value="stock"<?= $disp === 'stock' ? ' selected' : '' ?>>En tienda ahora</option>
          <option value="preventa"<?= $disp === 'preventa' ? ' selected' : '' ?>>Preventa</option>
        </select>
      </div>
      <div class="field">
        <label class="field__label" for="f-orden">Ordenar</label>
        <select class="input" id="f-orden" name="orden">
          <option value="">Recomendados</option>
          <option value="titulo"<?= $orden === 'titulo' ? ' selected' : '' ?>>Título A-Z</option>
          <option value="precio"<?= $orden === 'precio' ? ' selected' : '' ?>>Precio más bajo</option>
          <option value="precio-desc"<?= $orden === 'precio-desc' ? ' selected' : '' ?>>Precio más alto</option>
        </select>
      </div>
      <button class="btn btn--paper" type="submit"><span class="btn__label">Aplicar</span></button>
    </form>
  </div>
</header>

<div class="page">
  <div class="results">
    <p class="results__count" aria-live="polite"><?= count($lista) ?> <?= count($lista) === 1 ? 'libro' : 'libros' ?><?= $q ? ' para «' . e($q) . '»' : '' ?></p>
    <?php if ($q || $disp || $orden): ?>
    <a class="results__clear" href="<?= e(url($base)) ?>">Quitar filtros</a>
    <?php endif; ?>
  </div>

  <?php if (!$lista): ?>
  <div class="empty">
    <div class="empty__cover"><?= cover(['slug' => '', 'titulo' => '¿?', 'autor' => 'Sin resultados', 'coleccion' => $col ?? 'narrativa', 'stock' => 0, 'salida' => null], ['link' => false]) ?></div>
    <h2 class="empty__title">No tenemos nada con «<?= e($q ?: 'esos filtros') ?>».</h2>
    <p>Prueba solo con el apellido del autor o con una palabra del título. Si no lo encuentras, pregúntanos en la tienda.</p>
    <a class="btn btn--ink" href="<?= e(url('catalogo')) ?>"><span class="btn__label">Ver todo el catálogo</span></a>
  </div>
  <?php else: ?>
  <ul class="grid">
    <?php foreach ($lista as $b): ?>
    <li class="card">
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
