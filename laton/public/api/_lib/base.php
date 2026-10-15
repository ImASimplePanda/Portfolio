<?php
// Utilidades comunes: configuración, base de datos, respuestas JSON, sesión, CSRF y límites.
declare(strict_types=1);

// La configuración vive FUERA de la carpeta pública: dos niveles por encima de /api.
// Producción: /home/<usuario>/domains/<dominio>/laton.env, local: <proyecto>/laton.env
function config(string $clave, ?string $porDefecto = null): ?string
{
    static $env = null;
    if ($env === null) {
        $env = [];
        $fichero = raizProyecto() . '/laton.env';
        if (is_file($fichero)) {
            foreach (file($fichero, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linea) {
                if ($linea[0] === '#' || !str_contains($linea, '=')) continue;
                [$k, $v] = explode('=', $linea, 2);
                $env[trim($k)] = trim($v);
            }
        }
    }
    $v = $env[$clave] ?? getenv($clave);
    return ($v === false || $v === '') ? $porDefecto : $v;
}

// Carpeta privada (laton.env y datos/): por defecto, la superior a la pública. Si existe
// _lib/local.php (lo crea la compilación del portfolio), manda ese fichero.
function raizProyecto(): string
{
    static $r = null;
    return $r ??= getenv('LATON_RAIZ') ?: (is_file(__DIR__ . '/local.php') ? (require __DIR__ . '/local.php') : dirname(__DIR__, 3));
}
function raizPublica(): string { return dirname(__DIR__, 2); }
function esDemo(): bool { return config('DEMO', '1') === '1'; }

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = config('DB_DSN') ?: 'sqlite:' . raizProyecto() . '/datos/laton.sqlite';
    if (str_starts_with($dsn, 'sqlite:')) {
        $dir = dirname(substr($dsn, 7));
        if (!is_dir($dir)) mkdir($dir, 0775, true);
    }
    $pdo = new PDO($dsn, config('DB_USER'), config('DB_PASS'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    if (esSqlite()) {
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('PRAGMA busy_timeout = 5000');
    }
    return $pdo;
}

function esSqlite(): bool { return db()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite'; }
function ahora(): string { return gmdate('Y-m-d H:i:s'); }

// ---------- Respuestas ----------
function responder($datos, int $estado = 200): never
{
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fallo(string $mensaje, int $estado = 400, array $campos = []): never
{
    responder(['error' => $mensaje] + ($campos ? ['campos' => $campos] : []), $estado);
}

function entrada(): array
{
    static $datos = null;
    if ($datos === null) {
        $crudo = file_get_contents('php://input') ?: '';
        $datos = json_decode($crudo, true);
        if (!is_array($datos)) $datos = $_POST ?: [];
    }
    return $datos;
}

function texto(array $d, string $k, int $max = 200): string
{
    $v = isset($d[$k]) && is_scalar($d[$k]) ? trim((string) $d[$k]) : '';
    return mb_substr($v, 0, $max);
}

function entero(array $d, string $k, int $min, int $max, ?int $porDefecto = null): ?int
{
    if (!isset($d[$k]) || $d[$k] === '' || !is_numeric($d[$k])) return $porDefecto;
    return max($min, min($max, (int) $d[$k]));
}

// ---------- Sesión, usuario y CSRF ----------
function iniciarSesion(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    session_name('laton');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
    ini_set('session.use_strict_mode', '1');
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function exigirCsrf(): void
{
    $enviado = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($enviado) || !hash_equals($_SESSION['csrf'] ?? '', $enviado)) {
        fallo('La sesión ha caducado. Recarga la página e inténtalo de nuevo.', 419);
    }
}

function usuarioActual(): ?array
{
    $id = $_SESSION['usuario_id'] ?? null;
    if (!$id) return null;
    $s = db()->prepare('SELECT id, email, nombre, rol FROM usuarios WHERE id = ?');
    $s->execute([$id]);
    return $s->fetch() ?: null;
}

function exigirUsuario(): array
{
    $u = usuarioActual();
    if (!$u) fallo('Inicia sesión para continuar.', 401);
    return $u;
}

function exigirAdmin(): array
{
    $u = exigirUsuario();
    if ($u['rol'] !== 'admin') fallo('No tienes permiso para esto.', 403);
    return $u;
}

// ---------- Límite de intentos (login, recuperación) ----------
function limitar(string $clave, int $max, int $segundos): void
{
    $desde = gmdate('Y-m-d H:i:s', time() - $segundos);
    db()->prepare('DELETE FROM intentos WHERE creado < ?')->execute([gmdate('Y-m-d H:i:s', time() - 86400)]);
    $s = db()->prepare('SELECT COUNT(*) FROM intentos WHERE clave = ? AND creado >= ?');
    $s->execute([$clave, $desde]);
    if ((int) $s->fetchColumn() >= $max) {
        fallo('Demasiados intentos. Espera unos minutos y vuelve a probar.', 429);
    }
}

function anotarIntento(string $clave): void
{
    db()->prepare('INSERT INTO intentos (clave, creado) VALUES (?, ?)')->execute([$clave, ahora()]);
}

function ipCliente(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }

// Subcarpeta en la que vive la web ('' en su dominio, '/demos/laton' en el portfolio)
function rutaBase(): string
{
    $conf = config('URL_BASE');
    if ($conf) return rtrim((string) parse_url($conf, PHP_URL_PATH), '/');
    return '';
}

function urlBase(): string
{
    $conf = config('URL_BASE');
    if ($conf) return rtrim($conf, '/');
    $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
}

function slugify(string $t): string
{
    $t = mb_strtolower($t);
    $t = strtr($t, ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n', 'ç' => 'c']);
    $t = preg_replace('/[^a-z0-9]+/', '-', $t);
    return trim($t, '-') ?: 'producto';
}
