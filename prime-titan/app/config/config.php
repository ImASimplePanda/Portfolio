<?php
define('BASE_URL', '/Portfolio/prime-titan/public/');
define('BASE_DIR', __DIR__ . '/..'); 

define('ROOT_DIR', dirname(__DIR__, 2));

$lang = $_SESSION['user']['language'] ?? 'es';
$translations = require __DIR__ . "/../lang/$lang.php";

function __t($key) {
    global $translations;
    return $translations[$key] ?? $key;
}

function renderIcon($iconName) {
    // Calculamos la ruta absoluta
    $path = ROOT_DIR . '/public/assets/icons/' . $iconName;
    
    // Verificamos si existe
    if (file_exists($path)) {
        include $path;
    } else {
        // Esto se verá en tu web si falla, así sabrás qué está pasando
        echo "<span style='color:red; font-size:10px;'>[No encontrado: $path]</span>";
    }
}