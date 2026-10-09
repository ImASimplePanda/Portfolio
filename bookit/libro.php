<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$b = libro((string) ($_GET['l'] ?? ''));
if (!$b) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    exit;
}

$pre = es_preventa($b);
$agotado = !$pre && (int) $b['stock'] === 0;
$wish = wish_ids();
$col = COLECCIONES[$b['coleccion']];
$rel = array_values(array_filter(libros(['col' => $b['coleccion']]), fn($x) => $x['id'] !== $b['id']));
$site = rtrim($CFG['site_url'], '/');
$link = $site . url('libro/' . $b['slug']);

page_start([
    'title' => $b['titulo'] . ', de ' . $b['autor'] . ' · Bookit',
    'desc' => mb_substr($b['sinopsis'], 0, 150) . (mb_strlen($b['sinopsis']) > 150 ? '…' : ''),
    'path' => '/libro/' . $b['slug'],
    'col' => $b['coleccion'],
    'og_type' => 'book',
    'jsonld' => [[
        '@context' => 'https://schema.org',
        '@type' => ['Book', 'Product'],
        'name' => $b['titulo'],
        'author' => ['@type' => 'Person', 'name' => $b['autor']],
        'publisher' => !empty($b['editorial']) ? ['@type' => 'Organization', 'name' => $b['editorial']] : null,
        'bookFormat' => $b['formato'] === 'Tapa dura' ? 'https://schema.org/Hardcover' : 'https://schema.org/Paperback',
        'description' => $b['sinopsis'],
        'url' => $link,
        'offers' => [
            '@type' => 'Offer',
            'price' => number_format($b['precio_cent'] / 100, 2, '.', ''),
            'priceCurrency' => 'EUR',
            'url' => $link,
            'availability' => $pre ? 'https://schema.org/PreOrder' : ($agotado ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'),
        ],
    ], [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => [
            ['@type' => 'ListItem', 'position' => 1, 'name' => 'Catálogo', 'item' => $site . url('catalogo')],
            ['@type' => 'ListItem', 'position' => 2, 'name' => $col['nombre'], 'item' => $site . url('catalogo/' . $b['coleccion'])],
            ['@type' => 'ListItem', 'position' => 3, 'name' => $b['titulo']],
        ],
    ]],
]);
?>
<article class="book">
  <div class="book__cover"><?= cover($b, ['link' => false, 'vt' => true, 'eager' => true, 'sizes' => '(max-width: 760px) 62vw, 340px']) ?></div>
  <div class="book__info">
    <nav aria-label="Ruta">
      <ol class="crumbs">
        <li><a href="<?= e(url('catalogo')) ?>">Catálogo</a></li>
        <li><a href="<?= e(url('catalogo/' . $b['coleccion'])) ?>"><?= e($col['nombre']) ?></a></li>
        <li aria-current="page"><?= e($b['titulo']) ?></li>
      </ol>
    </nav>
    <h1 class="book__title<?= mb_strlen($b['titulo']) > 42 ? ' book__title--long' : '' ?>"><?= e($b['titulo']) ?></h1>
    <p class="book__author"><?= e($b['autor']) ?></p>

    <div class="book__buy">
      <div class="card__row"><span class="book__price"><?= money((int) $b['precio_cent']) ?></span><?= estado_libro($b) ?></div>
      <div class="book__actions">
        <?php if ($pre): ?>
          <?= add_form($b, 'btn btn--ink', 'Reservar preventa') ?>
        <?php elseif ($agotado): ?>
          <button class="btn" type="button" disabled>Agotado en tienda</button>
        <?php else: ?>
          <?= add_form($b, 'btn btn--ink', 'Añadir a la cesta') ?>
          <?= add_form($b, 'btn btn--ghost', 'Apartar en tienda', '<input type="hidden" name="entrega" value="recogida"><input type="hidden" name="ir" value="cesta">') ?>
        <?php endif; ?>
        <?= wish_button($b, $wish) ?>
      </div>
      <p class="book__note">
        <?php if ($pre): ?>
          Sale el <?= e(fecha_larga($b['salida'])) ?>. Lo reservas ahora y lo pagas al recogerlo, o eliges envío a casa al confirmar.
        <?php elseif ($agotado): ?>
          Ahora mismo no nos queda ninguno. Guárdalo en deseados para tenerlo a mano y pregúntanos en la tienda.
        <?php else: ?>
          «Apartar en tienda» te lo guarda <?= (int) $CFG['dias_reserva'] ?> días en el mostrador y lo pagas al recogerlo.
        <?php endif; ?>
      </p>
    </div>

    <p class="book__syn"><?= e($b['sinopsis']) ?></p>

    <dl class="facts">
      <div><dt>Editorial</dt><dd><?= pendiente($b['editorial'] ?? null, 'editorial') ?></dd></div>
      <div><dt>ISBN</dt><dd><?= pendiente($b['isbn'] ?? null, 'ISBN') ?></dd></div>
      <div><dt>Formato</dt><dd><?= e($b['formato']) ?></dd></div>
      <?php if ($b['anio']): ?><div><dt>Primera edición</dt><dd><?= (int) $b['anio'] ?></dd></div><?php endif; ?>
      <div><dt>Colección</dt><dd><?= e($col['nombre']) ?></dd></div>
    </dl>
  </div>
</article>

<?php if ($rel): ?>
<section class="related" aria-labelledby="rel-title">
  <h2 class="related__title" id="rel-title">En el mismo estante</h2>
  <ul class="grid">
    <?php foreach (array_slice($rel, 0, 6) as $r): ?>
    <li class="card">
      <?= cover($r, ['tabindex' => -1]) ?>
      <div class="card__body">
        <h3 class="card__title"><a href="<?= e(url('libro/' . $r['slug'])) ?>"><?= e($r['titulo']) ?></a></h3>
        <p class="card__author"><?= e($r['autor']) ?></p>
        <div class="card__row"><span class="price"><?= money((int) $r['precio_cent']) ?></span></div>
      </div>
    </li>
    <?php endforeach; ?>
  </ul>
</section>
<?php endif; ?>
<?php page_end(); ?>
