# Negro Sólido · estudio de tatuaje (demo)

React 19 + Vite, con componentes de [React Bits](https://reactbits.dev) adaptados (licencia MIT + Commons Clause: se pueden usar en la web, no revender los componentes).

## Comandos
- `npm run dev`: desarrollo en local.
- `npm run build`: genera los diseños (`scripts/generar-arte.mjs`), las páginas legales y la 404 (`scripts/generar-legal.mjs`) y compila en `dist/`.
- Lo que se sube al hosting es **solo el contenido de `dist/`**, incluido `.htaccess`.

## Dónde se cambia cada cosa
- Datos del estudio, contacto y titular legal: `src/data/contacto.json` (pon `"demo": false` cuando sean reales).
- Estilos, artistas, flash, proceso y FAQ: `src/data/estudio.js`.
- Diseños: `scripts/generar-arte.mjs` los genera como SVG. Para usar fotos reales, cambia las rutas `img` en `src/data/estudio.js`.

## Componentes de React Bits usados (en `src/components/rb/`)
TextPressure, ImageTrail, ScrollVelocity, FlowingMenu, ScrollReveal, Masonry, StickerPeel, ChromaGrid, Stepper, Magnet y Noise. Se adaptaron para usar fuentes propias, cumplir la CSP estricta, ser accesibles y respetar `prefers-reduced-motion`.

## Técnica
- Sin CDN ni Google Fonts: Archivo, Geist y Geist Mono van en el propio paquete.
- El primer pliegue carga solo, y el resto llega en un segundo paquete. ImageTrail, Lenis y GSAP solo se descargan en escritorio con ratón.
- Las pegatinas (WebGL2) solo se activan en escritorio. En móvil se ven como imágenes.
- `.htaccess`: HTTPS, HSTS, CSP estricta (`'self'` más formsubmit.co), sin listado de carpetas y 404 propia.
