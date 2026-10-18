<?php
// Llena la base de datos con productos de ejemplo y crea la cuenta de administración.
// Uso: php scripts/sembrar.php [--reset]
// DATOS DE DEMOSTRACIÓN: los interruptores, juegos de teclas y teclados son inventados (marca Muelle).
declare(strict_types=1);

require __DIR__ . '/../public/api/_lib/base.php';
require __DIR__ . '/../public/api/_lib/esquema.php';

if (in_array('--reset', $argv, true)) {
    $f = raizProyecto() . '/datos/muelle.sqlite';
    foreach ([$f, "$f-wal", "$f-shm", raizProyecto() . '/datos/.esquema-v1', raizProyecto() . '/datos/correos.log'] as $x) @unlink($x);
    echo "Base de datos borrada.\n";
}
@mkdir(raizProyecto() . '/datos', 0775, true);
migrar();
@touch(raizProyecto() . '/datos/.esquema-v1');

$n = 0;
$alta = function (array $p) use (&$n) {
    $s = db()->prepare('SELECT 1 FROM productos WHERE slug = ?');
    $s->execute([$p['slug']]);
    if ($s->fetchColumn()) return;
    $p += ['marca' => 'Muelle', 'familia' => null, 'formato' => null, 'color' => null, 'descripcion' => '', 'imagenes' => '[]', 'destacado' => 0, 'activo' => 1, 'creado' => gmdate('Y-m-d H:i:s', time() - $n * 3600)];
    $p['specs'] = json_encode($p['specs'] ?? [], JSON_UNESCAPED_UNICODE);
    $cols = array_keys($p);
    db()->prepare('INSERT INTO productos (' . implode(',', $cols) . ') VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')')->execute(array_values($p));
    $n++;
};

// Interruptores: se venden en packs de 10. "sonido" alimenta el sintetizador de la web.
$interruptores = [
    // nombre, familia, fuerza g, recorrido mm, carcasa, precio pack €, stock packs, destacado, color, sonido, resumen
    ['Crema', 'lineal', 45, 4.0, 'POM', 6.5, 60, 1, '#efe2c4', ['tono' => 1250, 'cuerpo' => 0.8, 'brillo' => 0.3], 'Lineal ligero y muy suave. Suena grave y redondo: el famoso "thock".'],
    ['Seda', 'lineal', 55, 3.8, 'Policarbonato', 5.0, 80, 0, '#d9e6f2', ['tono' => 1700, 'cuerpo' => 0.5, 'brillo' => 0.55], 'Un lineal de toda la vida, lubricado de fábrica. Para empezar sin equivocarse.'],
    ['Granito', 'lineal', 67, 4.0, 'Nailon', 7.5, 18, 0, '#6e6f73', ['tono' => 1050, 'cuerpo' => 0.95, 'brillo' => 0.25], 'Pesado y profundo. Para quien escribe fuerte y no quiere pulsaciones sin querer.'],
    ['Bergamota', 'tactil', 62, 3.6, 'POM y nailon', 7.0, 45, 1, '#e8a33d', ['tono' => 1550, 'cuerpo' => 0.6, 'brillo' => 0.5], 'Táctil con un bache marcado arriba del todo. Notas cada pulsación sin oírla.'],
    ['Grafito', 'tactil', 60, 3.5, 'Policarbonato', 8.0, 9, 0, '#3b3b40', ['tono' => 1400, 'cuerpo' => 0.4, 'brillo' => 0.2, 'volumen' => 0.4], 'Táctil silencioso, con amortiguadores arriba y abajo. Para oficinas y llamadas.'],
    ['Cigarra', 'clicky', 60, 4.0, 'Policarbonato', 5.5, 70, 1, '#5a8fd6', ['tono' => 2100, 'cuerpo' => 0.35, 'brillo' => 0.8], 'Clicky con barra de clic: suena como una máquina de escribir. No para compartir piso.'],
    ['Gorrión', 'clicky', 50, 3.6, 'Nailon', 6.0, 30, 0, '#a8c27a', ['tono' => 1900, 'cuerpo' => 0.45, 'brillo' => 0.7], 'Clicky ligero con caja de clic: clic nítido y corto, más fino que la Cigarra.'],
];
foreach ($interruptores as [$nom, $fam, $g, $mm, $carcasa, $precio, $stock, $dest, $color, $sonido, $resumen]) {
    $etiqueta = ['lineal' => 'lineal', 'tactil' => 'táctil', 'clicky' => 'clicky'][$fam];
    $alta(['slug' => 'interruptores-' . slugify($nom), 'tipo' => 'interruptores', 'titulo' => $nom, 'familia' => $fam, 'color' => $color,
        'resumen' => $resumen, 'precio' => (int) round($precio * 100), 'stock' => $stock, 'destacado' => $dest,
        'descripcion' => "Interruptor $etiqueta de $g g de fuerza y $mm mm de recorrido total, con carcasa de " . mb_strtolower($carcasa) . ". Tres pines, compatible con cualquier placa hot-swap MX. Pack de 10.",
        'specs' => ['fuerza' => $g, 'recorrido' => $mm, 'carcasa' => $carcasa, 'pines' => 3, 'pack' => 10, 'sonido' => ['familia' => $fam] + $sonido]]);
}

// Juegos de teclas: los colores son los que pinta el teclado 3D
$juegos = [
    // nombre, perfil, material, precio €, stock, destacado, letras, rótulo letras, mods, rótulo mods, acento, rótulo acento, resumen
    ['Ciruela', 'Cherry', 'PBT doble inyección', 89, 25, 1, '#efe3cf', '#4a2d52', '#4a2d52', '#efe3cf', '#e3a92f', '#2e1a33', 'Crema y ciruela con Escape e Intro en mostaza. El juego de la casa.'],
    ['Fósforo', 'Cherry', 'PBT sublimado', 79, 30, 1, '#1f2320', '#7fe08a', '#151816', '#7fe08a', '#7fe08a', '#151816', 'Negro con rótulos verde fósforo, como los monitores de 1982.'],
    ['Calco', 'Cherry', 'ABS doble inyección', 95, 12, 1, '#e6dcc6', '#2d2a26', '#a9a395', '#2d2a26', '#dd5a2b', '#f3ede0', 'Beige de oficina de los 80, grises cálidos y un Intro naranja.'],
    ['Hielo', 'Cherry', 'PBT doble inyección', 85, 20, 0, '#f4f6f7', '#3b5f86', '#c9d8e6', '#2b4766', '#5f8fc4', '#f4f6f7', 'Blanco y azules pálidos. Luminoso, limpio y muy tranquilo.'],
    ['Tinta', 'Cherry', 'PBT sublimado', 69, 40, 0, '#1b1b1d', '#f2f2f2', '#2a2a2d', '#f2f2f2', '#f2f2f2', '#1b1b1d', 'Negro y blanco, sin más. Rótulos que no se gastan nunca.'],
    ['Sandía', 'SA alto', 'ABS doble inyección', 99, 6, 1, '#f3b8b8', '#2e4a2c', '#3e6b3a', '#f6e9e9', '#d23a3a', '#f6e9e9', 'Rosa, verde y un Escape rojo. Perfil SA: altas, esféricas y con mucho sonido.'],
    ['Salitre', 'Cherry', 'PBT doble inyección', 89, 18, 0, '#e9e2d0', '#1f3250', '#1f3250', '#e9e2d0', '#c9a24a', '#1f3250', 'Azul marino y crema con detalles dorados, como un velero antiguo.'],
];
foreach ($juegos as [$nom, $perfil, $mat, $precio, $stock, $dest, $l, $lr, $m, $mr, $a, $ar, $resumen]) {
    $alta(['slug' => 'teclas-' . slugify($nom), 'tipo' => 'teclas', 'titulo' => $nom, 'color' => $l, 'resumen' => $resumen,
        'precio' => $precio * 100, 'stock' => $stock, 'destacado' => $dest,
        'descripcion' => "Juego de teclas $nom en perfil $perfil, $mat. Incluye teclas para 60 %, 65 %, 75 % y TKL en distribución ISO española (con Ñ y Ç).",
        'specs' => ['perfil' => $perfil, 'material' => $mat, 'colores' => ['letras' => $l, 'letrasRotulo' => $lr, 'mods' => $m, 'modsRotulo' => $mr, 'acento' => $a, 'acentoRotulo' => $ar]]]);
}

// Teclados ya montados: su configuración se pinta igual que en el montador
$idDe = function (string $slug) {
    $s = db()->prepare('SELECT id FROM productos WHERE slug = ?');
    $s->execute([$slug]);
    return (int) $s->fetchColumn();
};
$teclados = [
    ['Muelle 65 Ciruela', '65', 'aluminio', 'ciruela', 'laton', 'crema', 'ciruela', 349, 4, 1, 'Nuestro 65 % de aluminio color ciruela con placa de latón e interruptores Crema lubricados.'],
    ['Muelle 75 Calco', '75', 'aluminio', 'arena', 'policarbonato', 'bergamota', 'calco', 379, 3, 1, 'Un 75 % arena con teclas Calco y táctiles Bergamota. Retro por fuera, moderno por dentro.'],
    ['Muelle 60 Fósforo', '60', 'policarbonato', 'humo', 'fr4', 'cigarra', 'fosforo', 259, 5, 0, 'Policarbonato ahumado, rótulos verde fósforo y clic de máquina de escribir.'],
    ['Muelle TKL Hielo', 'tkl', 'policarbonato', 'hielo', 'aluminio', 'seda', 'hielo', 329, 2, 0, 'Completo, sin bloque numérico, translúcido y con teclas Hielo.'],
];
foreach ($teclados as [$nom, $fmt, $carcasa, $color, $placa, $int, $tec, $precio, $stock, $dest, $resumen]) {
    $alta(['slug' => slugify($nom), 'tipo' => 'teclado', 'titulo' => $nom, 'formato' => $fmt, 'resumen' => $resumen,
        'precio' => $precio * 100, 'stock' => $stock, 'destacado' => $dest,
        'descripcion' => "$resumen Montado y probado tecla a tecla en nuestro taller, con estabilizadores ajustados y cable USB-C. Distribución ISO española.",
        'specs' => ['montaje' => ['formato' => $fmt, 'carcasa' => $carcasa, 'color' => $color, 'placa' => $placa, 'interruptor' => $idDe("interruptores-$int"), 'teclas' => $idDe("teclas-$tec"), 'extras' => ['estabilizadores']]]]);
}

$accesorios = [
    ['Cable en espiral Ciruela', 35, 20, '#4a2d52', 'USB-C a USB-C con conector de aviación. Espiral de 15 cm y 1,8 m en total.'],
    ['Reposamuñecas de nogal', 49, 14, '#6b4630', 'Nogal macizo aceitado, con base de corcho para que no se mueva. Para 65 % y 75 %.'],
    ['Extractor de teclas e interruptores', 12, 50, '#b8b8bc', 'Dos herramientas en una: saca teclas sin rayarlas e interruptores hot-swap sin doblar pines.'],
    ['Kit de lubricado', 29, 22, '#e3a92f', 'Lubricante para interruptores, pinceles, pinzas y una base para abrir 4 a la vez.'],
    ['Probador de interruptores', 19, 35, '#efe3cf', 'Los siete interruptores de la tienda montados en una base. Prueba antes de comprar 90.'],
];
foreach ($accesorios as [$nom, $precio, $stock, $color, $resumen]) {
    $alta(['slug' => slugify($nom), 'tipo' => 'accesorio', 'titulo' => $nom, 'color' => $color, 'resumen' => $resumen, 'descripcion' => $resumen,
        'precio' => $precio * 100, 'stock' => $stock]);
}
echo "$n productos nuevos.\n";

// Cuenta de administración (los datos salen de muelle.env, nunca del código)
$email = config('ADMIN_EMAIL');
$clave = config('ADMIN_CLAVE');
if ($email && $clave) {
    $s = db()->prepare('SELECT id FROM usuarios WHERE email = ?');
    $s->execute([$email]);
    if ($id = $s->fetchColumn()) {
        db()->prepare("UPDATE usuarios SET hash = ?, rol = 'admin' WHERE id = ?")->execute([password_hash($clave, PASSWORD_DEFAULT), $id]);
    } else {
        db()->prepare("INSERT INTO usuarios (email, nombre, hash, rol, creado) VALUES (?, 'Administración', ?, 'admin', ?)")->execute([$email, password_hash($clave, PASSWORD_DEFAULT), ahora()]);
    }
    echo "Cuenta de administración lista ($email).\n";
}
