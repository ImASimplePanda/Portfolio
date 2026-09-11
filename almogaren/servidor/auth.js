import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";

/* Sin dependencias externas y sin base de datos: este módulo sólo sabe de
   criptografía, así que db.js puede importarlo sin ciclos. */

const N = 16384; // coste de CPU/memoria: ~100 ms por hash en un portátil
const r = 8;
const p = 1;
const LARGO = 64;

/** Devuelve un texto autocontenido: parámetros + sal + hash.
 *  Guardar los parámetros permite subir el coste en el futuro sin
 *  invalidar las claves ya existentes. */
export function hashClave(clave) {
  const sal = randomBytes(16);
  const h = scryptSync(clave, sal, LARGO, { N, r, p, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${sal.toString("base64")}$${h.toString("base64")}`;
}

/** Comparación en tiempo constante: comparar con === filtra información
 *  sobre cuántos bytes coinciden. */
export function verificarClave(clave, guardado) {
  try {
    const [alg, n, rr, pp, sal64, h64] = String(guardado).split("$");
    if (alg !== "scrypt") return false;
    const sal = Buffer.from(sal64, "base64");
    const esperado = Buffer.from(h64, "base64");
    const calculado = scryptSync(clave, sal, esperado.length, {
      N: Number(n),
      r: Number(rr),
      p: Number(pp),
      maxmem: 64 * 1024 * 1024,
    });
    return timingSafeEqual(esperado, calculado);
  } catch {
    return false;
  }
}

/** Token de sesión: 32 bytes de aleatoriedad criptográfica.
 *  Al cliente le damos el token en claro (en cookie httpOnly); en la base
 *  guardamos sólo su hash, para que leer la base no permita suplantar. */
export function nuevoToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export const hashToken = (t) => createHash("sha256").update(t).digest("hex");

/* ── Freno de fuerza bruta ──────────────────────────────────────────
   En memoria a propósito: es suficiente para un portal de un solo
   proceso y no añade infraestructura. Si algún día corre en varios
   procesos, esto hay que mover a la base o a Redis. */
const intentos = new Map();
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 8;

export function puedeIntentar(clave) {
  const ahora = Date.now();
  const reg = intentos.get(clave);
  if (!reg || ahora - reg.desde > VENTANA_MS) return { ok: true, quedan: MAX_INTENTOS };
  return { ok: reg.n < MAX_INTENTOS, quedan: Math.max(0, MAX_INTENTOS - reg.n) };
}

export function apuntarFallo(clave) {
  const ahora = Date.now();
  const reg = intentos.get(clave);
  if (!reg || ahora - reg.desde > VENTANA_MS) intentos.set(clave, { n: 1, desde: ahora });
  else reg.n += 1;
}

export function limpiarIntentos(clave) {
  intentos.delete(clave);
}
