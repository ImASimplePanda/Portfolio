<?php
/* Solo para pruebas en local: php -S localhost:8080 router.php  (en Hostinger lo hace .htaccess) */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/(data|inc|_src)(/|$)#', $path)) { http_response_code(403); exit('Prohibido'); }
if ($path !== '/' && is_file(__DIR__ . $path)) return false;
$routes = [
    '#^/$#' => 'index.php',
    '#^/catalogo/?$#' => 'catalogo.php',
    '#^/catalogo/([a-z]+)/?$#' => ['catalogo.php', 'col'],
    '#^/libro/([a-z0-9-]+)/?$#' => ['libro.php', 'l'],
    '#^/pedido/([A-Za-z0-9]+)/?$#' => ['pedido.php', 'c'],
    '#^/(cesta|entrar|cuenta|deseados|salir|creditos)/?$#' => null,
];
foreach ($routes as $re => $target) {
    if (preg_match($re, $path, $m)) {
        if ($target === null) $target = $m[1] . '.php';
        if (is_array($target)) { $_GET[$target[1]] = $m[1]; $target = $target[0]; }
        $_SERVER['SCRIPT_NAME'] = '/' . $target;
        require __DIR__ . '/' . $target;
        return true;
    }
}
http_response_code(404);
require __DIR__ . '/404.php';
