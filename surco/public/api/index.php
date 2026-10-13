<?php
// API de Surco. Un único punto de entrada: /api/<ruta>.
declare(strict_types=1);

require __DIR__ . '/_lib/base.php';
require __DIR__ . '/_lib/esquema.php';
require __DIR__ . '/_lib/catalogo.php';
require __DIR__ . '/_lib/pedidos.php';
require __DIR__ . '/_lib/cuenta.php';
require __DIR__ . '/_lib/admin.php';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

set_exception_handler(function (Throwable $e) {
    error_log('[surco] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
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

match (true) {
    $metodo === 'GET' && $ruta === '/sesion' => sesionActual(),
    $metodo === 'GET' && $ruta === '/productos' => listarProductos(),
    $metodo === 'GET' && $ruta === '/facetas' => facetas(),
    $metodo === 'GET' && $r('/productos/([a-z0-9-]{1,160})') => verProducto($GLOBALS['m'][1]),
    $metodo === 'POST' && $ruta === '/cesta' => validarCesta(),
    $metodo === 'POST' && $ruta === '/pedidos' => crearPedido(),
    $metodo === 'GET' && $r('/pedidos/(SU-[A-F0-9]{6})') => verPedido($GLOBALS['m'][1]),

    $metodo === 'POST' && $ruta === '/cuenta/registro' => registro(),
    $metodo === 'POST' && $ruta === '/cuenta/entrar' => entrar(),
    $metodo === 'POST' && $ruta === '/cuenta/salir' => salir(),
    $metodo === 'GET' && $ruta === '/cuenta/pedidos' => misPedidos(),
    $metodo === 'POST' && $ruta === '/cuenta/recuperar' => pedirRecuperacion(),
    $metodo === 'POST' && $ruta === '/cuenta/restablecer' => restablecerClave(),

    $metodo === 'GET' && $ruta === '/admin/resumen' => adminResumen(),
    $metodo === 'GET' && $ruta === '/admin/productos' => adminListarProductos(),
    $metodo === 'POST' && $ruta === '/admin/productos' => adminGuardarProducto(null),
    $metodo === 'GET' && $r('/admin/productos/(\d+)') => adminVerProducto((int) $GLOBALS['m'][1]),
    $metodo === 'PUT' && $r('/admin/productos/(\d+)') => adminGuardarProducto((int) $GLOBALS['m'][1]),
    $metodo === 'DELETE' && $r('/admin/productos/(\d+)') => adminBorrarProducto((int) $GLOBALS['m'][1]),
    $metodo === 'POST' && $ruta === '/admin/imagenes' => adminSubirImagen(),
    $metodo === 'GET' && $ruta === '/admin/pedidos' => adminListarPedidos(),
    $metodo === 'GET' && $ruta === '/admin/pedidos.csv' => adminExportarPedidos(),
    $metodo === 'PATCH' && $r('/admin/pedidos/(SU-[A-F0-9]{6})') => adminCambiarEstado($GLOBALS['m'][1]),

    default => fallo('Esta ruta no existe.', 404),
};
