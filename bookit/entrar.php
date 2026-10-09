<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

if (user()) redirect('cuenta');

$err = ['login' => [], 'alta' => []];
$old = ['email' => '', 'nombre' => '', 'email2' => ''];
$mode = $_POST['modo'] ?? '';

function after_login(): never
{
    // Si venía de pulsar el corazón, guardamos ese libro
    $pending = $_SESSION['wish_pending'] ?? null;
    $u = user(true);
    if ($pending && $u) {
        $st = db()->prepare('SELECT 1 FROM wishlist WHERE user_id = ? AND book_id = ?');
        $st->execute([$u['id'], $pending]);
        if (!$st->fetchColumn()) db()->prepare('INSERT INTO wishlist (user_id, book_id, creado) VALUES (?,?,?)')->execute([$u['id'], $pending, now()]);
        flash('Guardado en deseados.');
    }
    unset($_SESSION['wish_pending']);
    $to = $_SESSION['volver'] ?? 'cuenta';
    unset($_SESSION['volver']);
    redirect($to);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $_SESSION['intentos'] = array_filter($_SESSION['intentos'] ?? [], fn($t) => $t > time() - 600);

    if ($mode === 'login') {
        $old['email'] = trim((string) ($_POST['email'] ?? ''));
        $pass = (string) ($_POST['pass'] ?? '');
        if (count($_SESSION['intentos']) >= 8) {
            $err['login']['general'] = 'Demasiados intentos. Espera unos minutos y vuelve a probar.';
        } else {
            $st = db()->prepare('SELECT id, pass_hash FROM users WHERE email = ?');
            $st->execute([mb_strtolower($old['email'])]);
            $row = $st->fetch();
            if ($row && password_verify($pass, $row['pass_hash'])) {
                if (password_needs_rehash($row['pass_hash'], PASSWORD_DEFAULT)) {
                    db()->prepare('UPDATE users SET pass_hash = ? WHERE id = ?')->execute([password_hash($pass, PASSWORD_DEFAULT), $row['id']]);
                }
                $_SESSION['intentos'] = [];
                login_user((int) $row['id']);
                after_login();
            }
            $_SESSION['intentos'][] = time();
            $err['login']['general'] = 'El correo o la contraseña no coinciden.';
        }
    }

    if ($mode === 'alta') {
        $old['nombre'] = trim((string) ($_POST['nombre'] ?? ''));
        $old['email2'] = trim((string) ($_POST['email'] ?? ''));
        $pass = (string) ($_POST['pass'] ?? '');
        if (mb_strlen($old['nombre']) < 2) $err['alta']['nombre'] = 'Escribe tu nombre.';
        if (mb_strlen($old['nombre']) > 80) $err['alta']['nombre'] = 'El nombre es demasiado largo (máximo 80 caracteres).';
        if (!filter_var($old['email2'], FILTER_VALIDATE_EMAIL)) $err['alta']['email'] = $old['email2'] === '' ? 'Escribe tu correo.' : 'A ese correo le falta algo (por ejemplo, la @).';
        if (mb_strlen($pass) < 8) $err['alta']['pass'] = 'La contraseña necesita al menos 8 caracteres.';
        if (!$err['alta']) {
            $st = db()->prepare('SELECT 1 FROM users WHERE email = ?');
            $st->execute([mb_strtolower($old['email2'])]);
            if ($st->fetchColumn()) {
                $err['alta']['email'] = 'Ya hay una cuenta con ese correo. Entra con ella a la izquierda.';
            } else {
                db()->prepare('INSERT INTO users (nombre, email, pass_hash, creado) VALUES (?,?,?,?)')
                    ->execute([$old['nombre'], mb_strtolower($old['email2']), password_hash($pass, PASSWORD_DEFAULT), now()]);
                login_user((int) db()->lastInsertId());
                flash('Cuenta creada. Ya puedes guardar deseados.');
                after_login();
            }
        }
    }
}

$motivo = $_GET['motivo'] ?? '';
$fe = fn(string $f, string $k) => isset($err[$f][$k]) ? ' aria-invalid="true" aria-describedby="err-' . $f . '-' . $k . '"' : '';
$fm = fn(string $f, string $k) => isset($err[$f][$k]) ? '<p class="field__msg is-error" id="err-' . $f . '-' . $k . '">' . e($err[$f][$k]) . '</p>' : '';

page_start([
    'title' => 'Entrar o crear cuenta · Bookit',
    'desc' => 'Entra en tu cuenta de Bookit para guardar deseados y ver tus reservas.',
    'path' => '/entrar',
    'nav' => 'entrar',
    'noindex' => true,
]);
?>
<header class="pagehead">
  <h1 class="pagehead__title">Tu cuenta</h1>
  <p class="pagehead__sub"><?= $motivo === 'deseados' ? 'Para guardar deseados necesitas una cuenta. Es un minuto.' : 'Guarda deseados y consulta tus reservas desde cualquier sitio.' ?></p>
</header>
<div class="page">
  <div class="auth">
    <section class="auth__box" aria-labelledby="login-title">
      <h2 id="login-title">Ya tengo cuenta</h2>
      <form method="post" action="<?= e(url('entrar')) ?>" novalidate>
        <?= csrf_field() ?>
        <input type="hidden" name="modo" value="login">
        <?php if (isset($err['login']['general'])): ?><p class="form-error" role="alert"><?= icon('warning-circle') ?><?= e($err['login']['general']) ?></p><?php endif; ?>
        <div class="field">
          <label class="field__label" for="l-email">Correo</label>
          <input class="input" id="l-email" name="email" type="email" autocomplete="username" autocapitalize="none" required value="<?= e($old['email']) ?>">
        </div>
        <div class="field">
          <label class="field__label" for="l-pass">Contraseña</label>
          <input class="input" id="l-pass" name="pass" type="password" autocomplete="current-password" required>
        </div>
        <button class="btn btn--block" type="submit"><span class="btn__label">Entrar</span></button>
      </form>
    </section>
    <section class="auth__box" aria-labelledby="alta-title">
      <h2 id="alta-title">Crear una cuenta</h2>
      <p>Con cuenta, tu cesta te sigue entre el móvil y el ordenador y tus reservas quedan apuntadas.</p>
      <form method="post" action="<?= e(url('entrar')) ?>" novalidate>
        <?= csrf_field() ?>
        <input type="hidden" name="modo" value="alta">
        <div class="field">
          <label class="field__label" for="a-nombre">Nombre</label>
          <input class="input" id="a-nombre" name="nombre" autocomplete="given-name" required maxlength="80" value="<?= e($old['nombre']) ?>"<?= $fe('alta', 'nombre') ?>>
          <?= $fm('alta', 'nombre') ?>
        </div>
        <div class="field">
          <label class="field__label" for="a-email">Correo</label>
          <input class="input" id="a-email" name="email" type="email" autocomplete="email" autocapitalize="none" required value="<?= e($old['email2']) ?>"<?= $fe('alta', 'email') ?>>
          <?= $fm('alta', 'email') ?>
        </div>
        <div class="field">
          <label class="field__label" for="a-pass">Contraseña</label>
          <input class="input" id="a-pass" name="pass" type="password" autocomplete="new-password" required minlength="8"<?= $fe('alta', 'pass') ?: ' aria-describedby="a-pass-hint"' ?>>
          <?= $fm('alta', 'pass') ?: '<p class="field__hint" id="a-pass-hint">Al menos 8 caracteres.</p>' ?>
        </div>
        <button class="btn btn--ghost btn--block" type="submit"><span class="btn__label">Crear cuenta</span></button>
      </form>
    </section>
  </div>
</div>
<?php page_end(); ?>
