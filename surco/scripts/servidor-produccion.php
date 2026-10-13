<?php
// Imita en local el .htaccess de producción sobre dist/ (php -S ... scripts/servidor-produccion.php)
// y envía la misma política de seguridad, para probar la versión compilada antes de subirla.
$raiz = dirname(__DIR__) . '/dist';
$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
header('X-Content-Type-Options: nosniff');
if (preg_match('#(^|/)\.|\.(env|sqlite|log|sql|bak)$|^/api/_lib#', $ruta)) { http_response_code(403); exit; }
if (str_starts_with($ruta, '/api')) { chdir("$raiz/api"); require "$raiz/api/index.php"; return true; }
if ($ruta === '/sitemap.xml') { require "$raiz/sitemap.php"; return true; }
if ($ruta === '/robots.txt') { require "$raiz/robots.php"; return true; }
if ($ruta !== '/' && is_file($raiz . $ruta) && !str_ends_with($ruta, '.php')) {
    $tipos = ['js' => 'application/javascript', 'css' => 'text/css', 'svg' => 'image/svg+xml', 'webp' => 'image/webp', 'woff2' => 'font/woff2', 'jpg' => 'image/jpeg', 'png' => 'image/png'];
    $ext = pathinfo($ruta, PATHINFO_EXTENSION);
    header('Content-Type: ' . ($tipos[$ext] ?? 'application/octet-stream'));
    // Como en Hostinger: texto comprimido con gzip
    if (in_array($ext, ['js', 'css', 'svg'], true) && str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip')) {
        header('Content-Encoding: gzip');
        echo gzencode(file_get_contents($raiz . $ruta), 6);
    } else {
        readfile($raiz . $ruta);
    }
    return true;
}
if (str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip')) { ob_start('ob_gzhandler'); }
require "$raiz/index.php";
