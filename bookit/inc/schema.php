<?php
/* Esquema portable MySQL / SQLite. */

function bk_schema(string $driver): array
{
    $pk = $driver === 'mysql' ? 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    $int = $driver === 'mysql' ? 'INT UNSIGNED' : 'INTEGER';
    $tail = $driver === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci' : '';

    return [
        "CREATE TABLE IF NOT EXISTS users (
            id $pk,
            nombre VARCHAR(80) NOT NULL,
            email VARCHAR(190) NOT NULL UNIQUE,
            pass_hash VARCHAR(255) NOT NULL,
            creado VARCHAR(19) NOT NULL
        )$tail",
        "CREATE TABLE IF NOT EXISTS books (
            id $pk,
            slug VARCHAR(120) NOT NULL UNIQUE,
            titulo VARCHAR(200) NOT NULL,
            autor VARCHAR(160) NOT NULL,
            editorial VARCHAR(80) NULL,
            coleccion VARCHAR(20) NOT NULL,
            precio_cent $int NOT NULL,
            formato VARCHAR(40) NOT NULL,
            anio $int NULL,
            sinopsis TEXT NOT NULL,
            stock $int NOT NULL DEFAULT 0,
            salida VARCHAR(10) NULL,
            orden $int NOT NULL DEFAULT 0
        )$tail",
        "CREATE TABLE IF NOT EXISTS carts (
            id $pk,
            token VARCHAR(64) NOT NULL UNIQUE,
            user_id $int NULL,
            creado VARCHAR(19) NOT NULL
        )$tail",
        "CREATE TABLE IF NOT EXISTS cart_items (
            id $pk,
            cart_id $int NOT NULL,
            book_id $int NOT NULL,
            qty $int NOT NULL DEFAULT 1
        )$tail",
        "CREATE TABLE IF NOT EXISTS wishlist (
            id $pk,
            user_id $int NOT NULL,
            book_id $int NOT NULL,
            creado VARCHAR(19) NOT NULL
        )$tail",
        "CREATE TABLE IF NOT EXISTS orders (
            id $pk,
            codigo VARCHAR(12) NOT NULL UNIQUE,
            user_id $int NULL,
            nombre VARCHAR(80) NOT NULL,
            email VARCHAR(190) NOT NULL,
            telefono VARCHAR(30) NOT NULL,
            entrega VARCHAR(12) NOT NULL,
            direccion TEXT NULL,
            total_cent $int NOT NULL,
            estado VARCHAR(20) NOT NULL,
            creado VARCHAR(19) NOT NULL
        )$tail",
        "CREATE TABLE IF NOT EXISTS order_items (
            id $pk,
            order_id $int NOT NULL,
            book_id $int NOT NULL,
            titulo VARCHAR(200) NOT NULL,
            qty $int NOT NULL,
            precio_cent $int NOT NULL,
            tipo VARCHAR(12) NOT NULL
        )$tail",
        "CREATE TABLE IF NOT EXISTS subscribers (
            id $pk,
            email VARCHAR(190) NOT NULL UNIQUE,
            creado VARCHAR(19) NOT NULL
        )$tail",
        "CREATE INDEX idx_cart_items_cart ON cart_items (cart_id)",
        "CREATE INDEX idx_wishlist_user ON wishlist (user_id)",
        "CREATE INDEX idx_orders_user ON orders (user_id)",
    ];
}
