<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$cols = [];
foreach (array_keys(COLECCIONES) as $k) {
    $cols[$k] = array_values(array_filter(libros(['col' => $k]), fn($b) => !es_preventa($b)));
}
$preventas = libros(['disp' => 'preventa']);
$recomendado = libro('el-infinito-en-un-junco');
$t = $CFG['tienda'];
$site = rtrim($CFG['site_url'], '/');

page_start([
    'title' => 'Bookit · Librería. Te lo apartamos y lo recoges en tienda',
    'desc' => 'Librería de barrio con mostrador online. Compra libros con envío a casa, reserva novedades en preventa o apártalos y recógelos en la tienda.',
    'path' => '/',
    'col' => 'narrativa',
    'body' => 'home',
    'preload' => ['img/hero__pila_520.avif', 'img/hero__pila_360.avif 360w, img/hero__pila_520.avif 520w, img/hero__pila_683.avif 683w', '(max-width: 760px) 100vw, 440px'],
    'jsonld' => [
        ['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => 'Bookit', 'url' => $site . '/',
         'potentialAction' => ['@type' => 'SearchAction', 'target' => $site . url('catalogo') . '?q={q}', 'query-input' => 'required name=q']],
        array_filter(['@context' => 'https://schema.org', '@type' => 'BookStore', 'name' => 'Bookit', 'url' => $site . '/',
         'image' => $site . url('img/og-bookit.png'),
         'telephone' => $t['telefono'], 'address' => $t['direccion'] ? ['@type' => 'PostalAddress', 'streetAddress' => $t['direccion'], 'addressLocality' => $t['cp_ciudad']] : null]),
    ],
]);
?>
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__panel">
    <div class="hero__copy">
      <h1 class="hero__title" id="hero-title"><span>Lo apartamos hoy.</span> <span>Lo recoges mañana.</span></h1>
      <p class="hero__sub">Librería de barrio con mostrador online. Compra con envío a casa o resérvalo y pásate a recogerlo.</p>
      <form class="search" role="search" action="<?= e(url('catalogo')) ?>">
        <label class="search__label" for="q">Busca por título o autor</label>
        <div class="search__row">
          <input class="input search__input" id="q" name="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="Irene Vallejo, Reina roja…">
          <button class="btn" type="submit"><?= icon('magnifying-glass') ?><span class="btn__label">Buscar</span></button>
        </div>
      </form>
      <a class="hero__more" href="<?= e(url('catalogo?disp=preventa')) ?>">Reserva las novedades que aún no han salido<?= icon('arrow-right') ?></a>
    </div>
    <div class="hero__feature" data-feature>
      <figure class="hero__photo">
        <picture>
          <source type="image/avif" srcset="<?= e(url('img/hero__pila_360.avif')) ?> 360w, <?= e(url('img/hero__pila_520.avif')) ?> 520w, <?= e(url('img/hero__pila_683.avif')) ?> 683w" sizes="(max-width: 760px) 100vw, 440px">
          <img src="<?= e(url('img/hero__pila_520.webp')) ?>" srcset="<?= e(url('img/hero__pila_360.webp')) ?> 360w, <?= e(url('img/hero__pila_520.webp')) ?> 520w, <?= e(url('img/hero__pila_683.webp')) ?> 683w" sizes="(max-width: 760px) 100vw, 440px"
               width="683" height="683" fetchpriority="high" decoding="async"
               alt="Una persona con jersey amarillo sostiene una pila alta de libros de colores contra el pecho.">
        </picture>
      </figure>
    </div>
  </div>

  <div class="hero__shelf">
    <div class="switch" role="group" aria-label="Elige colección">
      <?php foreach (COLECCIONES as $k => $c): ?>
      <button class="switch__btn" type="button" data-switch="<?= e($k) ?>" aria-pressed="<?= $k === 'narrativa' ? 'true' : 'false' ?>">
        <span class="switch__chip" data-col="<?= e($k) ?>" aria-hidden="true"></span><?= e($c['corto']) ?>
      </button>
      <?php endforeach; ?>
    </div>
    <?php foreach ($cols as $k => $list): ?>
    <div class="shelf" data-shelf-for="<?= e($k) ?>"<?= $k === 'narrativa' ? '' : ' hidden' ?>>
      <ul class="shelf__row" aria-label="<?= e(COLECCIONES[$k]['nombre']) ?>: algunos títulos">
        <?php foreach (array_slice($list, 0, 5) as $i => $b): ?>
        <li class="shelf__item" style="--i: <?= $i ?>"><?= cover($b, ['sizes' => '(max-width: 760px) 42vw, 170px']) ?></li>
        <?php endforeach; ?>
      </ul>
      <a class="shelf__all" href="<?= e(url('catalogo/' . $k)) ?>">Toda la colección <?= e(mb_strtolower(COLECCIONES[$k]['nombre'])) ?><?= icon('arrow-right') ?></a>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<section class="stack" aria-labelledby="stack-title">
  <h2 class="section-title" id="stack-title">Cinco colecciones, un color cada una.</h2>
  <p class="lede">Así ordenamos la tienda y así la ordenamos aquí: si te gusta un color, el siguiente libro que buscas está en el mismo estante.</p>
  <ol class="spines">
    <?php $n = 0; foreach (COLECCIONES as $k => $c): $all = libros(['col' => $k]); ?>
    <li class="spines__item" style="--n: <?= $n++ ?>">
      <a class="spine" href="<?= e(url('catalogo/' . $k)) ?>" data-col="<?= e($k) ?>">
        <span class="spine__name"><?= e($c['nombre']) ?></span>
        <span class="spine__titles"><?= e(implode(' / ', array_map(fn($b) => $b['titulo'], array_slice($all, 0, 3)))) ?></span>
        <span class="spine__count"><?= count($all) ?> <?= count($all) === 1 ? 'título' : 'títulos' ?><?= icon('arrow-right') ?></span>
      </a>
    </li>
    <?php endforeach; ?>
  </ol>
</section>

<?php if ($preventas): ?>
<section class="pre" id="preventa" aria-labelledby="pre-title">
  <div class="pre__head">
    <h2 class="section-title" id="pre-title">Resérvalo antes de que llegue.</h2>
    <p class="lede">No pagas nada ahora. El día que sale lo tenemos apartado con tu nombre, o te lo enviamos a casa.</p>
  </div>
  <ul class="pre__row">
    <?php foreach ($preventas as $b): ?>
    <li class="pre__item">
      <p class="pre__date"><span class="pre__day"><?= (int) substr($b['salida'], 8, 2) ?></span> <?= e(explode(' de ', fecha_larga($b['salida']))[1]) ?></p>
      <?= cover($b) ?>
      <h3 class="pre__title"><a href="<?= e(url('libro/' . $b['slug'])) ?>"><?= e($b['titulo']) ?></a></h3>
      <p class="pre__meta"><?= e($b['autor']) ?> · <?= money((int) $b['precio_cent']) ?></p>
      <?= add_form($b, 'btn btn--ghost btn--block', 'Reservar') ?>
    </li>
    <?php endforeach; ?>
    <li class="pre__photo" aria-hidden="true">
      <img src="<?= e(url('img/preventa__cantos_520.webp')) ?>" srcset="<?= e(url('img/preventa__cantos_320.webp')) ?> 320w, <?= e(url('img/preventa__cantos_520.webp')) ?> 520w, <?= e(url('img/preventa__cantos_683.webp')) ?> 683w"
           sizes="300px" width="520" height="780" loading="lazy" decoding="async" alt="">
    </li>
  </ul>
</section>
<?php endif; ?>

<section class="how" aria-labelledby="how-title">
  <figure class="how__photo">
    <img src="<?= e(url('img/tienda__escalera_520.webp')) ?>"
         srcset="<?= e(url('img/tienda__escalera_320.webp')) ?> 320w, <?= e(url('img/tienda__escalera_520.webp')) ?> 520w, <?= e(url('img/tienda__escalera_320@2x.webp')) ?> 640w"
         sizes="(max-width: 760px) 100vw, 34vw" width="520" height="693" loading="lazy" decoding="async"
         alt="Estanterías de madera hasta el techo llenas de libros, con una escalera apoyada.">
    <figcaption>Foto provisional hasta tener las de la tienda.</figcaption>
  </figure>
  <div class="how__copy">
    <h2 class="section-title" id="how-title">Apártalo en la web. Pásate cuando puedas.</h2>
    <ol class="steps">
      <li><span><strong>Elige «Recoger en tienda»</strong> al confirmar la cesta. No pagas nada todavía.</span></li>
      <li><span><strong>Te avisamos</strong> cuando esté en el mostrador, con tu código de reserva.</span></li>
      <li><span><strong>Lo pagas al recogerlo.</strong> Te lo guardamos <?= (int) $CFG['dias_reserva'] ?> días.</span></li>
    </ol>
    <a class="btn btn--ink" href="<?= e(url('catalogo')) ?>"><span class="btn__label">Ver el catálogo</span><?= icon('arrow-right') ?></a>
  </div>
</section>

<?php if ($recomendado): ?>
<section class="rec" data-col="<?= e($recomendado['coleccion']) ?>" aria-labelledby="rec-title">
  <div class="rec__cover"><?= cover($recomendado, ['class' => 'cover--lg', 'sizes' => '(max-width: 760px) 58vw, 300px']) ?></div>
  <div class="rec__copy">
    <h2 class="visually-hidden" id="rec-title">Recomendación de la semana: <?= e($recomendado['titulo']) ?></h2>
    <blockquote class="rec__quote">
      <p>La historia de los libros contada como una novela de aventuras. Para quien alguna vez prestó uno y no se lo devolvieron.</p>
    </blockquote>
    <p class="rec__sign">Recomendado esta semana por <mark class="pendiente">Pendiente: nombre del librero o librera</mark></p>
    <div class="rec__actions">
      <?= add_form($recomendado, 'btn btn--paper') ?>
      <a class="link-on-band" href="<?= e(url('libro/' . $recomendado['slug'])) ?>">Leer la sinopsis</a>
    </div>
  </div>
  <figure class="rec__photo">
    <img src="<?= e(url('img/rec__lectura_640.webp')) ?>" srcset="<?= e(url('img/rec__lectura_400.webp')) ?> 400w, <?= e(url('img/rec__lectura_640.webp')) ?> 640w, <?= e(url('img/rec__lectura_960.webp')) ?> 960w"
         sizes="(max-width: 760px) 0px, 300px" width="640" height="427" loading="lazy" decoding="async"
         alt="Manos sosteniendo un libro abierto de cantos rojos.">
  </figure>
</section>
<?php endif; ?>

<section class="shop" id="tienda" aria-labelledby="shop-title">
  <div class="shop__media">
    <img class="shop__img shop__img--main" src="<?= e(url('img/tienda__interior_1200.webp')) ?>"
         srcset="<?= e(url('img/tienda__interior_400.webp')) ?> 400w, <?= e(url('img/tienda__interior_720.webp')) ?> 720w, <?= e(url('img/tienda__interior_1200.webp')) ?> 1200w, <?= e(url('img/tienda__interior_720@2x.webp')) ?> 1440w, <?= e(url('img/tienda__interior_1200@2x.webp')) ?> 2400w"
         sizes="(max-width: 760px) 100vw, 62vw" width="1200" height="900" loading="lazy" decoding="async"
         alt="Rincón de una librería con estanterías iluminadas, paredes rosas y una mesa baja con libros infantiles.">
    <img class="shop__img shop__img--side" src="<?= e(url('img/tienda__estantes_400.webp')) ?>"
         srcset="<?= e(url('img/tienda__estantes_400.webp')) ?> 400w, <?= e(url('img/tienda__estantes_640.webp')) ?> 640w, <?= e(url('img/tienda__estantes_400@2x.webp')) ?> 800w"
         sizes="(max-width: 760px) 50vw, 24vw" width="400" height="300" loading="lazy" decoding="async"
         alt="Una clienta mira libros entre pasillos estrechos y estanterías llenas.">
  </div>
  <div class="shop__panel">
    <h2 class="section-title" id="shop-title">Una librería de verdad, con mostrador y con gente detrás.</h2>
    <dl class="shop__facts">
      <div><dt>Dirección</dt><dd><?= pendiente($t['direccion'], 'dirección') ?></dd></div>
      <div><dt>Horario</dt><dd><?= pendiente($t['horario'], 'horario') ?></dd></div>
      <div><dt>Teléfono</dt><dd><?= pendiente($t['telefono'], 'teléfono') ?></dd></div>
    </dl>
    <?php if ($t['mapa_url']): ?>
    <a class="btn btn--ink" href="<?= e($t['mapa_url']) ?>" rel="noopener"><?= icon('storefront') ?><span class="btn__label">Cómo llegar</span></a>
    <?php else: ?>
    <button class="btn btn--ink" type="button" disabled><?= icon('storefront') ?><span class="btn__label">Cómo llegar</span></button>
    <?php endif; ?>
    <p class="shop__note">Las fotos son provisionales hasta tener las de la tienda.</p>
  </div>
</section>
<?php page_end(); ?>
