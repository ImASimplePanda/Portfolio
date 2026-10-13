# Datos inventados que hay que sustituir antes de publicar

Mientras `"demo": true` esté en `src/data/contacto.json`, la web muestra el distintivo amarillo "Demo · datos ficticios".

| Dato | Dónde |
|---|---|
| Nombre "Negro Sólido" y dominio negrosolido.es | `src/data/contacto.json`, `index.html` (metas, JSON-LD), `public/og.jpg` |
| Dirección (Calle Viera y Clavijo, 00), teléfono, WhatsApp, email e Instagram | `src/data/contacto.json`, `index.html` |
| Horario | `src/data/contacto.json`, `index.html` |
| Razón social, CIF (B00000000), registro mercantil y autorización sanitaria | `src/data/contacto.json` → aviso legal y privacidad |
| Señal de 50 €, precio mínimo de 70 € y política de cancelación de 72 h | `src/data/contacto.json`, `src/data/estudio.js` (FAQ) |
| Artistas (Iballa Rocha, Teo Marrero, Lucía Vega y Dani Suárez), estilos, años e Instagram | `src/data/estudio.js` |
| Flash del mes: nombres, tamaños y precios | `src/data/estudio.js` |
| Afirmaciones de higiene: tintas veganas con certificado REACH, revisión gratis a las 4 semanas | `src/data/estudio.js` (proceso) |
| **Los diseños son ilustraciones generadas por código**, no tatuajes reales del estudio | `public/arte/`. Cambiarlos por fotos de trabajos reales de los artistas |
| **Retratos de los artistas: generados con IA**, son personas que no existen | `public/fotos/artista-*.webp` |
| **Fotos de tatuajes de cada estilo: generadas con IA**, no son trabajos del estudio | `public/fotos/estilo-*.webp` |
| Fotos del proceso y de la sala: generadas con IA | `public/fotos/proceso-*.webp`, `public/fotos/estudio-*.webp` |
