<?php
// Caja: precios y envío calculados en el servidor, stock reservado en una transacción
// y pago con Stripe Checkout (o pago simulado en modo demo, sin claves de Stripe).
declare(strict_types=1);

const ESTADOS_PEDIDO = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'devuelto'];

// Envío desde el taller de Valencia. La zona la decide el código postal, no el navegador.
function zonaDeCp(string $cp): ?string
{
    if (!preg_match('/^\d{5}$/', $cp)) return null;
    $prov = (int) substr($cp, 0, 2);
    if ($prov < 1 || $prov > 52) return null;
    if ($prov === 35 || $prov === 38) return 'canarias';
    if ($prov === 51 || $prov === 52) return null; // Ceuta y Melilla: de momento no
    if ($prov === 7) return 'baleares';
    return 'peninsula';
}

function costeEnvio(string $zona, int $subtotal): int
{
    return match ($zona) {
        'peninsula' => $subtotal >= 8000 ? 0 : 490,
        'baleares' => $subtotal >= 8000 ? 0 : 790,
        'canarias' => $subtotal >= 15000 ? 0 : 1290,
    };
}

// Devuelve al stock los pedidos de Stripe que nunca se pagaron (la sesión caduca a los 30 min)
function liberarPendientesCaducados(): void
{
    $limite = gmdate('Y-m-d H:i:s', time() - 45 * 60);
    $s = db()->prepare("SELECT id FROM pedidos WHERE estado = 'pendiente' AND creado < ?");
    $s->execute([$limite]);
    foreach ($s->fetchAll(PDO::FETCH_COLUMN) as $id) cancelarPedido((int) $id);
}

// Devuelve al stock lo que reservó un pedido: productos sueltos y las piezas de cada teclado a medida
function reponerStock(PDO $pdo, int $pedidoId): void
{
    $l = $pdo->prepare('SELECT producto_id, detalle, cantidad FROM pedido_lineas WHERE pedido_id = ?');
    $l->execute([$pedidoId]);
    $r = $pdo->prepare('UPDATE productos SET stock = stock + ? WHERE id = ?');
    foreach ($l->fetchAll() as $x) {
        if ($x['producto_id']) { $r->execute([$x['cantidad'], $x['producto_id']]); continue; }
        foreach ((json_decode((string) $x['detalle'], true)['reservas'] ?? []) as [$pid, $n]) $r->execute([$n * $x['cantidad'], $pid]);
    }
}

function cancelarPedido(int $id): void
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $u = $pdo->prepare("UPDATE pedidos SET estado = 'cancelado', actualizado = ? WHERE id = ? AND estado = 'pendiente'");
        $u->execute([ahora(), $id]);
        if ($u->rowCount() === 1) reponerStock($pdo, $id);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// Comprueba la cesta contra la base de datos: precios reales, stock y lo que ya no existe.
// Cada línea es un producto ({id}) o un teclado a medida ({montaje}).
function validarCesta(): never
{
    $lineas = entrada()['lineas'] ?? [];
    if (!is_array($lineas)) fallo('Cesta no válida.');
    $res = [];
    foreach (array_slice($lineas, 0, 50) as $l) {
        if (!is_array($l)) continue;
        $clave = texto($l, 'clave', 120);
        if (isset($l['montaje'])) {
            try {
                $m = evaluarMontaje($l['montaje']);
                $res[] = ['clave' => $clave, 'montaje' => $m['montaje'], 'titulo' => $m['titulo'], 'precio' => $m['total'], 'disponible' => $m['disponible'] ? 3 : 0];
            } catch (RuntimeException $e) {
                $res[] = ['clave' => $clave, 'error' => $e->getMessage(), 'disponible' => 0];
            }
            continue;
        }
        $id = entero($l, 'id', 1, PHP_INT_MAX);
        if (!$id) continue;
        $s = db()->prepare('SELECT * FROM productos WHERE id = ? AND activo = 1');
        $s->execute([$id]);
        $p = $s->fetch();
        $res[] = $p
            ? ['clave' => $clave, 'id' => $id, 'disponible' => (int) $p['stock'], 'producto' => productoPublico($p)]
            : ['clave' => $clave, 'id' => $id, 'disponible' => 0, 'producto' => null];
    }
    responder(['lineas' => $res]);
}

function crearPedido(): never
{
    $d = entrada();
    $errores = [];
    $email = texto($d, 'email', 190);
    $nombre = texto($d, 'nombre', 120);
    $telefono = texto($d, 'telefono', 30);
    $direccion = texto($d, 'direccion', 200);
    $cp = texto($d, 'cp', 10);
    $ciudad = texto($d, 'ciudad', 80);
    $provincia = texto($d, 'provincia', 80);
    $notas = texto($d, 'notas', 500);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errores['email'] = 'Escribe un correo válido.';
    if (mb_strlen($nombre) < 2) $errores['nombre'] = 'Escribe tu nombre y apellidos.';
    if (mb_strlen($direccion) < 5) $errores['direccion'] = 'Escribe la dirección de entrega.';
    $zona = zonaDeCp($cp);
    if (!$zona) $errores['cp'] = 'Código postal no válido. Enviamos a la península, Baleares y Canarias.';
    if ($ciudad === '') $errores['ciudad'] = 'Escribe la ciudad.';
    if ($provincia === '') $errores['provincia'] = 'Escribe la provincia.';
    if (empty($d['acepta'])) $errores['acepta'] = 'Acepta las condiciones de venta para continuar.';

    $lineas = [];
    $montajes = [];
    foreach (array_slice((array) ($d['lineas'] ?? []), 0, 50) as $l) {
        if (!is_array($l)) continue;
        $cant = entero($l, 'cantidad', 1, 10, 1);
        if (isset($l['montaje'])) { $montajes[] = [$l['montaje'], min($cant, 3)]; continue; }
        $id = entero($l, 'id', 1, PHP_INT_MAX);
        if ($id) $lineas[$id] = ($lineas[$id] ?? 0) + $cant;
    }
    if (!$lineas && !$montajes) fallo('La cesta está vacía.');
    if ($errores) fallo('Revisa los datos marcados.', 422, $errores);

    liberarPendientesCaducados();

    $stripe = (bool) config('STRIPE_SECRET');
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $subtotal = 0;
        $filas = [];
        $sel = $pdo->prepare('SELECT * FROM productos WHERE id = ? AND activo = 1');
        // Reserva atómica: solo descuenta si queda stock suficiente (dos compras a la vez no pueden pasar de cero)
        $res = $pdo->prepare('UPDATE productos SET stock = stock - ? WHERE id = ? AND activo = 1 AND stock >= ?');
        foreach ($lineas as $id => $cant) {
            $sel->execute([$id]);
            $p = $sel->fetch();
            if (!$p) throw new RuntimeException('Uno de los productos ya no está a la venta. Revisa la cesta.');
            $res->execute([$cant, $id, $cant]);
            if ($res->rowCount() !== 1) throw new RuntimeException("«{$p['titulo']}» se acaba de vender. Quítalo de la cesta para continuar.");
            $filas[] = [$id, $p['titulo'], null, (int) $p['precio'], $cant];
            $subtotal += (int) $p['precio'] * $cant;
        }
        // Teclados a medida: se reservan sus interruptores y su juego de teclas con la misma regla
        foreach ($montajes as [$datos, $cant]) {
            $m = evaluarMontaje($datos, $pdo);
            foreach ($m['reservas'] as [$pid, $n, $pieza]) {
                $res->execute([$n * $cant, $pid, $n * $cant]);
                if ($res->rowCount() !== 1) throw new RuntimeException("No quedan suficientes «{$pieza}» para tu teclado a medida. Cambia esa pieza en el montador.");
            }
            $filas[] = [null, $m['titulo'], json_encode(['montaje' => $m['montaje'], 'lineas' => $m['lineas'], 'reservas' => $m['reservas']], JSON_UNESCAPED_UNICODE), $m['total'], $cant];
            $subtotal += $m['total'] * $cant;
        }
        $envio = costeEnvio($zona, $subtotal);
        $codigo = 'MU-' . strtoupper(bin2hex(random_bytes(3)));
        $token = bin2hex(random_bytes(24));
        $usuario = usuarioActual();
        $pdo->prepare('INSERT INTO pedidos (codigo, token, usuario_id, email, nombre, telefono, direccion, cp, ciudad, provincia, zona, subtotal, envio, total, estado, pago, notas, creado, actualizado)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
            ->execute([$codigo, $token, $usuario['id'] ?? null, $email, $nombre, $telefono, $direccion, $cp, $ciudad, $provincia, $zona,
                $subtotal, $envio, $subtotal + $envio, $stripe ? 'pendiente' : 'pagado', $stripe ? 'stripe' : 'demo', $notas, ahora(), ahora()]);
        $pedidoId = (int) $pdo->lastInsertId();
        $ins = $pdo->prepare('INSERT INTO pedido_lineas (pedido_id, producto_id, titulo, detalle, precio, cantidad) VALUES (?,?,?,?,?,?)');
        foreach ($filas as $f) $ins->execute([$pedidoId, ...$f]);
        $pdo->commit();
    } catch (RuntimeException $e) {
        $pdo->rollBack();
        fallo($e->getMessage(), 409);
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    if (!$stripe) {
        correoPedido($pedidoId);
        responder(['codigo' => $codigo, 'token' => $token, 'demo' => true]);
    }

    try {
        $sesion = stripeCrearSesion($pedidoId, $codigo, $token, $email, $filas, $envio);
    } catch (Throwable $e) {
        cancelarPedido($pedidoId);
        fallo('No hemos podido conectar con la pasarela de pago. Prueba de nuevo en unos minutos.', 502);
    }
    db()->prepare('UPDATE pedidos SET stripe_sesion = ? WHERE id = ?')->execute([$sesion['id'], $pedidoId]);
    responder(['url' => $sesion['url']]);
}

function verPedido(string $codigo): never
{
    $s = db()->prepare('SELECT * FROM pedidos WHERE codigo = ?');
    $s->execute([$codigo]);
    $p = $s->fetch();
    $u = usuarioActual();
    $token = (string) ($_GET['t'] ?? '');
    $propio = $p && (($token !== '' && hash_equals($p['token'], $token)) || ($u && ((int) $p['usuario_id'] === (int) $u['id'] || $u['rol'] === 'admin')));
    if (!$propio) fallo('No encontramos ese pedido.', 404);
    responder(['pedido' => pedidoPublico($p)]);
}

function pedidoPublico(array $p): array
{
    $l = db()->prepare('SELECT producto_id, titulo, detalle, precio, cantidad FROM pedido_lineas WHERE pedido_id = ?');
    $l->execute([$p['id']]);
    return [
        'codigo' => $p['codigo'], 'estado' => $p['estado'], 'pago' => $p['pago'],
        'email' => $p['email'], 'nombre' => $p['nombre'], 'telefono' => $p['telefono'],
        'direccion' => $p['direccion'], 'cp' => $p['cp'], 'ciudad' => $p['ciudad'], 'provincia' => $p['provincia'], 'zona' => $p['zona'],
        'subtotal' => (int) $p['subtotal'], 'envio' => (int) $p['envio'], 'total' => (int) $p['total'],
        'notas' => $p['notas'], 'creado' => $p['creado'],
        'lineas' => array_map(fn($x) => ['producto_id' => $x['producto_id'] ? (int) $x['producto_id'] : null, 'titulo' => $x['titulo'], 'montaje' => $x['detalle'] ? (json_decode($x['detalle'], true)['montaje'] ?? null) : null, 'precio' => (int) $x['precio'], 'cantidad' => (int) $x['cantidad']], $l->fetchAll()),
    ];
}

// ---------- Stripe (API REST con cURL, sin SDK) ----------
function stripe(string $metodo, string $ruta, array $datos = []): array
{
    $ch = curl_init('https://api.stripe.com/v1/' . $ruta);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => config('STRIPE_SECRET') . ':',
        CURLOPT_CUSTOMREQUEST => $metodo,
        CURLOPT_POSTFIELDS => $metodo === 'GET' ? null : http_build_query($datos),
        CURLOPT_TIMEOUT => 20,
    ]);
    $r = curl_exec($ch);
    $codigo = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $j = json_decode((string) $r, true);
    if ($codigo >= 300 || !is_array($j)) throw new RuntimeException('Stripe: ' . ($j['error']['message'] ?? "HTTP $codigo"));
    return $j;
}

function stripeCrearSesion(int $pedidoId, string $codigo, string $token, string $email, array $filas, int $envio): array
{
    $base = urlBase();
    $datos = [
        'mode' => 'payment',
        'locale' => 'es',
        'customer_email' => $email,
        'client_reference_id' => $codigo,
        'metadata' => ['codigo' => $codigo],
        'expires_at' => time() + 1800,
        'success_url' => "$base/pedido/$codigo?t=$token",
        'cancel_url' => "$base/cesta?cancelado=$codigo",
        'line_items' => [],
    ];
    foreach ($filas as [$id, $titulo, $detalle, $precio, $cant]) {
        $datos['line_items'][] = ['quantity' => $cant, 'price_data' => ['currency' => 'eur', 'unit_amount' => $precio, 'product_data' => ['name' => mb_substr($titulo, 0, 250)]]];
    }
    if ($envio > 0) {
        $datos['line_items'][] = ['quantity' => 1, 'price_data' => ['currency' => 'eur', 'unit_amount' => $envio, 'product_data' => ['name' => 'Envío']]];
    }
    return stripe('POST', 'checkout/sessions', $datos);
}

// Stripe avisa aquí del resultado del pago. Se verifica la firma antes de tocar nada.
function stripeWebhook(): never
{
    $secreto = config('STRIPE_WEBHOOK_SECRET');
    $cuerpo = file_get_contents('php://input') ?: '';
    $firma = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
    if (!$secreto) fallo('Webhook no configurado.', 503);
    $partes = [];
    foreach (explode(',', $firma) as $par) {
        [$k, $v] = array_pad(explode('=', $par, 2), 2, '');
        $partes[$k][] = $v;
    }
    $t = (int) ($partes['t'][0] ?? 0);
    $esperada = hash_hmac('sha256', "$t.$cuerpo", $secreto);
    $valida = abs(time() - $t) < 300 && array_filter($partes['v1'] ?? [], fn($v) => hash_equals($esperada, $v));
    if (!$valida) fallo('Firma no válida.', 400);

    $evento = json_decode($cuerpo, true);
    $sesion = $evento['data']['object'] ?? [];
    $codigo = $sesion['metadata']['codigo'] ?? '';
    $s = db()->prepare('SELECT id, estado FROM pedidos WHERE codigo = ?');
    $s->execute([$codigo]);
    $p = $s->fetch();
    if (!$p) responder(['ok' => true]);

    if ($evento['type'] === 'checkout.session.completed' && ($sesion['payment_status'] ?? '') === 'paid' && $p['estado'] === 'pendiente') {
        db()->prepare("UPDATE pedidos SET estado = 'pagado', actualizado = ? WHERE id = ?")->execute([ahora(), $p['id']]);
        correoPedido((int) $p['id']);
    } elseif ($evento['type'] === 'checkout.session.expired') {
        cancelarPedido((int) $p['id']);
    }
    responder(['ok' => true]);
}

// ---------- Correos (en modo demo se guardan en datos/correos.log) ----------
function correo(string $para, string $asunto, string $cuerpo): void
{
    $remite = config('MAIL_FROM');
    if (!esDemo() && $remite) {
        $cab = "From: Muelle <$remite>\r\nContent-Type: text/plain; charset=utf-8\r\n";
        @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $cab);
        return;
    }
    $log = raizProyecto() . '/datos/correos.log';
    file_put_contents($log, "---- " . ahora() . "\nPara: $para\nAsunto: $asunto\n\n$cuerpo\n\n", FILE_APPEND);
}

function euros(int $c): string { return number_format($c / 100, 2, ',', '.') . ' €'; }

function correoPedido(int $id): void
{
    $s = db()->prepare('SELECT * FROM pedidos WHERE id = ?');
    $s->execute([$id]);
    $p = pedidoPublico($s->fetch());
    $lineas = implode("\n", array_map(fn($l) => "  {$l['cantidad']} × {$l['titulo']}  " . euros($l['precio'] * $l['cantidad']), $p['lineas']));
    correo($p['email'], "Pedido {$p['codigo']} confirmado", "Hola, {$p['nombre']}:\n\nHemos recibido tu pedido {$p['codigo']}.\n\n$lineas\n  Envío: " . euros($p['envio']) . "\n  Total: " . euros($p['total']) . "\n\nLos productos sueltos salen en 24-48 horas laborables. Si has pedido un teclado a medida, lo montamos y probamos en unos 5 días laborables. Te avisamos cuando salga.\n\nMuelle");
}

function correoEnviado(int $id): void
{
    $s = db()->prepare('SELECT * FROM pedidos WHERE id = ?');
    $s->execute([$id]);
    $p = $s->fetch();
    correo($p['email'], "Tu pedido {$p['codigo']} ya va de camino", "Hola, {$p['nombre']}:\n\nTu pedido {$p['codigo']} ha salido hoy del taller.\n\nMuelle");
}
