<?php
// API de Latón. Un único punto de entrada: /api/<ruta>.
declare(strict_types=1);

require __DIR__ . '/_lib/base.php';
require __DIR__ . '/_lib/esquema.php';
require __DIR__ . '/_lib/opciones.php';
require __DIR__ . '/_lib/citas.php';
require __DIR__ . '/_lib/pedidos.php';
require __DIR__ . '/_lib/admin.php';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

set_exception_handler(function (Throwable $e) {
    error_log('[laton] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    fallo('Algo ha fallado en el servidor. Prueba de nuevo en un momento.', 500);
});

$metodo = $_SERVER['REQUEST_METHOD'];
$ruta = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$ruta = '/' . trim(preg_replace('#^.*?/api(?=/|$)#', '', $ruta), '/');

// Las tablas se crean la primera vez; después basta con una marca en disco
$marca = raizProyecto() . '/datos/.esquema-v1';
if (!is_file($marca)) {
    @mkdir(dirname($marca), 0775, true);
    migrar();
    @touch($marca);
}

// El aviso de Stripe llega sin sesión ni CSRF: se valida por firma
if ($ruta === '/stripe/webhook' && $metodo === 'POST') stripeWebhook();

iniciarSesion();
if (!in_array($metodo, ['GET', 'HEAD', 'OPTIONS'], true)) exigirCsrf();

$r = fn(string $patron) => (bool) preg_match('#^' . $patron . '$#', $ruta, $GLOBALS['m']);
$cod = '([A-Z]{2}-[2-9A-Z]{6})';

match (true) {
    $metodo === 'GET' && $ruta === '/sesion' => sesionActual(),
    $metodo === 'POST' && $ruta === '/configuraciones' => guardarConfiguracion(),
    $metodo === 'GET' && $r("/configuraciones/$cod") => verConfiguracion($GLOBALS['m'][1]),

    $metodo === 'GET' && $ruta === '/citas/huecos' => verHuecos(),
    $metodo === 'POST' && $ruta === '/citas' => reservarCita(),
    $metodo === 'GET' && $r("/citas/$cod") => verCita($GLOBALS['m'][1]),
    $metodo === 'POST' && $r("/citas/$cod/cancelar") => cancelarCita($GLOBALS['m'][1]),

    $metodo === 'POST' && $ruta === '/pedidos' => crearPedido(),
    $metodo === 'GET' && $r("/pedidos/$cod") => verPedido($GLOBALS['m'][1]),

    $metodo === 'POST' && $ruta === '/taller/entrar' => entrar(),
    $metodo === 'POST' && $ruta === '/taller/salir' => salir(),
    $metodo === 'GET' && $ruta === '/taller/resumen' => adminResumen(),
    $metodo === 'GET' && $ruta === '/taller/citas' => adminCitas(),
    $metodo === 'PATCH' && $r("/taller/citas/$cod") => adminCambiarCita($GLOBALS['m'][1]),
    $metodo === 'GET' && $ruta === '/taller/pedidos' => adminPedidos(),
    $metodo === 'PATCH' && $r("/taller/pedidos/$cod") => adminAvanzar($GLOBALS['m'][1]),

    default => fallo('Esta ruta no existe.', 404),
};
