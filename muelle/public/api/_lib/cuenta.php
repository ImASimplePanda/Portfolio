<?php
// Cuentas de cliente: registro, acceso, salida, pedidos propios y recuperación de contraseña.
declare(strict_types=1);

function sesionActual(): never
{
    responder(['usuario' => usuarioActual(), 'csrf' => $_SESSION['csrf'], 'demo' => esDemo(), 'stripe' => (bool) config('STRIPE_SECRET')]);
}

function registro(): never
{
    $d = entrada();
    $email = mb_strtolower(texto($d, 'email', 190));
    $nombre = texto($d, 'nombre', 120);
    $clave = (string) ($d['clave'] ?? '');
    $e = [];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $e['email'] = 'Escribe un correo válido.';
    if (mb_strlen($nombre) < 2) $e['nombre'] = 'Escribe tu nombre.';
    if (mb_strlen($clave) < 10) $e['clave'] = 'La contraseña necesita al menos 10 caracteres.';
    if (mb_strlen($clave) > 200) $e['clave'] = 'La contraseña es demasiado larga.';
    if ($e) fallo('Revisa los datos marcados.', 422, $e);

    limitar('registro:' . ipCliente(), 10, 3600);
    anotarIntento('registro:' . ipCliente());

    $s = db()->prepare('SELECT 1 FROM usuarios WHERE email = ?');
    $s->execute([$email]);
    if ($s->fetchColumn()) fallo('Ya hay una cuenta con ese correo. Inicia sesión o recupera la contraseña.', 409, ['email' => 'Este correo ya tiene cuenta.']);

    db()->prepare('INSERT INTO usuarios (email, nombre, hash, rol, creado) VALUES (?,?,?,?,?)')
        ->execute([$email, $nombre, password_hash($clave, PASSWORD_DEFAULT), 'cliente', ahora()]);
    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int) db()->lastInsertId();
    responder(['usuario' => usuarioActual()], 201);
}

function entrar(): never
{
    $d = entrada();
    $email = mb_strtolower(texto($d, 'email', 190));
    $clave = (string) ($d['clave'] ?? '');
    $clave = mb_substr($clave, 0, 200);
    $k = 'login:' . ipCliente() . ':' . $email;
    limitar($k, 5, 900);

    $s = db()->prepare('SELECT id, hash FROM usuarios WHERE email = ?');
    $s->execute([$email]);
    $u = $s->fetch();
    // Se verifica siempre un hash para no delatar qué correos existen por el tiempo de respuesta
    $ok = password_verify($clave, $u['hash'] ?? password_hash('sin-cuenta', PASSWORD_DEFAULT));
    if (!$u || !$ok) {
        anotarIntento($k);
        fallo('El correo o la contraseña no son correctos.', 401);
    }
    if (password_needs_rehash($u['hash'], PASSWORD_DEFAULT)) {
        db()->prepare('UPDATE usuarios SET hash = ? WHERE id = ?')->execute([password_hash($clave, PASSWORD_DEFAULT), $u['id']]);
    }
    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int) $u['id'];
    responder(['usuario' => usuarioActual()]);
}

function salir(): never
{
    $_SESSION = [];
    session_regenerate_id(true);
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    responder(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

function misPedidos(): never
{
    $u = exigirUsuario();
    $s = db()->prepare('SELECT * FROM pedidos WHERE usuario_id = ? OR email = ? ORDER BY id DESC LIMIT 100');
    $s->execute([$u['id'], $u['email']]);
    responder(['pedidos' => array_map('pedidoPublico', $s->fetchAll())]);
}

function pedirRecuperacion(): never
{
    $email = mb_strtolower(texto(entrada(), 'email', 190));
    limitar('recuperar:' . ipCliente(), 5, 3600);
    anotarIntento('recuperar:' . ipCliente());
    $s = db()->prepare('SELECT id, nombre FROM usuarios WHERE email = ?');
    $s->execute([$email]);
    if ($u = $s->fetch()) {
        $token = bin2hex(random_bytes(32));
        db()->prepare('DELETE FROM restablecer WHERE usuario_id = ?')->execute([$u['id']]);
        db()->prepare('INSERT INTO restablecer (usuario_id, token_hash, expira) VALUES (?,?,?)')
            ->execute([$u['id'], hash('sha256', $token), gmdate('Y-m-d H:i:s', time() + 3600)]);
        correo($email, 'Cambia tu contraseña de Muelle', "Hola, {$u['nombre']}:\n\nPara elegir una contraseña nueva, abre este enlace (caduca en 1 hora):\n" . urlBase() . "/cuenta/restablecer?token=$token\n\nSi no lo has pedido tú, ignora este correo.");
    }
    // Misma respuesta exista o no la cuenta
    responder(['ok' => true]);
}

function restablecerClave(): never
{
    $d = entrada();
    $token = texto($d, 'token', 100);
    $clave = (string) ($d['clave'] ?? '');
    if (mb_strlen($clave) < 10) fallo('La contraseña necesita al menos 10 caracteres.', 422, ['clave' => 'Mínimo 10 caracteres.']);
    $s = db()->prepare('SELECT usuario_id FROM restablecer WHERE token_hash = ? AND expira > ?');
    $s->execute([hash('sha256', $token), ahora()]);
    $id = $s->fetchColumn();
    if (!$id) fallo('El enlace ha caducado o ya se usó. Pide uno nuevo.', 410);
    db()->prepare('UPDATE usuarios SET hash = ? WHERE id = ?')->execute([password_hash($clave, PASSWORD_DEFAULT), $id]);
    db()->prepare('DELETE FROM restablecer WHERE usuario_id = ?')->execute([$id]);
    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int) $id;
    responder(['usuario' => usuarioActual()]);
}
