<?php
// Entrada de la tienda en producción: sirve la aplicación (index.html compilado) con el título,
// la descripción, Open Graph y los datos estructurados de cada página ya puestos, para buscadores
// y redes sociales. Las rutas que no existen devuelven 404 de verdad.
declare(strict_types=1);

require __DIR__ . '/api/_lib/base.php';

$html = @file_get_contents(__DIR__ . '/index.html');
if ($html === false) { http_response_code(500); exit('Falta index.html'); }

$ruta = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (rutaBase() !== '' && str_starts_with($ruta, rutaBase())) $ruta = substr($ruta, strlen(rutaBase()));
$ruta = '/' . trim($ruta, '/');
$base = urlBase();
$e = fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');

$meta = [
    'titulo' => 'Muelle · Teclados mecánicos que puedes oír antes de comprar',
    'descripcion' => 'Teclados mecánicos, interruptores y teclas con distribución española. Escucha cada interruptor en la web, monta tu teclado en 3D y te lo enviamos probado desde Valencia.',
    'imagen' => "$base/og.jpg",
    'jsonld' => null,
    'estado' => 200,
    'indexar' => true,
];
$fijas = [
    '/' => null,
    '/tienda' => ['Tienda · Muelle', 'Teclados montados, interruptores, juegos de teclas y accesorios, con envío desde Valencia.'],
    '/tienda/teclados' => ['Teclados mecánicos montados · Muelle', 'Teclados de 60 %, 65 %, 75 % y TKL montados y probados tecla a tecla. Distribución española.'],
    '/tienda/interruptores' => ['Interruptores mecánicos · Muelle', 'Lineales, táctiles y clicky en packs de 10. Escucha cada uno antes de comprarlo.'],
    '/tienda/teclas' => ['Juegos de teclas en español · Muelle', 'Juegos de teclas PBT y ABS en distribución ISO española, con Ñ y Ç.'],
    '/tienda/accesorios' => ['Accesorios para teclados · Muelle', 'Cables en espiral, reposamuñecas, extractores y kits de lubricado.'],
    '/montador' => ['Monta tu teclado · Muelle', 'Elige formato, carcasa, placa, interruptores y teclas, óyelo y velo en 3D con el precio al momento.'],
];
$privadas = ['/cesta', '/caja', '/cuenta', '/cuenta/restablecer'];

if (array_key_exists($ruta, $fijas)) {
    if ($fijas[$ruta]) [$meta['titulo'], $meta['descripcion']] = $fijas[$ruta];
    // Datos de la primera pantalla dentro de la página: la aplicación no tiene que esperar a la API
    require_once __DIR__ . '/api/_lib/catalogo.php';
    require_once __DIR__ . '/api/_lib/montador.php';
    $piezasIniciales = function () {
        $piezas = ['interruptores' => [], 'teclas' => []];
        foreach (db()->query("SELECT * FROM productos WHERE activo = 1 AND tipo IN ('interruptores', 'teclas') ORDER BY destacado DESC, precio ASC")->fetchAll() as $p) {
            $piezas[$p['tipo'] === 'interruptores' ? 'interruptores' : 'teclas'][] = productoPublico($p);
        }
        return $piezas;
    };
    if ($ruta === '/montador') $iniciales = ['piezas' => $piezasIniciales()];
    $secciones = ['/tienda' => null, '/tienda/teclados' => 'teclado', '/tienda/interruptores' => 'interruptores', '/tienda/teclas' => 'teclas', '/tienda/accesorios' => 'accesorio'];
    if (array_key_exists($ruta, $secciones) && empty($_GET)) {
        $tipo = $secciones[$ruta];
        $donde = 'activo = 1' . ($tipo ? ' AND tipo = ' . db()->quote($tipo) : '');
        $total = (int) db()->query("SELECT COUNT(*) FROM productos WHERE $donde")->fetchColumn();
        $filas = db()->query("SELECT * FROM productos WHERE $donde ORDER BY destacado DESC, creado DESC, id DESC LIMIT 24")->fetchAll();
        $iniciales = ['catalogo:' . ($tipo ?? 'todo') => ['productos' => array_map('productoPublico', $filas), 'total' => $total, 'pagina' => 1, 'paginas' => max(1, (int) ceil($total / 24))]];
    }
    if ($ruta === '/') {
        // Las piezas y los teclados de la portada viajan dentro de la página (sin esperar a la API)
        $piezas = $piezasIniciales();
        $teclados = db()->query("SELECT * FROM productos WHERE activo = 1 AND tipo = 'teclado' ORDER BY destacado DESC, creado DESC, id DESC LIMIT 4")->fetchAll();
        $iniciales = ['piezas' => $piezas, 'montados' => ['productos' => array_map('productoPublico', $teclados)]];
        $meta['jsonld'] = ['@context' => 'https://schema.org', '@type' => 'Store', 'name' => 'Muelle', 'url' => "$base/",
            'description' => $meta['descripcion'], 'image' => "$base/og.jpg", 'priceRange' => '5 € - 500 €',
            'address' => ['@type' => 'PostalAddress', 'streetAddress' => 'Calle del Doctor Sumsi, 00', 'postalCode' => '46005', 'addressLocality' => 'Valencia', 'addressCountry' => 'ES']];
    }
} elseif (preg_match('#^/producto/([a-z0-9-]{1,160})$#', $ruta, $m)) {
    $s = db()->prepare('SELECT * FROM productos WHERE slug = ? AND activo = 1');
    $s->execute([$m[1]]);
    if ($p = $s->fetch()) {
        require_once __DIR__ . '/api/_lib/catalogo.php';
        require_once __DIR__ . '/api/_lib/montador.php';
        $r = db()->prepare('SELECT * FROM productos WHERE activo = 1 AND stock > 0 AND id <> ? AND tipo = ? ORDER BY destacado DESC, creado DESC LIMIT 4');
        $r->execute([$p['id'], $p['tipo']]);
        $iniciales = ['producto:' . $p['slug'] => ['producto' => productoPublico($p, true), 'relacionados' => array_map('productoPublico', $r->fetchAll())]];
        $nombre = $p['tipo'] === 'interruptores' ? "Interruptores {$p['titulo']}" : ($p['tipo'] === 'teclas' ? "Juego de teclas {$p['titulo']}" : $p['titulo']);
        $meta['titulo'] = "$nombre · Muelle";
        $meta['descripcion'] = mb_substr(trim(($p['resumen'] ? "{$p['resumen']} " : '') . (string) $p['descripcion']), 0, 158);
        $imgs = $p['imagenes'] ? json_decode($p['imagenes'], true) : [];
        if ($imgs) $meta['imagen'] = "$base/subidas/{$imgs[0]}-1600.webp";
        $meta['jsonld'] = ['@context' => 'https://schema.org', '@type' => 'Product', 'name' => $nombre, 'description' => $meta['descripcion'],
            'image' => $meta['imagen'], 'sku' => (string) $p['id'], 'brand' => ['@type' => 'Brand', 'name' => $p['marca'] ?: 'Muelle'],
            'offers' => ['@type' => 'Offer', 'url' => "$base$ruta", 'priceCurrency' => 'EUR', 'price' => number_format($p['precio'] / 100, 2, '.', ''),
                'availability' => $p['stock'] > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
                'itemCondition' => 'https://schema.org/NewCondition']];
    } else {
        $meta['titulo'] = 'Este producto ya no está · Muelle';
        $meta['estado'] = 404;
        $meta['indexar'] = false;
    }
} elseif (preg_match('#^/legal/(aviso-legal|privacidad|condiciones|envios|garantia|cookies)$#', $ruta, $m)) {
    $t = ['aviso-legal' => 'Aviso legal', 'privacidad' => 'Política de privacidad', 'condiciones' => 'Condiciones de venta', 'envios' => 'Envíos y devoluciones', 'garantia' => 'Garantía', 'cookies' => 'Cookies'];
    $meta['titulo'] = $t[$m[1]] . ' · Muelle';
} elseif (in_array($ruta, $privadas, true) || str_starts_with($ruta, '/pedido/') || str_starts_with($ruta, '/admin')) {
    $meta['indexar'] = false;
} else {
    $meta['titulo'] = 'Página no encontrada · Muelle';
    $meta['estado'] = 404;
    $meta['indexar'] = false;
}

if (esDemo()) $meta['indexar'] = false; // la demo no se indexa

$cab = '<link rel="canonical" href="' . $e($base . ($ruta === '/' ? '/' : $ruta)) . '">'
    . '<meta name="robots" content="' . ($meta['indexar'] ? 'index, follow' : 'noindex, follow') . '">'
    . '<meta property="og:type" content="' . (str_starts_with($ruta, '/producto/') ? 'product' : 'website') . '">'
    . '<meta property="og:site_name" content="Muelle"><meta property="og:locale" content="es_ES">'
    . '<meta property="og:title" content="' . $e($meta['titulo']) . '">'
    . '<meta property="og:description" content="' . $e($meta['descripcion']) . '">'
    . '<meta property="og:url" content="' . $e("$base$ruta") . '">'
    . '<meta property="og:image" content="' . $e($meta['imagen']) . '"><meta name="twitter:card" content="summary_large_image">'
    . ($meta['jsonld'] ? '<script type="application/ld+json">' . json_encode($meta['jsonld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) . '</script>' : '');

$html = preg_replace('#<title>.*?</title>#s', '<title>' . $e($meta['titulo']) . '</title>', $html, 1);
$html = preg_replace('#<meta name="description" content="[^"]*"\s*/?>#', '<meta name="description" content="' . $e($meta['descripcion']) . '" />', $html, 1);
if (!empty($iniciales)) {
    // type="application/json" no se ejecuta: compatible con la CSP estricta (script-src 'self')
    $cab .= '<script type="application/json" id="muelle-inicial">' . json_encode($iniciales, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) . '</script>';
}
// El código de la página que se abre se pide a la vez que el principal, no después
$paginas = ['/montador' => 'src/paginas/Montador.jsx', '/producto/' => 'src/paginas/Producto.jsx', '/tienda' => 'src/paginas/Catalogo.jsx', '/cesta' => 'src/paginas/Cesta.jsx', '/caja' => 'src/paginas/Caja.jsx'];
$manifiesto = @json_decode((string) @file_get_contents(__DIR__ . '/.vite/manifest.json'), true) ?: [];
foreach ($paginas as $prefijo => $fuente) {
    if (!str_starts_with($ruta, $prefijo) || !isset($manifiesto[$fuente])) continue;
    $pendientes = [$fuente];
    $vistos = [];
    while ($k = array_pop($pendientes)) {
        if (isset($vistos[$k]) || !isset($manifiesto[$k])) continue;
        $vistos[$k] = true;
        if (empty($manifiesto[$k]['isEntry'])) $cab .= '<link rel="modulepreload" crossorigin href="' . $e(rtrim(rutaBase(), '/') . '/' . $manifiesto[$k]['file']) . '">';
        foreach ($manifiesto[$k]['imports'] ?? [] as $i) $pendientes[] = $i;
    }
    break;
}
$html = str_replace('<!--meta-->', $cab, $html);

// Cascarón: el aviso de demo y la cabecera salen ya en el HTML, así se ven en cuanto llega el CSS,
// sin esperar al JavaScript. React lo sustituye al arrancar por lo mismo (mismas clases y medidas).
if (!str_starts_with($ruta, '/admin')) {
    $raiz = rtrim(rutaBase(), '/');
    $enl = '';
    foreach ([['/tienda', 'Tienda'], ['/tienda/interruptores', 'Interruptores'], ['/tienda/teclas', 'Teclas'], ['/montador', 'Monta el tuyo']] as [$to, $t]) {
        $enl .= '<li><a class="relative px-3 py-2.5 text-[0.95rem] font-medium transition-colors text-serigrafia-tenue hover:text-serigrafia" href="' . $e($raiz . $to) . '">' . $t . '</a></li>';
    }
    $cascaron = (esDemo() ? '<p data-aviso-demo class="bg-fr4 text-mascara-honda text-center text-sm font-semibold px-4 py-1.5">Tienda de demostración: la marca, los productos y los precios son inventados y el pago es simulado.</p>' : '')
        . '<header class="cabecera sticky top-0 z-40 bg-mascara/90 backdrop-blur-md border-b border-mascara-borde/70"><div class="mx-auto max-w-[1360px] h-[68px] px-4 sm:px-6 lg:px-10 flex items-center gap-4">'
        . '<a href="' . $e($raiz . '/') . '" aria-label="Muelle, inicio" class="rounded"><span class="inline-flex items-center gap-2.5"><svg width="34" height="28" viewBox="0 0 34 28" aria-hidden="true"><rect x="1" y="1" width="32" height="26" rx="3" fill="none" stroke="var(--color-serigrafia)" stroke-width="1.6"/><path d="M8 20V8l9 7 9-7v12" fill="none" stroke="var(--color-cobre)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5" cy="5" r="1.4" fill="var(--color-serigrafia)"/></svg><span class="serigrafia text-[1.4rem] tracking-[0.08em]">MUELLE</span></span></a>'
        . '<nav aria-label="Principal" class="hidden lg:block ml-6"><ul class="flex gap-1">' . $enl . '</ul></nav>'
        . '<div class="ml-auto flex items-center gap-1.5"><span class="size-11"></span><span class="flex items-center gap-2.5 h-11 w-[4.25rem] rounded-full bg-cobre"></span><span class="lg:hidden size-11"></span></div>'
        . '</div></header><main class="min-h-[100svh]"></main>';
    $html = str_replace('<!--cascaron-->', $cascaron, $html);
}

// Política de seguridad: solo recursos del propio sitio. El nonce cambia en cada petición y solo
// lo conocen esta página y los estilos que la aplicación crea en tiempo de ejecución.
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'nonce-$nonce'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'self' https://checkout.stripe.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests");
$html = str_replace('<!--nonce-->', '<meta property="csp-nonce" content="' . $nonce . '">', $html);
http_response_code($meta['estado']);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
echo $html;
