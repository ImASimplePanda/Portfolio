<?php
// Encargos: el cliente paga una señal (30 %) y sigue desde un enlace privado en qué punto está su bici.
declare(strict_types=1);

const ETAPAS = ['Señal recibida', 'Medición y diseño', 'Corte y soldadura', 'Pintura', 'Montaje', 'Lista para recoger', 'Entregada'];

function crearPedido(): never
{
    $d = entrada();
    $k = 'pedido:' . ipCliente();
    limitar($k, 8, 3600);
    $contacto = validarContacto($d);
    $codigoConfig = texto($d, 'configuracion', 12);
    $c = cargarConfiguracion($codigoConfig);
    if (!$c) fallo('Guarda la configuración antes de encargarla.', 422);
    $ficha = fichaDe(normalizarConfiguracion($c));
    anotarIntento($k);

    $codigo = codigoNuevo('pedidos', 'PD-');
    $token = bin2hex(random_bytes(16));
    $pagoReal = !esDemo() && config('STRIPE_SECRET');
    db()->prepare('INSERT INTO pedidos (codigo, token, configuracion, datos, nombre, email, telefono, total, senal, plazo, estado, etapa, creado, actualizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)')
        ->execute([$codigo, $token, $codigoConfig, json_encode($ficha, JSON_UNESCAPED_UNICODE), $contacto['nombre'], $contacto['email'], $contacto['telefono'],
            $ficha['total'], $ficha['senal'], $ficha['plazo'], $pagoReal ? 'pendiente' : 'confirmado', ahora(), ahora()]);

    if (!$pagoReal) {
        // Sin Stripe (demo): la señal se da por pagada
        correoPedido($codigo);
        responder(['codigo' => $codigo, 'token' => $token, 'simulado' => true], 201);
    }
    $sesion = stripe('POST', 'checkout/sessions', [
        'mode' => 'payment', 'locale' => 'es', 'customer_email' => $contacto['email'],
        'client_reference_id' => $codigo, 'metadata' => ['codigo' => $codigo], 'expires_at' => time() + 1800,
        'success_url' => urlBase() . "/pedido/$codigo?t=$token", 'cancel_url' => urlBase() . "/configurador/$codigoConfig?cancelado=1",
        'line_items' => [['quantity' => 1, 'price_data' => ['currency' => 'eur', 'unit_amount' => $ficha['senal'],
            'product_data' => ['name' => 'Señal de tu bici ' . opcion('modelos', $ficha['configuracion']['modelo'])['nombre'] . " ($codigo)"]]]],
    ]);
    db()->prepare('UPDATE pedidos SET stripe_sesion = ? WHERE codigo = ?')->execute([$sesion['id'], $codigo]);
    responder(['codigo' => $codigo, 'token' => $token, 'url' => $sesion['url']], 201);
}

function pedidoPublico(array $p): array
{
    return [
        'codigo' => $p['codigo'], 'nombre' => $p['nombre'], 'estado' => $p['estado'], 'etapa' => (int) $p['etapa'], 'etapas' => ETAPAS,
        'nota' => $p['nota'], 'total' => (int) $p['total'], 'senal' => (int) $p['senal'], 'plazo' => (int) $p['plazo'],
        'configuracion' => $p['configuracion'], 'ficha' => json_decode($p['datos'], true), 'creado' => $p['creado'], 'actualizado' => $p['actualizado'],
    ];
}

function verPedido(string $codigo): never
{
    $s = db()->prepare('SELECT * FROM pedidos WHERE codigo = ?');
    $s->execute([$codigo]);
    $p = $s->fetch();
    if (!$p || !hash_equals($p['token'], (string) ($_GET['t'] ?? ''))) fallo('No encontramos ese encargo. Revisa el enlace del correo.', 404);
    responder(['pedido' => pedidoPublico($p)]);
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
    $codigo = (string) ($sesion['metadata']['codigo'] ?? '');
    if ($evento['type'] === 'checkout.session.completed' && ($sesion['payment_status'] ?? '') === 'paid') {
        $s = db()->prepare("UPDATE pedidos SET estado = 'confirmado', actualizado = ? WHERE codigo = ? AND estado = 'pendiente'");
        $s->execute([ahora(), $codigo]);
        if ($s->rowCount()) correoPedido($codigo);
    } elseif ($evento['type'] === 'checkout.session.expired') {
        db()->prepare("UPDATE pedidos SET estado = 'caducado', actualizado = ? WHERE codigo = ? AND estado = 'pendiente'")->execute([ahora(), $codigo]);
    }
    responder(['ok' => true]);
}

// ---------- Correos (en modo demo se guardan en datos/correos.log) ----------
function correo(string $para, string $asunto, string $cuerpo): void
{
    $remite = config('MAIL_FROM');
    if (!esDemo() && $remite) {
        $cab = "From: Latón <$remite>\r\nContent-Type: text/plain; charset=utf-8\r\n";
        @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $cab);
        return;
    }
    $dir = raizProyecto() . '/datos';
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    file_put_contents("$dir/correos.log", "---- " . ahora() . "\nPara: $para\nAsunto: $asunto\n\n$cuerpo\n\n", FILE_APPEND);
}

function euros(int $c): string { return number_format($c / 100, 2, ',', '.') . ' €'; }

function datosPedido(string $codigo): array
{
    $s = db()->prepare('SELECT * FROM pedidos WHERE codigo = ?');
    $s->execute([$codigo]);
    return $s->fetch();
}

function correoPedido(string $codigo): void
{
    $p = datosPedido($codigo);
    correo($p['email'], "Encargo $codigo: empezamos tu bici",
        "Hola, {$p['nombre']}:\n\nHemos recibido la señal de " . euros((int) $p['senal']) . " de tu bici (total " . euros((int) $p['total']) . ").\n\nTe llamamos en dos días laborables para cerrar la cita de medición. El plazo de entrega es de unas {$p['plazo']} semanas desde ese día.\n\nSigue cómo va aquí: " . urlBase() . "/pedido/$codigo?t={$p['token']}\n\nLatón");
}

function correoEtapa(string $codigo): void
{
    $p = datosPedido($codigo);
    $etapa = ETAPAS[(int) $p['etapa']];
    correo($p['email'], "Tu bici $codigo: $etapa",
        "Hola, {$p['nombre']}:\n\nTu bici ha pasado a «{$etapa}»." . ($p['nota'] ? "\n\n{$p['nota']}" : '') . "\n\nMira cómo va: " . urlBase() . "/pedido/$codigo?t={$p['token']}\n\nLatón");
}
