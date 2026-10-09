<?php
require __DIR__ . '/inc/boot.php';
require __DIR__ . '/inc/layout.php';

$u = user();
$errors = [];
$old = [
    'nombre' => $u['nombre'] ?? '',
    'email' => $u['email'] ?? '',
    'telefono' => '',
    'direccion' => '',
    'entrega' => $_SESSION['entrega'] ?? 'recogida',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    foreach (['nombre', 'email', 'telefono', 'direccion', 'entrega'] as $k) $old[$k] = trim((string) ($_POST[$k] ?? ''));
    $old['entrega'] = $old['entrega'] === 'domicilio' ? 'domicilio' : 'recogida';
    $_SESSION['entrega'] = $old['entrega'];

    $lines = cart_lines();
    if (!$lines) $errors['general'] = 'Tu cesta está vacía. Añade algún libro antes de confirmar.';
    if (mb_strlen($old['nombre']) < 2) $errors['nombre'] = 'Escribe tu nombre para saber a quién se lo guardamos.';
    if (!filter_var($old['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = $old['email'] === '' ? 'Escribe tu correo.' : 'A ese correo le falta algo (por ejemplo, la @).';
    if (!preg_match('/^\+?[0-9 ]{9,15}$/', $old['telefono'])) $errors['telefono'] = 'Escribe un teléfono de 9 cifras (puedes poner el prefijo).';
    if ($old['entrega'] === 'domicilio' && mb_strlen($old['direccion']) < 10) $errors['direccion'] = 'Escribe la dirección completa: calle, número, piso, código postal y ciudad.';

    foreach ($lines as $l) {
        if (!es_preventa($l) && (int) $l['qty'] > (int) $l['stock']) {
            $errors['general'] = (int) $l['stock'] === 0
                ? '«' . $l['titulo'] . '» se ha agotado mientras tanto. Quítalo de la cesta para seguir.'
                : 'Solo nos quedan ' . (int) $l['stock'] . ' de «' . $l['titulo'] . '». Ajusta la cantidad para seguir.';
        }
    }

    if (!$errors) {
        $db = db();
        $db->beginTransaction();
        try {
            $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            do {
                $code = 'BK';
                for ($i = 0; $i < 5; $i++) $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
                $st = $db->prepare('SELECT 1 FROM orders WHERE codigo = ?');
                $st->execute([$code]);
            } while ($st->fetchColumn());

            $total = array_sum(array_map(fn($l) => $l['qty'] * $l['precio_cent'], $lines));
            $db->prepare('INSERT INTO orders (codigo, user_id, nombre, email, telefono, entrega, direccion, total_cent, estado, creado) VALUES (?,?,?,?,?,?,?,?,?,?)')
               ->execute([$code, $u['id'] ?? null, $old['nombre'], mb_strtolower($old['email']), $old['telefono'], $old['entrega'],
                          $old['entrega'] === 'domicilio' ? $old['direccion'] : null, $total,
                          $old['entrega'] === 'recogida' ? 'apartado' : 'pendiente de pago', now()]);
            $oid = (int) $db->lastInsertId();
            $ins = $db->prepare('INSERT INTO order_items (order_id, book_id, titulo, qty, precio_cent, tipo) VALUES (?,?,?,?,?,?)');
            $dec = $db->prepare('UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?');
            foreach ($lines as $l) {
                $pre = es_preventa($l);
                $ins->execute([$oid, $l['id'], $l['titulo'], $l['qty'], $l['precio_cent'], $pre ? 'preventa' : 'compra']);
                if (!$pre) $dec->execute([$l['qty'], $l['id'], $l['qty']]);
            }
            $db->prepare('DELETE FROM cart_items WHERE cart_id = ?')->execute([cart_id()]);
            $db->commit();
            $_SESSION['pedidos'][] = $code;
            unset($_SESSION['entrega']);
            redirect('pedido/' . $code);
        } catch (Throwable $e) {
            $db->rollBack();
            $errors['general'] = 'No hemos podido guardar el pedido. Inténtalo otra vez en un momento.';
        }
    }
}

$lines = cart_lines();
$sub = array_sum(array_map(fn($l) => $l['qty'] * $l['precio_cent'], $lines));
$hasPre = (bool) array_filter($lines, 'es_preventa');
$fe = fn(string $k) => isset($errors[$k]) ? ' aria-invalid="true" aria-describedby="err-' . $k . '"' : '';
$fm = fn(string $k) => isset($errors[$k]) ? '<p class="field__msg is-error" id="err-' . $k . '">' . e($errors[$k]) . '</p>' : '';

page_start([
    'title' => 'Tu cesta · Bookit',
    'desc' => 'Revisa tu cesta y elige si lo recoges en la tienda o te lo enviamos a casa.',
    'path' => '/cesta',
    'nav' => 'cesta',
    'noindex' => true,
]);
?>
<header class="pagehead">
  <h1 class="pagehead__title">Tu cesta</h1>
  <p class="pagehead__sub"><?= $lines ? 'Elige cómo lo quieres y confirma. Si lo recoges, no pagas nada hasta pasar por la tienda.' : 'Todavía no hay nada aquí.' ?></p>
</header>

<div class="page">
<?php if (!$lines): ?>
  <div class="empty">
    <div class="empty__cover"><?= cover(['slug' => '', 'titulo' => 'Cesta vacía', 'autor' => 'Bookit', 'coleccion' => 'narrativa', 'stock' => 0, 'salida' => null], ['link' => false]) ?></div>
    <h2 class="empty__title">Tu cesta está vacía.</h2>
    <p>Añade libros desde el catálogo o aparta uno para recogerlo en la tienda.</p>
    <a class="btn btn--ink" href="<?= e(url('catalogo')) ?>"><span class="btn__label">Ir al catálogo</span><?= icon('arrow-right') ?></a>
  </div>
<?php else: ?>
  <div class="cart">
    <section aria-labelledby="lines-title">
      <h2 class="visually-hidden" id="lines-title">Libros en la cesta</h2>
      <ul class="lines" data-lines>
        <?php foreach ($lines as $l): $pre = es_preventa($l); ?>
        <li class="line" data-line="<?= (int) $l['id'] ?>" style="view-transition-name: line-<?= (int) $l['id'] ?>">
          <?= cover($l, ['tabindex' => -1]) ?>
          <div>
            <h3 class="line__title"><a href="<?= e(url('libro/' . $l['slug'])) ?>"><?= e($l['titulo']) ?></a></h3>
            <p class="line__meta"><?= e($l['autor']) ?> · <?= e($l['formato']) ?></p>
            <p class="line__tipo"><?= estado_libro($l) ?></p>
          </div>
          <div class="line__side">
            <form class="qty" method="post" action="<?= e(url('api/cesta.php')) ?>" data-qty>
              <?= csrf_field() ?>
              <input type="hidden" name="action" value="update">
              <input type="hidden" name="book" value="<?= (int) $l['id'] ?>">
              <button type="submit" name="qty" value="<?= (int) $l['qty'] - 1 ?>" aria-label="Quitar uno de <?= e($l['titulo']) ?>" data-step="-1"><?= icon('minus') ?></button>
              <output aria-live="polite" aria-label="Cantidad"><?= (int) $l['qty'] ?></output>
              <button type="submit" name="qty" value="<?= (int) $l['qty'] + 1 ?>" aria-label="Añadir otro de <?= e($l['titulo']) ?>" data-step="1"<?= (!$pre && $l['qty'] >= $l['stock']) || $l['qty'] >= 20 ? ' disabled' : '' ?> data-max="<?= $pre ? 20 : min(20, (int) $l['stock']) ?>"><?= icon('plus') ?></button>
            </form>
            <span class="price" data-line-price data-unit="<?= (int) $l['precio_cent'] ?>"><?= money($l['qty'] * $l['precio_cent']) ?></span>
            <form method="post" action="<?= e(url('api/cesta.php')) ?>" data-remove>
              <?= csrf_field() ?>
              <input type="hidden" name="action" value="remove">
              <input type="hidden" name="book" value="<?= (int) $l['id'] ?>">
              <button class="line__remove" type="submit"><?= icon('trash') ?>Quitar<span class="visually-hidden"> <?= e($l['titulo']) ?></span></button>
            </form>
          </div>
        </li>
        <?php endforeach; ?>
      </ul>
    </section>

    <form class="checkout" method="post" action="<?= e(url('cesta')) ?>" novalidate data-checkout>
      <?= csrf_field() ?>
      <h2 class="checkout__title">Confirmar</h2>
      <?php if (isset($errors['general'])): ?>
      <p class="form-error" role="alert"><?= icon('warning-circle') ?><?= e($errors['general']) ?></p>
      <?php elseif ($errors): ?>
      <p class="form-error" role="alert"><?= icon('warning-circle') ?>Revisa los campos marcados.</p>
      <?php endif; ?>

      <fieldset class="fieldset">
        <legend>¿Cómo lo quieres?</legend>
        <label class="option">
          <input type="radio" name="entrega" value="recogida"<?= $old['entrega'] === 'recogida' ? ' checked' : '' ?>>
          <span>
            <span class="option__title"><?= icon('storefront') ?>Recoger en tienda</span>
            <span class="option__text">Lo pagas al recogerlo. Te lo guardamos <?= (int) $CFG['dias_reserva'] ?> días<?= $hasPre ? ' desde que llegue' : '' ?>.</span>
          </span>
          <span class="option__price">Gratis</span>
        </label>
        <label class="option">
          <input type="radio" name="entrega" value="domicilio"<?= $old['entrega'] === 'domicilio' ? ' checked' : '' ?>>
          <span>
            <span class="option__title"><?= icon('truck') ?>Envío a casa</span>
            <span class="option__text">Te mandamos el enlace de pago por correo. <mark class="pendiente">Pendiente: pasarela de pago y tarifas</mark></span>
          </span>
          <span class="option__price"><mark class="pendiente">Pendiente</mark></span>
        </label>
      </fieldset>

      <div class="field<?= isset($errors['nombre']) ? ' is-error' : '' ?>">
        <label class="field__label" for="c-nombre">Nombre y apellidos</label>
        <input class="input" id="c-nombre" name="nombre" autocomplete="name" required value="<?= e($old['nombre']) ?>"<?= $fe('nombre') ?>>
        <?= $fm('nombre') ?>
      </div>
      <div class="field<?= isset($errors['email']) ? ' is-error' : '' ?>">
        <label class="field__label" for="c-email">Correo</label>
        <input class="input" id="c-email" name="email" type="email" autocomplete="email" autocapitalize="none" required value="<?= e($old['email']) ?>"<?= $fe('email') ?>>
        <?= $fm('email') ?>
      </div>
      <div class="field<?= isset($errors['telefono']) ? ' is-error' : '' ?>">
        <label class="field__label" for="c-tel">Teléfono</label>
        <input class="input" id="c-tel" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required value="<?= e($old['telefono']) ?>"<?= $fe('telefono') ?>>
        <?= isset($errors['telefono']) ? $fm('telefono') : '<p class="field__hint">Para avisarte cuando esté listo.</p>' ?>
      </div>
      <div class="field only-domicilio<?= isset($errors['direccion']) ? ' is-error' : '' ?>">
        <label class="field__label" for="c-dir">Dirección de envío</label>
        <textarea class="input" id="c-dir" name="direccion" rows="3" autocomplete="street-address"<?= $fe('direccion') ?>><?= e($old['direccion']) ?></textarea>
        <?= $fm('direccion') ?>
      </div>

      <div class="totals">
        <div><span>Subtotal</span><span data-subtotal><?= money($sub) ?></span></div>
        <div class="only-domicilio"><span>Envío</span><span><mark class="pendiente">Pendiente</mark></span></div>
        <div class="totals__grand"><span>Total</span><span data-total><?= money($sub) ?></span></div>
      </div>
      <button class="btn btn--block" type="submit"><span class="btn__label">Confirmar pedido</span></button>
      <?php if (!$u): ?>
      <p class="field__hint">¿Tienes cuenta? <a href="<?= e(url('entrar')) ?>">Entra</a> y verás tus reservas en un sitio.</p>
      <?php endif; ?>
    </form>
  </div>
<?php endif; ?>
</div>
<?php page_end(); ?>
