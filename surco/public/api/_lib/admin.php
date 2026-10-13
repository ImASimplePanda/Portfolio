<?php
// Panel de administración: productos, imágenes, stock y pedidos. Todo exige rol admin y CSRF.
declare(strict_types=1);

const TIPOS = ['vinilo', 'tocadiscos', 'accesorio'];
const FORMATOS = ['LP', '2LP', '7"', '10"', '12"', 'Caja'];

function adminResumen(): never
{
    exigirAdmin();
    $n = fn($sql) => (int) db()->query($sql)->fetchColumn();
    responder([
        'pendientes' => $n("SELECT COUNT(*) FROM pedidos WHERE estado = 'pagado'"),
        'ventas_mes' => $n("SELECT COALESCE(SUM(total),0) FROM pedidos WHERE estado IN ('pagado','enviado','entregado') AND creado >= '" . gmdate('Y-m-01') . "'"),
        'sin_stock' => $n("SELECT COUNT(*) FROM productos WHERE activo = 1 AND stock = 0"),
        'productos' => $n("SELECT COUNT(*) FROM productos WHERE activo = 1"),
    ]);
}

function adminListarProductos(): never
{
    exigirAdmin();
    $q = texto($_GET, 'q', 80);
    $args = [];
    $donde = '1 = 1';
    if ($q !== '') {
        $donde = "(titulo LIKE ? ESCAPE '!' OR artista LIKE ? ESCAPE '!' OR marca LIKE ? ESCAPE '!')";
        $like = '%' . str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $q) . '%';
        $args = [$like, $like, $like];
    }
    $s = db()->prepare("SELECT * FROM productos WHERE $donde ORDER BY id DESC LIMIT 500");
    $s->execute($args);
    responder(['productos' => array_map(fn($p) => productoPublico($p, true) + ['activo' => (bool) $p['activo']], $s->fetchAll())]);
}

function adminVerProducto(int $id): never
{
    exigirAdmin();
    $s = db()->prepare('SELECT * FROM productos WHERE id = ?');
    $s->execute([$id]);
    $p = $s->fetch() ?: fallo('No existe ese producto.', 404);
    responder(['producto' => productoPublico($p, true) + ['activo' => (bool) $p['activo']]]);
}

function validarProducto(array $d): array
{
    $e = [];
    $tipo = in_array($d['tipo'] ?? '', TIPOS, true) ? $d['tipo'] : null;
    if (!$tipo) $e['tipo'] = 'Elige un tipo.';
    $titulo = texto($d, 'titulo', 200);
    if ($titulo === '') $e['titulo'] = 'Escribe el título.';
    $precio = isset($d['precio']) && is_numeric(str_replace(',', '.', (string) $d['precio'])) ? (int) round((float) str_replace(',', '.', (string) $d['precio']) * 100) : -1;
    if ($precio < 0 || $precio > 10000000) $e['precio'] = 'Escribe un precio entre 0 y 100.000 €.';
    $stock = entero($d, 'stock', 0, 9999);
    if ($stock === null) $e['stock'] = 'Escribe el stock (0 o más).';
    $anio = entero($d, 'anio', 1890, (int) date('Y'));
    $grado = fn($k) => isset(GRADOS[$d[$k] ?? '']) ? $d[$k] : null;
    $formato = in_array($d['formato'] ?? '', FORMATOS, true) ? $d['formato'] : null;
    $tracks = array_values(array_filter(array_map(fn($t) => mb_substr(trim((string) $t), 0, 120), is_array($d['tracklist'] ?? null) ? $d['tracklist'] : explode("\n", (string) ($d['tracklist'] ?? ''))), fn($t) => $t !== ''));
    $imgs = array_values(array_filter((array) ($d['imagenes'] ?? []), fn($i) => is_string($i) && preg_match('/^[a-f0-9]{24}$/', $i)));
    if ($e) fallo('Revisa los campos marcados.', 422, $e);
    return [
        'tipo' => $tipo, 'titulo' => $titulo, 'artista' => texto($d, 'artista', 200) ?: null, 'sello' => texto($d, 'sello', 120) ?: null,
        'catalogo' => texto($d, 'catalogo', 60) ?: null, 'anio' => $anio, 'pais' => texto($d, 'pais', 60) ?: null,
        'genero' => texto($d, 'genero', 60) ?: null, 'formato' => $formato, 'estado_disco' => $grado('estado_disco'),
        'estado_funda' => $grado('estado_funda'), 'marca' => texto($d, 'marca', 80) ?: null, 'descripcion' => texto($d, 'descripcion', 4000),
        'tracklist' => json_encode(array_slice($tracks, 0, 60), JSON_UNESCAPED_UNICODE), 'imagenes' => json_encode($imgs),
        'precio' => $precio, 'stock' => $stock, 'destacado' => empty($d['destacado']) ? 0 : 1, 'activo' => isset($d['activo']) && !$d['activo'] ? 0 : 1,
    ];
}

function slugLibre(string $base, ?int $excepto = null): string
{
    $slug = $base;
    for ($i = 2; ; $i++) {
        $s = db()->prepare('SELECT id FROM productos WHERE slug = ?');
        $s->execute([$slug]);
        $id = $s->fetchColumn();
        if (!$id || (int) $id === $excepto) return $slug;
        $slug = "$base-$i";
    }
}

function adminGuardarProducto(?int $id): never
{
    exigirAdmin();
    $v = validarProducto(entrada());
    if ($id === null) {
        $v['slug'] = slugLibre(slugify(trim(($v['artista'] ? $v['artista'] . ' ' : '') . $v['titulo'])));
        $v['portada'] = json_encode(['familia' => random_int(0, 5), 'semilla' => random_int(1, 99999)]);
        $v['creado'] = ahora();
        $cols = array_keys($v);
        db()->prepare('INSERT INTO productos (' . implode(',', $cols) . ') VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')')->execute(array_values($v));
        $id = (int) db()->lastInsertId();
    } else {
        $set = implode(',', array_map(fn($c) => "$c = ?", array_keys($v)));
        $u = db()->prepare("UPDATE productos SET $set WHERE id = ?");
        $u->execute([...array_values($v), $id]);
    }
    adminVerProducto($id);
}

function adminBorrarProducto(int $id): never
{
    exigirAdmin();
    // Si ya se vendió alguna vez, se oculta en vez de borrarse (los pedidos lo siguen nombrando)
    $s = db()->prepare('SELECT COUNT(*) FROM pedido_lineas WHERE producto_id = ?');
    $s->execute([$id]);
    if ((int) $s->fetchColumn() > 0) {
        db()->prepare('UPDATE productos SET activo = 0 WHERE id = ?')->execute([$id]);
        responder(['ok' => true, 'oculto' => true]);
    }
    db()->prepare('DELETE FROM productos WHERE id = ?')->execute([$id]);
    responder(['ok' => true]);
}

// Sube una foto y la convierte a WebP en tres anchos (480, 960 y 1600 px). Nunca se guarda el original.
function adminSubirImagen(): never
{
    exigirAdmin();
    if (!function_exists('imagewebp')) fallo('El servidor no tiene GD con soporte WebP.', 500);
    $f = $_FILES['imagen'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) fallo('No ha llegado ninguna imagen.');
    if ($f['size'] > 12 * 1024 * 1024) fallo('La imagen pesa más de 12 MB.');
    $info = @getimagesize($f['tmp_name']);
    $tipos = [IMAGETYPE_JPEG => 'imagecreatefromjpeg', IMAGETYPE_PNG => 'imagecreatefrompng', IMAGETYPE_WEBP => 'imagecreatefromwebp'];
    if (!$info || !isset($tipos[$info[2]])) fallo('Formato no admitido. Sube JPG, PNG o WebP.');
    if ($info[0] * $info[1] > 40_000_000) fallo('La imagen es demasiado grande (más de 40 megapíxeles).');
    $src = $tipos[$info[2]]($f['tmp_name']);
    if (!$src) fallo('No se ha podido leer la imagen.');
    $id = bin2hex(random_bytes(12));
    $dir = raizPublica() . '/subidas';
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    [$w, $h] = [imagesx($src), imagesy($src)];
    foreach ([480, 960, 1600] as $ancho) {
        $nw = min($ancho, $w);
        $nh = (int) round($h * $nw / $w);
        $dst = imagecreatetruecolor($nw, $nh);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagewebp($dst, "$dir/$id-$ancho.webp", 80);
        imagedestroy($dst);
    }
    imagedestroy($src);
    responder(['imagen' => $id, 'ancho' => $w, 'alto' => $h], 201);
}

function adminListarPedidos(): never
{
    exigirAdmin();
    $estado = in_array($_GET['estado'] ?? '', ESTADOS_PEDIDO, true) ? $_GET['estado'] : null;
    $s = $estado
        ? db()->prepare('SELECT * FROM pedidos WHERE estado = ? ORDER BY id DESC LIMIT 300')
        : db()->prepare('SELECT * FROM pedidos ORDER BY id DESC LIMIT 300');
    $s->execute($estado ? [$estado] : []);
    responder(['pedidos' => array_map('pedidoPublico', $s->fetchAll())]);
}

function adminCambiarEstado(string $codigo): never
{
    exigirAdmin();
    $nuevo = entrada()['estado'] ?? '';
    if (!in_array($nuevo, ['enviado', 'entregado', 'devuelto', 'cancelado'], true)) fallo('Estado no válido.');
    $s = db()->prepare('SELECT id, estado FROM pedidos WHERE codigo = ?');
    $s->execute([$codigo]);
    $p = $s->fetch() ?: fallo('No existe ese pedido.', 404);
    $permitidos = ['pagado' => ['enviado', 'cancelado'], 'enviado' => ['entregado', 'devuelto'], 'entregado' => ['devuelto'], 'pendiente' => ['cancelado']];
    if (!in_array($nuevo, $permitidos[$p['estado']] ?? [], true)) fallo("Un pedido «{$p['estado']}» no puede pasar a «{$nuevo}».", 409);

    $pdo = db();
    $pdo->beginTransaction();
    $pdo->prepare('UPDATE pedidos SET estado = ?, actualizado = ? WHERE id = ?')->execute([$nuevo, ahora(), $p['id']]);
    // Cancelar o devolver repone el stock
    if (in_array($nuevo, ['cancelado', 'devuelto'], true)) {
        $l = $pdo->prepare('SELECT producto_id, cantidad FROM pedido_lineas WHERE pedido_id = ?');
        $l->execute([$p['id']]);
        $r = $pdo->prepare('UPDATE productos SET stock = stock + ? WHERE id = ?');
        foreach ($l->fetchAll() as $x) if ($x['producto_id']) $r->execute([$x['cantidad'], $x['producto_id']]);
    }
    $pdo->commit();
    if ($nuevo === 'enviado') correoEnviado((int) $p['id']);
    $s = db()->prepare('SELECT * FROM pedidos WHERE id = ?');
    $s->execute([$p['id']]);
    responder(['pedido' => pedidoPublico($s->fetch())]);
}

function adminExportarPedidos(): never
{
    exigirAdmin();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="pedidos-surco-' . gmdate('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Código', 'Fecha', 'Estado', 'Pago', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'CP', 'Ciudad', 'Provincia', 'Productos', 'Subtotal', 'Envío', 'Total'], ';');
    foreach (db()->query('SELECT * FROM pedidos ORDER BY id DESC') as $p) {
        $pp = pedidoPublico($p);
        $prods = implode(' | ', array_map(fn($l) => "{$l['cantidad']}× {$l['titulo']}", $pp['lineas']));
        // Evita que una celda empiece por = + - @ y se interprete como fórmula al abrir el CSV
        $seguro = fn($v) => preg_match('/^[=+\-@\t\r]/', (string) $v) ? "'" . $v : $v;
        fputcsv($out, array_map($seguro, [$p['codigo'], $p['creado'], $p['estado'], $p['pago'], $p['nombre'], $p['email'], $p['telefono'], $p['direccion'], $p['cp'], $p['ciudad'], $p['provincia'], $prods,
            number_format($p['subtotal'] / 100, 2, ',', ''), number_format($p['envio'] / 100, 2, ',', ''), number_format($p['total'] / 100, 2, ',', '')]), ';');
    }
    exit;
}
