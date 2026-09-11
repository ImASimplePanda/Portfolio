import { Router } from "express";
import { db } from "../db.js";
import {
  verificarClave,
  hashClave,
  puedeIntentar,
  apuntarFallo,
  limpiarIntentos,
} from "../auth.js";
import {
  abrirSesion,
  cerrarSesion,
  exigeSesion,
  COOKIE,
  opcionesCookie,
} from "../sesiones.js";

export const cuenta = Router();

cuenta.post("/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const clave = String(req.body?.clave || "");
  if (!email || !clave) return res.status(400).json({ error: "Faltan el correo o la contraseña." });

  /* El freno cuenta por correo Y por origen: así un atacante no puede
     bloquear la cuenta de otro simplemente fallando adrede. */
  const llaves = [`e:${email}`, `ip:${req.ip}`];
  for (const k of llaves) {
    if (!puedeIntentar(k).ok) {
      return res.status(429).json({
        error: "Demasiados intentos. Espera quince minutos y vuelve a probar.",
      });
    }
  }

  const u = db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email);

  /* Mismo mensaje tanto si el correo no existe como si la clave falla:
     si se distinguen, se puede averiguar qué correos están dados de alta. */
  const generico = { error: "Correo o contraseña incorrectos." };

  if (!u || !verificarClave(clave, u.hash)) {
    llaves.forEach(apuntarFallo);
    return res.status(401).json(generico);
  }
  if (!u.activo) {
    return res.status(403).json({ error: "Esta cuenta está desactivada. Habla con tu comercial." });
  }

  llaves.forEach(limpiarIntentos);
  const { token, expira } = abrirSesion(u.id);
  res.cookie(COOKIE, token, opcionesCookie(expira));

  const tarifa = u.tarifa_id
    ? db.prepare("SELECT nombre, descuento_pct FROM tarifas WHERE id = ?").get(u.tarifa_id)
    : null;

  res.json({
    usuario: {
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      empresa: u.empresa,
      rol: u.rol,
      tarifa: tarifa?.nombre ?? null,
      descuento_pct: tarifa?.descuento_pct ?? 0,
    },
  });
});

cuenta.post("/logout", (req, res) => {
  cerrarSesion(req.cookies?.[COOKIE]);
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
});

cuenta.get("/yo", (req, res) => {
  res.json({ usuario: req.usuario ?? null });
});

cuenta.post("/clave", exigeSesion, (req, res) => {
  const actual = String(req.body?.actual || "");
  const nueva = String(req.body?.nueva || "");
  if (nueva.length < 10) {
    return res.status(400).json({ error: "La contraseña nueva necesita al menos 10 caracteres." });
  }
  const u = db.prepare("SELECT hash FROM usuarios WHERE id = ?").get(req.usuario.id);
  if (!verificarClave(actual, u.hash)) {
    return res.status(401).json({ error: "La contraseña actual no es correcta." });
  }
  db.prepare("UPDATE usuarios SET hash = ? WHERE id = ?").run(hashClave(nueva), req.usuario.id);
  /* Cambiar la clave cierra las demás sesiones: si alguien te la había
     robado, deja de valerle. */
  db.prepare("DELETE FROM sesiones WHERE usuario_id = ?").run(req.usuario.id);
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true, aviso: "Contraseña cambiada. Vuelve a entrar." });
});
