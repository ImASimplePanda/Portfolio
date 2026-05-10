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
        $error = __t('cannot_delete_self');
    } else {
        try {
            // Consultar el rol del usuario que se quiere eliminar
            $checkStmt = $db->prepare("SELECT role FROM users WHERE id = :id");
            $checkStmt->execute([':id' => $deleteId]);
            $userToDelete = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($userToDelete && $userToDelete['role'] === 'admin') {
                // Si es admin, bloqueamos la acción
                $error = __t('cannot_delete_other_admin'); 
            } else {
                // Si no es admin o no existe, procedemos al borrado
                $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
                $stmt->execute([':id' => $deleteId]);
                $success = __t('user_deleted');
            }
        } catch (PDOException $e) {
            $error = __t('user_delete_error');
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
        $error = __t('invalid_data');
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

            $success = __t('user_updated');
        } catch (PDOException $e) {
            $error = __t('user_update_error');
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

        <h2 class="admin-title"><?= __t('title_users') ?></h2>

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
                        <th><?= __t('id') ?></th>
                        <th><?= __t('user') ?></th>
                        <th><?= __t('email') ?></th>
                        <th><?= __t('role') ?></th>
                        <th><?= __t('actions') ?></th>
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
                                    <option value="user" <?= $u['role'] === 'user' ? 'selected' : '' ?>>
                                        <?= __t('user') ?>
                                    </option>
                                    <option value="admin" <?= $u['role'] === 'admin' ? 'selected' : '' ?>>
                                        <?= __t('admin') ?>
                                    </option>
                                </select>
                            </td>

                            <td class="actions-cell">

                                <input type="password" name="password" placeholder="<?= __t('new_password') ?>">
                                <input type="hidden" name="edit_user_id" value="<?= $u['id'] ?>">
                                <button type="submit" class="update-btn">
                                    <?= __t('update') ?>
                                </button>

                        </form>

                                <!-- Formulario eliminar-->
                                <form method="POST" onsubmit="return confirm('<?= __t('confirm_delete_user') ?>');">
                                    <input type="hidden" name="delete_user_id" value="<?= $u['id'] ?>">
                                    <button type="submit" class="delete-btn">
                                        <?= __t('delete') ?>
                                    </button>
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