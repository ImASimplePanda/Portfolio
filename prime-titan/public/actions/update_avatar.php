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

// Verificar si se subió un archivo
if (!empty($_FILES['avatar']['name'])) {

    // Nombre único
    $fileName = time() . "_" . basename($_FILES['avatar']['name']);

    // Ruta donde se guardará la imagen
    $targetPath = __DIR__ . "/../../assets/images/" . $fileName;

    // Mover archivo
    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {

        // Actualizar en la base de datos
        $userModel = new User($db);
        $userModel->updateAvatar($userId, $fileName);

        // Actualizar en sesión
        $_SESSION['user']['avatar'] = $fileName;
    }
}

// Volver al perfil
header("Location: ../profile.php");
exit;
