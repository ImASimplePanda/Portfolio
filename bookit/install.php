<?php
/* Crea las tablas y carga el catálogo de ejemplo en MySQL. Uso: /install.php?key=TU_CLAVE  (bórralo después) */
require __DIR__ . '/inc/boot.php';
header('Content-Type: text/plain; charset=utf-8');
if (!hash_equals((string) $CFG['install_key'], (string) ($_GET['key'] ?? '')) || $CFG['install_key'] === 'cambia-esta-clave') {
    http_response_code(403);
    exit("Clave incorrecta o sin cambiar en config.local.php.\n");
}
bk_install(db(), $CFG['db_driver']);
echo "Listo: tablas creadas y catálogo cargado. Borra install.php del servidor.\n";
