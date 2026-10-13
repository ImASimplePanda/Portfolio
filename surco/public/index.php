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
    'titulo' => 'Surco · Discos y tocadiscos de segunda mano en Las Palmas',
    'descripcion' => 'Vinilos de segunda mano revisados uno a uno y tocadiscos puestos a punto en Las Palmas de Gran Canaria. Envío a Canarias y a la península.',
    'imagen' => "$base/og.jpg",
    'jsonld' => null,
    'estado' => 200,
    'indexar' => true,
];
$fijas = [
    '/' => null,
    '/discos' => ['Discos de segunda mano · Surco', 'Jazz, soul, rock, música canaria y más: vinilos originales graduados con la escala Goldmine y escuchados enteros.'],
    '/tocadiscos' => ['Tocadiscos revisados · Surco', 'Technics, Thorens, Dual y más, revisados en nuestro taller con un año de garantía.'],
    '/accesorios' => ['Accesorios para vinilos · Surco', 'Cepillos, fundas y limpiadores para que tus discos duren décadas.'],
    '/vender' => ['Vende tus discos · Surco', 'Compramos colecciones de vinilos y tocadiscos en Gran Canaria. Pago en el momento o crédito para la tienda.'],
];
$privadas = ['/cesta', '/caja', '/cuenta', '/cuenta/restablecer'];

if (array_key_exists($ruta, $fijas)) {
    if ($fijas[$ruta]) [$meta['titulo'], $meta['descripcion']] = $fijas[$ruta];
    if ($ruta === '/') {
        // Los dos listados de la portada viajan dentro de la página (sin esperar a la API)
        require __DIR__ . '/api/_lib/catalogo.php';
        $lista = function (string $where, int $n) {
            $s = db()->query("SELECT * FROM productos WHERE activo = 1 AND tipo = 'vinilo' $where ORDER BY creado DESC, id DESC LIMIT $n");
            return ['productos' => array_map('productoPublico', $s->fetchAll())];
        };
        $iniciales = ['destacados' => $lista('AND destacado = 1 AND stock > 0', 12), 'nuevos' => $lista('', 8)];
        $meta['jsonld'] = ['@context' => 'https://schema.org', '@type' => 'Store', 'name' => 'Surco', 'url' => "$base/",
            'description' => $meta['descripcion'], 'image' => "$base/og.jpg", 'priceRange' => '9 € - 420 €',
            'address' => ['@type' => 'PostalAddress', 'streetAddress' => 'Calle Perdomo, 00', 'postalCode' => '35002', 'addressLocality' => 'Las Palmas de Gran Canaria', 'addressCountry' => 'ES']];
    }
} elseif (preg_match('#^/producto/([a-z0-9-]{1,160})$#', $ruta, $m)) {
    $s = db()->prepare('SELECT * FROM productos WHERE slug = ? AND activo = 1');
    $s->execute([$m[1]]);
    if ($p = $s->fetch()) {
        $nombre = $p['artista'] ? "{$p['artista']}: {$p['titulo']}" : $p['titulo'];
        $meta['titulo'] = "$nombre · Surco";
        $meta['descripcion'] = mb_substr(trim(($p['anio'] ? "{$p['anio']}. " : '') . ($p['estado_disco'] ? "Disco {$p['estado_disco']}, funda {$p['estado_funda']}. " : '') . (string) $p['descripcion']), 0, 158);
        $imgs = $p['imagenes'] ? json_decode($p['imagenes'], true) : [];
        if ($imgs) $meta['imagen'] = "$base/subidas/{$imgs[0]}-1600.webp";
        $meta['jsonld'] = ['@context' => 'https://schema.org', '@type' => 'Product', 'name' => $nombre, 'description' => $meta['descripcion'],
            'image' => $meta['imagen'], 'sku' => (string) $p['id'], 'brand' => $p['sello'] ?: $p['marca'] ?: 'Surco',
            'offers' => ['@type' => 'Offer', 'url' => "$base$ruta", 'priceCurrency' => 'EUR', 'price' => number_format($p['precio'] / 100, 2, '.', ''),
                'availability' => $p['stock'] > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
                'itemCondition' => $p['tipo'] === 'accesorio' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition']];
    } else {
        $meta['titulo'] = 'Este disco ya no está · Surco';
        $meta['estado'] = 404;
        $meta['indexar'] = false;
    }
} elseif (preg_match('#^/legal/(aviso-legal|privacidad|condiciones|envios|cookies)$#', $ruta, $m)) {
    $t = ['aviso-legal' => 'Aviso legal', 'privacidad' => 'Política de privacidad', 'condiciones' => 'Condiciones de venta', 'envios' => 'Envíos y devoluciones', 'cookies' => 'Cookies'];
    $meta['titulo'] = $t[$m[1]] . ' · Surco';
} elseif (in_array($ruta, $privadas, true) || str_starts_with($ruta, '/pedido/') || str_starts_with($ruta, '/admin')) {
    $meta['indexar'] = false;
} else {
    $meta['titulo'] = 'Página no encontrada · Surco';
    $meta['estado'] = 404;
    $meta['indexar'] = false;
}

if (esDemo()) $meta['indexar'] = false; // la demo no se indexa

$cab = '<link rel="canonical" href="' . $e($base . ($ruta === '/' ? '/' : $ruta)) . '">'
    . '<meta name="robots" content="' . ($meta['indexar'] ? 'index, follow' : 'noindex, follow') . '">'
    . '<meta property="og:type" content="' . (str_starts_with($ruta, '/producto/') ? 'product' : 'website') . '">'
    . '<meta property="og:site_name" content="Surco"><meta property="og:locale" content="es_ES">'
    . '<meta property="og:title" content="' . $e($meta['titulo']) . '">'
    . '<meta property="og:description" content="' . $e($meta['descripcion']) . '">'
    . '<meta property="og:url" content="' . $e("$base$ruta") . '">'
    . '<meta property="og:image" content="' . $e($meta['imagen']) . '"><meta name="twitter:card" content="summary_large_image">'
    . ($meta['jsonld'] ? '<script type="application/ld+json">' . json_encode($meta['jsonld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) . '</script>' : '');

$html = preg_replace('#<title>.*?</title>#s', '<title>' . $e($meta['titulo']) . '</title>', $html, 1);
$html = preg_replace('#<meta name="description" content="[^"]*"\s*/?>#', '<meta name="description" content="' . $e($meta['descripcion']) . '" />', $html, 1);
if (!empty($iniciales)) {
    // type="application/json" no se ejecuta: compatible con la CSP estricta (script-src 'self')
    $cab .= '<script type="application/json" id="surco-inicial">' . json_encode($iniciales, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) . '</script>';
}
$html = str_replace('<!--meta-->', $cab, $html);

http_response_code($meta['estado']);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
echo $html;
