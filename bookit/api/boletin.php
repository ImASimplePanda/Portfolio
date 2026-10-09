<?php
require __DIR__ . '/../inc/boot.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
csrf_check();

$email = trim((string) ($_POST['email'] ?? ''));
$ok = filter_var($email, FILTER_VALIDATE_EMAIL) && mb_strlen($email) <= 190;

if (!$ok) {
    $err = $email === '' ? 'escribe tu correo.' : 'a ese correo le falta algo (por ejemplo, la @).';
    if (is_ajax()) json_out(['ok' => false, 'error' => $err], 422);
    flash('Revisa: ' . $err, 'error');
    redirect('');
}

$st = db()->prepare('SELECT id FROM subscribers WHERE email = ?');
$st->execute([mb_strtolower($email)]);
if (!$st->fetchColumn()) {
    db()->prepare('INSERT INTO subscribers (email, creado) VALUES (?,?)')->execute([mb_strtolower($email), now()]);
}
$msg = 'Apuntado. El próximo correo de novedades llegará a ' . $email . '.';
if (is_ajax()) json_out(['ok' => true, 'msg' => $msg]);
flash($msg);
redirect('');
