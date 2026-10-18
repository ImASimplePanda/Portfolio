<?php
// Catálogo público: listado con filtros, ficha y facetas.
declare(strict_types=1);

const TIPOS = ['teclado', 'interruptores', 'teclas', 'accesorio'];
const FAMILIAS = ['lineal', 'tactil', 'clicky'];
const FORMATOS_PRODUCTO = ['60', '65', '75', 'tkl'];
const ORDENES = [
    'destacados' => 'destacado DESC, creado DESC, id DESC',
    'nuevo' => 'creado DESC, id DESC',
    'precio-asc' => 'precio ASC, id DESC',
    'precio-desc' => 'precio DESC, id DESC',
];

// Designador de la pieza, como en la serigrafía de una placa: fijo para cada producto y contado
// por prefijo (SW interruptores, K teclas, U teclados, J accesorios) según su orden de alta.
function designador(int $id, string $tipo): string
{
    static $mapa = null;
    if ($mapa === null) {
        $mapa = [];
        $cuenta = [];
        foreach (db()->query('SELECT id, tipo FROM productos ORDER BY id')->fetchAll() as $f) {
            $cuenta[$f['tipo']] = ($cuenta[$f['tipo']] ?? 0) + 1;
            $mapa[(int) $f['id']] = $cuenta[$f['tipo']];
        }
    }
    $prefijo = ['interruptores' => 'SW', 'teclas' => 'K', 'teclado' => 'U', 'accesorio' => 'J'][$tipo] ?? 'X';
    return $prefijo . ($mapa[$id] ?? '?');
}

function productoPublico(array $p, bool $completo = false): array
{
    $base = [
        'id' => (int) $p['id'],
        'slug' => $p['slug'],
        'tipo' => $p['tipo'],
        'titulo' => $p['titulo'],
        'marca' => $p['marca'],
        'familia' => $p['familia'],
        'formato' => $p['formato'],
        'color' => $p['color'],
        'resumen' => $p['resumen'],
        'precio' => (int) $p['precio'],
        'stock' => (int) $p['stock'],
        'specs' => $p['specs'] ? json_decode($p['specs'], true) : new stdClass(),
        'imagenes' => $p['imagenes'] ? json_decode($p['imagenes'], true) : [],
        'destacado' => (bool) $p['destacado'],
        'designador' => designador((int) $p['id'], $p['tipo']),
    ];
    if ($p['tipo'] === 'teclado' && is_array($base['specs']) && isset($base['specs']['montaje'])) $base['vista'] = vistaMontaje($base['specs']['montaje']);
    if ($completo) $base['descripcion'] = $p['descripcion'];
    return $base;
}

function listarProductos(): never
{
    $q = $_GET;
    $donde = ['activo = 1'];
    $args = [];

    $tipo = in_array($q['tipo'] ?? '', TIPOS, true) ? $q['tipo'] : null;
    if ($tipo) { $donde[] = 'tipo = ?'; $args[] = $tipo; }

    $familia = in_array($q['familia'] ?? '', FAMILIAS, true) ? $q['familia'] : null;
    if ($familia) { $donde[] = 'familia = ?'; $args[] = $familia; }

    $formato = in_array($q['formato'] ?? '', FORMATOS_PRODUCTO, true) ? $q['formato'] : null;
    if ($formato) { $donde[] = 'formato = ?'; $args[] = $formato; }

    $max = entero($q, 'max', 0, 100000);
    if ($max) { $donde[] = 'precio <= ?'; $args[] = $max * 100; }

    if (!empty($q['disponibles'])) $donde[] = 'stock > 0';
    if (!empty($q['destacados'])) $donde[] = 'destacado = 1';

    $busca = texto($q, 'q', 80);
    if ($busca !== '') {
        // '!' como carácter de escape: funciona igual en SQLite y en MySQL
        $donde[] = "(titulo LIKE ? ESCAPE '!' OR marca LIKE ? ESCAPE '!' OR resumen LIKE ? ESCAPE '!')";
        $like = '%' . str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $busca) . '%';
        array_push($args, $like, $like, $like);
    }

    $orden = ORDENES[$q['orden'] ?? 'destacados'] ?? ORDENES['destacados'];
    $porPagina = entero($q, 'por', 1, 60, 24);
    $pagina = entero($q, 'pagina', 1, 1000, 1);
    $where = implode(' AND ', $donde);

    $c = db()->prepare("SELECT COUNT(*) FROM productos WHERE $where");
    $c->execute($args);
    $total = (int) $c->fetchColumn();

    $s = db()->prepare("SELECT * FROM productos WHERE $where ORDER BY $orden LIMIT $porPagina OFFSET " . (($pagina - 1) * $porPagina));
    $s->execute($args);

    responder([
        'productos' => array_map('productoPublico', $s->fetchAll()),
        'total' => $total,
        'pagina' => $pagina,
        'paginas' => max(1, (int) ceil($total / $porPagina)),
    ]);
}

function verProducto(string $slug): never
{
    $s = db()->prepare('SELECT * FROM productos WHERE slug = ? AND activo = 1');
    $s->execute([$slug]);
    $p = $s->fetch();
    if (!$p) fallo('Este producto ya no está en la tienda.', 404);
    $r = db()->prepare('SELECT * FROM productos WHERE activo = 1 AND stock > 0 AND id <> ? AND tipo = ? ORDER BY destacado DESC, creado DESC LIMIT 4');
    $r->execute([$p['id'], $p['tipo']]);
    responder(['producto' => productoPublico($p, true), 'relacionados' => array_map('productoPublico', $r->fetchAll())]);
}

// Lo que necesita el montador: interruptores y juegos de teclas a la venta
function piezasMontador(): never
{
    $s = db()->query("SELECT * FROM productos WHERE activo = 1 AND tipo IN ('interruptores', 'teclas') ORDER BY destacado DESC, precio ASC");
    $i = $t = [];
    foreach ($s->fetchAll() as $p) {
        if ($p['tipo'] === 'interruptores') $i[] = productoPublico($p); else $t[] = productoPublico($p);
    }
    responder(['interruptores' => $i, 'teclas' => $t]);
}
