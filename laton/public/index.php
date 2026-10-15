<?php
// Entrada de la web en producción: sirve la aplicación (index.html compilado) con el título,
// la descripción, Open Graph y los datos estructurados de cada página ya puestos.
// Las rutas que no existen devuelven 404 de verdad.
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
    'titulo' => 'Latón · Bicicletas a medida soldadas a mano en Gran Canaria',
    'descripcion' => 'Cuadros de acero y titanio hechos a la medida de tu cuerpo en Tafira, Gran Canaria. Configura tu bici, mira el precio al momento y pide cita para medirte.',
    'jsonld' => null, 'estado' => 200, 'indexar' => true,
];
$fijas = [
    '/' => null,
    '/configurador' => ['Diseña tu bici · Latón', 'Elige modelo, material, color y componentes, mete tu altura y entrepierna y mira tu bici en 3D con el precio al momento.'],
    '/cita' => ['Pide cita para medirte · Latón', 'Hora y media en el taller de Tafira para medirte y diseñar tu cuadro. 90 €, que se descuentan si encargas la bici.'],
    '/legal/aviso-legal' => ['Aviso legal · Latón', null],
    '/legal/privacidad' => ['Política de privacidad · Latón', null],
    '/legal/condiciones' => ['Condiciones de encargo · Latón', 'Señal del 30 %, cancelación sin coste hasta aprobar el plano, plazos y garantía de por vida del cuadro.'],
    '/legal/cookies' => ['Cookies · Latón', null],
];

if (array_key_exists($ruta, $fijas)) {
    if ($fijas[$ruta]) {
        $meta['titulo'] = $fijas[$ruta][0];
        if ($fijas[$ruta][1]) $meta['descripcion'] = $fijas[$ruta][1];
    }
    if ($ruta === '/') {
        $meta['jsonld'] = ['@context' => 'https://schema.org', '@type' => 'BicycleStore', 'name' => 'Latón', 'url' => "$base/",
            'description' => $meta['descripcion'], 'image' => "$base/og.jpg", 'telephone' => '+34928000000', 'priceRange' => '2.400 € - 8.000 €',
            'address' => ['@type' => 'PostalAddress', 'streetAddress' => 'Carretera del Centro, 00', 'postalCode' => '35017', 'addressLocality' => 'Tafira Alta, Las Palmas de Gran Canaria', 'addressCountry' => 'ES'],
            'openingHoursSpecification' => [
                ['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens' => '10:00', 'closes' => '20:00'],
                ['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => 'Saturday', 'opens' => '10:00', 'closes' => '14:00'],
            ]];
    }
} elseif (preg_match('#^/configurador/LT-[2-9A-Z]{6}$#', $ruta)) {
    // Bicis compartidas: se ven, pero no se indexan
    $meta['titulo'] = 'Una bici diseñada en Latón';
    $meta['descripcion'] = 'Mira esta bici a medida en 3D, con sus medidas y su precio.';
    $meta['indexar'] = false;
} elseif (preg_match('#^/(cita|pedido)/[A-Z]{2}-[2-9A-Z]{6}$#', $ruta) || str_starts_with($ruta, '/taller')) {
    $meta['indexar'] = false;
} else {
    $meta['titulo'] = 'Página no encontrada · Latón';
    $meta['estado'] = 404;
    $meta['indexar'] = false;
}

if (esDemo()) $meta['indexar'] = false; // la demo no se indexa

$cab = '<link rel="canonical" href="' . $e($base . ($ruta === '/' ? '/' : $ruta)) . '">'
    . '<meta name="robots" content="' . ($meta['indexar'] ? 'index, follow' : 'noindex, follow') . '">'
    . '<meta property="og:type" content="website"><meta property="og:site_name" content="Latón"><meta property="og:locale" content="es_ES">'
    . '<meta property="og:title" content="' . $e($meta['titulo']) . '">'
    . '<meta property="og:description" content="' . $e($meta['descripcion']) . '">'
    . '<meta property="og:url" content="' . $e("$base$ruta") . '">'
    . '<meta property="og:image" content="' . $e("$base/og.jpg") . '"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
    . '<meta name="twitter:card" content="summary_large_image">'
    . ($meta['jsonld'] ? '<script type="application/ld+json">' . json_encode($meta['jsonld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) . '</script>' : '');

$html = preg_replace('#<title>.*?</title>#s', '<title>' . $e($meta['titulo']) . '</title>', $html, 1);
$html = preg_replace('#<meta name="description" content="[^"]*"\s*/?>#', '<meta name="description" content="' . $e($meta['descripcion']) . '" />', $html, 1);
// El código de la página que se abre se pide a la vez que el principal, no después
$paginas = ['/configurador' => 'src/paginas/Configurador.jsx', '/cita' => 'src/paginas/Cita.jsx', '/pedido/' => 'src/paginas/Pedido.jsx', '/legal/' => 'src/paginas/Legal.jsx', '/taller' => 'src/taller/Taller.jsx'];
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

http_response_code($meta['estado']);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
echo $html;
