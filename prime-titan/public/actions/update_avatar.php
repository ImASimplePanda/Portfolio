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

    $fileName = time() . "_" . basename($_FILES['avatar']['name']);
    $targetPath = __DIR__ . "/../../assets/images/" . $fileName;

    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {

        $userModel = new User($db);
        $userModel->updateAvatar($userId, $fileName);

        $_SESSION['user']['avatar'] = $fileName;
    }
}

header("Location: ../profile.php");
exit;
