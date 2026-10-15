<?php
// Las mismas reglas que src/lib/configuracion.js. Aquí es donde cuentan: el precio que llega del
// navegador no se usa nunca, se calcula de nuevo con estas funciones.
declare(strict_types=1);

function opciones(): array
{
    static $o = null;
    return $o ??= json_decode(file_get_contents(__DIR__ . '/opciones.json'), true, 32, JSON_THROW_ON_ERROR);
}

function opcion(string $lista, string $id): ?array
{
    foreach (opciones()[$lista] as $x) if ($x['id'] === $id) return $x;
    return null;
}

function opcionVale(array $o, array $c): bool
{
    return (!isset($o['modelos']) || in_array($c['modelo'], $o['modelos'], true))
        && (!isset($o['materiales']) || in_array($c['material'], $o['materiales'], true));
}

const LIMITES = ['altura' => [145, 210], 'entrepierna' => [60, 105]];
const INICIAL = ['modelo' => 'alisio', 'material' => 'acero', 'acabado' => 'tabaiba', 'transmision' => '105', 'ruedas' => 'aluminio', 'cinta' => 'miel', 'extras' => [], 'altura' => 176, 'entrepierna' => 83];

// Valida lo que llega del navegador. Los identificadores desconocidos son un error (no se
// "arreglan" en silencio); lo que no encaja con el modelo se cambia igual que en el configurador.
function normalizarConfiguracion($d): array
{
    if (!is_array($d)) fallo('La configuración no es válida.', 422);
    $c = INICIAL;
    foreach (['modelo', 'material', 'acabado', 'transmision', 'ruedas', 'cinta'] as $k) {
        if (isset($d[$k])) {
            if (!is_string($d[$k]) || !preg_match('/^[a-z0-9]{1,20}$/', $d[$k])) fallo("Opción no válida: $k.", 422);
            $c[$k] = $d[$k];
        }
    }
    $listas = ['modelo' => 'modelos', 'material' => 'materiales', 'acabado' => 'acabados', 'transmision' => 'transmisiones', 'ruedas' => 'ruedas', 'cinta' => 'cintas'];
    foreach ($listas as $k => $lista) if (!opcion($lista, $c[$k])) fallo("Opción no válida: $k.", 422);

    foreach (['acabado' => 'acabados', 'transmision' => 'transmisiones', 'ruedas' => 'ruedas', 'cinta' => 'cintas'] as $k => $lista) {
        if (!opcionVale(opcion($lista, $c[$k]), $c)) {
            foreach (opciones()[$lista] as $x) if (opcionVale($x, $c)) { $c[$k] = $x['id']; break; }
        }
    }
    if ($c['material'] === 'titanio' && opcion('acabados', $c['acabado'])['tipo'] !== 'titanio') $c['acabado'] = 'cepillado';

    $extras = [];
    foreach ((is_array($d['extras'] ?? null) ? $d['extras'] : []) as $id) {
        if (!is_string($id)) continue;
        $e = opcion('extras', $id);
        if ($e && opcionVale($e, $c)) $extras[$id] = true;
    }
    $c['extras'] = array_keys($extras);
    sort($c['extras']);

    foreach (LIMITES as $k => [$min, $max]) {
        $v = $d[$k] ?? $c[$k];
        if (!is_numeric($v)) fallo("Escribe tu $k en centímetros.", 422);
        $c[$k] = max($min, min($max, (int) round((float) $v)));
    }
    return $c;
}

function tallaDe(array $c): array
{
    $g = opcion('modelos', $c['modelo'])['geometria'];
    $ha = deg2rad($g['anguloDireccion']);
    $tuboSillin = (int) round($c['entrepierna'] * 6.5);
    $reach = (int) round(383 + ($c['altura'] - 178) * 1.9 + $g['reachExtra']);
    $bajo = $g['caidaPedalier'] + $g['horquilla'] * sin($ha) - $g['avance'] * cos($ha) + 15;
    $stack = max((int) round(565 + ($c['altura'] - 178) * 2.2 + ($c['entrepierna'] - 84) * 1.6 + $g['stackExtra']), (int) round($bajo + 95 * sin($ha)));
    return [
        'tuboSillin' => $tuboSillin, 'reach' => $reach, 'stack' => $stack,
        'tuboDireccion' => (int) round(($stack - $bajo) / sin($ha)),
        'alturaSillin' => (int) round($c['entrepierna'] * 8.83),
        'potencia' => min(130, max(70, (int) round((100 + ($c['altura'] - 178) * 0.8) / 10) * 10)),
        'nombre' => (string) round($tuboSillin / 10),
    ];
}

function precioDe(array $c): array
{
    $m = opcion('modelos', $c['modelo']);
    $a = opcion('acabados', $c['acabado']);
    $t = opcion('transmisiones', $c['transmision']);
    $r = opcion('ruedas', $c['ruedas']);
    $lineas = [["Cuadro {$m['nombre']} de {$c['material']} a tu medida", $m['cuadro'][$c['material']]], [$a['nombre'], $a['precio']], [$t['nombre'], $t['precio']], [$r['nombre'], $r['precio']]];
    foreach ($c['extras'] as $id) { $e = opcion('extras', $id); $lineas[] = [$e['nombre'], $e['precio']]; }
    return ['lineas' => $lineas, 'total' => array_sum(array_column($lineas, 1))];
}

function plazoDe(array $c): int
{
    $a = opcion('acabados', $c['acabado']);
    return opcion('materiales', $c['material'])['plazo'] + (($a['tipo'] === 'metal' || $a['id'] === 'anodizado') ? 1 : 0);
}

function pesoDe(array $c): float
{
    $kg = opcion('modelos', $c['modelo'])['peso'][$c['material']] + ($c['material'] === 'acero' ? 0.6 : 0.5)
        + opcion('transmisiones', $c['transmision'])['peso'] + opcion('ruedas', $c['ruedas'])['peso'] + 1.6;
    foreach ($c['extras'] as $id) $kg += opcion('extras', $id)['peso'];
    return round($kg, 1);
}

function senalDe(int $total): int { return (int) (round($total * opciones()['senal'] / 100) * 100); }

// Resumen completo de una configuración, tal como lo ve el cliente
function fichaDe(array $c): array
{
    $p = precioDe($c);
    return ['configuracion' => $c, 'talla' => tallaDe($c), 'lineas' => $p['lineas'], 'total' => $p['total'], 'senal' => senalDe($p['total']), 'plazo' => plazoDe($c), 'peso' => pesoDe($c)];
}

function codigoNuevo(string $tabla, string $prefijo): string
{
    $alfabeto = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // sin 0/O ni 1/I/L: se dictan por teléfono sin errores
    do {
        $c = $prefijo;
        for ($i = 0; $i < 6; $i++) $c .= $alfabeto[random_int(0, strlen($alfabeto) - 1)];
        $s = db()->prepare("SELECT 1 FROM $tabla WHERE codigo = ?");
        $s->execute([$c]);
    } while ($s->fetchColumn());
    return $c;
}

// ---------- Configuraciones guardadas ----------
function guardarConfiguracion(): never
{
    $k = 'guardar:' . ipCliente();
    limitar($k, 40, 3600);
    $c = normalizarConfiguracion(entrada()['configuracion'] ?? null);
    $json = json_encode($c, JSON_UNESCAPED_UNICODE);
    // La misma bici guardada dos veces conserva el mismo código
    $s = db()->prepare('SELECT codigo FROM configuraciones WHERE datos = ?');
    $s->execute([$json]);
    if ($codigo = $s->fetchColumn()) responder(['codigo' => $codigo] + fichaDe($c));
    anotarIntento($k);
    $codigo = codigoNuevo('configuraciones', 'LT-');
    db()->prepare('INSERT INTO configuraciones (codigo, datos, modelo, precio, creado) VALUES (?, ?, ?, ?, ?)')
        ->execute([$codigo, $json, $c['modelo'], precioDe($c)['total'], ahora()]);
    responder(['codigo' => $codigo] + fichaDe($c), 201);
}

function cargarConfiguracion(string $codigo): ?array
{
    $s = db()->prepare('SELECT datos FROM configuraciones WHERE codigo = ?');
    $s->execute([$codigo]);
    $d = $s->fetchColumn();
    return $d ? json_decode($d, true) : null;
}

function verConfiguracion(string $codigo): never
{
    $c = cargarConfiguracion($codigo);
    if (!$c) fallo('No hay ninguna bici guardada con ese código.', 404);
    // Si los precios han cambiado desde que se guardó, se muestra el precio de hoy
    responder(['codigo' => $codigo] + fichaDe(normalizarConfiguracion($c)));
}
