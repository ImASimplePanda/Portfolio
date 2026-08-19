# Kage · 影

Un paseo nocturno en cinco capítulos por un templo ficticio en las montañas de
Kioto: una sola cámara WebGL continua movida por el scroll, con una capa de
lectura editorial superpuesta.

Estudio de diseño independiente, hecho a partir de un encargo escrito. Sin
vinculación con ningún templo, institución ni organismo de turismo.

## Cómo ejecutarlo

```bash
node tools/serve.mjs
```

Luego abre <http://127.0.0.1:8751/>. Sirve cualquier servidor estático: la web es
HTML, CSS y módulos ES, sin paso de compilación. `tools/serve.mjs` sólo añade un
endpoint `POST /__save` que usan los generadores de recursos descritos más abajo.

## Cómo está montado

```text
kage/
├── index.html                  documento, landmarks y contenido editorial
├── assets/
│   ├── css/kage.css            toda la capa de lectura
│   ├── js/scene.js             el mundo procedural y la cadena de post
│   ├── js/site.js              coreografía de scroll, revelados, cursor, planos fijos
│   ├── fonts/                  tipografías OFL alojadas aquí + fonts.css
│   ├── stills/                 seis láminas de la escena (WebP)
│   ├── foreground/             diez recortes con alfa (WebP)
│   └── vendor/                 Three.js r185 (MIT)
└── tools/                      generadores y servidor de desarrollo — no forman parte de la web
```

**El mundo** (`assets/js/scene.js`) se construye en tiempo de ejecución: terreno a
partir de ruido fbm, siluetas de crestas superpuestas, tres torii, una escalinata
de treinta peldaños, un muro de tierra, la sala con sus tejados a dos aguas de
alero curvo y sus shoji encendidos, una pagoda de tres cuerpos, un estanque cuya
columna de luna sigue a la cámara, pinos y arces instanciados, lluvia, hojas a la
deriva, ascuas y veinticuatro faroles de piedra. La iluminación es una luna
direccional fría más cuatro focos cálidos. El post-procesado está escrito a mano:
pase de brillos, dos escalas de desenfoque y un composite que aplica bloom, bruma
por profundidad a partir de la depth texture, un viraje frío en las sombras,
viñeta, separación cromática y grano.

**La cámara** recorre una curva Catmull-Rom que pasa por siete planos compuestos,
uno por sección. El scroll se traduce en un índice fraccionario de plano que se
mantiene cerca de cada fotograma clave durante la primera mitad de la sección y
cede el paso durante la segunda, de modo que cada capítulo se lee como un plano
propio y no como un cambio de escena.

**Las imágenes** salen del mismo mundo. Las seis láminas de `assets/stills/` son
fotogramas reales capturados en la posición de cámara de cada capítulo, y los diez
recortes de `assets/foreground/` están dibujados por procedimiento como siluetas
casi negras con el mismo borde frío de luna. Se pueden regenerar con el servidor
en marcha:

- <http://127.0.0.1:8751/tools/gen-foreground.html> — redibuja los recortes
- <http://127.0.0.1:8751/tools/capture-stills.html> — vuelve a renderizar las láminas
- `node tools/build-fonts.mjs` — descarga y vuelve a subsetear las tipografías

## Restricciones que respeta

Sin framework, sin herramientas de compilación, sin analítica ni rastreadores, sin
tipografías remotas y sin peticiones de red después de cargar. Todas las rutas son
relativas, así que la web funciona igual desde un subdirectorio de GitHub Pages
(incluye `.nojekyll`). Con movimiento reducido se conservan el texto y las imágenes
completos y se retira la animación; el cursor personalizado sólo aparece en
punteros de precisión.

El idioma de la página es el español; los comentarios del código están en inglés.

## Licencias

Three.js r185 es MIT — ver `assets/vendor/THREE-LICENSE.txt`. Instrument Serif,
Instrument Sans y Shippori Mincho están bajo SIL OFL 1.1. Todo lo demás es
original de este proyecto.
