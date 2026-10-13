<?php
// Llena la base de datos con productos de ejemplo y crea la cuenta de administración.
// Uso: php scripts/sembrar.php [--reset]
// DATOS DE DEMOSTRACIÓN: discos, artistas y sellos son inventados.
declare(strict_types=1);

require __DIR__ . '/../public/api/_lib/base.php';
require __DIR__ . '/../public/api/_lib/esquema.php';

migrar();
if (in_array('--reset', $argv, true)) {
    foreach (['pedido_lineas', 'pedidos', 'productos', 'restablecer', 'intentos'] as $t) db()->exec("DELETE FROM $t");
    echo "Tablas vaciadas.\n";
}

$discos = [
    // titulo, artista, sello, catálogo, año, país, género, formato, disco, funda, precio €, destacado, tracklist
    ['Marea de fondo', 'Los Alisios', 'Discos Roque', 'DR-1043', 1978, 'España', 'Folk canario', 'LP', 'VG+', 'VG', 38, 1, ['Arinaga', 'Viento de abajo', 'Isa del muelle', 'La barra', 'Folía del faro', 'Marea de fondo']],
    ['Medianoche en la calle Perdomo', 'Trío Valcárcel', 'Sello Atlántico', 'SA-207', 1964, 'España', 'Jazz', 'LP', 'NM', 'VG+', 95, 1, ['Perdomo, 2 a.m.', 'Blues para Triana', 'Alameda', 'Ritmo de guagua', 'Puerto de la Luz']],
    ['Sol de invierno', 'Nadia Ferrer', 'Hispavox Archivo', 'HA-3381', 1983, 'España', 'Pop español', 'LP', 'VG+', 'VG+', 24, 0, ['Sol de invierno', 'Ventanas', 'Domingo', 'Cuando vuelvas', 'Luz de neón', 'Final']],
    ['Electric Harbour', 'The Undertow', 'Blue Harbour Records', 'BH-12', 1971, 'Reino Unido', 'Rock', 'LP', 'VG', 'G+', 42, 1, ['Harbour Lights', 'Salt Engine', 'Undertow', 'Night Ferry', 'Low Tide Boogie']],
    ['Calor de La Isleta', 'Orquesta Tropical Canaria', 'Discos Roque', 'DR-2210', 1976, 'España', 'Latin', 'LP', 'VG+', 'VG', 32, 0, ['Guaguancó isleño', 'Mambo del puerto', 'Bolero de la playa', 'Son de Las Canteras', 'Descarga']],
    ['Vidro azul', 'Celina Prado', 'Odeon Brasil', 'ODB-1188', 1969, 'Brasil', 'Bossa nova', 'LP', 'NM', 'NM', 68, 1, ['Vidro azul', 'Manhã', 'Onda clara', 'Saudade de nada', 'Barquinho de papel']],
    ['Funk de contrabando', 'Los Corsarios del Groove', 'Sello Atlántico', 'SA-455', 1974, 'España', 'Soul y funk', 'LP', 'VG+', 'VG+', 55, 1, ['Contrabando', 'Calle Triana', 'Bajo eléctrico', 'Fiebre de sábado', 'Corsario']],
    ['Transmisión 01', 'Unidad Orbital', 'Kosmos Musik', 'KM-001', 1992, 'Alemania', 'Electrónica', '12"', 'NM', 'VG+', 29, 0, ['Transmisión (original)', 'Transmisión (versión eco)', 'Señal']],
    ['Raíces de piedra', 'Rumbo Sur', 'Discos Roque', 'DR-3002', 1981, 'España', 'Reggae', 'LP', 'VG', 'VG', 22, 0, ['Raíces', 'Piedra y mar', 'Dub del barranco', 'Jah en la azotea', 'Volver']],
    ['Nocturnos para piano', 'Elena Mirabal', 'Deutsche Klassik', 'DK-2531', 1966, 'Alemania', 'Clásica', 'LP', 'NM', 'VG+', 18, 0, ['Nocturno I', 'Nocturno II', 'Nocturno III', 'Nocturno IV', 'Nocturno V']],
    ['Siete pulgadas de verano', 'Las Gaviotas', 'Hispavox Archivo', 'HA-7-114', 1967, 'España', 'Pop español', '7"', 'VG+', 'VG', 12, 0, ['Verano en Maspalomas', 'No te vayas aún']],
    ['Cosmic Lagoon', 'Astral Ensemble', 'Kosmos Musik', 'KM-077', 1977, 'Alemania', 'Electrónica', 'LP', 'VG+', 'VG+', 48, 1, ['Lagoon', 'Drift', 'Phosphor', 'Tidal Clock', 'Afterglow']],
    ['Live at the Cove', 'Bill Ostrander Quartet', 'Blue Harbour Records', 'BH-2LP-3', 1961, 'Estados Unidos', 'Jazz', '2LP', 'VG', 'VG', 64, 0, ['Cove Theme', 'Easy Tide', 'Moonset', 'Ostinato', 'Last Set', 'Cove Theme (reprise)']],
    ['Guitarra del sur', 'Paco Almagro', 'Hispavox Archivo', 'HA-2290', 1972, 'España', 'Flamenco', 'LP', 'NM', 'VG+', 35, 0, ['Alegrías de Cádiz', 'Soleá del sur', 'Bulerías', 'Taranta', 'Rumba del puerto']],
    ['Corazón de vinilo', 'Los Satélites', 'Sello Atlántico', 'SA-610', 1985, 'España', 'Rock', 'LP', 'VG+', 'VG', 26, 0, ['Corazón de vinilo', 'Autopista', 'Radio pirata', 'Satélites', 'Hasta el amanecer']],
    ['Soul from the Islands', 'Marisa Ortega & The Tides', 'Blue Harbour Records', 'BH-58', 1970, 'Reino Unido', 'Soul y funk', 'LP', 'VG', 'G+', 40, 0, ['Island Soul', 'Hold the Tide', 'Calima', 'Sweet Sargasso', 'Homeward']],
    ['Timple eléctrico', 'Benchomo Trío', 'Discos Roque', 'DR-4120', 1989, 'España', 'Folk canario', 'LP', 'NM', 'NM', 30, 0, ['Timple eléctrico', 'Malagueña nueva', 'Seguidillas', 'Tajaraste', 'Isa del siglo']],
    ['Salsa en el puerto', 'Conjunto Cumbre', 'Discos Roque', 'DR-2299', 1979, 'España', 'Latin', 'LP', 'G+', 'G', 15, 0, ['Puerto', 'Sonero mayor', 'La cumbre', 'Pa’ La Isleta', 'Descarga final']],
    ['Minimal Tides', 'Halvorsen', 'Kosmos Musik', 'KM-140', 1998, 'Noruega', 'Electrónica', '12"', 'VG+', 'VG+', 19, 0, ['Minimal Tides', 'Fjord Loop', 'Ebb']],
    ['Canciones para la calima', 'Ana Sosa', 'Discos Roque', 'DR-5003', 1994, 'España', 'Pop español', 'LP', 'NM', 'VG+', 45, 1, ['Calima', 'Arena en el balcón', 'Teror', 'La Laja', 'Postales', 'Sur']],
    ['Brass & Breaks', 'The Harbour Horns', 'Blue Harbour Records', 'BH-12-9', 1973, 'Reino Unido', 'Soul y funk', '7"', 'VG+', 'VG', 14, 0, ['Brass & Breaks', 'Horn Dub']],
    ['Lluvia en Vegueta', 'Cuarteto Atlántico', 'Sello Atlántico', 'SA-118', 1959, 'España', 'Jazz', '10"', 'VG', 'G+', 72, 0, ['Lluvia en Vegueta', 'Santa Ana', 'Calle Mendizábal', 'Balada del Guiniguada']],
    ['Ondas medias', 'Radio Varadero', 'Hispavox Archivo', 'HA-6650', 1988, 'España', 'Rock', 'LP', 'VG+', 'VG+', 21, 0, ['Ondas medias', 'Frecuencia', 'Locutor nocturno', 'Estática', 'Fin de emisión']],
    ['Réquiem atlántico', 'Coro y Orquesta de Las Palmas', 'Deutsche Klassik', 'DK-4410', 1980, 'España', 'Clásica', 'Caja', 'NM', 'NM', 58, 0, ['Introitus', 'Kyrie', 'Sequentia', 'Offertorium', 'Sanctus', 'Agnus Dei', 'Lux aeterna']],
];

$tocadiscos = [
    // titulo, marca, año, precio, destacado, color, descripción
    ['Technics SL-1210MK2', 'Technics', 1995, 420, 1, 'plata', 'Tracción directa, el estándar de los DJ. Revisado: cápsula y aguja nuevas, pitch calibrado, cables RCA cambiados y tapa pulida. Garantía de 1 año.'],
    ['Thorens TD 160', 'Thorens', 1975, 390, 1, 'madera', 'Plato subchasis con brazo TP16. Revisado: correa nueva, suspensión ajustada y aguja de recambio. Garantía de 1 año.'],
    ['Dual CS 505-2', 'Dual', 1985, 180, 0, 'negro', 'Tracción por correa, retorno automático del brazo. Revisado: correa y aguja nuevas, rodamiento lubricado. Garantía de 1 año.'],
    ['Pioneer PL-12D', 'Pioneer', 1972, 150, 0, 'madera', 'Un clásico sencillo y robusto para empezar. Revisado: correa nueva, motor limpio y velocidad ajustada. Garantía de 1 año.'],
    ['Lenco L75', 'Lenco', 1968, 260, 0, 'blanco', 'Rueda loca con plato pesado de 4 kg y velocidad continua. Revisado: rueda intermedia nueva y engrase completo. Garantía de 1 año.'],
];

$accesorios = [
    ['Cepillo antiestático de fibra de carbono', 14, 12, 'Quita el polvo y la estática antes de cada escucha.'],
    ['Fundas interiores antiestáticas (25 uds.)', 9, 40, 'Fundas de papel de arroz para proteger los surcos.'],
    ['Líquido limpiador de discos 250 ml', 12, 20, 'Sin alcohol, para limpieza en húmedo con paño de microfibra.'],
];

$ins = db()->prepare('INSERT INTO productos (slug, tipo, titulo, artista, sello, catalogo, anio, pais, genero, formato, estado_disco, estado_funda, marca, descripcion, tracklist, portada, imagenes, precio, stock, destacado, activo, creado)
                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)');
$existe = db()->prepare('SELECT 1 FROM productos WHERE slug = ?');
$n = 0;
$t = time();
$alta = function (array $f) use ($ins, $existe, &$n, &$t) {
    $existe->execute([$f[0]]);
    if ($existe->fetchColumn()) return;
    $t -= 3600 * 7; // fechas de alta escalonadas para que "recién llegados" tenga orden
    $ins->execute([...$f, gmdate('Y-m-d H:i:s', $t)]);
    $n++;
};

foreach ($discos as $i => [$tit, $art, $sello, $cat, $anio, $pais, $gen, $fmt, $ed, $ef, $precio, $dest, $tracks]) {
    $desc = "Edición original de $anio ($pais). Disco en estado $ed y funda en $ef, revisados a mano con luz y escuchados de principio a fin. Limpieza en húmedo antes de salir a la venta.";
    $alta([slugify("$art $tit"), 'vinilo', $tit, $art, $sello, $cat, $anio, $pais, $gen, $fmt, $ed, $ef, null, $desc,
        json_encode($tracks, JSON_UNESCAPED_UNICODE), json_encode(['familia' => $i % 6, 'semilla' => 1000 + $i * 37]), '[]', $precio * 100, 1, $dest]);
}
foreach ($tocadiscos as $i => [$tit, $marca, $anio, $precio, $dest, $color, $desc]) {
    $alta([slugify($tit), 'tocadiscos', $tit, null, null, null, $anio, null, null, null, null, null, $marca, $desc,
        '[]', json_encode(['familia' => 'tocadiscos', 'color' => $color, 'semilla' => 500 + $i]), '[]', $precio * 100, 1, $dest]);
}
foreach ($accesorios as $i => [$tit, $precio, $stock, $desc]) {
    $alta([slugify($tit), 'accesorio', $tit, null, null, null, null, null, null, null, null, null, null, $desc,
        '[]', json_encode(['familia' => 'accesorio', 'semilla' => 800 + $i]), '[]', $precio * 100, $stock, 0]);
}
echo "$n productos nuevos.\n";

// Cuenta de administración (los datos salen de surco.env, nunca del código)
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
