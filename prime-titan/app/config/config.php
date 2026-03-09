<?php
define('BASE_URL', '/Portfolio/prime-titan/public/');
define('BASE_DIR', __DIR__ . '/..'); 

$lang = $_SESSION['user']['language'] ?? 'es';
$translations = require __DIR__ . "/../lang/$lang.php";

function __t($key) {
    global $translations;
    return $translations[$key] ?? $key;
}

