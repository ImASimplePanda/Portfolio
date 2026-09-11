# TRAMA

Sitio de un estudio de dirección de arte. React sobre Vite, sin librerías de
animación ni de estilos.

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción, a dist/
npm run lint
```

## Estructura

```
src/datos/proyectos.js      todo el contenido del sitio
src/componentes/            Barra · Cubierta · Índice · Láminas · Cierre · Revelar
src/hooks/movimiento.js     hooks de scroll, revelado, medida y contadores
src/estilo.css              hoja de estilos completa
public/img/                 fotografías, en 1600 y 800 px (WebP)
```

El contenido vive entero en `datos/proyectos.js`. El índice, las láminas, el
colofón y la fila de datos de la cubierta se derivan de ahí, así que cambiar un
proyecto es tocar un solo sitio.

## Sistema de diseño

La idea: una ficha de archivo impresa. La retícula se ve; no se disimula.

| | |
|---|---|
| Títulos | Bricolage Grotesque variable, ejes `wdth` y `opsz` |
| Datos | Martian Mono a `wdth` 82 |
| Papel | `#E8E5DE` |
| Tinta | `#14120F` (14,9:1) |
| Secundario | `#5E594F` (5,5:1) |
| Rojo | `#B62612` (5,1:1 sobre papel) |
| Rojo en negativo | `#E5533C` (5,0:1 sobre tinta) |
| Marcador | `#F2D64E`, para los datos aún sin rellenar |

`--tenue` (`#8C877C`, 2,8:1) es sólo para rótulos decorativos y reglas, nunca
para texto que haya que leer.

## Movimiento

Tres movimientos grandes y varias respuestas pequeñas.

1. **La palabra se abre.** Las cinco letras de la cubierta arrancan amontonadas
   en el centro y se reparten, escalonadas, hasta tocar los dos márgenes. El
   cuerpo se calcula para que quepan justas y el `space-between` hace el
   reparto, así que llega al margen exacto en cualquier ancho.
2. **El índice responde.** Al señalar o enfocar una fila, la fila se tiñe, el
   nombre se desplaza y cambia la lámina del panel de la derecha. Funciona igual
   con teclado que con ratón: el panel sigue al foco.
3. **Las láminas avanzan en horizontal**, gobernadas por el scroll vertical, con
   tramos de sostén al principio y al final. En móvil pasa a ser un carrete a
   dedo con ajuste por lámina.

Notas de implementación:

- Una sola pasada por fotograma (`requestAnimationFrame` con bandera) y listener
  de scroll pasivo. Sólo se animan `transform` y `opacity`.
- Las medidas se toman al cargar y al redimensionar, nunca dentro del bucle.
- El `transform` del carrete se escribe directo en el nodo, no en el estado: un
  `setState` por fotograma volvería a renderizar sesenta veces por segundo. Sólo
  va al estado el número de lámina activa, que cambia cinco veces.
- El desplegable de cada ficha se anima con `grid-template-rows: 0fr → 1fr`, sin
  medir alturas. El aire de abajo va en un `::after` porque el `padding` del
  hijo no colapsa con `0fr`.
- Las letras de la cubierta animan sólo el reparto, no la opacidad: si una
  transición se atasca, la palabra tiene que seguir leyéndose.
- El revelado al entrar en pantalla usa umbral 0,03, deja de observar al entrar
  y tiene una red de seguridad a los 2,5 s. El contenido nunca depende de que la
  animación funcione.

## Accesibilidad

- Contrastes comprobados uno a uno; los ratios están en la tabla de arriba.
- Doce paradas de tabulación, todas con foco visible y en orden lógico.
- El panel de vista previa sigue al foco, no sólo al ratón.
- Las fichas son `<button>` con `aria-expanded` y `aria-controls`, e `inert`
  mientras están cerradas.
- `prefers-reduced-motion` apaga el reparto de letras, el carrete horizontal y
  los contadores sin ocultar contenido.
- Sin desbordamiento horizontal entre 360 y 2560 px.

## Pendiente de rellenar

Todo lo marcado con el subrayador amarillo es contenido de ejemplo:

- correo, teléfono y sede, en el colofón y en la cubierta;
- las cuatro cifras del estudio;
- las fichas completas de los cinco proyectos.

Para producción conviene además alojar las tipografías en el propio dominio
(woff2, subconjunto latino) en lugar de pedirlas a Google Fonts: carga antes y
no filtra las visitas a un tercero.

## Fotografías

Cinco fotografías libres de Unsplash. Autores: Dietmar Becker, Florian Klauer,
Ariana Prestes, Elisabetta Foco y Daniel Ebersole. La atribución está en el pie
del sitio.

Van desaturadas y levantadas por CSS (`saturate(.5) contrast(.9)
brightness(1.2)`) para que las fotos oscuras no se cierren sobre el papel. El
tratamiento está en la hoja de estilos, no en los archivos.
