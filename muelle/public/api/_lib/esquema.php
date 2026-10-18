<?php
// Crea las tablas si no existen. Mismo esquema para SQLite (local) y MySQL (Hostinger).
declare(strict_types=1);

function migrar(): void
{
    $sqlite = esSqlite();
    $id = $sqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY';
    $ref = $sqlite ? 'INTEGER' : 'INT UNSIGNED';
    $txt = $sqlite ? 'TEXT' : 'TEXT';
    $vc = fn(int $n) => $sqlite ? 'TEXT' : "VARCHAR($n)";
    $fin = $sqlite ? '' : ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

    $tablas = [
        "CREATE TABLE IF NOT EXISTS productos (
            id $id,
            slug {$vc(160)} NOT NULL UNIQUE,
            tipo {$vc(20)} NOT NULL,
            titulo {$vc(200)} NOT NULL,
            marca {$vc(80)},
            familia {$vc(12)},
            formato {$vc(8)},
            color {$vc(9)},
            resumen {$vc(300)},
            descripcion $txt,
            specs $txt,
            imagenes $txt,
            precio INT NOT NULL,
            stock INT NOT NULL DEFAULT 0,
            destacado INT NOT NULL DEFAULT 0,
            activo INT NOT NULL DEFAULT 1,
            creado {$vc(19)} NOT NULL
        )$fin",
        "CREATE TABLE IF NOT EXISTS usuarios (
            id $id,
            email {$vc(190)} NOT NULL UNIQUE,
            nombre {$vc(120)} NOT NULL,
            hash {$vc(255)} NOT NULL,
            rol {$vc(10)} NOT NULL DEFAULT 'cliente',
            creado {$vc(19)} NOT NULL
        )$fin",
        "CREATE TABLE IF NOT EXISTS pedidos (
            id $id,
            codigo {$vc(20)} NOT NULL UNIQUE,
            token {$vc(64)} NOT NULL,
            usuario_id $ref,
            email {$vc(190)} NOT NULL,
            nombre {$vc(120)} NOT NULL,
            telefono {$vc(30)},
            direccion {$vc(200)} NOT NULL,
            cp {$vc(10)} NOT NULL,
            ciudad {$vc(80)} NOT NULL,
            provincia {$vc(80)} NOT NULL,
            zona {$vc(20)} NOT NULL,
            subtotal INT NOT NULL,
            envio INT NOT NULL,
            total INT NOT NULL,
            estado {$vc(20)} NOT NULL,
            pago {$vc(10)} NOT NULL,
            stripe_sesion {$vc(120)},
            notas $txt,
            creado {$vc(19)} NOT NULL,
            actualizado {$vc(19)} NOT NULL
        )$fin",
        "CREATE TABLE IF NOT EXISTS pedido_lineas (
            id $id,
            pedido_id $ref NOT NULL,
            producto_id $ref,
            titulo {$vc(260)} NOT NULL,
            detalle $txt,
            precio INT NOT NULL,
            cantidad INT NOT NULL
        )$fin",
        "CREATE TABLE IF NOT EXISTS intentos (
            id $id,
            clave {$vc(190)} NOT NULL,
            creado {$vc(19)} NOT NULL
        )$fin",
        "CREATE TABLE IF NOT EXISTS restablecer (
            id $id,
            usuario_id $ref NOT NULL,
            token_hash {$vc(64)} NOT NULL,
            expira {$vc(19)} NOT NULL
        )$fin",
    ];
    foreach ($tablas as $sql) db()->exec($sql);

    $indices = [
        'CREATE INDEX IF NOT EXISTS i_productos_tipo ON productos (tipo, activo)',
        'CREATE INDEX IF NOT EXISTS i_productos_familia ON productos (familia)',
        'CREATE INDEX IF NOT EXISTS i_lineas_pedido ON pedido_lineas (pedido_id)',
        'CREATE INDEX IF NOT EXISTS i_intentos_clave ON intentos (clave, creado)',
        'CREATE INDEX IF NOT EXISTS i_pedidos_usuario ON pedidos (usuario_id)',
    ];
    // MySQL no admite "IF NOT EXISTS" en índices: se ignora el error si ya existe.
    foreach ($indices as $sql) {
        try { db()->exec($sqlite ? $sql : str_replace('IF NOT EXISTS ', '', $sql)); } catch (PDOException) {}
    }
}
