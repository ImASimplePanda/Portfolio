import { Router } from "express";
import { db } from "../db.js";
import { exigeSesion } from "../sesiones.js";

export const borrador = Router();
borrador.use(exigeSesion);

const leer = db.prepare("SELECT lineas, nota, actualizado FROM borradores WHERE usuario_id = ?");
const guardar = db.prepare(`
  INSERT INTO borradores (usuario_id, lineas, nota, actualizado)
  VALUES (?, ?, ?, datetime('now'))
  ON CONFLICT(usuario_id) DO UPDATE
    SET lineas = excluded.lineas, nota = excluded.nota, actualizado = datetime('now')`);

borrador.get("/", (req, res) => {
  const f = leer.get(req.usuario.id);
  if (!f) return res.json({ lineas: [], nota: "", actualizado: null });
  let lineas = [];
  try {
    const d = JSON.parse(f.lineas);
    if (Array.isArray(d)) lineas = d;
  } catch {
    /* borrador corrupto: se devuelve vacio en vez de reventar */
  }
  res.json({ lineas, nota: f.nota, actualizado: f.actualizado });
});

borrador.put("/", (req, res) => {
  /* Se sanea aqui y no se confia en lo que llegue: solo sku y cantidad,
     enteros positivos, y con un tope para que nadie engorde la tabla. */
  const brutas = Array.isArray(req.body?.lineas) ? req.body.lineas : [];
  const lineas = [];
  for (const l of brutas.slice(0, 200)) {
    const sku = String(l?.sku || "").slice(0, 32);
    const cantidad = Math.floor(Number(l?.cantidad));
    if (sku && Number.isFinite(cantidad) && cantidad > 0) lineas.push({ sku, cantidad });
  }
  const nota = String(req.body?.nota || "").slice(0, 500);
  guardar.run(req.usuario.id, JSON.stringify(lineas), nota);
  const f = leer.get(req.usuario.id);
  res.json({ ok: true, actualizado: f.actualizado });
});

borrador.delete("/", (req, res) => {
  db.prepare("DELETE FROM borradores WHERE usuario_id = ?").run(req.usuario.id);
  res.json({ ok: true });
});
