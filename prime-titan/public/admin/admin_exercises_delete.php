<?php
session_start();
require_once __DIR__ . '/../../app/config/config.php';
require_once __DIR__ . '/../../app/config/database.php';
require_once __DIR__ . '/../../app/models/exercise.php';

if (isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin' && isset($_GET['id'])) {
    $exerciseModel = new Exercise($db);
    $exerciseModel->delete($_GET['id']);
}

header("Location: " . BASE_URL . "admin/admin_exercises.php");
exit;