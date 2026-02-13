<?php
session_start();
require_once '../../app/config/config.php';
require_once '../../app/config/database.php';
require_once '../../app/models/user.php';

// Solo admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('Location: ' . BASE_URL . 'index.php');
    exit;
}

// Cargar vista
require_once '../../app/views/admin/users.php';
