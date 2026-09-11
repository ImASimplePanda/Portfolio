import { Router } from "express";
import { db, precioPara } from "../db.js";
import { exigeSesion } from "../sesiones.js";

export const pedidos = Router();
pedidos.use(exigeSesion);

function referencia() {
  const d = new Date();
  const mes = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const n = db.prepare("SELECT COUNT(*) c FROM pedidos").get().c + 1;
  return `ALM-${mes}-${String(n).padStart(4, "0")}`;
}

const lineasDe = db.prepare(`
  SELECT l.*, p.sku, p.nombre, p.formato
  FROM pedido_lineas l JOIN productos p ON p.id = l.producto_id
  WHERE l.pedido_id = ?`);

pedidos.post("/", (req, res) => {
  const lineas = Array.isArray(req.body?.lineas) ? req.body.lineas : [];
  if (!lineas.length) return res.status(400).json({ error: "El pedido está vacío." });

  /* Todo dentro de una transacción: si una línea falla por stock, no se
     queda medio pedido grabado ni stock descontado a medias. */
  try {
    const resultado = db.transaction(() => {
      const ref = referencia();
      const pedidoId = db
        .prepare("INSERT INTO pedidos (referencia, usuario_id, nota, total_cent) VALUES (?,?,?,0)")
        .run(ref, req.usuario.id, String(req.body?.nota || "").slice(0, 500)).lastInsertRowid;

      const insLinea = db.prepare(
        "INSERT INTO pedido_lineas (pedido_id, producto_id, cantidad, precio_cent, iva_pct) VALUES (?,?,?,?,?)",
      );
      let total = 0;

      for (const l of lineas) {
        const cant = Math.floor(Number(l.cantidad));
        if (!Number.isFinite(cant) || cant < 1) {
          throw new Error("Hay una cantidad que no es un número entero positivo.");
        }
        const p = db.prepare("SELECT * FROM productos WHERE sku = ? AND activo = 1").get(String(l.sku));
        if (!p) throw new Error(`El producto ${l.sku} ya no está disponible.`);
        if (p.stock < cant) {
          throw new Error(`Sólo quedan ${p.stock} de ${p.nombre}. Ajusta la cantidad.`);
        }

        /* El precio se recalcula EN EL SERVIDOR a partir del acuerdo del
           cliente. Nunca se acepta el que mande el navegador: si no, se
           podría pedir a cualquier precio manipulando la petición. */
        const { cent } = precioPara(req.usuario.id, p);
        insLinea.run(pedidoId, p.id, cant, cent, p.iva_pct);
        db.prepare("UPDATE productos SET stock = stock - ? WHERE id = ?").run(cant, p.id);
        total += cent * cant;
      }

      db.prepare("UPDATE pedidos SET total_cent = ? WHERE id = ?").run(total, pedidoId);
      /* el borrador ya es un pedido: deja de existir */
      db.prepare("DELETE FROM borradores WHERE usuario_id = ?").run(req.usuario.id);
      return { ref, total };
    })();

    res.status(201).json({ pedido: resultado });
  } catch (e) {
    res.status(409).json({ error: e.message });
  }
});

pedidos.get("/", (req, res) => {
  /* Un comercial o el admin ven todos; un cliente, sólo los suyos. */
  const todos = req.usuario.rol !== "cliente";
  const filas = db
    .prepare(
      `SELECT pe.*, u.empresa, u.nombre AS contacto
       FROM pedidos pe JOIN usuarios u ON u.id = pe.usuario_id
       ${todos ? "" : "WHERE pe.usuario_id = ?"}
       ORDER BY pe.creado DESC, pe.id DESC`,
    )
    .all(...(todos ? [] : [req.usuario.id]));
  res.json({ pedidos: filas });
});

pedidos.get("/:ref", (req, res) => {
  const p = db.prepare("SELECT * FROM pedidos WHERE referencia = ?").get(req.params.ref);
  if (!p) return res.status(404).json({ error: "No existe ese pedido." });
  if (req.usuario.rol === "cliente" && p.usuario_id !== req.usuario.id) {
    /* 404 y no 403: un 403 confirmaría que la referencia existe. */
    return res.status(404).json({ error: "No existe ese pedido." });
  }
  res.json({ pedido: { ...p, lineas: lineasDe.all(p.id) } });
});
