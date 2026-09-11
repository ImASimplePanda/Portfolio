import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { hashClave } from "./auth.js";

const aqui = dirname(fileURLToPath(import.meta.url));
const carpetaDatos = join(aqui, "..", "datos");
mkdirSync(carpetaDatos, { recursive: true });

export const db = new Database(join(carpetaDatos, "almogaren.db"));

/* WAL permite leer mientras se escribe: en un portal donde varios comerciales
   consultan mientras alguien mete un pedido, evita bloqueos. */
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ═══════════════════════════════════════════════════════════════════
   Esquema
   El dinero se guarda SIEMPRE en céntimos enteros. Un precio en coma
   flotante acaba dando 0,1 + 0,2 = 0,30000000000000004 en una factura.
   ═══════════════════════════════════════════════════════════════════ */
db.exec(`
CREATE TABLE IF NOT EXISTS tarifas (
  id            INTEGER PRIMARY KEY,
  nombre        TEXT NOT NULL UNIQUE,
  descuento_pct REAL NOT NULL DEFAULT 0,
  nota          TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id         INTEGER PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nombre     TEXT NOT NULL,
  empresa    TEXT,
  cif        TEXT,
  telefono   TEXT,
  hash       TEXT NOT NULL,
  rol        TEXT NOT NULL DEFAULT 'cliente'
             CHECK (rol IN ('cliente','comercial','admin')),
  tarifa_id  INTEGER REFERENCES tarifas(id),
  activo     INTEGER NOT NULL DEFAULT 1,
  creado     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS productores (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT NOT NULL,
  zona    TEXT NOT NULL,
  nota    TEXT
);

CREATE TABLE IF NOT EXISTS productos (
  id               INTEGER PRIMARY KEY,
  sku              TEXT NOT NULL UNIQUE,
  nombre           TEXT NOT NULL,
  categoria        TEXT NOT NULL,
  productor_id     INTEGER REFERENCES productores(id),
  formato          TEXT NOT NULL,
  unidad_caja      INTEGER NOT NULL DEFAULT 1,
  precio_base_cent INTEGER NOT NULL,
  iva_pct          REAL NOT NULL DEFAULT 3,
  stock            INTEGER NOT NULL DEFAULT 0,
  sello            TEXT,
  nota_cata        TEXT,
  activo           INTEGER NOT NULL DEFAULT 1
);

/* Precio negociado para un cliente concreto: manda sobre la tarifa.
   Es la razón de ser del acceso privado. */
CREATE TABLE IF NOT EXISTS precios_cliente (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  precio_cent INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, producto_id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id          INTEGER PRIMARY KEY,
  referencia  TEXT NOT NULL UNIQUE,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
  estado      TEXT NOT NULL DEFAULT 'recibido'
              CHECK (estado IN ('recibido','preparando','enviado','entregado','anulado')),
  nota        TEXT,
  total_cent  INTEGER NOT NULL DEFAULT 0,
  creado      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pedido_lineas (
  id           INTEGER PRIMARY KEY,
  pedido_id    INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id  INTEGER NOT NULL REFERENCES productos(id),
  cantidad     INTEGER NOT NULL CHECK (cantidad > 0),
  precio_cent  INTEGER NOT NULL,
  iva_pct      REAL NOT NULL
);

/* Borrador de pedido, uno por cliente. Vive en su cuenta y no en el
   navegador: sobrevive a cerrar sesion y se puede retomar desde otro
   equipo. Se guardan SOLO sku y cantidad; el precio se calcula al
   mostrarlo y al confirmar, asi nunca queda un importe viejo grabado. */
CREATE TABLE IF NOT EXISTS borradores (
  usuario_id  INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  lineas      TEXT NOT NULL DEFAULT '[]',
  nota        TEXT NOT NULL DEFAULT '',
  actualizado TEXT NOT NULL DEFAULT (datetime('now'))
);

/* El token no se guarda en claro: si alguien lee la base, no puede
   suplantar sesiones abiertas. */
CREATE TABLE IF NOT EXISTS sesiones (
  token_hash TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creada     TEXT NOT NULL DEFAULT (datetime('now')),
  expira     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prod_cat    ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_prod_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_ped_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ses_usuario ON sesiones(usuario_id);
`);

/* ═══════════════════════════════════════════════════════════════════
   Precio efectivo de un producto para un cliente
   Orden: precio negociado > tarifa del cliente > precio base.
   ═══════════════════════════════════════════════════════════════════ */
export function precioPara(usuarioId, producto) {
  const negociado = usuarioId
    ? db
        .prepare("SELECT precio_cent FROM precios_cliente WHERE usuario_id = ? AND producto_id = ?")
        .get(usuarioId, producto.id)
    : null;
  if (negociado) return { cent: negociado.precio_cent, origen: "negociado" };

  const u = usuarioId
    ? db
        .prepare("SELECT t.descuento_pct FROM usuarios u LEFT JOIN tarifas t ON t.id = u.tarifa_id WHERE u.id = ?")
        .get(usuarioId)
    : null;
  const dto = u?.descuento_pct ?? 0;
  if (dto > 0) {
    return { cent: Math.round(producto.precio_base_cent * (1 - dto / 100)), origen: "tarifa", dto };
  }
  return { cent: producto.precio_base_cent, origen: "base" };
}

/* ═══════════════════════════════════════════════════════════════════
   Semilla — DATOS DE DEMOSTRACIÓN
   Los tipos de producto y los sellos (DOP, IGP) son reales y de Gran
   Canaria. Los productores, los precios, el stock y los clientes son
   inventados. No corresponden a ninguna empresa existente.
   ═══════════════════════════════════════════════════════════════════ */
export function sembrar() {
  const hay = db.prepare("SELECT COUNT(*) c FROM productos").get().c;
  if (hay > 0) return false;

  const tx = db.transaction(() => {
    const tarifa = db.prepare("INSERT INTO tarifas (nombre, descuento_pct, nota) VALUES (?,?,?)");
    const tGeneral = tarifa.run("General", 0, "Sin acuerdo de volumen").lastInsertRowid;
    const tHosteleria = tarifa.run("Hostelería", 8, "A partir de 300 € / mes").lastInsertRowid;
    const tCadena = tarifa.run("Cadena hotelera", 15, "Contrato anual").lastInsertRowid;

    const prod = db.prepare("INSERT INTO productores (nombre, zona, nota) VALUES (?,?,?)");
    const P = {
      guia: prod.run("Quesería Los Llanetes", "Santa María de Guía", "Cuajo vegetal de flor de cardo, elaboración diaria").lastInsertRowid,
      agaete: prod.run("Tostadero Barranco Alto", "Valle de Agaete", "Cultivo bajo naranjos, tueste natural").lastInsertRowid,
      bodega: prod.run("Bodega Vega de Enmedio", "Monte Lentiscal", "Viñedo en espaldera entre 400 y 700 m").lastInsertRowid,
      sal: prod.run("Salinera del Sureste", "Pozo Izquierdo", "Recogida a mano en tablero de barro").lastInsertRowid,
      miel: prod.run("Colmenas de Tirajana", "San Bartolomé de Tirajana", "Trashumancia entre costa y cumbre").lastInsertRowid,
      gofio: prod.run("Molino de Cuatro Puertas", "Telde", "Molienda en piedra, millo tostado en el día").lastInsertRowid,
      huerta: prod.run("Huerta de Valsequillo", "Valsequillo", "Variedades antiguas recuperadas").lastInsertRowid,
    };

    const p = db.prepare(`INSERT INTO productos
      (sku, nombre, categoria, productor_id, formato, unidad_caja, precio_base_cent, iva_pct, stock, sello, nota_cata)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

    const cat = [
      ["QFG-001", "Queso de Flor de Guía curado", "Quesos", P.guia, "Pieza 2,8 kg aprox.", 1, 4850, 3, 34, "DOP", "Cuajo de flor de cardo. Pasta blanda, amargor limpio al final."],
      ["QFG-002", "Queso de Media Flor semicurado", "Quesos", P.guia, "Pieza 1,4 kg aprox.", 2, 2390, 3, 61, "DOP", "Mezcla de cuajo animal y vegetal. Más dócil, para carta de tapas."],
      ["QFG-003", "Queso tierno de leche cruda", "Quesos", P.guia, "Pieza 900 g", 4, 1180, 3, 88, null, "Quince días de cura. Se funde bien a la plancha."],
      ["CAF-001", "Café de Agaete, tueste natural", "Café", P.agaete, "Bolsa 250 g grano", 12, 1490, 3, 120, null, "Typica. Taza baja en acidez, retrogusto a fruta seca."],
      ["CAF-002", "Café de Agaete, molido para filtro", "Café", P.agaete, "Bolsa 250 g", 12, 1490, 3, 74, null, "Mismo lote, molienda media."],
      ["VIN-001", "Tinto listán negro, barrica", "Vinos", P.bodega, "Botella 75 cl", 6, 1180, 3, 210, "DO Gran Canaria", "Seis meses en roble francés. Fruta roja y fondo volcánico."],
      ["VIN-002", "Blanco malvasía volcánica seco", "Vinos", P.bodega, "Botella 75 cl", 6, 1340, 3, 156, "DO Gran Canaria", "Cítrico y salino. Aguanta pescado azul."],
      ["VIN-003", "Tinto joven de maceración", "Vinos", P.bodega, "Botella 75 cl", 6, 890, 3, 240, "DO Gran Canaria", "Sin madera. Para copeo y menú del día."],
      ["SAL-001", "Sal marina en escamas", "Sal y conservas", P.sal, "Tarro 150 g", 12, 480, 3, 300, null, "Flor de sal de tablero. Para acabado en mesa."],
      ["SAL-002", "Sal marina gruesa", "Sal y conservas", P.sal, "Saco 1 kg", 10, 320, 3, 180, null, "Para horno y salazón."],
      ["MIE-001", "Miel de retama del Teide", "Miel", P.miel, "Tarro 500 g", 12, 1120, 3, 64, "DOP", "Cristalización fina, floral muy marcado."],
      ["MIE-002", "Miel de tedera de medianías", "Miel", P.miel, "Tarro 500 g", 12, 890, 3, 92, "DOP", "Suave, ámbar claro. La más versátil en cocina."],
      ["GOF-001", "Gofio de millo tostado", "Gofio y legumbre", P.gofio, "Bolsa 1 kg", 10, 390, 3, 210, "IGP", "Molienda en piedra. Punto de tueste medio."],
      ["GOF-002", "Gofio de trigo y millo", "Gofio y legumbre", P.gofio, "Bolsa 1 kg", 10, 420, 3, 145, "IGP", "Mezcla tradicional, más dulce."],
      ["HUE-001", "Papa antigua bonita negra", "Huerta", P.huerta, "Caja 5 kg", 1, 1850, 3, 40, "IGP", "Temporada corta. Piel oscura, carne amarilla intensa."],
      ["HUE-002", "Almendra de Valsequillo cruda", "Huerta", P.huerta, "Bolsa 1 kg", 6, 1690, 3, 55, null, "Variedad local, calibre pequeño. Para bienmesabe."],
      ["HUE-003", "Mojo rojo picón artesano", "Sal y conservas", P.huerta, "Tarro 200 ml", 12, 340, 3, 260, null, "Pimienta palmera. Pica de verdad."],
      ["HUE-004", "Mojo verde de cilantro", "Sal y conservas", P.huerta, "Tarro 200 ml", 12, 320, 3, 275, null, "Sin conservantes. Caducidad corta, servir en frío."],
    ];
    for (const fila of cat) p.run(...fila);

    const u = db.prepare(
      "INSERT INTO usuarios (email, nombre, empresa, cif, telefono, hash, rol, tarifa_id) VALUES (?,?,?,?,?,?,?,?)",
    );
    const admin = u.run("admin@almogaren.test", "Dirección", "Almogarén", "B00000000", "", hashClave("almogaren"), "admin", null).lastInsertRowid;
    u.run("comercial@almogaren.test", "Equipo comercial", "Almogarén", null, "", hashClave("almogaren"), "comercial", null);
    const c1 = u.run("compras@hotelmaspalomas.test", "Nayra Suárez", "Hotel Dunas de Maspalomas", "B35000001", "", hashClave("almogaren"), "cliente", tCadena).lastInsertRowid;
    const c2 = u.run("pedidos@restaurantevegueta.test", "Airam Déniz", "Taberna de Vegueta", "B35000002", "", hashClave("almogaren"), "cliente", tHosteleria).lastInsertRowid;
    u.run("hola@tiendateror.test", "Yaiza Ramírez", "Ultramarinos Teror", "B35000003", "", hashClave("almogaren"), "cliente", tGeneral);

    /* precio negociado: la cadena tiene cerrado el queso curado por contrato */
    const pid = db.prepare("SELECT id FROM productos WHERE sku = 'QFG-001'").get().id;
    db.prepare("INSERT INTO precios_cliente (usuario_id, producto_id, precio_cent) VALUES (?,?,?)")
      .run(c1, pid, 3990);

    /* un pedido de ejemplo para que el panel no arranque vacío */
    const ped = db.prepare("INSERT INTO pedidos (referencia, usuario_id, estado, nota, total_cent) VALUES (?,?,?,?,?)")
      .run("ALM-2609-0001", c2, "preparando", "Entregar antes de las 11:00", 0).lastInsertRowid;
    const linea = db.prepare("INSERT INTO pedido_lineas (pedido_id, producto_id, cantidad, precio_cent, iva_pct) VALUES (?,?,?,?,?)");
    let total = 0;
    for (const [sku, cant] of [["VIN-001", 12], ["QFG-002", 4], ["SAL-001", 6]]) {
      const pr = db.prepare("SELECT * FROM productos WHERE sku = ?").get(sku);
      const { cent } = precioPara(c2, pr);
      linea.run(ped, pr.id, cant, cent, pr.iva_pct);
      total += cent * cant;
    }
    db.prepare("UPDATE pedidos SET total_cent = ? WHERE id = ?").run(total, ped);

    return admin;
  });

  tx();
  return true;
}
