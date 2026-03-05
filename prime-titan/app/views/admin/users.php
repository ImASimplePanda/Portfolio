<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/user.php';

// Acceso solo para admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('Location: ' . BASE_URL . 'index.php');
    exit;
}

$userModel = new User($db);
$error = null;
$success = null;

// Eliminar usuario
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_user_id'])) {

    $deleteId = intval($_POST['delete_user_id']);

    // Evitar que el admin se elimine a sí mismo
    if ($deleteId == $_SESSION['user']['id']) {
        $error = "No puedes eliminar tu propio usuario.";
    } else {
        try {
            $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $deleteId]);
            $success = "Usuario eliminado correctamente.";
        } catch (PDOException $e) {
            $error = "Error al eliminar el usuario.";
        }
    }
}

// Actualizar usuario
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_user_id'])) {
    $id       = intval($_POST['edit_user_id']);
    $username = trim($_POST['username']);
    $email    = trim($_POST['email']);
    $password = $_POST['password'];
    $role     = $_POST['role'];

    if ($username === '' || $email === '' || !in_array($role, ['user','admin'])) {
        $error = "Datos inválidos.";
    } else {
        try {
            if (!empty($password)) {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $db->prepare("
                    UPDATE users
                    SET username = :u, email = :e, password = :p, role = :r
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':u' => $username,
                    ':e' => $email,
                    ':p' => $hashedPassword,
                    ':r' => $role,
                    ':id' => $id
                ]);
            } else {
                $stmt = $db->prepare("
                    UPDATE users
                    SET username = :u, email = :e, role = :r
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':u' => $username,
                    ':e' => $email,
                    ':r' => $role,
                    ':id' => $id
                ]);
            }

            $success = "Usuario actualizado correctamente.";
        } catch (PDOException $e) {
            $error = "Error al actualizar el usuario. Verifica que el nombre y el email sean únicos.";
        }
    }
}

// Obtener todos los usuarios
$stmt = $db->query("SELECT id, username, email, role FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

$extra_css = '<link rel="stylesheet" href="' . BASE_URL . 'assets/css/users.css">';
require_once BASE_DIR . '/views/layouts/header.php';
?>

<div class="page-wrapper">

    <div class="content-box">

        <h2 class="admin-title">Administrar Usuarios</h2>

        <?php if ($error): ?>
            <p class="error-msg"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>

        <?php if ($success): ?>
            <p class="success-msg"><?= htmlspecialchars($success) ?></p>
        <?php endif; ?>

        <div class="table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <?php foreach($users as $u): ?>
                    <tr>

                        <td><?= $u['id'] ?></td>

                        <!-- Formulario actualizar -->
                        <form method="POST">
                            <td>
                                <input type="text" name="username"
                                       value="<?= htmlspecialchars($u['username']) ?>">
                            </td>

                            <td>
                                <input type="email" name="email"
                                       value="<?= htmlspecialchars($u['email']) ?>">
                            </td>

                            <td>
                                <select name="role">
                                    <option value="user" <?= $u['role'] === 'user' ? 'selected' : '' ?>>Usuario</option>
                                    <option value="admin" <?= $u['role'] === 'admin' ? 'selected' : '' ?>>Admin</option>
                                </select>
                            </td>

                            <td class="actions-cell">

                                <input type="password" name="password" placeholder="Nueva contraseña">
                                <input type="hidden" name="edit_user_id" value="<?= $u['id'] ?>">
                                <button type="submit" class="update-btn">Actualizar</button>

                        </form>

                                <!-- Formulario eliminar-->
                                <form method="POST" onsubmit="return confirm('¿Seguro que quieres eliminar este usuario?');">
                                    <input type="hidden" name="delete_user_id" value="<?= $u['id'] ?>">
                                    <button type="submit" class="delete-btn">Eliminar</button>
                                </form>

                            </td>

                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

    </div>

</div>

<?php require_once BASE_DIR . '/views/layouts/footer.php'; ?>