<?php
session_start();

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/user.php';

if (isset($_SESSION['user'])) {
    header('Location: index.php');
    exit;
}

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/login.css">';
require_once '../layouts/header.php';

$error = null;
$success = null;

// Registro
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $username  = trim($_POST['username'] ?? '');
    $email     = trim($_POST['email'] ?? '');
    $password  = $_POST['password'] ?? '';
    $password2 = $_POST['password2'] ?? '';

    // Validaciones
    if ($username === '' || $email === '' || $password === '' || $password2 === '') {
        $error = "Todos los campos son obligatorios";

    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "El email no es válido";

    } elseif ($password !== $password2) {
        $error = "Las contraseñas no coinciden";

    } else {

        // Comprobar duplicados 
        // Username
        $stmtUsername = $db->prepare("SELECT id FROM users WHERE username = :u LIMIT 1");
        $stmtUsername->execute([':u' => $username]);
        $userExists = $stmtUsername->fetch();

        // Email
        $stmtEmail = $db->prepare("SELECT id FROM users WHERE email = :e LIMIT 1");
        $stmtEmail->execute([':e' => $email]);
        $emailExists = $stmtEmail->fetch();

        if ($userExists) {
            $error = "El nombre de usuario ya está en uso";
        } elseif ($emailExists) {
            $error = "El email ya está registrado";
        } else {

            // Avatar
            $avatar = "default-avatar.png";

            if (!empty($_FILES['avatar']['name'])) {
                $fileTmp  = $_FILES['avatar']['tmp_name'];
                $fileName = time() . "_" . basename($_FILES['avatar']['name']);
                $uploadPath = $_SERVER['DOCUMENT_ROOT'] . "/prime-titan/public/assets/images/" . $fileName;

                if (move_uploaded_file($fileTmp, $uploadPath)) {
                    $avatar = $fileName;
                }
            }

            // Hash
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Insertar datos
            try {
                $stmt = $db->prepare("
                    INSERT INTO users (username, email, password, avatar, created_at)
                    VALUES (:u, :e, :p, :a, NOW())
                ");

                $stmt->execute([
                    ':u' => $username,
                    ':e' => $email,
                    ':p' => $hashedPassword,
                    ':a' => $avatar
                ]);

                $success = "Cuenta creada correctamente. Ya puedes iniciar sesión.";

            } catch (PDOException $e) {
                $error = "Error al crear la cuenta. Inténtalo de nuevo.";
            }
        }
    }
}
?>

<div class="page-wrapper">

    <div class="register-container">

        <h2 class="register-title">Crear cuenta</h2>

        <?php if ($error): ?>
            <p class="error-msg"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>

        <?php if ($success): ?>
            <p class="success-msg" style="background:#e5ffe5; padding:4%; border-radius:10px; text-align:center;">
                <?= htmlspecialchars($success) ?>
            </p>
        <?php endif; ?>

        <form method="POST" enctype="multipart/form-data" class="login-form">

            <label>Usuario</label>
            <input type="text" name="username" required>

            <label>Email</label>
            <input type="email" name="email" required>

            <label>Contraseña</label>
            <input type="password" name="password" required>

            <label>Repetir contraseña</label>
            <input type="password" name="password2" required>

            <label>Foto de perfil (opcional)</label>
            <input type="file" name="avatar" class="file-input" accept="image/*">

            <button type="submit" class="login-btn">Registrarme</button>
        </form>

        <p class="register-text">
            ¿Ya tienes cuenta?
            <a href="<?= BASE_URL ?>login.php">Inicia sesión</a>
        </p>

    </div>

</div>

<?php require_once '../layouts/footer.php'; ?>
