<?php
// Crea la base de datos con la cuenta del taller (de laton.env) y unos encargos y citas de ejemplo.
// Uso: php scripts/sembrar.php [--reset]
declare(strict_types=1);

require __DIR__ . '/../public/api/_lib/base.php';
require __DIR__ . '/../public/api/_lib/esquema.php';
require __DIR__ . '/../public/api/_lib/opciones.php';
require __DIR__ . '/../public/api/_lib/citas.php';
require __DIR__ . '/../public/api/_lib/pedidos.php';

// fallo() responde JSON y sale: aquí basta con avisar
if (in_array('--reset', $argv, true)) {
    $f = raizProyecto() . '/datos/laton.sqlite';
    foreach ([$f, "$f-wal", "$f-shm", raizProyecto() . '/datos/.esquema-v1', raizProyecto() . '/datos/correos.log'] as $x) @unlink($x);
}
@mkdir(raizProyecto() . '/datos', 0775, true);
migrar();
touch(raizProyecto() . '/datos/.esquema-v1');

$email = config('ADMIN_EMAIL');
$clave = config('ADMIN_CLAVE');
if (!$email || !$clave || strlen($clave) < 10) exit("Falta ADMIN_EMAIL o ADMIN_CLAVE (mínimo 10 caracteres) en laton.env\n");
db()->prepare('DELETE FROM usuarios WHERE email = ?')->execute([$email]);
db()->prepare('INSERT INTO usuarios (email, nombre, hash, rol, creado) VALUES (?, ?, ?, ?, ?)')
    ->execute([$email, 'Taller Latón', password_hash($clave, PASSWORD_DEFAULT), 'admin', ahora()]);

if ((int) db()->query('SELECT COUNT(*) FROM pedidos')->fetchColumn() > 0) exit("Base de datos lista (ya tenía datos).\n");

// Encargos inventados en distintas etapas, para que el panel no esté vacío
$ejemplos = [
    [['modelo' => 'jable', 'material' => 'acero', 'acabado' => 'jable', 'transmision' => 'grx', 'ruedas' => 'dinamo', 'cinta' => 'miel', 'extras' => ['anclajes', 'portabultos'], 'altura' => 171, 'entrepierna' => 79], 'Carmen Ojeda', 4, 'Ya está montada a falta de la cinta. Pásate el jueves a probarla.'],
    [['modelo' => 'alisio', 'material' => 'titanio', 'acabado' => 'anodizado', 'transmision' => 'ultegra', 'ruedas' => 'carbono', 'cinta' => 'negro', 'extras' => [], 'altura' => 184, 'entrepierna' => 88], 'Iván Santana', 2, null],
    [['modelo' => 'calima', 'material' => 'acero', 'acabado' => 'atlantico', 'transmision' => 'alfine', 'ruedas' => 'dinamo', 'cinta' => 'miel', 'extras' => ['guardabarros', 'sillin'], 'altura' => 163, 'entrepierna' => 75], 'Nayra Medina', 6, null],
    [['modelo' => 'alisio', 'material' => 'acero', 'acabado' => 'visto', 'transmision' => '105', 'ruedas' => 'aluminio', 'cinta' => 'miel', 'extras' => ['guardabarros'], 'altura' => 178, 'entrepierna' => 84], 'Ayoze Quintana', 1, 'Medido el 2 de octubre. Te mandamos el plano para que le des el visto bueno.'],
];
$d = new DateTimeImmutable('-40 days', zona());
foreach ($ejemplos as $i => [$c, $nombre, $etapa, $nota]) {
    $c = normalizarConfiguracion($c);
    $ficha = fichaDe($c);
    $cfg = codigoNuevo('configuraciones', 'LT-');
    $f = $d->modify('+' . ($i * 9) . ' days')->format('Y-m-d H:i:s');
    db()->prepare('INSERT INTO configuraciones (codigo, datos, modelo, precio, creado) VALUES (?, ?, ?, ?, ?)')->execute([$cfg, json_encode($c, JSON_UNESCAPED_UNICODE), $c['modelo'], $ficha['total'], $f]);
    $usuario = strtolower(strtr(explode(' ', $nombre)[0], ['ñ' => 'n', 'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o']));
    db()->prepare('INSERT INTO pedidos (codigo, token, configuracion, datos, nombre, email, telefono, total, senal, plazo, estado, etapa, nota, creado, actualizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        ->execute([codigoNuevo('pedidos', 'PD-'), bin2hex(random_bytes(16)), $cfg, json_encode($ficha, JSON_UNESCAPED_UNICODE), $nombre, "$usuario@ejemplo.test", '600 000 00' . $i,
            $ficha['total'], $ficha['senal'], $ficha['plazo'], 'confirmado', $etapa, $nota, $f, $f]);
}

// Algunas citas en los próximos días
$huecos = huecosOfrecidos();
$fechas = array_keys($huecos);
foreach ([[0, 0, 'Elena Rivero'], [1, 2, 'Jonay Hernández'], [3, 1, 'Marta Déniz'], [6, 0, 'Pablo Afonso']] as [$dia, $h, $nombre]) {
    $fecha = $fechas[$dia];
    $hora = $huecos[$fecha][$h % count($huecos[$fecha])]; // los sábados hay menos horas
    db()->prepare('INSERT INTO citas (codigo, token, fecha, hora, hueco, nombre, email, telefono, configuracion, notas, estado, creado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)')
        ->execute([codigoNuevo('citas', 'CT-'), bin2hex(random_bytes(16)), $fecha, $hora, "$fecha $hora", $nombre, 'cita@ejemplo.test', '600 000 000', null, 'reservada', ahora()]);
}
echo "Base de datos creada con 4 encargos y 4 citas de ejemplo.\n";
