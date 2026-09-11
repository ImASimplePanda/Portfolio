import { Router } from "express";
import { db } from "../db.js";
import { hashClave } from "../auth.js";
import { exigeRol } from "../sesiones.js";

export const admin = Router();

/* Todo lo de aquí exige rol. El comercial puede mirar y mover pedidos;
   sólo dirección da de alta usuarios o cambia tarifas. */
const verPanel = exigeRol("admin", "comercial");
const soloAdmin = exigeRol("admin");

/* ── Resumen ──────────────────────────────────────────────────────── */
admin.get("/resumen", verPanel, (_req, res) => {
  res.json({
    clientes: db.prepare("SELECT COUNT(*) c FROM usuarios WHERE rol='cliente' AND activo=1").get().c,
    productos: db.prepare("SELECT COUNT(*) c FROM productos WHERE activo=1").get().c,
    bajoStock: db.prepare("SELECT COUNT(*) c FROM productos WHERE activo=1 AND stock < 50").get().c,
    pendientes: db.prepare("SELECT COUNT(*) c FROM pedidos WHERE estado IN ('recibido','preparando')").get().c,
    facturado: db.prepare("SELECT COALESCE(SUM(total_cent),0) s FROM pedidos WHERE estado <> 'anulado'").get().s,
  });
});

/* ── Usuarios ─────────────────────────────────────────────────────── */
admin.get("/usuarios", verPanel, (_req, res) => {
  const filas = db
    .prepare(
      `SELECT u.id, u.email, u.nombre, u.empresa, u.cif, u.rol, u.activo, u.creado,
              t.id AS tarifa_id, t.nombre AS tarifa, t.descuento_pct,
              (SELECT COUNT(*) FROM pedidos p WHERE p.usuario_id = u.id) AS pedidos
       FROM usuarios u LEFT JOIN tarifas t ON t.id = u.tarifa_id
       ORDER BY u.rol, u.empresa, u.nombre`,
    )
    .all();
  res.json({ usuarios: filas });
});

admin.post("/usuarios", soloAdmin, (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const nombre = String(req.body?.nombre || "").trim();
  const empresa = String(req.body?.empresa || "").trim() || null;
  const clave = String(req.body?.clave || "");
  const rol = ["cliente", "comercial", "admin"].includes(req.body?.rol) ? req.body.rol : "cliente";
  const tarifaId = req.body?.tarifa_id ? Number(req.body.tarifa_id) : null;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Ese correo no tiene forma de correo." });
  }
  if (!nombre) return res.status(400).json({ error: "Falta el nombre de contacto." });
  if (clave.length < 10) {
    return res.status(400).json({ error: "La contraseña necesita al menos 10 caracteres." });
  }
  if (db.prepare("SELECT 1 FROM usuarios WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "Ya hay una cuenta con ese correo." });
  }

  const id = db
    .prepare(
      "INSERT INTO usuarios (email, nombre, empresa, cif, telefono, hash, rol, tarifa_id) VALUES (?,?,?,?,?,?,?,?)",
    )
    .run(
      email,
      nombre,
      empresa,
      String(req.body?.cif || "").trim() || null,
      String(req.body?.telefono || "").trim() || null,
      hashClave(clave),
      rol,
      tarifaId,
    ).lastInsertRowid;

  res.status(201).json({ id });
});

admin.patch("/usuarios/:id", soloAdmin, (req, res) => {
  const id = Number(req.params.id);
  const u = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id);
  if (!u) return res.status(404).json({ error: "No existe ese usuario." });

  /* Nadie puede desactivarse ni degradarse a sí mismo: es la forma más
     habitual de quedarse fuera del panel sin poder volver a entrar. */
  if (id === req.usuario.id && (req.body?.activo === 0 || req.body?.rol)) {
    return res.status(400).json({ error: "No puedes cambiar tu propio rol ni desactivarte." });
  }

  const campos = [];
  const args = [];
  if (req.body?.tarifa_id !== undefined) {
    campos.push("tarifa_id = ?");
    args.push(req.body.tarifa_id === null ? null : Number(req.body.tarifa_id));
  }
  if (req.body?.activo !== undefined) {
    campos.push("activo = ?");
    args.push(req.body.activo ? 1 : 0);
  }
  if (req.body?.rol && ["cliente", "comercial", "admin"].includes(req.body.rol)) {
    campos.push("rol = ?");
    args.push(req.body.rol);
  }
  if (!campos.length) return res.status(400).json({ error: "No hay nada que cambiar." });

  db.prepare(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`).run(...args, id);
  /* Desactivar cierra sus sesiones abiertas al momento. */
  if (req.body?.activo === 0) db.prepare("DELETE FROM sesiones WHERE usuario_id = ?").run(id);
  res.json({ ok: true });
});

admin.get("/tarifas", verPanel, (_req, res) => {
  res.json({ tarifas: db.prepare("SELECT * FROM tarifas ORDER BY descuento_pct").all() });
});

/* ── Productos ────────────────────────────────────────────────────── */
admin.get("/productos", verPanel, (_req, res) => {
  const filas = db
    .prepare(
      `SELECT p.*, pr.nombre AS productor FROM productos p
       LEFT JOIN productores pr ON pr.id = p.productor_id
       ORDER BY p.categoria, p.nombre`,
    )
    .all();
  res.json({ productos: filas });
});

admin.patch("/productos/:id", verPanel, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare("SELECT 1 FROM productos WHERE id = ?").get(id)) {
    return res.status(404).json({ error: "No existe ese producto." });
  }
  const campos = [];
  const args = [];
  if (req.body?.stock !== undefined) {
    const s = Math.floor(Number(req.body.stock));
    if (!Number.isFinite(s) || s < 0) return res.status(400).json({ error: "El stock no puede ser negativo." });
    campos.push("stock = ?");
    args.push(s);
  }
  if (req.body?.precio_base_cent !== undefined) {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ error: "Sólo dirección puede cambiar precios." });
    }
    const c = Math.round(Number(req.body.precio_base_cent));
    if (!Number.isFinite(c) || c <= 0) return res.status(400).json({ error: "El precio debe ser mayor que cero." });
    campos.push("precio_base_cent = ?");
    args.push(c);
  }
  if (req.body?.activo !== undefined) {
    campos.push("activo = ?");
    args.push(req.body.activo ? 1 : 0);
  }
  if (!campos.length) return res.status(400).json({ error: "No hay nada que cambiar." });
  db.prepare(`UPDATE productos SET ${campos.join(", ")} WHERE id = ?`).run(...args, id);
  res.json({ ok: true });
});

/* ── Pedidos ──────────────────────────────────────────────────────── */
const ESTADOS = ["recibido", "preparando", "enviado", "entregado", "anulado"];

admin.patch("/pedidos/:ref", verPanel, (req, res) => {
  const estado = req.body?.estado;
  if (!ESTADOS.includes(estado)) return res.status(400).json({ error: "Ese estado no existe." });
  const p = db.prepare("SELECT * FROM pedidos WHERE referencia = ?").get(req.params.ref);
  if (!p) return res.status(404).json({ error: "No existe ese pedido." });

  /* Anular devuelve el género al stock; si no, el inventario miente. */
  if (estado === "anulado" && p.estado !== "anulado") {
    db.transaction(() => {
      for (const l of db.prepare("SELECT * FROM pedido_lineas WHERE pedido_id = ?").all(p.id)) {
        db.prepare("UPDATE productos SET stock = stock + ? WHERE id = ?").run(l.cantidad, l.producto_id);
      }
      db.prepare("UPDATE pedidos SET estado = ? WHERE id = ?").run(estado, p.id);
    })();
    return res.json({ ok: true, aviso: "Pedido anulado y stock devuelto." });
  }

  db.prepare("UPDATE pedidos SET estado = ? WHERE id = ?").run(estado, p.id);
  res.json({ ok: true });
});
