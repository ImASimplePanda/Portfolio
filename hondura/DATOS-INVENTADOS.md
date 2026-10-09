# Datos inventados que hay que sustituir

Todo lo de esta lista es ficticio y se creó para la demo. Mientras `"demo": true` esté en `data/site.json`, la web muestra un distintivo amarillo "Demo · datos ficticios".

| Dato | Dónde |
|---|---|
| Nombre "Hondura", dominio hondurabuceo.es y año de fundación (2014) | `data/site.json` |
| Email, teléfono (+34 928 000 000) y WhatsApp (+34 600 00 00 00) | `data/site.json` |
| Dirección, horario e idiomas | `data/site.json` |
| Razón social, CIF (B00000000), domicilio y registro mercantil | `data/site.json` → aviso legal y privacidad |
| "Centro PADI 5 Estrellas" y la agencia PADI | `data/site.json`, `data/equipo.json` |
| Redes sociales (enlaces genéricos) | `data/site.json` |
| Precios, duraciones, profundidades, edades e inclusiones | `data/experiencias.json` |
| Ratios 1:4 y 1:6, "sin accidentes graves", 100 % con primeros auxilios | `data/seguridad.json` |
| Revisiones de material, protocolo con la cámara hiperbárica, sellos | `data/seguridad.json`, `src/build.mjs` (sellos) |
| Instructores (nombres, titulaciones, idiomas, nº de inmersiones) | `data/equipo.json` |
| **Opiniones (3, marcadas como "de ejemplo")**: publicar opiniones falsas es ilegal | `data/opiniones.json` (pon `"visible": false` si no hay reales) |
| Respuestas de la FAQ (máscaras graduadas, política de cancelación 48 h, tiempos de vuelo) | `data/faq.json` |
| Fauna y profundidades de los puntos de buceo (los nombres de lugar son reales) | `data/puntos.json` |
| Temperatura del agua del indicador | `js/main.js` (cálculo aproximado) |

Las 4 fotos son las que me pasaste. Antes de publicar, comprueba que tienes derechos sobre ellas.
