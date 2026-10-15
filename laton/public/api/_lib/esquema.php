<?php
// Crea las tablas si no existen. Mismo esquema para SQLite (local) y MySQL (Hostinger).
declare(strict_types=1);

function migrar(): void
{
    $sqlite = esSqlite();
    $id = $sqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY';
    $ref = $sqlite ? 'INTEGER' : 'INT UNSIGNED';
    $vc = fn(int $n) => $sqlite ? 'TEXT' : "VARCHAR($n)";
    $fin = $sqlite ? '' : ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

    $tablas = [
        "CREATE TABLE IF NOT EXISTS usuarios (
            id $id,
            email {$vc(190)} NOT NULL UNIQUE,
            nombre {$vc(120)} NOT NULL,
            hash {$vc(255)} NOT NULL,
            rol {$vc(10)} NOT NULL DEFAULT 'admin',
            creado {$vc(19)} NOT NULL
        )$fin",
        // Cada bici guardada desde el configurador: se comparte con su código (LT-XXXXXX)
        "CREATE TABLE IF NOT EXISTS configuraciones (
            id $id,
            codigo {$vc(12)} NOT NULL UNIQUE,
            datos TEXT NOT NULL,
            modelo {$vc(20)} NOT NULL,
            precio INT NOT NULL,
            creado {$vc(19)} NOT NULL
        )$fin",
        // Citas para medirse en el taller. 'hueco' (fecha + hora) es único mientras la cita sigue en pie;
        // al cancelarla se vacía y el hueco vuelve a quedar libre.
        "CREATE TABLE IF NOT EXISTS citas (
            id $id,
            codigo {$vc(12)} NOT NULL UNIQUE,
            token {$vc(64)} NOT NULL,
            fecha {$vc(10)} NOT NULL,
            hora {$vc(5)} NOT NULL,
            hueco {$vc(16)} UNIQUE,
            nombre {$vc(120)} NOT NULL,
            email {$vc(190)} NOT NULL,
            telefono {$vc(30)} NOT NULL,
            configuracion {$vc(12)},
            notas TEXT,
            estado {$vc(12)} NOT NULL,
            creado {$vc(19)} NOT NULL
        )$fin",
        // Encargos con señal pagada; 'etapa' es el punto del proceso en que está la bici
        "CREATE TABLE IF NOT EXISTS pedidos (
            id $id,
            codigo {$vc(12)} NOT NULL UNIQUE,
            token {$vc(64)} NOT NULL,
            configuracion {$vc(12)} NOT NULL,
            datos TEXT NOT NULL,
            nombre {$vc(120)} NOT NULL,
            email {$vc(190)} NOT NULL,
            telefono {$vc(30)} NOT NULL,
            total INT NOT NULL,
            senal INT NOT NULL,
            plazo INT NOT NULL,
            estado {$vc(12)} NOT NULL,
            etapa INT NOT NULL DEFAULT 0,
            nota TEXT,
            stripe_sesion {$vc(120)},
            creado {$vc(19)} NOT NULL,
            actualizado {$vc(19)} NOT NULL
        )$fin",
        "CREATE TABLE IF NOT EXISTS intentos (
            id $id,
            clave {$vc(190)} NOT NULL,
            creado {$vc(19)} NOT NULL
        )$fin",
    ];
    foreach ($tablas as $sql) db()->exec($sql);

    $indices = [
        'CREATE INDEX IF NOT EXISTS i_citas_fecha ON citas (fecha)',
        'CREATE INDEX IF NOT EXISTS i_intentos_clave ON intentos (clave, creado)',
        'CREATE INDEX IF NOT EXISTS i_pedidos_estado ON pedidos (estado)',
    ];
    foreach ($indices as $sql) {
        try { db()->exec($sqlite ? $sql : str_replace('IF NOT EXISTS ', '', $sql)); } catch (PDOException) {}
    }
}
