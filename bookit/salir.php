<?php
require __DIR__ . '/inc/boot.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('cuenta');
csrf_check();
$_SESSION = [];
session_regenerate_id(true);
flash('Has salido de tu cuenta.');
redirect('');
