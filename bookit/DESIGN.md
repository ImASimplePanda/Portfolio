---
name: Bookit
description: Librería de barrio con mostrador online; cada pantalla es una cubierta de colección de bolsillo.
colors:
  paper: "#F8F8F6"
  white: "#FFFFFF"
  ink: "#16181B"
  ink-2: "#4A4E55"
  ink-3: "#64686F"
  line: "#D6D6D1"
  line-2: "#ECECE8"
  mark: "#FFE45C"
  error: "#B3123E"
  ok: "#1F5C46"
  c-narrativa: "#1E5E6C"
  c-negra: "#2B2D33"
  c-ensayo: "#2445B8"
  c-clasicos: "#B3123E"
  c-infantil: "#F5B700"
typography:
  display:
    fontFamily: "Sofia Sans Condensed, Sofia Cond Fallback, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1.4rem + 5.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  display-band:
    fontFamily: "Sofia Sans Extra Condensed, Sofia Cond Fallback, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1.4rem + 5.4vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Sofia Sans Condensed, Sofia Cond Fallback, Arial Narrow, sans-serif"
    fontSize: "clamp(2.125rem, 1.5rem + 2.4vw, 3.375rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Sofia Sans Condensed, Sofia Cond Fallback, Arial Narrow, sans-serif"
    fontSize: "clamp(1.25rem, 1.12rem + 0.45vw, 1.4375rem)"
    fontWeight: 800
    lineHeight: 1.1
  body:
    fontFamily: "Sofia Sans, Sofia Fallback, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  lede:
    fontFamily: "Sofia Sans, Sofia Fallback, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.12rem + 0.45vw, 1.4375rem)"
    fontWeight: 400
    lineHeight: 1.45
  ui:
    fontFamily: "Sofia Sans Condensed, Sofia Cond Fallback, Arial Narrow, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.01em"
  label-band:
    fontFamily: "Sofia Sans Extra Condensed, Sofia Cond Fallback, Arial Narrow, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.06em"
  small:
    fontFamily: "Sofia Sans, Sofia Fallback, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  s9: "96px"
  s10: "128px"
  gutter: "clamp(16px, 4vw, 48px)"
  max: "1360px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "52px"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "52px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-disabled:
    backgroundColor: "{colors.line-2}"
    textColor: "{colors.ink-3}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "52px"
  chip:
    backgroundColor: "transparent"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  cover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  wish-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "48px"
  pending-mark:
    backgroundColor: "{colors.mark}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.05em 0.4em"
---

# Design System: Bookit

## Overview

**Creative North Star: "La colección de bolsillo"**

Bookit se comporta como una colección editorial de bolsillo: cada pantalla es una cubierta construida con un solo módulo de tres franjas (franja de color de la colección / panel blanco con el título / franja de color). La cabecera es la franja superior, el pie es la franja inferior, y entre ambas el papel frío funciona como panel. Las cubiertas de los libros no son imágenes: son el mismo módulo dibujado en CSS, con el nombre de la colección arriba y la marca Bookit abajo.

El color pertenece a las colecciones, no a la interfaz. Hay cinco telas (narrativa, novela negra, ensayo, clásicos y poesía, infantil y juvenil) y una sola variable de franja (`--band` / `--on-band`) que se reasigna por `data-col`; elegir una colección retiñe todas las franjas de la página con una transición registrada. La tinta hace el resto: botones primarios, bordes de 2px, reglas de sección. Densidad media, tipografía generosa para un público amplio que incluye lectores mayores (WCAG 2.2 AA).

Rechaza explícitamente el tópico del sector: papel crema, serifa elegante y héroe de lomos en estantería.

**Key Characteristics:**
- Un módulo de tres franjas repetido a toda escala: cubierta, página, resguardo de pedido, pie.
- Cinco colores de colección con texto sobre franja elegido para AA; nada de color decorativo fuera de ellos.
- Esquinas rectas en todo; bordes de tinta de 2px; plano, sin sombras proyectadas en superficies.
- Superfamilia Sofia Sans en tres anchos, alojada en el propio servidor.
- Los estados se dibujan con franjas: subrayados inset de 3 a 6px en el color de la franja.

## Colors

Papel frío y tinta casi negra como base; cinco telas de colección que solo aparecen como franjas completas.

### Primary
- **Tela de colección (variable `--band`)**: no es un color fijo sino un rol. Toma el valor de la colección activa y pinta cabecera, pie, cabecera de página interior, estantería del héroe, lomos, campos de recomendación y las franjas de las cubiertas. Su pareja `--on-band` fija el texto encima.
  - **Petróleo Narrativa** (c-narrativa): colección por defecto y valor inicial de la franja. Lleva texto blanco. Sustituyó al naranja original, que cansaba la vista.
  - **Carbón Negra** (c-negra): novela negra, literal. Lleva texto blanco.
  - **Cobalto Ensayo** (c-ensayo): ensayo. Lleva texto blanco.
  - **Cereza Clásicos** (c-clasicos): clásicos y poesía. Lleva texto blanco.
  - **Yema Infantil** (c-infantil): infantil y juvenil. Lleva texto en tinta.

### Neutral
- **Papel Frío** (paper): fondo de página y del menú lateral; texto de botón primario.
- **Blanco Panel** (white): panel central de las cubiertas, campos, caja de pago, resguardo, filas de pedido.
- **Tinta** (ink): texto, botones primarios, bordes de 2px de campos y botones, reglas de sección.
- **Tinta Media** (ink-2): autores, subtítulos, entradillas, metadatos.
- **Tinta Suave** (ink-3): marcadores de posición, notas al pie de foto, texto deshabilitado.
- **Línea** (line) y **Línea Clara** (line-2): separadores de filas de cesta y opciones sin marcar; fondo de deshabilitado.

### Estados
- **Error** (error) y **Correcto** (ok): mensajes de campo y avisos. Error comparte valor con cereza clásicos y correcto es un verde botella propio; se distinguen siempre por texto e icono, nunca solo por color.
- **Amarillo Pendiente** (mark): exclusivo del marcador de dato pendiente.

### Named Rules
**The Tela Entera Rule.** Un color de colección solo aparece como franja completa (fondo de banda, regla inset, muestra cuadrada) con su `--on-band` correspondiente encima. Nunca como texto de color sobre papel, nunca en degradado, nunca a media opacidad.

**The Pareja Fija Rule.** Infantil lleva tinta encima; narrativa, negra, ensayo y clásicos llevan blanco. Una colección nueva entra con su pareja comprobada para AA antes de usarse.

**The Amarillo Reservado Rule.** El amarillo pendiente señala exclusivamente datos que el cliente aún no ha entregado. Nunca como acento ni resaltado editorial.

## Typography

**Display Font:** Sofia Sans Condensed y Sofia Sans Extra Condensed (con respaldo métrico sobre Arial Narrow)
**Body Font:** Sofia Sans (con respaldo métrico sobre Arial)

**Character:** Una sola superfamilia en tres anchos, como el programa tipográfico de una editorial: el extra condensado es el lomo y la etiqueta de colección, el condensado es el título de cubierta y la voz de la interfaz, el regular es la lectura. Los cuatro archivos woff2 viven en `/fonts`, con `font-display: swap` y respaldos ajustados en `size-adjust` para que el texto no salte.

### Hierarchy
- **Display** (Condensed 800, display, 0.92): titular del héroe y título de ficha de libro. Tracking negativo.
- **Display de franja** (Extra Condensed 900, display, 0.9, mayúsculas): título de la cabecera de página interior; también nombres de lomo, código de pedido y día de preventa en tamaños menores.
- **Headline** (Condensed 800, headline, 0.98, máx. 18ch): títulos de sección; `text-wrap: balance`.
- **Title** (Condensed 800, title, 1.1): títulos de tarjeta, línea de cesta, opción, precio.
- **Body** (Regular 400, body, 1.6): lectura; sinopsis hasta 60ch.
- **Lede** (Regular 400, lede, 1.45, máx. 44ch, ink-2): entradilla bajo los títulos de sección.
- **UI** (Condensed 700, ui, 1): botones, navegación, chips, herramientas.
- **Etiqueta de franja** (Extra Condensed 700-800, mayúsculas, 0.04-0.09em): nombre de colección en la franja de la cubierta, cabeceras de columna del pie, banda del resguardo. Siempre sobre franja de color, nunca sobre papel encima de un título.

### Named Rules
**The Tres Anchos Rule.** Ancho según función: extra condensado para lo que vive en una franja, condensado para títulos e interfaz, regular para leer. No se introducen otras familias.

**The Cifras Fijas Rule.** Precios, contador de cesta, cantidades y códigos usan `tabular-nums`.

## Layout

Contenedor de 1360px de ancho máximo con margen lateral fluido (gutter, 16 a 48px). La escala de espaciado es de 4px hasta 128px (s1-s10); las secciones de portada respiran con s9 (96px) arriba y abajo. Las franjas a sangre (cabecera, estantería, recomendación, pie, cabecera de página) ocupan todo el ancho y alinean su contenido al contenedor mediante `max(gutter, (100vw - max)/2 + gutter)`.

Las composiciones se recomponen por franjas enteras, nunca por fracciones: el héroe es papel arriba y franja abajo con la cubierta destacada apoyada sobre la franja; la ficha de libro es cubierta fija a la izquierda (5fr) y texto a la derecha (7fr); la cesta es lista (7fr) y caja de pago fija (5fr). Rejilla de catálogo en `auto-fill` con mínimo de 210px.

Puntos de corte observados: 1023px (las herramientas pierden la etiqueta), 900px (cesta y pie a una columna), 760px (menú lateral, estanterías en carrusel con `scroll-snap` y elementos al 42%, una columna), 560px y 480px para ajustes de líneas de cesta y pie. Altura de cabecera 68px (60px en móvil); `scroll-padding-top` la respeta.

## Elevation & Depth

Plano. La profundidad se expresa con franjas y bordes, no con sombras: las superficies descansan en el mismo plano y se separan por color de tela, por panel blanco sobre papel o por reglas de tinta de 2px. `box-shadow` se usa como herramienta de dibujo, no de elevación: reglas inset que marcan estados y franjas, y anillos de 1 a 3px que perfilan.

### Shadow Vocabulary
- **Perfil de cubierta** (`box-shadow: 0 0 0 1px rgb(22 24 27 / 0.14)`): borde fino que separa la cubierta blanca del papel.
- **Regla de estado** (`box-shadow: inset 0 -5px 0 var(--band)`): hover de botón y foco de campo; variantes de 3-4px en navegación, chips y herramientas.
- **Lomo lateral** (`box-shadow: inset 6px 0 0 var(--band)`): opción de envío seleccionada, fila de pedido; `inset 0 8px 0` como franja superior de la caja de pago.
- **Anillo de franja** (`box-shadow: 0 0 0 3px var(--band)`): hover de cubierta enlazada, junto a un ascenso de 6px.

### Named Rules
**The Sin Sombra Proyectada Rule.** Ninguna superficie lleva sombra difusa desplazada. Las sombras del sistema son reglas inset o anillos sólidos, siempre en tinta o en el color de la franja.

## Shapes

Esquinas rectas en todo (radio 0): botones, campos, chips, cubiertas, contador de cesta, botón de deseados, menú lateral. La forma recurrente es el rectángulo 2:3 de la cubierta dividido en tres franjas (27% / panel / 17%), y su versión miniatura en la marca del logo (dos barras sólidas con un hueco). Los bordes son de tinta sólida a 2px; la línea fina solo existe en el perfil de cubierta.

**The Esquina Recta Rule.** `border-radius` es siempre 0. Una esquina redondeada rompe la ilusión de papel cortado.

## Components

### Buttons
Tinta sólida y decidida; la franja de la colección aparece al pasar por encima.
- **Shape:** rectos (0), alto mínimo 52px, borde de 2px del color de fondo, padding lateral 24px.
- **Primary:** fondo tinta, texto papel, tipografía UI.
- **Paper:** fondo papel, texto tinta; para usar sobre franja (boletín del pie, recomendación).
- **Ghost:** transparente con borde de tinta; en hover se rellena de tinta.
- **Hover / Focus:** regla inset de 5px en el color de la franja (en tinta para el botón papel); foco con contorno de 3px separado 3px, en `--on-band` cuando el botón vive sobre una franja. Pulsación a escala 0.97 en 120ms.
- **Cargando:** una franja de 5px avanza por la base del botón; al terminar, la etiqueta entra desde 6px abajo.
- **Disabled:** fondo line-2, borde line, texto ink-3.

### Chips y selector de colección
- **Style:** contorno de 2px en `--on-band`, transparentes, sobre la franja; alto 44px. Llevan una muestra cuadrada de 14px con el color de su colección.
- **State:** el seleccionado se invierte (fondo `--on-band`, texto en color de franja); hover con regla inset de 4px.

### Cubierta (componente firma)
- El módulo de tres franjas dibujado en CSS en proporción 2:3, con unidades de contenedor (`cqi`) para que escale de miniatura de cesta (64px) a destacado (420px).
- **Franja superior:** nombre de colección en etiqueta de franja. **Panel:** título en condensado 800 (tres tamaños según longitud) y autor en ink-2. **Franja inferior:** marca y palabra Bookit.
- **Fantasma:** preventa y agotados se dibujan como contorno del color de la colección sin relleno; en hover se rellenan. Es la convención para lo que aún no existe en tienda.
- **Hover:** asciende 6px y gana anillo de 3px en el color de la franja.

### Inputs / Fields
- **Style:** fondo blanco, borde de tinta de 2px, recto, alto 52px, texto a 16px mínimo; cursor en color de franja.
- **Focus:** regla inset inferior de 5px en el color de franja; con teclado, además el contorno de 3px.
- **Error / Disabled:** borde y regla en rojo error con mensaje en texto; deshabilitado en line-2.
- **Opción de envío:** caja con borde line que pasa a tinta y gana lomo lateral de 6px al marcarse.

### Navigation
- **Cabecera:** la franja superior de la cubierta, fija, en el color de la colección activa. Navegación en condensado 700 a 18px con subrayado de 3px que crece desde la izquierda; la página actual lo mantiene completo. Herramientas (deseados, cuenta, cesta) con icono SVG y etiqueta; en hover se invierten. Contador de cesta cuadrado e invertido, con rebote al añadir.
- **Móvil:** menú en popover que entra desde la derecha (380ms, curva de cajón), papel, enlaces grandes separados por reglas de tinta y accesos a colecciones como franjas.

### Lomos de colección
Cinco franjas de alto 72-104px con anchuras y sangrías ligeramente distintas, como una pila de libros; nombre en extra condensado mayúsculas. En hover se desplazan 24px a la derecha.

### Marcador de dato pendiente
Fondo amarillo pendiente, texto tinta, contorno discontinuo de 1px, prefijo "Pendiente:". Señala dirección, horario, teléfono, nombre del librero y textos legales que el cliente aún no ha entregado. Es una pieza de trabajo, no decoración: desaparece cuando llega el dato.

### Movimiento
Tres curvas: salida (`--ease-out`) para casi todo, entrada-salida (`--ease-in-out`) para el retintado de franja y la carga, cajón (`--ease-drawer`) para el menú lateral. Duraciones: 120ms pulsación, 200ms interfaz, 320ms desplazamiento, 520ms retintado. Con movimiento reducido se eliminan desplazamientos y escalas y se conservan fundidos y cambios de color.

## Do's and Don'ts

### Do:
- **Do** construir cada superficie nueva con el módulo de tres franjas: franja de color, panel blanco o papel, franja de color.
- **Do** pintar el color solo a través de `--band` / `--on-band` y `data-col`, para que el cambio de colección retiña la pantalla entera.
- **Do** usar bordes de tinta de 2px y reglas inset en el color de franja para separar y marcar estados.
- **Do** dibujar preventas y agotados como cubiertas fantasma (contorno sin relleno).
- **Do** mantener objetivos táctiles de 44px como mínimo y campos de 52px.
- **Do** marcar cualquier dato real que falte con el marcador pendiente, nunca con texto inventado.

### Don't:
- **Don't** redondear esquinas; el radio es siempre 0.
- **Don't** usar sombras difusas desplazadas para elevar superficies.
- **Don't** usar papel crema, serifas ni un héroe de lomos en estantería: es el tópico que este sistema rechaza.
- **Don't** poner texto de color de colección sobre papel, ni mezclar dos colecciones en la misma franja.
- **Don't** introducir familias tipográficas fuera de la superfamilia Sofia Sans.
- **Don't** usar el amarillo pendiente como acento.
