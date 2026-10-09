<?php
declare(strict_types=1);

$CFG = require __DIR__ . '/../config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);
date_default_timezone_set('Europe/Madrid');

session_name('bk_sess');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => ($CFG['base'] ?: '') . '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
]);
session_start();

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: SAMEORIGIN');

require __DIR__ . '/schema.php';
require __DIR__ . '/seed.php';

/* ---------- Base de datos ---------- */

function db(): PDO
{
    static $pdo = null;
    global $CFG;
    if ($pdo) return $pdo;

    $opts = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    if ($CFG['db_driver'] === 'mysql') {
        $dsn = "mysql:host={$CFG['db_host']};dbname={$CFG['db_name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $CFG['db_user'], $CFG['db_pass'], $opts);
        return $pdo;
    }

    $fresh = !is_file($CFG['sqlite_path']);
    if (!is_dir(dirname($CFG['sqlite_path']))) mkdir(dirname($CFG['sqlite_path']), 0775, true);
    $pdo = new PDO('sqlite:' . $CFG['sqlite_path'], null, null, $opts);
    $pdo->exec('PRAGMA foreign_keys = ON');
    if ($fresh) bk_install($pdo, 'sqlite');
    return $pdo;
}

function bk_install(PDO $db, string $driver): void
{
    foreach (bk_schema($driver) as $sql) {
        try { $db->exec($sql); } catch (PDOException $e) { /* índice ya existente */ }
    }
    if ((int) $db->query('SELECT COUNT(*) FROM books')->fetchColumn() === 0) bk_seed($db);
}

function now(): string { return date('Y-m-d H:i:s'); }

/* ---------- Utilidades ---------- */

function e(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function url(string $path = ''): string
{
    global $CFG;
    return ($CFG['base'] ?: '') . '/' . ltrim($path, '/');
}

function asset(string $path): string
{
    $file = __DIR__ . '/../' . ltrim($path, '/');
    $v = is_file($file) ? substr((string) filemtime($file), -6) : '1';
    return url($path) . '?v=' . $v;
}

function money(int $cent): string
{
    return number_format($cent / 100, 2, ',', '.') . ' €';
}

function icon(string $name, string $class = 'icon'): string
{
    return '<svg class="' . e($class) . '" aria-hidden="true" focusable="false"><use href="' . e(url('img/icons.svg')) . '#i-' . e($name) . '"></use></svg>';
}

function fecha_larga(string $ymd): string
{
    $m = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    [$y, $mo, $d] = array_map('intval', explode('-', $ymd));
    return $d . ' de ' . $m[$mo - 1];
}

function redirect(string $path): never
{
    header('Location: ' . url($path), true, 303);
    exit;
}

function is_ajax(): bool
{
    return ($_SERVER['HTTP_ACCEPT'] ?? '') === 'application/json' || isset($_SERVER['HTTP_X_BOOKIT']);
}

function json_out(array $data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function flash(?string $msg = null, string $type = 'ok'): ?array
{
    if ($msg !== null) { $_SESSION['flash'] = ['msg' => $msg, 'type' => $type]; return null; }
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

/* ---------- CSRF ---------- */

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): void
{
    $t = $_POST['csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? '');
    if (!is_string($t) || !hash_equals(csrf_token(), $t)) {
        if (is_ajax()) json_out(['ok' => false, 'error' => 'La sesión ha caducado. Recarga la página.'], 419);
        http_response_code(419);
        exit('La sesión ha caducado. Vuelve atrás y recarga la página.');
    }
}

/* ---------- Colecciones ---------- */

const COLECCIONES = [
    'narrativa' => ['nombre' => 'Narrativa',          'corto' => 'Narrativa'],
    'negra'     => ['nombre' => 'Novela negra',       'corto' => 'Negra'],
    'ensayo'    => ['nombre' => 'Ensayo',             'corto' => 'Ensayo'],
    'clasicos'  => ['nombre' => 'Clásicos y poesía',  'corto' => 'Clásicos'],
    'infantil'  => ['nombre' => 'Infantil y juvenil', 'corto' => 'Infantil'],
];

function col_valida(?string $c): ?string { return isset(COLECCIONES[$c ?? '']) ? $c : null; }

/* ---------- Libros ---------- */

function es_preventa(array $b): bool { return !empty($b['salida']) && $b['salida'] > date('Y-m-d'); }

function libros(array $f = []): array
{
    $where = []; $p = [];
    if (!empty($f['col'])) { $where[] = 'coleccion = ?'; $p[] = $f['col']; }
    if (!empty($f['q'])) {
        $where[] = '(LOWER(titulo) LIKE ? OR LOWER(autor) LIKE ?)';
        $q = '%' . mb_strtolower($f['q']) . '%';
        $p[] = $q; $p[] = $q;
    }
    if (($f['disp'] ?? '') === 'preventa') { $where[] = 'salida > ?'; $p[] = date('Y-m-d'); }
    if (($f['disp'] ?? '') === 'stock') { $where[] = 'stock > 0 AND (salida IS NULL OR salida <= ?)'; $p[] = date('Y-m-d'); }
    $order = match ($f['orden'] ?? '') {
        'precio' => 'precio_cent ASC',
        'precio-desc' => 'precio_cent DESC',
        'titulo' => 'titulo ASC',
        default => ($f['disp'] ?? '') === 'preventa' ? 'salida ASC' : 'orden ASC',
    };
    $sql = 'SELECT * FROM books' . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . " ORDER BY $order";
    if (!empty($f['limit'])) $sql .= ' LIMIT ' . (int) $f['limit'];
    $st = db()->prepare($sql);
    $st->execute($p);
    return $st->fetchAll();
}

function libro(string $slug): ?array
{
    $st = db()->prepare('SELECT * FROM books WHERE slug = ?');
    $st->execute([$slug]);
    return $st->fetch() ?: null;
}

function libro_id(int $id): ?array
{
    $st = db()->prepare('SELECT * FROM books WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

/* ---------- Usuarios ---------- */

function user(bool $refresh = false): ?array
{
    static $u = false;
    if ($u !== false && !$refresh) return $u;
    $u = null;
    if (!empty($_SESSION['uid'])) {
        $st = db()->prepare('SELECT id, nombre, email FROM users WHERE id = ?');
        $st->execute([$_SESSION['uid']]);
        $u = $st->fetch() ?: null;
    }
    return $u;
}

function login_user(int $id): void
{
    session_regenerate_id(true);
    $_SESSION['uid'] = $id;
    cart_attach_user($id);
}

/* ---------- Cesta ---------- */

function cart_id(bool $create = false): ?int
{
    global $CFG;
    $u = user();
    if ($u) {
        $st = db()->prepare('SELECT id FROM carts WHERE user_id = ? ORDER BY id DESC LIMIT 1');
        $st->execute([$u['id']]);
        $id = $st->fetchColumn();
        if ($id) return (int) $id;
    }
    $token = $_COOKIE['bk_cart'] ?? '';
    if (is_string($token) && preg_match('/^[a-f0-9]{48}$/', $token)) {
        $st = db()->prepare('SELECT id, user_id FROM carts WHERE token = ?');
        $st->execute([$token]);
        $row = $st->fetch();
        if ($row && (!$row['user_id'] || ($u && (int) $row['user_id'] === (int) $u['id']))) return (int) $row['id'];
    }
    if (!$create) return null;
    $token = bin2hex(random_bytes(24));
    db()->prepare('INSERT INTO carts (token, user_id, creado) VALUES (?,?,?)')->execute([$token, $u['id'] ?? null, now()]);
    $id = (int) db()->lastInsertId();
    setcookie('bk_cart', $token, [
        'expires' => time() + 60 * 60 * 24 * 60, 'path' => ($CFG['base'] ?: '') . '/',
        'httponly' => true, 'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    $_COOKIE['bk_cart'] = $token;
    return $id;
}

/* Al entrar: la cesta de invitado se une a la del usuario. */
function cart_attach_user(int $uid): void
{
    $token = $_COOKIE['bk_cart'] ?? '';
    if (!is_string($token) || !preg_match('/^[a-f0-9]{48}$/', $token)) return;
    $st = db()->prepare('SELECT id FROM carts WHERE token = ? AND user_id IS NULL');
    $st->execute([$token]);
    $guest = $st->fetchColumn();
    if (!$guest) return;
    $st = db()->prepare('SELECT id FROM carts WHERE user_id = ? ORDER BY id DESC LIMIT 1');
    $st->execute([$uid]);
    $mine = $st->fetchColumn();
    if (!$mine) {
        db()->prepare('UPDATE carts SET user_id = ? WHERE id = ?')->execute([$uid, $guest]);
        return;
    }
    $items = db()->prepare('SELECT book_id, qty FROM cart_items WHERE cart_id = ?');
    $items->execute([$guest]);
    foreach ($items->fetchAll() as $it) cart_set((int) $mine, (int) $it['book_id'], (int) $it['qty'], true);
    db()->prepare('DELETE FROM cart_items WHERE cart_id = ?')->execute([$guest]);
}

function cart_set(int $cart, int $book, int $qty, bool $add = false): void
{
    $qty = max(0, min(20, $qty));
    $st = db()->prepare('SELECT id, qty FROM cart_items WHERE cart_id = ? AND book_id = ?');
    $st->execute([$cart, $book]);
    $row = $st->fetch();
    if ($row) {
        $n = $add ? min(20, (int) $row['qty'] + $qty) : $qty;
        if ($n <= 0) db()->prepare('DELETE FROM cart_items WHERE id = ?')->execute([$row['id']]);
        else db()->prepare('UPDATE cart_items SET qty = ? WHERE id = ?')->execute([$n, $row['id']]);
    } elseif ($qty > 0) {
        db()->prepare('INSERT INTO cart_items (cart_id, book_id, qty) VALUES (?,?,?)')->execute([$cart, $book, $qty]);
    }
}

function cart_lines(): array
{
    $id = cart_id();
    if (!$id) return [];
    $st = db()->prepare('SELECT ci.qty, b.* FROM cart_items ci JOIN books b ON b.id = ci.book_id WHERE ci.cart_id = ? ORDER BY ci.id');
    $st->execute([$id]);
    return $st->fetchAll();
}

function cart_count(): int
{
    $id = cart_id();
    if (!$id) return 0;
    $st = db()->prepare('SELECT COALESCE(SUM(qty),0) FROM cart_items WHERE cart_id = ?');
    $st->execute([$id]);
    return (int) $st->fetchColumn();
}

/* ---------- Deseados ---------- */

function wish_ids(): array
{
    $u = user();
    if (!$u) return [];
    $st = db()->prepare('SELECT book_id FROM wishlist WHERE user_id = ?');
    $st->execute([$u['id']]);
    return array_map('intval', $st->fetchAll(PDO::FETCH_COLUMN));
}
