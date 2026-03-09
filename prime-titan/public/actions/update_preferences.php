<?php
session_start();

require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/user.php';

if (!isset($_SESSION['user'])) {
    header("Location: ../login.php");
    exit;
}

$userId = $_SESSION['user']['id'];

$theme = $_POST['theme'] ?? 'light';
$language = $_POST['language'] ?? 'es';

$userModel = new User($db);
$userModel->updatePreferences($userId, $theme, $language);

// Actualizar sesión
$_SESSION['user']['theme'] = $theme;
$_SESSION['user']['language'] = $language;

header("Location: ../preferences.php");
exit;
