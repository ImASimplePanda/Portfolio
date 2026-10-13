<?php
// Catálogo público: listado con filtros, ficha y facetas.
declare(strict_types=1);

const GRADOS = ['M' => 6, 'NM' => 5, 'VG+' => 4, 'VG' => 3, 'G+' => 2, 'G' => 1];
const ORDENES = [
    'nuevo' => 'creado DESC, id DESC',
    'precio-asc' => 'precio ASC, id DESC',
    'precio-desc' => 'precio DESC, id DESC',
    'anio' => 'anio ASC, id ASC',
];

function productoPublico(array $p, bool $completo = false): array
{
    $base = [
        'id' => (int) $p['id'],
        'slug' => $p['slug'],
        'tipo' => $p['tipo'],
        'titulo' => $p['titulo'],
        'artista' => $p['artista'],
        'anio' => $p['anio'] !== null ? (int) $p['anio'] : null,
        'genero' => $p['genero'],
        'formato' => $p['formato'],
        'estado_disco' => $p['estado_disco'],
        'estado_funda' => $p['estado_funda'],
        'marca' => $p['marca'],
        'precio' => (int) $p['precio'],
        'stock' => (int) $p['stock'],
        'portada' => $p['portada'] ? json_decode($p['portada'], true) : null,
        'imagenes' => $p['imagenes'] ? json_decode($p['imagenes'], true) : [],
        'destacado' => (bool) $p['destacado'],
    ];
    if ($completo) {
        $base += [
            'sello' => $p['sello'],
            'catalogo' => $p['catalogo'],
            'pais' => $p['pais'],
            'descripcion' => $p['descripcion'],
            'tracklist' => $p['tracklist'] ? json_decode($p['tracklist'], true) : [],
        ];
    }
    return $base;
}

function listarProductos(): never
{
    $q = $_GET;
    $donde = ['activo = 1'];
    $args = [];

    $tipo = in_array($q['tipo'] ?? '', ['vinilo', 'tocadiscos', 'accesorio'], true) ? $q['tipo'] : null;
    if ($tipo) { $donde[] = 'tipo = ?'; $args[] = $tipo; }

    $genero = texto($q, 'genero', 60);
    if ($genero !== '') { $donde[] = 'genero = ?'; $args[] = $genero; }

    $formato = texto($q, 'formato', 30);
    if ($formato !== '') { $donde[] = 'formato = ?'; $args[] = $formato; }

    $estado = $q['estado'] ?? '';
    if (isset(GRADOS[$estado])) {
        $validos = array_keys(array_filter(GRADOS, fn($v) => $v >= GRADOS[$estado]));
        $donde[] = 'estado_disco IN (' . implode(',', array_fill(0, count($validos), '?')) . ')';
        array_push($args, ...$validos);
    }

    $decada = entero($q, 'decada', 1900, 2030);
    if ($decada) { $donde[] = 'anio >= ? AND anio < ?'; $args[] = $decada; $args[] = $decada + 10; }

    $max = entero($q, 'max', 0, 1000000);
    if ($max) { $donde[] = 'precio <= ?'; $args[] = $max * 100; }

    if (!empty($q['disponibles'])) $donde[] = 'stock > 0';

    $busca = texto($q, 'q', 80);
    if ($busca !== '') {
        // '!' como carácter de escape: funciona igual en SQLite y en MySQL
        $donde[] = "(titulo LIKE ? ESCAPE '!' OR artista LIKE ? ESCAPE '!' OR sello LIKE ? ESCAPE '!' OR marca LIKE ? ESCAPE '!')";
        $like = '%' . str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $busca) . '%';
        array_push($args, $like, $like, $like, $like);
    }

    if (!empty($q['destacados'])) $donde[] = 'destacado = 1';

    $orden = ORDENES[$q['orden'] ?? 'nuevo'] ?? ORDENES['nuevo'];
    $porPagina = entero($q, 'por', 1, 48, 24);
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
    if (!$p) fallo('Este disco ya no está en la tienda.', 404);

    // Relacionados: mismo género (discos) o mismo tipo, con stock
    $r = db()->prepare('SELECT * FROM productos WHERE activo = 1 AND stock > 0 AND id <> ? AND tipo = ? AND (genero = ? OR ? IS NULL) ORDER BY creado DESC LIMIT 4');
    $r->execute([$p['id'], $p['tipo'], $p['genero'], $p['genero']]);

    responder(['producto' => productoPublico($p, true), 'relacionados' => array_map('productoPublico', $r->fetchAll())]);
}

function facetas(): never
{
    $g = db()->query("SELECT genero, COUNT(*) n FROM productos WHERE activo = 1 AND tipo = 'vinilo' AND genero IS NOT NULL GROUP BY genero ORDER BY n DESC")->fetchAll();
    $f = db()->query("SELECT formato, COUNT(*) n FROM productos WHERE activo = 1 AND tipo = 'vinilo' AND formato IS NOT NULL GROUP BY formato ORDER BY n DESC")->fetchAll();
    $expr = esSqlite() ? 'CAST(anio / 10 AS INTEGER) * 10' : '(anio DIV 10) * 10';
    $d = db()->query("SELECT DISTINCT $expr AS decada FROM productos WHERE activo = 1 AND anio IS NOT NULL ORDER BY decada")->fetchAll(PDO::FETCH_COLUMN);
    responder(['generos' => $g, 'formatos' => $f, 'decadas' => array_map('intval', $d)]);
}
