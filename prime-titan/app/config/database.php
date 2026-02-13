<?php
// Configuración de conexión
$host = 'localhost';
$dbname = 'prime_titan_db';
$user = 'primetitan';
$pass = '1234';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
