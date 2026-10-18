<?php
// Montajes a medida: las mismas reglas que src/lib/montador.js. El precio que manda el navegador no se usa.
declare(strict_types=1);

function montador(): array
{
    static $m = null;
    return $m ??= json_decode(file_get_contents(__DIR__ . '/montador.json'), true, 32, JSON_THROW_ON_ERROR);
}

function piezaMontador(string $lista, string $id): ?array
{
    foreach (montador()[$lista] as $x) if ($x['id'] === $id) return $x;
    return null;
}

// Valida un montaje que llega del navegador. Devuelve el montaje limpio, sus productos y el precio.
// Lanza RuntimeException con un mensaje para el cliente si algo no existe o no está a la venta.
function evaluarMontaje($d, ?PDO $pdo = null): array
{
    if (!is_array($d)) throw new RuntimeException('El montaje no es válido.');
    $pdo ??= db();
    $f = piezaMontador('formatos', (string) ($d['formato'] ?? ''));
    $carcasa = piezaMontador('carcasas', (string) ($d['carcasa'] ?? ''));
    $placa = piezaMontador('placas', (string) ($d['placa'] ?? ''));
    if (!$f || !$carcasa || !$placa) throw new RuntimeException('El montaje tiene una pieza que no existe. Vuelve a abrir el montador.');
    $color = null;
    foreach ($carcasa['colores'] as $c) if ($c['id'] === ($d['color'] ?? '')) $color = $c;
    if (!$color) throw new RuntimeException('Ese color no existe para esa carcasa.');

    $producto = function ($id, string $tipo) use ($pdo) {
        $s = $pdo->prepare('SELECT * FROM productos WHERE id = ? AND tipo = ? AND activo = 1');
        $s->execute([(int) $id, $tipo]);
        return $s->fetch() ?: null;
    };
    $int = $producto($d['interruptor'] ?? 0, 'interruptores');
    $teclas = $producto($d['teclas'] ?? 0, 'teclas');
    if (!$int) throw new RuntimeException('Elige unos interruptores que estén a la venta.');
    if (!$teclas) throw new RuntimeException('Elige un juego de teclas que esté a la venta.');

    $extras = [];
    foreach ((array) ($d['extras'] ?? []) as $e) if (is_string($e) && piezaMontador('extras', $e)) $extras[$e] = true;
    $extras = array_keys($extras);
    sort($extras);

    $packs = (int) ceil($f['teclas'] / montador()['packInterruptores']);
    $lineas = [
        ["Kit {$f['nombre']} (PCB, estabilizadores y montaje base)", $f['precio']],
        ['Carcasa: ' . mb_strtolower($carcasa['nombre']) . ', ' . mb_strtolower($color['nombre']), $carcasa['precio']],
        ['Placa de ' . mb_strtolower($placa['nombre']), $placa['precio']],
        [($packs * montador()['packInterruptores']) . " interruptores {$int['titulo']}", $packs * (int) $int['precio']],
        ["Juego de teclas {$teclas['titulo']}", (int) $teclas['precio']],
    ];
    foreach ($extras as $id) {
        $e = piezaMontador('extras', $id);
        $lineas[] = [$e['nombre'], isset($e['precioPorTecla']) ? $e['precioPorTecla'] * $f['teclas'] : $e['precio']];
    }
    $lineas[] = ['Montaje y prueba tecla a tecla', montador()['montaje']['precio']];

    return [
        'montaje' => ['formato' => $f['id'], 'carcasa' => $carcasa['id'], 'color' => $color['id'], 'placa' => $placa['id'], 'interruptor' => (int) $int['id'], 'teclas' => (int) $teclas['id'], 'extras' => $extras],
        'titulo' => "Teclado {$f['nombre']} a medida: {$int['titulo']}, {$teclas['titulo']}",
        'lineas' => $lineas,
        'total' => array_sum(array_column($lineas, 1)),
        // Lo que se descuenta del stock al comprar: los packs de interruptores y el juego de teclas
        'reservas' => [[(int) $int['id'], $packs, $int['titulo']], [(int) $teclas['id'], 1, $teclas['titulo']]],
        'disponible' => (int) $int['stock'] >= $packs && (int) $teclas['stock'] >= 1,
    ];
}

// Lo que hace falta para pintar y hacer sonar un montaje: colores de teclas, carcasa, placa e interruptor
function vistaMontaje(array $m): ?array
{
    static $cache = [];
    $clave = json_encode($m);
    if (isset($cache[$clave])) return $cache[$clave];
    $carcasa = piezaMontador('carcasas', (string) ($m['carcasa'] ?? ''));
    if (!$carcasa) return null;
    $hex = $carcasa['colores'][0]['hex'];
    foreach ($carcasa['colores'] as $c) if ($c['id'] === ($m['color'] ?? '')) $hex = $c['hex'];
    $s = db()->prepare('SELECT id, tipo, color, specs FROM productos WHERE id IN (?, ?)');
    $s->execute([(int) ($m['interruptor'] ?? 0), (int) ($m['teclas'] ?? 0)]);
    $int = $tec = null;
    foreach ($s->fetchAll() as $p) { if ($p['tipo'] === 'interruptores') $int = $p; if ($p['tipo'] === 'teclas') $tec = $p; }
    return $cache[$clave] = [
        'formato' => $m['formato'] ?? '65', 'carcasa' => ['hex' => $hex, 'material' => $carcasa['id']], 'placa' => $m['placa'] ?? 'aluminio',
        'colores' => $tec ? (json_decode($tec['specs'], true)['colores'] ?? null) : null,
        'interruptor' => $int['color'] ?? null, 'sonido' => $int ? (json_decode($int['specs'], true)['sonido'] ?? null) : null,
    ];
}

function presupuestoMontaje(): never
{
    try {
        $r = evaluarMontaje(entrada()['montaje'] ?? null);
    } catch (RuntimeException $e) {
        fallo($e->getMessage(), 422);
    }
    unset($r['reservas']);
    responder($r);
}
