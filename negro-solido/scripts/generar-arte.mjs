// Genera los diseños del estudio (blackwork, dotwork y geometría) como SVG.
// Mismo seed = mismo diseño. Uso: node scripts/generar-arte.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "arte");
mkdirSync(OUT, { recursive: true });

const TINTA = "#151313";
const ROJO = "#e0371f";
const PAPEL = "#ebe8e2";
const f = (n) => +n.toFixed(1);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const P = (p) => `${f(p[0])} ${f(p[1])}`;

/* ---------- piezas básicas ---------- */
const circulo = (cx, cy, r, sw = 2, fill = "none", stroke = TINTA) =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const punto = (cx, cy, r, c = TINTA) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${c}"/>`;

function anilloPuntos(cx, cy, r, n, s, c = TINTA) {
  let o = "";
  for (let i = 0; i < n; i++) { const [x, y] = pol(cx, cy, r, (i / n) * Math.PI * 2); o += punto(x, y, s, c); }
  return o;
}
function petalos(cx, cy, r0, r1, n, rnd, { relleno = false, doble = true, giro = 0, color = TINTA } = {}) {
  let o = "";
  const ancho = (Math.PI / n) * (0.75 + rnd() * 0.5);
  const rm = r0 + (r1 - r0) * (0.45 + rnd() * 0.2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + giro;
    const b = pol(cx, cy, r0, a), t = pol(cx, cy, r1, a);
    const c1 = pol(cx, cy, rm, a - ancho), c2 = pol(cx, cy, rm, a + ancho);
    o += `<path d="M${P(b)}Q${P(c1)} ${P(t)}Q${P(c2)} ${P(b)}Z" fill="${relleno ? color : "none"}" stroke="${color}" stroke-width="2"/>`;
    if (doble && !relleno) {
      const t2 = pol(cx, cy, r0 + (r1 - r0) * 0.7, a);
      const d1 = pol(cx, cy, r0 + (rm - r0) * 0.9, a - ancho * 0.5), d2 = pol(cx, cy, r0 + (rm - r0) * 0.9, a + ancho * 0.5);
      o += `<path d="M${P(b)}Q${P(d1)} ${P(t2)}Q${P(d2)} ${P(b)}Z" fill="${TINTA}"/>`;
    }
  }
  return o;
}
function dientes(cx, cy, r0, r1, n, giro = 0, color = TINTA) {
  let o = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + giro, w = Math.PI / n;
    o += `<path d="M${P(pol(cx, cy, r0, a - w))}L${P(pol(cx, cy, r1, a))}L${P(pol(cx, cy, r0, a + w))}Z" fill="${color}"/>`;
  }
  return o;
}
function festones(cx, cy, r, n, prof) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
    const p0 = pol(cx, cy, r, a0), p1 = pol(cx, cy, r, a1), c = pol(cx, cy, r + prof, am);
    d += `${i ? "" : `M${P(p0)}`}Q${P(c)} ${P(p1)}`;
  }
  return `<path d="${d}Z" fill="none" stroke="${TINTA}" stroke-width="2"/>`;
}
function rayos(cx, cy, r0, r1, n, sw = 1.4) {
  let d = "";
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; d += `M${P(pol(cx, cy, r0, a))}L${P(pol(cx, cy, r1, a))}`; }
  return `<path d="${d}" stroke="${TINTA}" stroke-width="${sw}"/>`;
}
// puntillismo: densidad según una función 0..1
function puntillismo(rnd, n, dentro, densidad, rmin = 0.9, rmax = 1.9) {
  let o = "", hechos = 0, intentos = 0;
  while (hechos < n && intentos < n * 30) {
    intentos++;
    const x = rnd() * 400, y = rnd() * 400;
    if (!dentro(x, y)) continue;
    if (rnd() > densidad(x, y)) continue;
    o += punto(x, y, rmin + rnd() * (rmax - rmin));
    hechos++;
  }
  return o;
}
const estrella = (x, y, r) =>
  `<path d="M${f(x)} ${f(y - r)}Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y + r)}Q${f(x)} ${f(y)} ${f(x - r)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y - r)}Z" fill="${TINTA}"/>`;

/* ---------- familias ---------- */
function mandala(seed) {
  const rnd = rng(seed), cx = 200, cy = 200;
  const rojo = rnd() < 0.45;
  let o = "", r = 14 + rnd() * 8;
  o += punto(cx, cy, r * 0.55, rojo ? ROJO : TINTA) + circulo(cx, cy, r, 2);
  const tipos = ["petalos", "puntos", "dientes", "festones", "rayos", "doble", "negativo", "petalosR"];
  let ultimo = "";
  while (r < 168) {
    let t = tipos[Math.floor(rnd() * tipos.length)];
    if (t === ultimo) t = tipos[(tipos.indexOf(t) + 1) % tipos.length];
    ultimo = t;
    const paso = 14 + rnd() * 18, n = [8, 12, 16, 24, 32][Math.floor(rnd() * 5)];
    const r1 = Math.min(180, r + paso);
    if (t === "petalos") o += petalos(cx, cy, r, r1 + 6, n, rnd);
    else if (t === "petalosR") o += petalos(cx, cy, r, r1 + 4, n, rnd, { relleno: true, color: rojo && rnd() < 0.5 ? ROJO : TINTA });
    else if (t === "puntos") o += anilloPuntos(cx, cy, (r + r1) / 2, n * 2, 1.6 + rnd() * 2.2);
    else if (t === "dientes") o += dientes(cx, cy, r, r1, n, rnd() < 0.5 ? 0 : Math.PI / n);
    else if (t === "festones") o += festones(cx, cy, r + 2, n, paso * 0.7);
    else if (t === "rayos") o += rayos(cx, cy, r + 2, r1, n * 3, 1.2);
    else if (t === "doble") o += circulo(cx, cy, r + 3, 1.4) + circulo(cx, cy, r1 - 3, 3);
    else if (t === "negativo") {
      const rm = (r + r1) / 2, w = r1 - r;
      o += circulo(cx, cy, rm, w, "none") + anilloPuntos(cx, cy, rm, n * 2, Math.min(3.2, w / 4), PAPEL);
    }
    o += circulo(cx, cy, r1, 1.6);
    r = r1 + 3 + rnd() * 5;
  }
  o += anilloPuntos(cx, cy, r + 8, 48, 2.2);
  return { o, w: 400, h: 400 };
}

function geometria(seed) {
  const rnd = rng(seed), cx = 200, cy = 200, R = 46 + rnd() * 10;
  let o = "";
  const centros = [[cx, cy]];
  for (let i = 0; i < 6; i++) centros.push(pol(cx, cy, R, (i / 6) * Math.PI * 2 + Math.PI / 6));
  if (rnd() < 0.6) for (let i = 0; i < 6; i++) centros.push(pol(cx, cy, R * Math.sqrt(3), (i / 6) * Math.PI * 2));
  centros.forEach(([x, y]) => (o += circulo(x, y, R, 1.3)));
  o += circulo(cx, cy, R * 2.05, 2.4) + circulo(cx, cy, R * 2.05 + 8, 1.2);
  // hexagrama
  const tri = (giro, fill) => {
    const pts = [0, 1, 2].map((i) => pol(cx, cy, R * 2.05, giro + (i / 3) * Math.PI * 2));
    return `<path d="M${P(pts[0])}L${P(pts[1])}L${P(pts[2])}Z" fill="${fill}" stroke="${TINTA}" stroke-width="2.2"/>`;
  };
  o += tri(-Math.PI / 2, "none") + tri(Math.PI / 2, "none");
  if (rnd() < 0.5) {
    const pts = [0, 1, 2].map((i) => pol(cx, cy, R * 0.9, -Math.PI / 2 + (i / 3) * Math.PI * 2));
    o += `<path d="M${P(pts[0])}L${P(pts[1])}L${P(pts[2])}Z" fill="${TINTA}"/>`;
    o += punto(cx, cy + 4, 7, rnd() < 0.5 ? ROJO : PAPEL);
  } else o += punto(cx, cy, 10, TINTA) + circulo(cx, cy, 18, 1.4);
  // vértices
  for (let i = 0; i < 6; i++) { const [x, y] = pol(cx, cy, R * 2.05, (i / 6) * Math.PI * 2 + Math.PI / 6); o += punto(x, y, 4.5); }
  o += anilloPuntos(cx, cy, R * 2.05 + 22, 72, 1.6);
  // ejes y lunas pequeñas
  o += `<path d="M${cx} ${f(cy - R * 2.05 - 40)}V${f(cy - R * 2.05 - 8)}M${cx} ${f(cy + R * 2.05 + 8)}V${f(cy + R * 2.05 + 40)}" stroke="${TINTA}" stroke-width="1.6"/>`;
  o += punto(cx, cy - R * 2.05 - 46, 5) + punto(cx, cy + R * 2.05 + 46, 5);
  return { o, w: 400, h: 400 };
}

function luna(seed) {
  const rnd = rng(seed), cx = 200, cy = 196, R = 96 + rnd() * 14;
  const lado = rnd() < 0.5 ? -1 : 1;
  let o = circulo(cx, cy, R, 2.2);
  o += puntillismo(rnd, 2600, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 < (R - 3) ** 2,
    (x) => Math.max(0.02, Math.min(1, 0.5 + (lado * (x - cx)) / R * 0.75)) ** 1.6, 0.8, 1.7);
  // cráteres
  for (let i = 0; i < 5; i++) { const a = rnd() * 6.28, d = rnd() * R * 0.6; const [x, y] = pol(cx, cy, d, a); o += circulo(x, y, 6 + rnd() * 12, 1.2, PAPEL); }
  // órbitas y estrellas
  o += circulo(cx, cy, R + 26, 1.2) + `<circle cx="${cx}" cy="${cy}" r="${f(R + 44)}" fill="none" stroke="${TINTA}" stroke-width="1.2" stroke-dasharray="2 7"/>`;
  const [px, py] = pol(cx, cy, R + 26, rnd() * 6.28); o += punto(px, py, 6, ROJO);
  for (let i = 0; i < 7; i++) { const a = rnd() * 6.28, d = R + 60 + rnd() * 26; const [x, y] = pol(cx, cy, d, a); o += estrella(x, y, 5 + rnd() * 9); }
  o += rayos(cx, cy, R + 6, R + 18, 60, 1.1);
  return { o, w: 400, h: 400 };
}

function polilla(seed) {
  const rnd = rng(seed), cx = 200, cy = 210;
  let alas = "";
  const ala = (s) => {
    const ax = 150 + rnd() * 20, ay = -100 - rnd() * 30;
    const sup = `M${cx} ${cy - 30}C${cx + s * 40} ${cy - 110} ${cx + s * ax} ${cy + ay} ${cx + s * (ax + 20)} ${cy - 40}C${cx + s * (ax - 10)} ${cy - 10} ${cx + s * 70} ${cy + 4} ${cx} ${cy}Z`;
    const inf = `M${cx} ${cy}C${cx + s * 70} ${cy + 10} ${cx + s * 130} ${cy + 40} ${cx + s * 110} ${cy + 110}C${cx + s * 80} ${cy + 150} ${cx + s * 30} ${cy + 90} ${cx} ${cy + 40}Z`;
    let o = `<path d="${sup}" fill="none" stroke="${TINTA}" stroke-width="2.4"/><path d="${inf}" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`;
    o += `<g transform="translate(${cx} ${cy - 20}) scale(0.62) translate(${-cx} ${-cy + 20})"><path d="${sup}" fill="${TINTA}"/></g>`;
    o += `<g transform="translate(${cx} ${cy + 30}) scale(0.55) translate(${-cx} ${-cy - 30})"><path d="${inf}" fill="none" stroke="${TINTA}" stroke-width="2"/></g>`;
    // ojo del ala inferior
    o += circulo(cx + s * 72, cy + 62, 13, 2) + punto(cx + s * 72, cy + 62, 6, rnd() < 0.4 ? ROJO : TINTA);
    // puntos del borde
    for (let i = 0; i < 9; i++) { const t = i / 8; o += punto(cx + s * (60 + t * (ax - 30)), cy - 60 - Math.sin(t * Math.PI) * 50 + t * 10, 2.4); }
    return o;
  };
  alas += ala(1) + ala(-1);
  // cuerpo y antenas
  let cuerpo = `<ellipse cx="${cx}" cy="${cy + 10}" rx="11" ry="52" fill="${TINTA}"/>`;
  for (let i = 0; i < 6; i++) cuerpo += `<path d="M${cx - 10} ${cy + i * 12 - 10}H${cx + 10}" stroke="${PAPEL}" stroke-width="1.6"/>`;
  cuerpo += punto(cx, cy - 46, 10);
  cuerpo += `<path d="M${cx - 4} ${cy - 54}C${cx - 20} ${cy - 90} ${cx - 50} ${cy - 100} ${cx - 64} ${cy - 92}M${cx + 4} ${cy - 54}C${cx + 20} ${cy - 90} ${cx + 50} ${cy - 100} ${cx + 64} ${cy - 92}" fill="none" stroke="${TINTA}" stroke-width="2"/>`;
  // luna sobre la polilla
  const extra = circulo(cx, 46, 18, 2) + `<path d="M${cx + 4} 30a18 18 0 1 0 0 32a22 22 0 1 1 0-32Z" fill="${TINTA}"/>`;
  return { o: alas + cuerpo + extra + anilloPuntos(cx, cy + 10, 175, 0, 0), w: 400, h: 400 };
}

function daga(seed) {
  const rnd = rng(seed), cx = 150;
  let o = "";
  // halo de puntos detrás
  o += anilloPuntos(cx, 150, 92, 36, 2.2) + circulo(cx, 150, 104, 1.4) + festones(cx, 150, 110, 24, 12);
  // hoja
  o += `<path d="M${cx - 18} 190L${cx} 440L${cx + 18} 190Z" fill="${PAPEL}" stroke="${TINTA}" stroke-width="2.6"/>`;
  o += `<path d="M${cx} 196V420" stroke="${TINTA}" stroke-width="1.6"/>`;
  o += `<path d="M${cx} 190L${cx + 18} 190L${cx} 440Z" fill="${TINTA}"/>`;
  // guarda
  o += `<path d="M${cx - 64} 178H${cx + 64}V194H${cx - 64}Z" fill="${TINTA}"/>` + punto(cx - 70, 186, 9) + punto(cx + 70, 186, 9);
  o += punto(cx, 186, 5, rnd() < 0.6 ? ROJO : PAPEL);
  // empuñadura
  o += `<path d="M${cx - 12} 90H${cx + 12}V178H${cx - 12}Z" fill="${PAPEL}" stroke="${TINTA}" stroke-width="2.4"/>`;
  for (let y = 96; y < 176; y += 9) o += `<path d="M${cx - 12} ${y}L${cx + 12} ${y + 8}" stroke="${TINTA}" stroke-width="1.6"/>`;
  // pomo
  o += `<path d="M${cx} 52L${cx + 18} 72L${cx} 92L${cx - 18} 72Z" fill="${TINTA}"/>` + punto(cx, 72, 4, PAPEL);
  // gotas
  for (let i = 0; i < 3; i++) { const y = 456 + i * 18; o += punto(cx, y, 4 - i, i === 0 ? ROJO : TINTA); }
  return { o, w: 300, h: 500 };
}

function ojo(seed) {
  const rnd = rng(seed), cx = 200, cy = 220;
  let o = "";
  const tri = [pol(cx, cy - 10, 170, -Math.PI / 2), pol(cx, cy - 10, 170, Math.PI / 6), pol(cx, cy - 10, 170, (5 * Math.PI) / 6)];
  o += `<path d="M${P(tri[0])}L${P(tri[1])}L${P(tri[2])}Z" fill="none" stroke="${TINTA}" stroke-width="2.6"/>`;
  o += rayos(cx, cy, 120, 176, 44, 1.2);
  o += `<path d="M${cx - 92} ${cy}Q${cx} ${cy - 76} ${cx + 92} ${cy}Q${cx} ${cy + 76} ${cx - 92} ${cy}Z" fill="${PAPEL}" stroke="${TINTA}" stroke-width="3"/>`;
  o += puntillismo(rnd, 700, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 < 34 ** 2, (x, y) => 0.3 + 0.7 * (Math.hypot(x - cx, y - cy) / 34), 0.7, 1.4);
  o += circulo(cx, cy, 34, 2.2) + punto(cx, cy, 14) + punto(cx + 5, cy - 5, 4, PAPEL);
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; const [x0, y0] = pol(cx, cy + 18, 78, a); const [x1, y1] = pol(cx, cy + 18, 96, a); o += `<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}" stroke="${TINTA}" stroke-width="2.4"/>`; }
  o += anilloPuntos(cx, cy - 10, 190, 60, 1.8) + punto(cx, cy - 192, 6, rnd() < 0.5 ? ROJO : TINTA);
  return { o, w: 400, h: 420, vb: "0 0 400 420" };
}

/* ---------- salida ---------- */
const piezas = [
  ["mandala", mandala, [11, 23, 37, 58, 71, 94]],
  ["geometria", geometria, [5, 19, 42]],
  ["luna", luna, [8, 33, 61]],
  ["polilla", polilla, [3, 17]],
  ["daga", daga, [4, 27]],
  ["ojo", ojo, [9]],
];

const manifiesto = [];
for (const [tipo, fn, seeds] of piezas) {
  seeds.forEach((s, i) => {
    const { o, w, h, vb } = fn(s);
    const id = `${tipo}-${i + 1}`;
    const vbox = vb || `0 0 ${w} ${h}`;
    // papel: tarjeta de flash
    writeFileSync(join(OUT, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbox}" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${PAPEL}"/><g stroke-linecap="round" stroke-linejoin="round">${o}</g></svg>`);
    // pegatina: troquel sólido (círculo o rectángulo redondeado) con borde blanco y papel dentro
    const [vx, vy, vw, vh] = vbox.split(' ').map(Number);
    const fondo = w === h
      ? `<circle cx="${vx + vw / 2}" cy="${vy + vh / 2}" r="${vw / 2 + 22}" fill="#f7f5f1"/><circle cx="${vx + vw / 2}" cy="${vy + vh / 2}" r="${vw / 2 + 8}" fill="${PAPEL}"/>`
      : `<rect x="${vx - 22}" y="${vy - 22}" width="${vw + 44}" height="${vh + 44}" rx="46" fill="#f7f5f1"/><rect x="${vx - 8}" y="${vy - 8}" width="${vw + 16}" height="${vh + 16}" rx="34" fill="${PAPEL}"/>`;
    writeFileSync(join(OUT, `${id}-pegatina.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx - 30} ${vy - 30} ${vw + 60} ${vh + 60}" width="${vw + 60}" height="${vh + 60}">${fondo}<g stroke-linecap="round" stroke-linejoin="round">${o}</g></svg>`);
    // versión clara para fondos oscuros: tinta hueso, sin papel
    const claro = o.split(TINTA).join('#ebe8e2').split(PAPEL).join('#0d0c0c');
    writeFileSync(join(OUT, `${id}-claro.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbox}" width="${w}" height="${h}"><g stroke-linecap="round" stroke-linejoin="round">${claro}</g></svg>`);
    manifiesto.push({ id, tipo, w, h });
  });
}
writeFileSync(join(ROOT, "src", "data", "arte.json"), JSON.stringify(manifiesto, null, 2));
console.log(`✓ ${manifiesto.length} diseños en public/arte`);
