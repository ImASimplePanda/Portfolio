<?php

function cover(array $b, array $o = []): string
{
    $tag = isset($o['link']) && $o['link'] === false ? 'div' : 'a';
    $href = $tag === 'a' ? ' href="' . e(url('libro/' . $b['slug'])) . '"' : '';
    $ghost = es_preventa($b) || (int) $b['stock'] === 0;
    $cls = 'cover' . ($ghost ? ' cover--ghost' : '') . (!empty($o['class']) ? ' ' . $o['class'] : '');
    $vt = !empty($o['vt']) ? ' style="view-transition-name: c-' . e($b['slug']) . '"' : '';
    $label = $tag === 'a' ? '' : ' aria-hidden="true"';
    $len = mb_strlen($b['titulo']);
    $size = $len > 34 ? ' cover--long' : ($len < 12 ? ' cover--short' : '');
    $tab = '';
    if (isset($o['tabindex'])) { $tab = ' tabindex="-1"'; $label = ' aria-hidden="true"'; }
    $img = !empty($b['slug']) && is_file(__DIR__ . '/../img/libros/' . $b['slug'] . '-l.webp');
    if ($img) {
        $l = getimagesize(__DIR__ . '/../img/libros/' . $b['slug'] . '-l.webp');
        $sizes = $o['sizes'] ?? '(max-width: 760px) 42vw, 230px';
        $load = !empty($o['eager']) ? 'fetchpriority="high"' : 'loading="lazy"';
        return '<' . $tag . $href . ' class="' . $cls . ' cover--img" data-col="' . e($b['coleccion']) . '"' . $vt . $label . $tab . '>'
            . '<img class="cover__img" src="' . e(url('img/libros/' . $b['slug'] . '-l.webp')) . '" srcset="' . e(url('img/libros/' . $b['slug'] . '-s.webp')) . ' 200w, ' . e(url('img/libros/' . $b['slug'] . '-l.webp')) . ' ' . $l[0] . 'w" sizes="' . e($sizes) . '" width="' . $l[0] . '" height="' . $l[1] . '" ' . $load . ' decoding="async" alt="">'
            . '<span class="visually-hidden">' . e($b['titulo']) . ', de ' . e($b['autor']) . '</span>'
            . '<span class="cover__faja" aria-hidden="true"><span>' . e(COLECCIONES[$b['coleccion']]['nombre']) . '</span><span class="cover__mark"></span></span>'
            . '</' . $tag . '>';
    }
    return '<' . $tag . $href . ' class="' . $cls . $size . '" data-col="' . e($b['coleccion']) . '"' . $vt . $label . $tab . '>'
        . '<span class="cover__band" aria-hidden="true">' . e(COLECCIONES[$b['coleccion']]['nombre']) . '</span>'
        . '<span class="cover__panel"><span class="cover__title">' . e($b['titulo']) . '</span>'
        . '<span class="cover__author">' . e($b['autor']) . '</span></span>'
        . '<span class="cover__band cover__band--foot" aria-hidden="true"><span class="cover__mark"></span>Bookit</span>'
        . '</' . $tag . '>';
}

function estado_libro(array $b): string
{
    if (es_preventa($b)) return '<span class="estado estado--preventa">Preventa · sale el ' . e(fecha_larga($b['salida'])) . '</span>';
    if ((int) $b['stock'] === 0) return '<span class="estado estado--agotado">Agotado en tienda</span>';
    if ((int) $b['stock'] <= 2) return '<span class="estado estado--pocos">' . ((int) $b['stock'] === 1 ? 'Queda 1' : 'Quedan ' . (int) $b['stock']) . ' en tienda</span>';
    return '<span class="estado">En tienda</span>';
}

function pendiente(?string $valor, string $que): string
{
    return $valor !== null && $valor !== ''
        ? e($valor)
        : '<mark class="pendiente">Pendiente: ' . e($que) . '</mark>';
}

function wish_button(array $b, array $wish): string
{
    $on = in_array((int) $b['id'], $wish, true);
    $label = $on ? 'Quitar de deseados' : 'Guardar en deseados';
    return '<form class="wish" method="post" action="' . e(url('api/deseos.php')) . '" data-wish>'
        . csrf_field()
        . '<input type="hidden" name="book" value="' . (int) $b['id'] . '">'
        . '<button class="wish__btn" type="submit" aria-pressed="' . ($on ? 'true' : 'false') . '" aria-label="' . e($label . ': ' . $b['titulo']) . '" title="' . e($label) . '">'
        . icon('heart', 'icon wish__off') . icon('heart-fill', 'icon wish__on')
        . '</button></form>';
}

function add_form(array $b, string $class = 'btn', ?string $label = null, string $extra = ''): string
{
    $pre = es_preventa($b);
    $agotado = !$pre && (int) $b['stock'] === 0;
    $label ??= $pre ? 'Reservar preventa' : 'Añadir a la cesta';
    if ($agotado) {
        return '<button class="' . e($class) . '" type="button" disabled>Agotado</button>';
    }
    return '<form class="add" method="post" action="' . e(url('api/cesta.php')) . '" data-add>'
        . csrf_field()
        . '<input type="hidden" name="action" value="add">'
        . '<input type="hidden" name="book" value="' . (int) $b['id'] . '">'
        . $extra
        . '<button class="' . e($class) . '" type="submit"><span class="btn__label">' . e($label) . '</span></button>'
        . '</form>';
}

function page_start(array $o): void
{
    global $CFG;
    $title = $o['title'] ?? 'Bookit · Librería';
    $desc = $o['desc'] ?? '';
    $col = col_valida($o['col'] ?? null) ?? 'narrativa';
    $canon = rtrim($CFG['site_url'], '/') . ($o['path'] ?? $_SERVER['REQUEST_URI'] ?? '/');
    $u = user();
    $count = cart_count();
    $active = $o['nav'] ?? '';
    $flash = flash();
    ?>
<!doctype html>
<html lang="es" data-col="<?= e($col) ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title><?= e($title) ?></title>
<meta name="description" content="<?= e($desc) ?>">
<link rel="canonical" href="<?= e($canon) ?>">
<?php if (!empty($o['noindex'])): ?><meta name="robots" content="noindex"><?php endif; ?>
<meta name="theme-color" content="#16181B">
<meta name="color-scheme" content="light">
<meta property="og:type" content="<?= e($o['og_type'] ?? 'website') ?>">
<meta property="og:site_name" content="Bookit">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="<?= e($title) ?>">
<meta property="og:description" content="<?= e($desc) ?>">
<meta property="og:url" content="<?= e($canon) ?>">
<meta property="og:image" content="<?= e(rtrim($CFG['site_url'], '/') . url('img/og-bookit.png')) ?>">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="<?= e(url('favicon.svg')) ?>" type="image/svg+xml">
<link rel="icon" href="<?= e(url('favicon.ico')) ?>" sizes="32x32">
<link rel="apple-touch-icon" href="<?= e(url('img/apple-touch-icon.png')) ?>">
<link rel="preload" href="<?= e(url('fonts/sofia-sans-condensed.woff2')) ?>" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="<?= e(url('fonts/sofia-sans.woff2')) ?>" as="font" type="font/woff2" crossorigin>
<?php if (!empty($o['preload'])): [$pi, $pset, $psizes] = $o['preload']; ?>
<link rel="preload" as="image" type="image/avif" href="<?= e(url($pi)) ?>" imagesrcset="<?= e(preg_replace_callback('/(img\/\S+)/', fn($m) => url($m[1]), $pset)) ?>" imagesizes="<?= e($psizes) ?>" fetchpriority="high">
<?php endif; ?>
<link rel="stylesheet" href="<?= e(asset('css/bookit.css')) ?>">
<?php foreach ($o['jsonld'] ?? [] as $ld): ?>
<script type="application/ld+json"><?= json_encode(array_filter($ld, fn($v) => $v !== null), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
<?php endforeach; ?>
<script type="module" src="<?= e(asset('js/bookit.js')) ?>"></script>
</head>
<body class="<?= e($o['body'] ?? '') ?>" data-csrf="<?= e(csrf_token()) ?>" data-base="<?= e($CFG['base']) ?>">
<a class="skip" href="#main">Saltar al contenido</a>
<?php if ($CFG['demo']): ?>
<p class="demobar">Catálogo de demostración: precios, existencias y fechas de preventa son de ejemplo.</p>
<?php endif; ?>
<header class="masthead">
  <div class="masthead__in">
    <a class="logo" href="<?= e(url('')) ?>" aria-label="Bookit, inicio">
      <span class="logo__mark" aria-hidden="true"></span><span class="logo__word">Bookit</span>
    </a>
    <nav class="mainnav" aria-label="Principal">
      <ul>
        <li><a href="<?= e(url('catalogo')) ?>"<?= $active === 'catalogo' ? ' aria-current="page"' : '' ?>>Catálogo</a></li>
        <li><a href="<?= e(url('catalogo?disp=preventa')) ?>"<?= $active === 'preventa' ? ' aria-current="page"' : '' ?>>Preventa</a></li>
        <li><a href="<?= e(url('#tienda')) ?>">La tienda</a></li>
      </ul>
    </nav>
    <div class="tools">
      <a class="tool" href="<?= e(url('deseados')) ?>"<?= $active === 'deseados' ? ' aria-current="page"' : '' ?>>
        <?= icon('heart') ?><span class="tool__label">Deseados</span>
      </a>
      <a class="tool" href="<?= e(url($u ? 'cuenta' : 'entrar')) ?>"<?= in_array($active, ['cuenta', 'entrar'], true) ? ' aria-current="page"' : '' ?>>
        <?= icon('user') ?><span class="tool__label"><?= $u ? 'Mi cuenta' : 'Entrar' ?></span>
      </a>
      <a class="tool tool--bag" href="<?= e(url('cesta')) ?>"<?= $active === 'cesta' ? ' aria-current="page"' : '' ?>>
        <?= icon('handbag') ?><span class="tool__label">Cesta</span>
        <span class="bagcount" data-bagcount <?= $count ? '' : 'hidden' ?>><span class="visually-hidden">, </span><?= $count ?><span class="visually-hidden"> libros</span></span>
      </a>
      <button class="tool tool--menu" type="button" popovertarget="menu" aria-label="Abrir menú"><?= icon('list') ?></button>
    </div>
  </div>
  <div id="menu" class="sheet" popover>
    <div class="sheet__head">
      <span class="sheet__title">Menú</span>
      <button class="sheet__close" type="button" popovertarget="menu" popovertargetaction="hide" aria-label="Cerrar menú"><?= icon('x') ?></button>
    </div>
    <ul class="sheet__nav">
      <li><a href="<?= e(url('catalogo')) ?>">Catálogo</a></li>
      <li><a href="<?= e(url('catalogo?disp=preventa')) ?>">Preventa</a></li>
      <li><a href="<?= e(url('#tienda')) ?>">La tienda</a></li>
      <li><a href="<?= e(url('deseados')) ?>">Deseados</a></li>
      <li><a href="<?= e(url($u ? 'cuenta' : 'entrar')) ?>"><?= $u ? 'Mi cuenta' : 'Entrar o crear cuenta' ?></a></li>
    </ul>
    <ul class="sheet__cols">
      <?php foreach (COLECCIONES as $k => $c): ?>
      <li><a href="<?= e(url('catalogo/' . $k)) ?>" data-col="<?= e($k) ?>"><?= e($c['nombre']) ?></a></li>
      <?php endforeach; ?>
    </ul>
  </div>
</header>
<main id="main" tabindex="-1">
<?php if ($flash): ?>
<p class="flash flash--<?= e($flash['type']) ?>" role="status"><?= icon($flash['type'] === 'ok' ? 'check-circle' : 'warning-circle') ?><?= e($flash['msg']) ?></p>
<?php endif;
}

function page_end(): void
{
    global $CFG;
    $t = $CFG['tienda'];
    ?>
</main>
<footer class="colophon">
  <div class="colophon__news">
    <h2 class="colophon__title">Un correo al mes con lo que llega a la mesa de novedades.</h2>
    <form class="news" method="post" action="<?= e(url('api/boletin.php')) ?>" data-news novalidate>
      <?= csrf_field() ?>
      <label class="field__label" for="news-email">Tu correo</label>
      <div class="news__row">
        <input class="input" id="news-email" name="email" type="email" autocomplete="email" required placeholder="nombre@correo.es" aria-describedby="news-msg">
        <button class="btn btn--paper" type="submit"><span class="btn__label">Apuntarme</span></button>
      </div>
      <p class="field__msg" id="news-msg" aria-live="polite"></p>
    </form>
  </div>
  <div class="colophon__grid">
    <div>
      <h2 class="colophon__head">La tienda</h2>
      <p><?= pendiente($t['direccion'], 'dirección') ?><br><?= pendiente($t['cp_ciudad'], 'código postal y ciudad') ?></p>
      <p><?= pendiente($t['horario'], 'horario') ?></p>
    </div>
    <div>
      <h2 class="colophon__head">Contacto</h2>
      <p><?= pendiente($t['telefono'], 'teléfono') ?><br><?= pendiente($t['email'], 'correo') ?></p>
    </div>
    <div>
      <h2 class="colophon__head">Colecciones</h2>
      <ul class="colophon__list">
        <?php foreach (COLECCIONES as $k => $c): ?>
        <li><a href="<?= e(url('catalogo/' . $k)) ?>"><?= e($c['nombre']) ?></a></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <div>
      <h2 class="colophon__head">Información</h2>
      <ul class="colophon__list">
        <li><a href="<?= e(url('creditos')) ?>">Créditos de las fotos</a></li>
        <li><mark class="pendiente">Pendiente: aviso legal</mark></li>
        <li><mark class="pendiente">Pendiente: privacidad y cookies</mark></li>
      </ul>
    </div>
  </div>
  <p class="colophon__base"><span class="logo__mark" aria-hidden="true"></span>Bookit, librería. Te lo apartamos en el mostrador.</p>
</footer>
<div class="toast" data-toast role="status" aria-live="polite"></div>
</body>
</html>
<?php
}
