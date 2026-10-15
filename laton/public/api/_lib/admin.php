<?php
// Sesión del taller y panel: citas, encargos y avance de cada bici.
declare(strict_types=1);

function sesionActual(): never
{
    responder(['usuario' => usuarioActual(), 'csrf' => $_SESSION['csrf'], 'demo' => esDemo(), 'stripe' => (bool) config('STRIPE_SECRET')]);
}

function entrar(): never
{
    $d = entrada();
    $email = mb_strtolower(texto($d, 'email', 190));
    $clave = mb_substr((string) ($d['clave'] ?? ''), 0, 200);
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

function adminResumen(): never
{
    exigirAdmin();
    $hoy = (new DateTimeImmutable('now', zona()))->format('Y-m-d');
    $uno = fn(string $sql, array $p = []) => (function () use ($sql, $p) { $s = db()->prepare($sql); $s->execute($p); return (int) $s->fetchColumn(); })();
    responder([
        'citasProximas' => $uno("SELECT COUNT(*) FROM citas WHERE estado = 'reservada' AND fecha >= ?", [$hoy]),
        'enTaller' => $uno("SELECT COUNT(*) FROM pedidos WHERE estado = 'confirmado' AND etapa < 6"),
        'senales' => $uno("SELECT COALESCE(SUM(senal), 0) FROM pedidos WHERE estado = 'confirmado'"),
        'pendienteCobro' => $uno("SELECT COALESCE(SUM(total - senal), 0) FROM pedidos WHERE estado = 'confirmado' AND etapa < 6"),
        'configuraciones' => $uno('SELECT COUNT(*) FROM configuraciones'),
        'modelos' => db()->query('SELECT modelo, COUNT(*) AS n FROM configuraciones GROUP BY modelo ORDER BY n DESC')->fetchAll(),
    ]);
}

function adminCitas(): never
{
    exigirAdmin();
    $desde = (new DateTimeImmutable('-7 days', zona()))->format('Y-m-d');
    $s = db()->prepare('SELECT codigo, fecha, hora, nombre, email, telefono, configuracion, notas, estado FROM citas WHERE fecha >= ? ORDER BY fecha, hora LIMIT 300');
    $s->execute([$desde]);
    responder(['citas' => $s->fetchAll()]);
}

function adminCambiarCita(string $codigo): never
{
    exigirAdmin();
    $estado = texto(entrada(), 'estado', 12);
    if (!in_array($estado, ['reservada', 'hecha', 'no_vino', 'cancelada'], true)) fallo('Estado no válido.', 422);
    // Al cancelar, el hueco queda libre; si se reactiva y alguien lo ha cogido, no se puede
    try {
        $hueco = $estado === 'cancelada' ? 'NULL' : (esSqlite() ? "fecha || ' ' || hora" : "CONCAT(fecha, ' ', hora)");
        $s = db()->prepare("UPDATE citas SET estado = ?, hueco = $hueco WHERE codigo = ?");
        $s->execute([$estado, $codigo]);
    } catch (PDOException) {
        fallo('Ese hueco ya lo ha cogido otra persona.', 409);
    }
    if (!$s->rowCount()) fallo('No existe esa cita.', 404);
    responder(['ok' => true]);
}

function adminPedidos(): never
{
    exigirAdmin();
    $filas = db()->query('SELECT * FROM pedidos ORDER BY id DESC LIMIT 300')->fetchAll();
    responder(['pedidos' => array_map(fn($p) => pedidoPublico($p) + ['email' => $p['email'], 'telefono' => $p['telefono']], $filas)]);
}

function adminAvanzar(string $codigo): never
{
    exigirAdmin();
    $d = entrada();
    $etapa = entero($d, 'etapa', 0, count(ETAPAS) - 1);
    if ($etapa === null) fallo('Elige una etapa.', 422);
    $s = db()->prepare("SELECT etapa, estado FROM pedidos WHERE codigo = ?");
    $s->execute([$codigo]);
    $p = $s->fetch();
    if (!$p) fallo('No existe ese encargo.', 404);
    if ($p['estado'] !== 'confirmado') fallo('Este encargo no tiene la señal pagada.', 409);
    db()->prepare('UPDATE pedidos SET etapa = ?, nota = ?, actualizado = ? WHERE codigo = ?')->execute([$etapa, texto($d, 'nota', 600) ?: null, ahora(), $codigo]);
    if ($etapa !== (int) $p['etapa']) correoEtapa($codigo);
    responder(['ok' => true]);
}
