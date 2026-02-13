<?php
session_start();

require_once __DIR__ . '/../app/config/config.php';
require_once __DIR__ . '/../app/config/database.php';
require_once __DIR__ . '/../app/models/user.php';

// Si ya está logueado, redirige
if (isset($_SESSION['user'])) {
    header('Location: index.php');
    exit;
}

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/login.css">';


require_once '../app/views/layouts/header.php';

// Inicializar variable de error
$error = null;

// Procesar formulario solo si se envió
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userInput = strtolower(trim($_POST['user'] ?? ''));
    $password  = $_POST['password'] ?? '';

    // Validaciones básicas
    if ($userInput === '' || $password === '') {
        $error = 'Todos los campos son obligatorios';
    } else {
        // Crear instancia del modelo User
        $userModel = new User($db);     

        // Buscar usuario por email o username
        $user = $userModel->findByEmailOrUsername($userInput);


        // Verificar si el usuario existe y contraseña
        if (!$user || !password_verify($password, $user['password'])) {
            $error = 'Credenciales incorrectas';
        } else {
            // Guardar datos del usuario en sesión
            $_SESSION['user'] = [
                'id'         => $user['id'],
                'username'   => $user['username'],
                'email'      => $user['email'],
                'avatar'     => $user['avatar'] ?: 'default-avatar.png',
                'created_at' => $user['created_at'],
                'role'     => $user['role']
            ];

            header('Location: index.php');
            exit;
        }
    }
}
?>

<div class="page-wrapper">

    <div class="login-container">

        <h2 class="login-title">Iniciar sesión</h2>

        <?php if ($error): ?>
            <p class="error-msg"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>

        <form method="POST" class="login-form">
            <label>Correo o usuario</label>
            <input
                type="text"
                name="user"
                value="<?= htmlspecialchars($_POST['user'] ?? '') ?>"
                required
            >

            <label>Contraseña</label>
            <input
                type="password"
                name="password"
                required
            >

            <button type="submit" class="login-btn">
                Iniciar sesión
            </button>
        </form>

        <p class="register-text">
            ¿No tienes cuenta?
            <a href="../app/views/auth/register.php">Regístrate aquí</a>
        </p>

    </div>

</div>
<?php require_once '../app/views/layouts/footer.php'; ?>

