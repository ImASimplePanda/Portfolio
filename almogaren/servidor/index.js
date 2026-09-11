import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

import { sembrar } from "./db.js";
import { conUsuario, limpiarCaducadas } from "./sesiones.js";
import { cuenta } from "./rutas/cuenta.js";
import { catalogo } from "./rutas/catalogo.js";
import { pedidos } from "./rutas/pedidos.js";
import { borrador } from "./rutas/borrador.js";
import { admin } from "./rutas/admin.js";

const aqui = dirname(fileURLToPath(import.meta.url));
/* Variable propia y no PORT: hay lanzadores (el panel de vista previa,
   algunos PaaS) que inyectan PORT para el servidor web, y la API acababa
   intentando levantarse en el puerto de Vite. */
const PUERTO = Number(process.env.PORT_API || 5190);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); // para que req.ip sea el real detrás de un proxy

app.use(express.json({ limit: "128kb" }));

/* Lector de cookies mínimo: no merece una dependencia para esto. */
app.use((req, _res, next) => {
  req.cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const i = c.indexOf("=");
        return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
      }),
  );
  next();
});

/* Cabeceras de seguridad. Sin dependencias: son cuatro líneas y así se ve
   qué hace cada una en vez de confiar en una caja negra. */
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

app.use(conUsuario);

app.use("/api", cuenta);
app.use("/api", catalogo);
app.use("/api/pedidos", pedidos);
app.use("/api/borrador", borrador);
app.use("/api/admin", admin);

app.get("/api/salud", (_req, res) => res.json({ ok: true, hora: new Date().toISOString() }));

/* En producción el mismo proceso sirve el cliente ya compilado.
   En desarrollo lo sirve Vite y esto no se usa. */
const dist = join(aqui, "..", "dist");
if (existsSync(dist)) {
  app.use(express.static(dist, { maxAge: "1h" }));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(join(dist, "index.html")));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  /* Nunca devolvemos el error interno al navegador: filtra rutas de
     ficheros y consultas SQL. */
  res.status(500).json({ error: "Algo ha fallado por nuestra parte." });
});

const nuevo = sembrar();
limpiarCaducadas();
setInterval(limpiarCaducadas, 3600_000).unref();

app.listen(PUERTO, () => {
  console.log(`Almogarén · API en http://localhost:${PUERTO}`);
  if (nuevo) {
    console.log("Base de datos creada con datos de demostración.");
    console.log("  admin@almogaren.test               · almogaren  (dirección)");
    console.log("  comercial@almogaren.test           · almogaren  (comercial)");
    console.log("  compras@hotelmaspalomas.test       · almogaren  (cliente, -15 %)");
    console.log("  pedidos@restaurantevegueta.test    · almogaren  (cliente, -8 %)");
    console.log("  hola@tiendateror.test              · almogaren  (cliente, tarifa general)");
  }
});
