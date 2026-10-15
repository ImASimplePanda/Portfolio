<?php
// Citas para medirse en el taller (hora y media). De martes a sábado, hasta cuatro semanas vista.
declare(strict_types=1);

const HORARIO = [
    2 => ['10:00', '12:00', '17:00', '18:30'],
    3 => ['10:00', '12:00', '17:00', '18:30'],
    4 => ['10:00', '12:00', '17:00', '18:30'],
    5 => ['10:00', '12:00', '17:00', '18:30'],
    6 => ['10:00', '12:00'],
];
const DIAS_VISTA = 28;

function zona(): DateTimeZone { return new DateTimeZone('Atlantic/Canary'); }

// Huecos ofrecidos: desde mañana hasta DIAS_VISTA días
function huecosOfrecidos(): array
{
    $dias = [];
    $d = new DateTimeImmutable('tomorrow', zona());
    for ($i = 0; $i < DIAS_VISTA; $i++, $d = $d->modify('+1 day')) {
        $horas = HORARIO[(int) $d->format('N')] ?? [];
        if ($horas) $dias[$d->format('Y-m-d')] = $horas;
    }
    return $dias;
}

function verHuecos(): never
{
    $ofrecidos = huecosOfrecidos();
    $s = db()->prepare('SELECT hueco FROM citas WHERE hueco IS NOT NULL AND fecha >= ?');
    $s->execute([array_key_first($ofrecidos)]);
    $ocupados = array_flip($s->fetchAll(PDO::FETCH_COLUMN));
    $dias = [];
    foreach ($ofrecidos as $fecha => $horas) {
        $dias[] = ['fecha' => $fecha, 'horas' => array_map(fn($h) => ['hora' => $h, 'libre' => !isset($ocupados["$fecha $h"])], $horas)];
    }
    responder(['dias' => $dias, 'precio' => opciones()['medicion']['precio']]);
}

function validarContacto(array $d): array
{
    $c = ['nombre' => texto($d, 'nombre', 120), 'email' => mb_strtolower(texto($d, 'email', 190)), 'telefono' => texto($d, 'telefono', 30)];
    $e = [];
    if (mb_strlen($c['nombre']) < 2) $e['nombre'] = 'Escribe tu nombre.';
    if (!filter_var($c['email'], FILTER_VALIDATE_EMAIL)) $e['email'] = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    if (!preg_match('/^\+?[0-9 ]{9,20}$/', $c['telefono'])) $e['telefono'] = 'Escribe un teléfono de 9 cifras como mínimo.';
    if (empty($d['acepto'])) $e['acepto'] = 'Necesitamos que aceptes la política de privacidad para guardar tus datos.';
    if ($e) fallo('Revisa los datos marcados.', 422, $e);
    return $c;
}

function reservarCita(): never
{
    $d = entrada();
    $k = 'cita:' . ipCliente();
    limitar($k, 6, 3600);
    $contacto = validarContacto($d);
    $fecha = texto($d, 'fecha', 10);
    $hora = texto($d, 'hora', 5);
    if (!in_array($hora, huecosOfrecidos()[$fecha] ?? [], true)) fallo('Ese hueco ya no está disponible. Elige otro.', 409);
    $config = texto($d, 'configuracion', 12);
    if ($config !== '' && !cargarConfiguracion($config)) $config = '';

    anotarIntento($k);
    $codigo = codigoNuevo('citas', 'CT-');
    $token = bin2hex(random_bytes(16));
    try {
        db()->prepare('INSERT INTO citas (codigo, token, fecha, hora, hueco, nombre, email, telefono, configuracion, notas, estado, creado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([$codigo, $token, $fecha, $hora, "$fecha $hora", $contacto['nombre'], $contacto['email'], $contacto['telefono'], $config ?: null, texto($d, 'notas', 1000), 'reservada', ahora()]);
    } catch (PDOException $e) {
        // Dos personas pidieron el mismo hueco a la vez: el índice único deja pasar solo a una
        if (str_contains(strtolower($e->getMessage()), 'unique') || $e->getCode() === '23000') fallo('Alguien acaba de reservar ese hueco. Elige otro.', 409);
        throw $e;
    }
    correo($contacto['email'], 'Cita en Latón: ' . fechaLarga($fecha) . " a las $hora",
        "Hola, {$contacto['nombre']}:\n\nTe esperamos el " . fechaLarga($fecha) . " a las $hora en el taller (Carretera del Centro, 00, Tafira Alta).\n\nTrae la ropa y las zapatillas con las que montas, y tu bici actual si tienes una. La medición dura hora y media.\n\nSi no puedes venir, cancela aquí: " . urlBase() . "/cita/$codigo?t=$token\n\nLatón");
    responder(['codigo' => $codigo, 'token' => $token], 201);
}

function citaPublica(array $c): array
{
    return ['codigo' => $c['codigo'], 'fecha' => $c['fecha'], 'hora' => $c['hora'], 'nombre' => $c['nombre'], 'estado' => $c['estado'], 'configuracion' => $c['configuracion']];
}

function buscarCita(string $codigo, string $token): array
{
    $s = db()->prepare('SELECT * FROM citas WHERE codigo = ?');
    $s->execute([$codigo]);
    $c = $s->fetch();
    if (!$c || !hash_equals($c['token'], $token)) fallo('No encontramos esa cita. Revisa el enlace del correo.', 404);
    return $c;
}

function verCita(string $codigo): never
{
    responder(['cita' => citaPublica(buscarCita($codigo, (string) ($_GET['t'] ?? '')))]);
}

function cancelarCita(string $codigo): never
{
    $c = buscarCita($codigo, texto(entrada(), 't', 64));
    if ($c['estado'] !== 'reservada') fallo('Esta cita ya no se puede cancelar.', 409);
    db()->prepare("UPDATE citas SET estado = 'cancelada', hueco = NULL WHERE id = ?")->execute([$c['id']]);
    $c['estado'] = 'cancelada';
    responder(['cita' => citaPublica($c)]);
}

function fechaLarga(string $fecha): string
{
    $d = new DateTimeImmutable($fecha, zona());
    $dias = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    $meses = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return $dias[(int) $d->format('N')] . ' ' . (int) $d->format('j') . ' de ' . $meses[(int) $d->format('n')];
}
