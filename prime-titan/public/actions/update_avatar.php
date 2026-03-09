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

if (!empty($_FILES['avatar']['name'])) {

    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    $maxSize = 2 * 1024 * 1024; // 2MB

    if (!in_array($_FILES['avatar']['type'], $allowedTypes)) {
        die("Formato no permitido");
    }

    if ($_FILES['avatar']['size'] > $maxSize) {
        die("La imagen es demasiado grande");
    }

    $fileName = time() . "_" . basename($_FILES['avatar']['name']);
    $targetPath = __DIR__ . "/../assets/images/" . $fileName;

    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {

        // Actualizar en BD
        $userModel = new User($db);
        $userModel->updateAvatar($userId, $fileName);

        // Actualizar sesión
        $_SESSION['user']['avatar'] = $fileName;
    }
}

header("Location: ../profile.php");
exit;
