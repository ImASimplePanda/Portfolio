# Hondura · Centro de Buceo (demo)

Web estática bilingüe (ES en `/`, EN en `/en/`). La página es una inmersión: bajar con el scroll es descender de 0 a 40 m.

## Editar contenido
1. Cambia los textos de `data/*.json` (experiencias, puntos, equipo, opiniones, FAQ, seguridad, datos del centro) o los de `i18n/es.json` y `i18n/en.json`.
2. Regenera las páginas: `node src/build.mjs`. No necesita dependencias.
3. Sube a la raíz del hosting **solo** esto: `index.html`, `en/`, `aviso-legal/`, `privacidad/`, `gracias/`, `404.html`, `assets/`, `css/`, `js/`, `sitemap.xml`, `robots.txt` y `.htaccess`.

## Antes de publicar
- Sustituye **todos** los datos de `DATOS-INVENTADOS.md` y pon `"demo": false` en `data/site.json`.
- Activa FormSubmit: el primer envío manda un correo de confirmación al email de reservas.
- Fotos del equipo: pon la ruta de cada foto en el campo `foto` de `data/equipo.json` (WebP, 600×750).
- Haz que un asesor revise los textos legales.

## Técnica
- Sin build ni CDN. anime.js 4.5 y Lenis 1.3 en `assets/lib/`, fuentes OFL en `assets/fonts/`.
- Agua: capas de color (solo opacidad) + WebGL a pelo en diferido (`js/agua-gl.js`). En móvil va a menor resolución y 30 fps. Con ahorro de datos no se carga.
- `prefers-reduced-motion`: sin Lenis, sin animaciones y con todo visible.
- `.htaccess`: CSP estricta (solo recursos propios más formsubmit.co), HTTPS forzado, HSTS, sin listado de carpetas, y bloquea `src/`, `data/` e `i18n/`.
