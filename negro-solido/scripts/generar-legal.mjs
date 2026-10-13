// Genera aviso legal, privacidad y 404 (HTML estático) desde src/data/contacto.json.
// Uso: node scripts/generar-legal.mjs  (lo lanza también "npm run build")
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const c = JSON.parse(readFileSync(join(ROOT, 'src/data/contacto.json'), 'utf8'));
const t = c.titular;
// Ruta base: '/' en su dominio; BASE=/demos/negro-solido/ dentro del portfolio
const B = process.env.BASE || '/';
const esc = (s) => String(s).replace(/[&<>"]/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]));
const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const pagina = ({ ruta, titulo, descripcion, cuerpo, noindex = false }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)} · ${esc(c.nombre)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">
${ruta ? `<link rel="canonical" href="${c.dominio}/${ruta}">` : ''}
<meta name="theme-color" content="#0d0c0c">
<link rel="icon" href="${B}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${B}legal.css">
</head>
<body>
<header class="cab"><a href="${B}">${esc(c.nombre)}</a><a class="volver" href="${B}">Volver al inicio</a></header>
<main id="contenido">
${cuerpo}
</main>
</body>
</html>
`;

const demo = c.demo ? '<p class="demo">Texto de demostración con datos ficticios. Sustituye los datos del titular y que lo revise un asesor antes de publicar.</p>' : '';
const datos = `<dl>
  <div><dt>Titular</dt><dd>${esc(t.razonSocial)}</dd></div>
  <div><dt>Nombre comercial</dt><dd>${esc(c.nombre)}</dd></div>
  <div><dt>CIF</dt><dd>${esc(t.cif)}</dd></div>
  <div><dt>Domicilio</dt><dd>${esc(t.domicilio)}</dd></div>
  <div><dt>Registro</dt><dd>${esc(t.registro)}</dd></div>
  <div><dt>Sanidad</dt><dd>${esc(t.sanitario)}</dd></div>
  <div><dt>Email</dt><dd><a href="mailto:${t.emailLegal}">${esc(t.emailLegal)}</a></dd></div>
  <div><dt>Teléfono</dt><dd>${esc(c.telefono)}</dd></div>
</dl>`;

const aviso = `<h1>Aviso legal</h1>
${demo}<p class="fecha">Última actualización: ${hoy}</p>
<h2>1. Datos del titular</h2>
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE):</p>
${datos}
<h2>2. Objeto</h2>
<p>Esta web informa sobre los servicios de tatuaje de ${esc(c.nombre)} y permite enviar solicitudes de cita. Enviar una solicitud no supone un contrato: la cita queda confirmada cuando el estudio responde por escrito y se abona la señal.</p>
<h2>3. Condiciones de uso</h2>
<p>El acceso es libre y gratuito. Quien navega se compromete a usar la web de forma lícita y a no enviar datos falsos o de terceros sin su consentimiento.</p>
<h2>4. Propiedad intelectual</h2>
<p>Los diseños, textos, imágenes y código de esta web pertenecen al titular o a sus artistas. No se pueden reproducir, tatuar ni distribuir sin autorización expresa.</p>
<h2>5. Responsabilidad</h2>
<p>Los precios publicados son orientativos salvo los del flash, que son cerrados. El titular no responde del contenido de webs de terceros enlazadas, como Instagram o WhatsApp.</p>
<h2>6. Salud e higiene</h2>
<p>Los tatuajes se realizan solo a mayores de 18 años, previo consentimiento informado firmado en el estudio y conforme a la normativa sanitaria de Canarias.</p>
<h2>7. Ley aplicable</h2>
<p>Se aplica la legislación española. Para cualquier conflicto, los juzgados de Las Palmas de Gran Canaria, sin perjuicio del fuero que corresponda a las personas consumidoras. También puedes usar la plataforma europea de resolución de litigios en línea: <a href="https://ec.europa.eu/consumers/odr" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>`;

const privacidad = `<h1>Política de privacidad</h1>
${demo}<p class="fecha">Última actualización: ${hoy}</p>
<h2>1. Responsable</h2>
${datos}
<h2>2. Qué datos tratamos</h2>
<p>Los que nos das en el formulario de cita o al escribirnos: nombre, correo, teléfono si lo indicas, estilo, zona del cuerpo, tamaño, tu idea y si es tu primer tatuaje. No pedimos datos de salud por la web: el consentimiento informado y las preguntas de salud se rellenan en el estudio el día de la cita.</p>
<h2>3. Para qué</h2>
<ul>
  <li>Responder a tu solicitud, preparar el presupuesto y gestionar la cita.</li>
  <li>Cumplir las obligaciones legales, fiscales y sanitarias del estudio.</li>
</ul>
<p>No enviamos publicidad, no hacemos perfiles y no tomamos decisiones automatizadas.</p>
<h2>4. Base legal</h2>
<p>Tu consentimiento al enviar el formulario (art. 6.1.a RGPD), las medidas precontractuales y el contrato cuando reservas (art. 6.1.b) y las obligaciones legales (art. 6.1.c). Puedes retirar el consentimiento cuando quieras.</p>
<h2>5. Cuánto tiempo</h2>
<p>Si no llegas a reservar, borramos la solicitud en un máximo de 12 meses. Si te tatúas, conservamos los datos durante los plazos que marcan la normativa sanitaria y la fiscal.</p>
<h2>6. Quién los recibe</h2>
<ul>
  <li><strong>FormSubmit</strong> (formsubmit.co), que nos hace llegar el formulario por correo. Actúa como encargado del tratamiento y puede implicar una transferencia internacional con las garantías del RGPD.</li>
  <li><strong>Hostinger</strong>, proveedor del alojamiento web, con servidores en la Unión Europea.</li>
  <li><strong>Meta (WhatsApp o Instagram)</strong>, solo si eliges escribirnos por ahí.</li>
  <li>Las administraciones públicas, cuando una ley lo exija.</li>
</ul>
<h2>7. Tus derechos</h2>
<p>Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad en <a href="mailto:${t.emailLegal}">${esc(t.emailLegal)}</a>. Te respondemos en un mes como máximo. Si no estás conforme, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>
<h2>8. Cookies</h2>
<p>Esta web no usa cookies, ni analítica, ni píxeles de seguimiento. Las fuentes y librerías se sirven desde nuestro propio servidor. La única conexión con terceros es el envío del formulario a FormSubmit, y solo si lo envías tú.</p>`;

const p404 = `<div class="p404">
<p class="num" aria-hidden="true">404</p>
<h1>Esta página no existe</h1>
<p>Puede que se haya movido o que el enlace esté mal escrito.</p>
<p><a class="boton" href="${B}">Volver al inicio</a></p>
</div>`;

const out = (rel, html) => { const p = join(ROOT, 'public', rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); console.log('✓', rel); };
out('aviso-legal/index.html', pagina({ ruta: 'aviso-legal/', titulo: 'Aviso legal', descripcion: `Aviso legal de ${c.nombre}.`, cuerpo: aviso }));
out('privacidad/index.html', pagina({ ruta: 'privacidad/', titulo: 'Política de privacidad', descripcion: `Cómo trata ${c.nombre} tus datos personales.`, cuerpo: privacidad }));
out('404.html', pagina({ titulo: 'Página no encontrada', descripcion: 'Página no encontrada', cuerpo: p404, noindex: true }));

const hoyIso = new Date().toISOString().slice(0, 10);
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${c.dominio}/</loc><lastmod>${hoyIso}</lastmod><priority>1.0</priority></url>
  <url><loc>${c.dominio}/aviso-legal/</loc><lastmod>${hoyIso}</lastmod><priority>0.2</priority></url>
  <url><loc>${c.dominio}/privacidad/</loc><lastmod>${hoyIso}</lastmod><priority>0.2</priority></url>
</urlset>
`);
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${c.dominio}/sitemap.xml\n`);
