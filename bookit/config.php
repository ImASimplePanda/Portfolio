<?php
/*
 * Configuración de Bookit.
 * En Hostinger: copia este fichero como config.local.php y rellena los datos de MySQL
 * (hPanel → Bases de datos → MySQL). config.local.php tiene prioridad y no se versiona.
 */

$config = [
    // 'sqlite' para probar en local, 'mysql' en Hostinger
    'db_driver' => 'sqlite',
    'db_host'   => 'localhost',
    'db_name'   => '',
    'db_user'   => '',
    'db_pass'   => '',
    'sqlite_path' => __DIR__ . '/data/bookit.sqlite',

    // Ruta base si la web no cuelga de la raíz del dominio (p. ej. '/tienda'). Sin barra final.
    'base' => '',
    'site_url' => 'https://bookit.example',   // [PENDIENTE] dominio definitivo, para canonical y Open Graph

    // Muestra la franja "catálogo de demostración". Ponlo a false cuando cargues el catálogo real.
    'demo' => true,

    // Días que guardamos un libro apartado en el mostrador. [PENDIENTE] confirmar política de la tienda.
    'dias_reserva' => 3,

    // Datos de la tienda. null = se muestra como pendiente en la web.
    'tienda' => [
        'direccion' => null,
        'cp_ciudad' => null,
        'horario'   => null,
        'telefono'  => null,
        'email'     => null,
        'mapa_url'  => null,
    ],

    // Clave para ejecutar /install.php en el servidor. Cámbiala antes de subir.
    'install_key' => 'cambia-esta-clave',
];

if (is_file(__DIR__ . '/config.local.php')) {
    $config = array_replace_recursive($config, require __DIR__ . '/config.local.php');
}

return $config;
