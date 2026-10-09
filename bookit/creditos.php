<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$fotos = json_decode((string) file_get_contents(__DIR__ . '/data/creditos.json'), true) ?: [];

page_start([
    'title' => 'Créditos de las fotos · Bookit',
    'desc' => 'Autoría y licencias de las fotografías usadas en la web de Bookit.',
    'path' => '/creditos',
    'col' => 'ensayo',
]);
?>
<header class="pagehead">
  <h1 class="pagehead__title">Créditos</h1>
  <p class="pagehead__sub">Fotografías provisionales con licencia libre, hasta tener las de la tienda.</p>
</header>
<div class="page">
  <ul class="credits">
    <?php foreach ($fotos as $f): ?>
    <li>
      <strong><?= e($f['titulo']) ?></strong><br>
      <?= $f['autor_url'] ? '<a href="' . e($f['autor_url']) . '" rel="noopener">' . e($f['autor']) . '</a>' : e($f['autor'] === 'Unknown' ? 'Autoría no indicada' : $f['autor']) ?>,
      <a href="<?= e($f['licencia_url']) ?>" rel="noopener license"><?= e($f['licencia']) ?></a>.
      <a href="<?= e($f['fuente']) ?>" rel="noopener">Ver original</a>
    </li>
    <?php endforeach; ?>
  </ul>
  <p class="field__hint" style="margin-top: var(--s6)">Las portadas de los libros proceden de <a href="https://openlibrary.org/dev/docs/api/covers" rel="noopener">Open Library Covers</a> y son propiedad de sus editoriales; se muestran para identificar el libro a la venta.</p>
  <p class="field__hint" style="margin-top: var(--s3)">Los tipos de letra son Sofia Sans, Sofia Sans Condensed y Sofia Sans Extra Condensed (SIL Open Font License). Los iconos son de Phosphor (MIT).</p>
</div>
<?php page_end(); ?>
