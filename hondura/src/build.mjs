// Genera la web estática (ES en / y EN en /en/) a partir de data/ e i18n/.
// Uso: node src/build.mjs   — sin dependencias. El resultado es HTML plano.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { legal } from "./legal.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const json = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const site = json("data/site.json");
const D = {
  exps: json("data/experiencias.json"),
  puntos: json("data/puntos.json"),
  equipo: json("data/equipo.json"),
  opiniones: json("data/opiniones.json"),
  faq: json("data/faq.json"),
  seg: json("data/seguridad.json"),
};
const T = { es: json("i18n/es.json"), en: json("i18n/en.json") };
const now = new Date();
const V = now.toISOString().slice(0, 10).replace(/-/g, "");
const HOY = now.toISOString().slice(0, 10);

// ---------- utilidades ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const L = (o, lang) => (o && typeof o === "object" && !Array.isArray(o) && (lang in o) ? o[lang] : o);
const euros = (n, lang) => (lang === "es" ? `${n} €` : `€${n}`);
const base = (lang) => (lang === "es" ? "" : "en/");
const write = (rel, html) => {
  const p = join(ROOT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html.replace(/\n\s*\n\s*\n/g, "\n\n"), "utf8");
  console.log("✓", rel);
};
const prefixFor = (rel) => "../".repeat(rel.split("/").length - 1);

// ---------- mapa: proyección y silueta de Gran Canaria ----------
const MAP = { W: 920, H: 960, lonMin: -15.86, latMax: 28.2, k: 2000, c: Math.cos((28 * Math.PI) / 180) };
const proj = (lat, lon) => [(lon - MAP.lonMin) * MAP.c * MAP.k, (MAP.latMax - lat) * MAP.k];
const COSTA = [
  [28.181, -15.43], [28.172, -15.405], [28.155, -15.408], [28.142, -15.418], [28.12, -15.414], [28.1, -15.412],
  [28.07, -15.405], [28.035, -15.385], [27.995, -15.368], [27.955, -15.37], [27.925, -15.362], [27.89, -15.375],
  [27.862, -15.382], [27.835, -15.405], [27.81, -15.43], [27.785, -15.475], [27.762, -15.53], [27.738, -15.578],
  [27.745, -15.615], [27.758, -15.67], [27.775, -15.705], [27.8, -15.745], [27.825, -15.79], [27.868, -15.818],
  [27.93, -15.83], [27.985, -15.825], [28.035, -15.8], [28.075, -15.765], [28.105, -15.715], [28.145, -15.7],
  [28.163, -15.665], [28.155, -15.62], [28.15, -15.575], [28.148, -15.53], [28.142, -15.49], [28.136, -15.452],
  [28.15, -15.44], [28.168, -15.445],
].map(([a, b]) => proj(a, b));
function curva(pts, s = 1, cx = 0, cy = 0) {
  const P = pts.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]);
  const n = P.length, f = (v) => v.toFixed(1);
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}
const CEN = (() => { const [x, y] = proj(27.96, -15.6); return [x, y]; })();

// ---------- CSS generado desde los datos (posiciones y medidores) ----------
function cssDatos() {
  let css = "/* Generado por src/build.mjs a partir de data/. No editar a mano. */\n";
  D.puntos.forEach((p) => {
    const [x, y] = proj(p.lat, p.lon);
    css += `.pin--${p.id}{left:${((x / MAP.W) * 100).toFixed(2)}%;top:${((y / MAP.H) * 100).toFixed(2)}%}\n`;
  });
  const [cx, cy] = proj(site.direccion.lat, site.direccion.lon);
  css += `.pin--centro{left:${((cx / MAP.W) * 100).toFixed(2)}%;top:${((cy / MAP.H) * 100).toFixed(2)}%}\n`;
  D.exps.forEach((e) => { css += `.exp--${e.id} .gauge__fill{transform:scaleY(${Math.max(0.03, e.profundidad / 40).toFixed(3)})}\n`; });
  D.puntos.forEach((p) => {
    css += `.ficha--${p.id} .rango__fill{transform:translateX(${(p.profundidad[0] / 40 * 100).toFixed(1)}%) scaleX(${((p.profundidad[1] - p.profundidad[0]) / 40).toFixed(3)})}\n`;
  });
  return css;
}

// ---------- piezas comunes ----------
function rutas(lang) {
  const t = T[lang];
  return {
    inicio: base(lang),
    aviso: base(lang) + t.paginas.aviso.slug,
    privacidad: base(lang) + t.paginas.privacidad.slug,
    gracias: base(lang) + t.paginas.gracias.slug,
  };
}

function head({ lang, title, description, rel, canon, alt, extra = "", noindex = false, R }) {
  const t = T[lang];
  const url = site.dominio + "/" + canon;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${url}">
${alt ? `<link rel="alternate" hreflang="es" href="${site.dominio}/${alt.es}">
<link rel="alternate" hreflang="en" href="${site.dominio}/${alt.en}">
<link rel="alternate" hreflang="x-default" href="${site.dominio}/${alt.es}">` : ""}
<meta name="theme-color" content="#023f4e">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.nombreCompleto)}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:locale:alternate" content="${lang === "es" ? "en_GB" : "es_ES"}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.dominio}/assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.meta.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${R}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${R}assets/apple-touch-icon.png">
<link rel="preload" href="${R}assets/fonts/saira-extra-condensed-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${R}assets/fonts/hanken-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${extra}
<link rel="stylesheet" href="${R}css/styles.css?v=${V}">
<link rel="stylesheet" href="${R}css/datos.css?v=${V}">
</head>`;
}

function header(lang, R, { alternar, enInicio }) {
  const t = T[lang].nav, r = rutas(lang), I = enInicio ? "" : R + r.inicio;
  const links = [["experiencias", t.experiencias], ["puntos", t.puntos], ["seguridad", t.seguridad], ["equipo", t.equipo], ["faq", t.faq]];
  return `<a class="skip" href="#main">${esc(T[lang].skip)}</a>
<header class="nav" id="nav">
  <a class="nav__logo" href="${(R + r.inicio) || "./"}" aria-label="${esc(site.nombreCompleto)}">
    <svg class="nav__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="14.5"/><path d="M16 4v6M16 22v6M4 16h6M22 16h6"/><circle class="nav__dot" cx="16" cy="16" r="3"/></svg>
    <span>${esc(site.nombre)}</span>
  </a>
  <nav class="nav__menu" id="menu" aria-label="${esc(t.label)}">
    <ul>
${links.map(([id, txt]) => `      <li><a href="${I}#${id}">${esc(txt)}</a></li>`).join("\n")}
    </ul>
  </nav>
  <div class="nav__acciones">
    <a class="nav__lang" href="${R}${alternar}" hreflang="${lang === "es" ? "en" : "es"}" lang="${lang === "es" ? "en" : "es"}" aria-label="${esc(t.idiomaLabel)}">${t.idiomaCorto}</a>
    <a class="btn btn--sm" href="${I}#reserva">${esc(t.reservar)}</a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" data-abrir="${esc(t.menu)}" data-cerrar="${esc(t.cerrar)}"><span class="sr">${esc(t.menu)}</span><i aria-hidden="true"></i></button>
  </div>
</header>
${site.demo ? `<p class="demo-badge" role="note">${esc(T[lang].demo)}</p>` : ""}`;
}

function footer(lang, R) {
  const t = T[lang].pie, r = rutas(lang), c = site.contacto, d = site.direccion;
  const tel = c.telefono.replace(/\s/g, "");
  return `<footer class="pie" id="pie">
  <div class="pie__grid">
    <div class="pie__marca">
      <p class="pie__logo">${esc(site.nombre)}</p>
      <p>${esc(L(site.certificacionCentro, lang))}</p>
      <a class="pie__subir" href="#main">↑ ${esc(t.subir)}</a>
    </div>
    <div>
      <h2 class="pie__h">${esc(t.direccion)}</h2>
      <address>${esc(d.calle)}<br>${esc(d.cp)} ${esc(d.localidad)}<br>${esc(d.region)}</address>
    </div>
    <div>
      <h2 class="pie__h">${esc(t.horario)}</h2>
      <p>${esc(L(site.horario, lang))}</p>
      <p>${esc(L(site.idiomas, lang))}</p>
    </div>
    <div>
      <h2 class="pie__h">${esc(t.contacto)}</h2>
      <p><a href="tel:${tel}">${esc(c.telefono)}</a><br><a href="mailto:${c.email}">${esc(c.email)}</a><br><a href="https://wa.me/${c.whatsapp}" rel="noopener" target="_blank">WhatsApp ${esc(c.whatsappVisible)}</a></p>
    </div>
    <div>
      <h2 class="pie__h">${esc(t.redes)}</h2>
      <ul class="pie__redes">${site.redes.map((s) => `<li><a href="${s.url}" rel="noopener" target="_blank">${esc(s.red)}</a></li>`).join("")}</ul>
    </div>
  </div>
  <div class="pie__base">
    <p>© ${now.getFullYear()} ${esc(site.titular.razonSocial)} · ${esc(t.derechos)}</p>
    <p>${esc(t.cookies)}</p>
    <p><a href="${R}${r.aviso}">${esc(t.legal)}</a> · <a href="${R}${r.privacidad}">${esc(t.privacidad)}</a></p>
  </div>
</footer>`;
}

const scripts = (R, conAnim = true) => `${conAnim ? `<script src="${R}assets/lib/anime.umd.min.js?v=${V}" defer></script>
<script src="${R}assets/lib/lenis.min.js?v=${V}" defer></script>` : ""}
<script src="${R}js/main.js?v=${V}" defer></script>`;

const img = (R, name, alt, { sizes = "100vw", cls = "", lazy = true, w = 1600, h = 900 } = {}) =>
  `<img class="${cls}" src="${R}assets/img/${name}-960.webp" srcset="${R}assets/img/${name}-960.webp 960w, ${R}assets/img/${name}-1600.webp 1600w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ""}>`;

// ---------- datos estructurados ----------
function jsonLd(lang) {
  const d = site.direccion, t = T[lang];
  const precios = D.exps.map((e) => e.precio);
  const negocio = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": site.dominio + "/#centro",
    name: site.nombreCompleto,
    description: t.meta.description,
    url: site.dominio + "/" + base(lang),
    image: site.dominio + "/assets/og.jpg",
    logo: site.dominio + "/assets/apple-touch-icon.png",
    telephone: site.contacto.telefono.replace(/\s/g, ""),
    email: site.contacto.email,
    foundingDate: String(site.fundado),
    priceRange: `${Math.min(...precios)}–${Math.max(...precios)} €`,
    currenciesAccepted: "EUR",
    address: { "@type": "PostalAddress", streetAddress: d.calle, postalCode: d.cp, addressLocality: d.localidad, addressRegion: d.provincia, addressCountry: d.pais },
    geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lon },
    openingHours: site.horario.schema,
    knowsLanguage: ["es", "en", "de", "it"],
    sameAs: site.redes.map((r) => r.url),
    makesOffer: D.exps.map((e) => ({
      "@type": "Offer", priceCurrency: "EUR", price: e.precio,
      itemOffered: { "@type": "Service", name: L(e.nombre, lang), description: L(e.resumen, lang) },
    })),
  };
  const faq = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: D.faq.map((f) => ({ "@type": "Question", name: L(f.p, lang), acceptedAnswer: { "@type": "Answer", text: L(f.r, lang) } })),
  };
  return `<script type="application/ld+json">${JSON.stringify(negocio)}</script>
<script type="application/ld+json">${JSON.stringify(faq)}</script>`;
}

// ---------- secciones de la página principal ----------
function hud(lang) {
  const t = T[lang].hud;
  return `<div class="hud" id="hud" aria-hidden="true">
  <div class="hud__escala"><i class="hud__marca" id="hudMarca"></i>${[0, 10, 20, 30, 40].map((m) => `<span>${m}</span>`).join("")}</div>
  <dl class="hud__datos">
    <div class="hud__prof"><dt>${t.prof}</dt><dd><b id="hudProf">0.0</b><small>m</small></dd></div>
    <div><dt>${t.presion}</dt><dd><b id="hudBar">1.0</b><small>bar</small></dd></div>
    <div><dt>${t.temp}</dt><dd><b id="hudTemp">23.0</b><small>°C</small></dd></div>
    <div class="hud__zona"><dt class="sr">Zona</dt><dd id="hudZona" data-zonas="${esc(JSON.stringify(t.zonas))}">${t.zonas[0]}</dd></div>
  </dl>
</div>`;
}

function seccionHero(lang, R) {
  const t = T[lang].hero;
  return `<section class="hero" id="top" data-d0="0" data-d1="0" aria-labelledby="hero-t">
  <picture class="hero__foto">
    <source media="(max-width: 640px)" srcset="${R}assets/img/superficie-movil-600.webp" width="600" height="940">
    <img src="${R}assets/img/superficie-1600.webp" srcset="${R}assets/img/superficie-960.webp 960w, ${R}assets/img/superficie-1600.webp 1600w" sizes="100vw" width="1600" height="900" alt="${esc(t.alt)}" fetchpriority="high" decoding="async">
  </picture>
  <div class="hero__velo" aria-hidden="true"></div>
  <div class="hero__txt">
    <p class="eyebrow">${esc(t.eyebrow)}</p>
    <h1 id="hero-t" class="hero__titulo">${esc(t.titulo)}</h1>
    <p class="hero__valor">${esc(t.valor)}</p>
    <div class="hero__cta">
      <a class="btn" href="#reserva">${esc(t.reservar)}</a>
      <a class="btn btn--linea" href="#experiencias">${esc(t.ver)}</a>
    </div>
  </div>
  <p class="hero__scroll" aria-hidden="true"><span>${esc(t.scroll)}</span><i></i></p>
</section>`;
}

function tramo(lang, R, key, d0, d1, foto) {
  const t = T[lang].tramos[key];
  return `<section class="tramo tramo--${key}" data-d0="${d0}" data-d1="${d1}" aria-label="${esc(t.prof + " · " + t.titulo)}">
  <div class="tramo__escena">
    ${foto ? `<figure class="tramo__ventana">${img(R, foto, t.alt, { cls: "tramo__img", sizes: "(max-width: 900px) 92vw, 70vw" })}<span class="esq esq--a" aria-hidden="true"></span><span class="esq esq--b" aria-hidden="true"></span></figure>` : ""}
    <div class="tramo__txt">
      <p class="tramo__prof">${esc(t.prof)}</p>
      <h2 class="tramo__titulo">${esc(t.titulo)}</h2>
      <p class="tramo__texto">${esc(t.texto)}</p>
    </div>
  </div>
</section>`;
}

function cabecera(t, id) {
  return `<header class="sec__cab">
    <p class="kicker">${esc(t.kicker)}</p>
    <h2 class="sec__titulo" id="${id}-t">${esc(t.titulo)}</h2>
    ${t.intro ? `<p class="sec__intro">${esc(t.intro)}</p>` : ""}
  </header>`;
}

function seccionExperiencias(lang) {
  const t = T[lang].experiencias;
  return `<section class="sec" id="experiencias" data-d0="8" data-d1="11" aria-labelledby="experiencias-t">
  ${cabecera(t, "experiencias")}
  <ul class="exps" role="list">
${D.exps.map((e) => `    <li class="exp exp--${e.id}${e.destacada ? " exp--top" : ""}" data-reveal>
      <article aria-labelledby="exp-${e.id}">
        <div class="gauge" aria-hidden="true"><i class="gauge__fill"></i></div>
        ${e.destacada ? `<p class="exp__tag">${esc(t.destacada)}</p>` : ""}
        <h3 class="exp__nombre" id="exp-${e.id}">${esc(L(e.nombre, lang))}</h3>
        <p class="exp__resumen">${esc(L(e.resumen, lang))}</p>
        <dl class="exp__datos">
          <div><dt>${t.duracion}</dt><dd>${esc(L(e.duracion, lang))}</dd></div>
          <div><dt>${t.profMax}</dt><dd>${e.profundidad ? e.profundidad + " m" : t.superficie}</dd></div>
          <div class="exp__nivel"><dt>${t.nivel}</dt><dd>${esc(L(e.nivel, lang))}</dd></div>
        </dl>
        <p class="exp__inc-t">${t.incluye}</p>
        <ul class="exp__inc">${L(e.incluye, lang).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <div class="exp__pie">
          <p class="exp__precio"><span>${t.desde}</span> <b>${euros(e.precio, lang)}</b></p>
          <a class="btn btn--sm btn--linea" href="#reserva" data-exp="${e.id}">${t.reservar}<span class="sr">: ${esc(L(e.nombre, lang))}</span></a>
        </div>
      </article>
    </li>`).join("\n")}
  </ul>
</section>`;
}

function seccionPuntos(lang) {
  const t = T[lang].puntos;
  const [cx, cy] = CEN;
  const isobatas = [1.07, 1.15, 1.26].map((s, i) => `<path class="iso iso--${i}" d="${curva(COSTA, s, cx, cy)}"/>`).join("");
  const relieve = [0.72, 0.5, 0.3, 0.13].map((s, i) => `<path class="rel rel--${i}" d="${curva(COSTA, s, cx + 10, cy - 8)}"/>`).join("");
  return `<section class="sec sec--puntos" id="puntos" data-d0="11" data-d1="14" aria-labelledby="puntos-t">
  ${cabecera(t, "puntos")}
  <div class="puntos">
    <div class="mapa" data-reveal>
      <div class="mapa__plano">
        <svg class="mapa__svg" viewBox="0 0 ${MAP.W} ${MAP.H}" role="img" aria-label="${esc(t.mapa)}">
          ${isobatas}
          <path class="isla" d="${curva(COSTA)}"/>
          ${relieve}
          <g class="leyenda" transform="translate(40 ${MAP.H - 40})"><path class="leyenda__rombo" d="M0-9L9 0 0 9-9 0Z"/><text x="20" y="6">${esc(t.centro)}</text></g>
          <g class="rosa" transform="translate(${MAP.W - 70} 70)"><circle r="26"/><path d="M0-20L6 0 0 20-6 0Z"/><text y="-32" text-anchor="middle">${t.norte}</text></g>
        </svg>
        <span class="pin pin--centro" aria-hidden="true"><i></i></span>
${D.puntos.map((p, i) => `        <button class="pin pin--${p.id} pin--lab-${p.etiqueta || "der"}" type="button" aria-controls="ficha-${p.id}" aria-pressed="${i === 0}" data-punto="${p.id}"><i aria-hidden="true"></i><span class="pin__label">${esc(p.nombre)}<small>${p.profundidad[0]}–${p.profundidad[1]} m</small></span></button>`).join("\n")}
      </div>
    </div>
    <div class="fichas" aria-live="polite">
${D.puntos.map((p, i) => `      <article class="ficha ficha--${p.id}" id="ficha-${p.id}" data-ficha="${p.id}" aria-labelledby="ficha-${p.id}-t">
        <p class="ficha__zona">${esc(L(p.zona, lang))}</p>
        <h3 class="ficha__nombre" id="ficha-${p.id}-t">${esc(p.nombre)}</h3>
        <div class="rango" aria-hidden="true"><i class="rango__fill"></i><span>0</span><span>40 m</span></div>
        <dl class="ficha__datos">
          <div><dt>${t.prof}</dt><dd>${p.profundidad[0]}–${p.profundidad[1]} m</dd></div>
          <div><dt>${t.nivel}</dt><dd>${esc(L(p.nivel, lang))}</dd></div>
          <div><dt>${t.acceso}</dt><dd>${esc(L(p.acceso, lang))}</dd></div>
        </dl>
        <p class="ficha__fauna"><b>${t.fauna}.</b> ${esc(L(p.fauna, lang))}</p>
      </article>`).join("\n")}
    </div>
  </div>
</section>`;
}

function seccionSeguridad(lang, R) {
  const t = T[lang].seguridad;
  return `<section class="sec sec--seg" id="seguridad" data-d0="21" data-d1="24" aria-labelledby="seguridad-t">
  ${cabecera(t, "seguridad")}
  <ul class="cifras" role="list">
${D.seg.cifras.map((c) => `    <li class="cifra" data-reveal><p class="cifra__n"><span>${c.prefijo || ""}</span><b data-cuenta="${c.valor}">${c.valor}</b><span>${c.sufijo || ""}</span></p><p class="cifra__t">${esc(L(c.texto, lang))}</p></li>`).join("\n")}
  </ul>
  <div class="seg">
    <figure class="seg__foto" data-reveal>${img(R, "revision", t.alt, { sizes: "(max-width: 900px) 92vw, 45vw", w: 1600, h: 1067 })}</figure>
    <div class="seg__lista">
      <ul role="list">
${D.seg.puntos.map((p, i) => `        <li class="seg__item" data-reveal><span class="seg__num" aria-hidden="true">0${i + 1}</span><div><h3>${esc(L(p.t, lang))}</h3><p>${esc(L(p.d, lang))}</p></div></li>`).join("\n")}
      </ul>
      <div class="certs" data-reveal>
        <h3 class="certs__t">${esc(t.certTitulo)}</h3>
        <p><span class="sello">${esc(L(site.certificacionCentro, lang))}</span><span class="sello">${lang === "es" ? "Seguro de accidentes de buceo" : "Diving accident insurance"}</span><span class="sello">${lang === "es" ? "Registro de Turismo de Canarias" : "Canary Islands Tourism Register"}</span></p>
      </div>
    </div>
  </div>
</section>`;
}

function seccionEquipo(lang) {
  const t = T[lang].equipo;
  const ini = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return `<section class="sec" id="equipo" data-d0="24" data-d1="27" aria-labelledby="equipo-t">
  ${cabecera(t, "equipo")}
  <ul class="equipo" role="list">
${D.equipo.map((p) => `    <li class="buzo" data-reveal>
      <div class="buzo__foto"${p.foto ? "" : ' aria-hidden="true"'}>${p.foto ? `<img src="${p.foto}" alt="${esc(p.nombre)}" width="600" height="750" loading="lazy" decoding="async">` : `<span>${esc(ini(p.nombre))}</span>`}</div>
      <h3 class="buzo__nombre">${esc(p.nombre)}</h3>
      <p class="buzo__rol">${esc(L(p.rol, lang))}</p>
      <dl class="buzo__datos">
        <div><dt>${t.titulacion}</dt><dd>${esc(p.titulacion)}</dd></div>
        <div><dt>${t.idiomas}</dt><dd>${esc(p.idiomas)}</dd></div>
      </dl>
      <p class="buzo__inm"><b>${p.inmersiones.toLocaleString(lang === "es" ? "es-ES" : "en-GB")}</b> ${t.inmersiones}</p>
    </li>`).join("\n")}
  </ul>
</section>`;
}

function seccionOpiniones(lang) {
  const o = D.opiniones, t = T[lang].opiniones;
  if (!o.visible || !o.lista.length) return "";
  return `<section class="sec" id="opiniones" data-d0="27" data-d1="29" aria-labelledby="opiniones-t">
  ${cabecera(t, "opiniones")}
  ${o.ejemplo ? `<p class="aviso-ejemplo">${esc(t.ejemplo)}</p>` : ""}
  <ul class="opiniones" role="list">
${o.lista.map((r) => `    <li data-reveal><figure class="op"><blockquote><p>${esc(L(r.texto, lang))}</p></blockquote><figcaption><b>${esc(r.autor)}</b> · ${esc(L(r.origen, lang))}<span>${esc(L(r.experiencia, lang))}</span></figcaption></figure></li>`).join("\n")}
  </ul>
</section>`;
}

function seccionFaq(lang) {
  const t = T[lang].faq;
  return `<section class="sec sec--faq" id="faq" data-d0="33" data-d1="36" aria-labelledby="faq-t">
  ${cabecera(t, "faq")}
  <div class="faq">
${D.faq.map((f) => `    <details class="faq__item"><summary><span>${esc(L(f.p, lang))}</span><i aria-hidden="true"></i></summary><div class="faq__r"><p>${esc(L(f.r, lang))}</p></div></details>`).join("\n")}
  </div>
</section>`;
}

function seccionReserva(lang, R) {
  const t = T[lang].reserva, r = rutas(lang), c = site.contacto;
  const req = `<span class="req" aria-hidden="true">*</span>`;
  const campo = (id, label, input, extra = "") => `<div class="campo${extra}" data-campo="${id}">
          <label for="f-${id}">${label}</label>
          ${input}
          <p class="campo__err" id="f-${id}-err" hidden></p>
        </div>`;
  const wa = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(t.whatsappTexto)}`;
  return `<section class="sec sec--reserva" id="reserva" data-d0="38" data-d1="40" aria-labelledby="reserva-t">
  ${cabecera(t, "reserva")}
  <div class="reserva">
    <form class="form" id="form" action="https://formsubmit.co/${c.email}" method="POST" data-ajax="https://formsubmit.co/ajax/${c.email}" data-msg="${esc(JSON.stringify({ ...t.err, ok: t.ok, fallo: t.fallo, enviando: t.enviando, enviar: t.enviar }))}">
      <div class="form__resumen" id="form-resumen" tabindex="-1" hidden><p>${esc(t.errores)}</p><ul></ul></div>
      <input type="hidden" name="_subject" value="Reserva web · ${esc(site.nombre)} (${lang.toUpperCase()})">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="_next" value="${site.dominio}/${r.gracias}">
      <input type="hidden" name="idioma" value="${lang}">
      <div class="trampa" aria-hidden="true"><label for="f-honey">${esc(t.honey)}</label><input type="text" id="f-honey" name="_honey" tabindex="-1" autocomplete="off"></div>
      <div class="form__grid">
        ${campo("exp", `${t.experiencia} ${req}`, `<select id="f-exp" name="experiencia" required aria-describedby="f-exp-err">
            <option value="">${esc(t.elige)}</option>
${D.exps.map((e) => `            <option value="${e.id}">${esc(L(e.nombre, lang))}</option>`).join("\n")}
          </select>`, " campo--ancho")}
        ${campo("fecha", `${t.fecha} ${req}`, `<input type="date" id="f-fecha" name="fecha" required aria-describedby="f-fecha-err">`)}
        ${campo("personas", `${t.personas} ${req}`, `<input type="number" id="f-personas" name="personas" min="1" max="8" value="1" inputmode="numeric" required aria-describedby="f-personas-err">`)}
        ${campo("nivel", `${t.nivel} ${req}`, `<select id="f-nivel" name="nivel" required aria-describedby="f-nivel-err">
            <option value="">${esc(t.elige)}</option>
${t.niveles.map((n) => `            <option>${esc(n)}</option>`).join("\n")}
          </select>`, " campo--ancho")}
        ${campo("nombre", `${t.nombre} ${req}`, `<input type="text" id="f-nombre" name="nombre" autocomplete="name" required maxlength="120" aria-describedby="f-nombre-err">`, " campo--ancho")}
        ${campo("email", `${t.email} ${req}`, `<input type="email" id="f-email" name="email" autocomplete="email" required maxlength="160" spellcheck="false" aria-describedby="f-email-err">`)}
        ${campo("tel", t.telefono, `<input type="tel" id="f-tel" name="telefono" autocomplete="tel" maxlength="30" aria-describedby="f-tel-err">`)}
        ${campo("msg", t.mensaje, `<textarea id="f-msg" name="mensaje" rows="4" maxlength="1500" placeholder="${esc(t.mensajePh)}" aria-describedby="f-msg-err"></textarea>`, " campo--ancho")}
      </div>
      <div class="campo campo--check" data-campo="priv" data-etiqueta="${esc(T[lang].pie.privacidad)}">
        <input type="checkbox" id="f-priv" name="privacidad" value="acepto" required aria-describedby="f-priv-err">
        <label for="f-priv">${t.privacidad.replace("{priv}", R + r.privacidad)} ${req}</label>
        <p class="campo__err" id="f-priv-err" hidden></p>
      </div>
      <p class="form__nota">${req} ${esc(t.obligatorio)}</p>
      <button class="btn btn--grande" type="submit">${esc(t.enviar)}</button>
      <p class="form__estado" id="form-estado" role="status" aria-live="polite"></p>
    </form>
    <aside class="reserva__alt" aria-labelledby="alt-t">
      <h3 id="alt-t">${esc(t.o)}</h3>
      <a class="btn btn--wa" href="${wa}" rel="noopener" target="_blank">${esc(t.whatsapp)}</a>
      <a class="btn btn--linea" href="tel:${c.telefono.replace(/\s/g, "")}">${esc(t.llamar)} · ${esc(c.telefono)}</a>
      <p class="reserva__horario">${esc(L(site.horario, lang))}</p>
    </aside>
  </div>
</section>`;
}

function agua() {
  return `<div class="agua" aria-hidden="true">
  <div class="agua__capa agua__capa--0"></div><div class="agua__capa agua__capa--1"></div><div class="agua__capa agua__capa--2"></div><div class="agua__capa agua__capa--3"></div><div class="agua__capa agua__capa--4"></div>
  <canvas class="agua__gl" id="aguaGL"></canvas>
  <div class="agua__linterna" id="linterna"></div>
</div>`;
}

// ---------- páginas ----------
function paginaInicio(lang) {
  const t = T[lang], rel = base(lang) + "index.html", R = prefixFor(rel);
  const html = `${head({ lang, title: t.meta.title, description: t.meta.description, rel, canon: base(lang), alt: { es: "", en: "en/" }, R,
    extra: `<link rel="preload" as="image" href="${R}assets/img/superficie-movil-600.webp" media="(max-width: 640px)" fetchpriority="high">
<link rel="preload" as="image" imagesrcset="${R}assets/img/superficie-960.webp 960w, ${R}assets/img/superficie-1600.webp 1600w" imagesizes="100vw" media="(min-width: 641px)" fetchpriority="high">
${jsonLd(lang)}` })}
<body class="inicio">
${agua()}
${header(lang, R, { alternar: lang === "es" ? "en/" : "", enInicio: true })}
${hud(lang)}
<main id="main" data-gl="${R}js/agua-gl.js?v=${V}">
${seccionHero(lang, R)}
${tramo(lang, R, "sebadal", 0, 8, "sebadal")}
${seccionExperiencias(lang)}
${seccionPuntos(lang)}
${tramo(lang, R, "pecio", 14, 21, "pecio")}
${seccionSeguridad(lang, R)}
${seccionEquipo(lang)}
${seccionOpiniones(lang)}
${tramo(lang, R, "fondo", 29, 33, null)}
${seccionFaq(lang)}
${seccionReserva(lang, R)}
</main>
${footer(lang, R)}
${scripts(R)}
</body>
</html>
`;
  write(rel, html);
}

function paginaSimple(lang, key, cuerpo, { noindex = false } = {}) {
  const t = T[lang], p = t.paginas[key], otro = lang === "es" ? "en" : "es";
  const rel = base(lang) + p.slug + "index.html", R = prefixFor(rel);
  const alt = { es: T.es.paginas[key].slug, en: "en/" + T.en.paginas[key].slug };
  const html = `${head({ lang, title: `${p.titulo} · ${site.nombreCompleto}`, description: `${p.titulo} — ${site.nombreCompleto}`, rel, canon: base(lang) + p.slug, alt, noindex, R })}
<body class="simple">
${header(lang, R, { alternar: base(otro) + T[otro].paginas[key].slug, enInicio: false })}
<main id="main" class="doc">
  <h1>${esc(p.titulo)}</h1>
${cuerpo}
</main>
${footer(lang, R)}
${scripts(R, false)}
</body>
</html>
`;
  write(rel, html);
}

function pagina404() {
  const R = "/";
  const html = `${head({ lang: "es", title: `404 · ${site.nombreCompleto}`, description: "Página no encontrada", rel: "404.html", canon: "404.html", noindex: true, R })}
<body class="simple p404">
<main id="main" class="doc doc--404">
  <p class="p404__prof" aria-hidden="true">−404 m</p>
  <h1>Te has pasado de profundidad</h1>
  <p>Esta página no existe o se ha movido. Sube despacio y vuelve a empezar.</p>
  <p><a class="btn" href="/">Volver a la superficie</a></p>
  <hr>
  <h2 lang="en">You've gone too deep</h2>
  <p lang="en">This page doesn't exist or has moved. Ascend slowly and start again.</p>
  <p lang="en"><a class="btn btn--linea" href="/en/">Back to the surface</a></p>
</main>
</body>
</html>
`;
  write("404.html", html);
}

function sitemap() {
  const pares = [["", "en/"], [T.es.paginas.aviso.slug, "en/" + T.en.paginas.aviso.slug], [T.es.paginas.privacidad.slug, "en/" + T.en.paginas.privacidad.slug]];
  const u = (loc, es, en, pr) => `  <url><loc>${site.dominio}/${loc}</loc><lastmod>${HOY}</lastmod><priority>${pr}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${site.dominio}/${es}"/><xhtml:link rel="alternate" hreflang="en" href="${site.dominio}/${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${site.dominio}/${es}"/></url>`;
  const body = pares.flatMap(([es, en], i) => [u(es, es, en, i ? "0.3" : "1.0"), u(en, es, en, i ? "0.3" : "0.9")]).join("\n");
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`);
  write("robots.txt", `User-agent: *
Allow: /
Disallow: /gracias/
Disallow: /en/thanks/

Sitemap: ${site.dominio}/sitemap.xml
`);
}

// ---------- ejecutar ----------
write("css/datos.css", cssDatos());
for (const lang of ["es", "en"]) {
  paginaInicio(lang);
  const lg = legal(lang, site, rutas(lang), esc, L, HOY);
  paginaSimple(lang, "aviso", lg.aviso);
  paginaSimple(lang, "privacidad", lg.privacidad);
  const g = T[lang].paginas.gracias;
  paginaSimple(lang, "gracias", `  <p>${esc(g.texto)}</p>\n  <p><a class="btn" href="${prefixFor(base(lang) + g.slug + "index.html")}${base(lang)}">${esc(g.volver)}</a></p>`, { noindex: true });
}
pagina404();
sitemap();
