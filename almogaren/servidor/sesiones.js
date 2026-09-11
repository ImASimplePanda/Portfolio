import { db } from "./db.js";
import { nuevoToken, hashToken } from "./auth.js";

const DIAS = 7;
export const COOKIE = "alm_sesion";

export function abrirSesion(usuarioId) {
  const { token, hash } = nuevoToken();
  const expira = new Date(Date.now() + DIAS * 864e5).toISOString();
  db.prepare("INSERT INTO sesiones (token_hash, usuario_id, expira) VALUES (?,?,?)").run(
    hash,
    usuarioId,
    expira,
  );
  return { token, expira };
}

export function cerrarSesion(token) {
  if (!token) return;
  db.prepare("DELETE FROM sesiones WHERE token_hash = ?").run(hashToken(token));
}

export function usuarioDeToken(token) {
  if (!token) return null;
  const fila = db
    .prepare(
      `SELECT u.id, u.email, u.nombre, u.empresa, u.cif, u.telefono, u.rol, u.activo,
              t.nombre AS tarifa, t.descuento_pct
       FROM sesiones s
       JOIN usuarios u ON u.id = s.usuario_id
       LEFT JOIN tarifas t ON t.id = u.tarifa_id
       WHERE s.token_hash = ? AND s.expira > datetime('now')`,
    )
    .get(hashToken(token));
  if (!fila || !fila.activo) return null;
  return fila;
}

/* Las sesiones caducadas no se borran solas: se limpian al arrancar y
   cada hora, para que la tabla no crezca sin fin. */
export function limpiarCaducadas() {
  const { changes } = db.prepare("DELETE FROM sesiones WHERE expira <= datetime('now')").run();
  return changes;
}

/* ── Middleware ──────────────────────────────────────────────────── */

export function conUsuario(req, _res, next) {
  req.usuario = usuarioDeToken(req.cookies?.[COOKIE]);
  next();
}

export function exigeSesion(req, res, next) {
  if (!req.usuario) return res.status(401).json({ error: "Necesitas iniciar sesión." });
  next();
}

export function exigeRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: "Necesitas iniciar sesión." });
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "Tu cuenta no tiene permiso para esto." });
    }
    next();
  };
}

export const opcionesCookie = (expira) => ({
  httpOnly: true, // el JavaScript de la página no puede leerla: frena el robo por XSS
  sameSite: "lax", // frena el envío desde otros sitios (CSRF) sin romper la navegación normal
  secure: process.env.NODE_ENV === "production", // en local no hay HTTPS
  expires: new Date(expira),
  path: "/",
});
