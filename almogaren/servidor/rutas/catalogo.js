import { Router } from "express";
import { db, precioPara } from "../db.js";

export const catalogo = Router();

/* El catálogo público enseña QUÉ hay; los precios sólo tras iniciar sesión.
   No es un adorno: en mayorista el precio depende del acuerdo de cada
   cliente, así que un precio público sería falso para casi todos. */
function conPrecio(p, usuario) {
  const base = {
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    categoria: p.categoria,
    formato: p.formato,
    unidad_caja: p.unidad_caja,
    sello: p.sello,
    nota_cata: p.nota_cata,
    productor: p.productor,
    zona: p.zona,
    stock: p.stock,
    iva_pct: p.iva_pct,
  };
  if (!usuario) return { ...base, precio: null };
  const { cent, origen, dto } = precioPara(usuario.id, p);
  return {
    ...base,
    precio: { cent, origen, dto: dto ?? 0, base_cent: p.precio_base_cent },
  };
}

const SQL_PROD = `
  SELECT p.*, pr.nombre AS productor, pr.zona
  FROM productos p
  LEFT JOIN productores pr ON pr.id = p.productor_id
  WHERE p.activo = 1`;

catalogo.get("/productos", (req, res) => {
  const { categoria, buscar } = req.query;
  let sql = SQL_PROD;
  const args = [];
  if (categoria) {
    sql += " AND p.categoria = ?";
    args.push(categoria);
  }
  if (buscar) {
    sql += " AND (p.nombre LIKE ? OR p.sku LIKE ? OR pr.nombre LIKE ?)";
    const t = `%${buscar}%`;
    args.push(t, t, t);
  }
  sql += " ORDER BY p.categoria, p.nombre";
  const filas = db.prepare(sql).all(...args);
  res.json({ productos: filas.map((p) => conPrecio(p, req.usuario)) });
});

catalogo.get("/productos/:sku", (req, res) => {
  const p = db.prepare(`${SQL_PROD} AND p.sku = ?`).get(req.params.sku);
  if (!p) return res.status(404).json({ error: "Ese producto no existe o ya no está activo." });
  res.json({ producto: conPrecio(p, req.usuario) });
});

catalogo.get("/categorias", (_req, res) => {
  const filas = db
    .prepare("SELECT categoria, COUNT(*) n FROM productos WHERE activo = 1 GROUP BY categoria ORDER BY categoria")
    .all();
  res.json({ categorias: filas });
});

catalogo.get("/productores", (_req, res) => {
  const filas = db
    .prepare(
      `SELECT pr.*, COUNT(p.id) AS productos
       FROM productores pr LEFT JOIN productos p ON p.productor_id = pr.id AND p.activo = 1
       GROUP BY pr.id ORDER BY pr.nombre`,
    )
    .all();
  res.json({ productores: filas });
});
