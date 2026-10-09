<?php
if (!function_exists('db')) {
    require __DIR__ . '/inc/boot.php';
    http_response_code(404);
}
require_once __DIR__ . '/inc/layout.php';

page_start([
    'title' => 'No encontrado · Bookit',
    'desc' => 'Esta página no existe.',
    'col' => 'ensayo',
    'noindex' => true,
]);
?>
<header class="pagehead">
  <h1 class="pagehead__title">Este estante está vacío</h1>
  <p class="pagehead__sub">La página que buscas no existe o ha cambiado de sitio.</p>
</header>
<div class="page">
  <form class="search" role="search" action="<?= e(url('catalogo')) ?>" style="margin-top:0">
    <label class="search__label" for="q404">Busca por título o autor</label>
    <div class="search__row">
      <input class="input search__input" id="q404" name="q" type="search" enterkeyhint="search">
      <button class="btn" type="submit"><?= icon('magnifying-glass') ?><span class="btn__label">Buscar</span></button>
    </div>
  </form>
</div>
<?php page_end(); ?>
