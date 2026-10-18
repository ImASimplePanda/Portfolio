---
name: Muelle
description: Tienda de teclados mecánicos que se recorre como la placa del propio teclado.
colors:
  mascara: "#3a2257"
  mascara-honda: "#2c1943"
  mascara-alta: "#4a2d6b"
  mascara-borde: "#6d4b94"
  serigrafia: "#f1ecf7"
  serigrafia-tenue: "#d3c7e3"
  cobre: "#d9a94e"
  cobre-vivo: "#f0c36a"
  cobre-hondo: "#9c7330"
  fr4: "#e9dfc4"
  alerta: "#ff8a7a"
  ok: "#8fe3a8"
typography:
  display:
    fontFamily: "Chakra Petch, Arial Narrow, sans-serif"
    fontSize: "clamp(2.9rem, 6vw, 5.4rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Chakra Petch, Arial Narrow, sans-serif"
    fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "0.01em"
  title:
    fontFamily: "Chakra Petch, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Chakra Petch, Arial Narrow, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  pad: "4px"
  placa: "14px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "40px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.cobre}"
    textColor: "{colors.mascara-honda}"
    typography: "{typography.title}"
    rounded: "{rounded.pad}"
    padding: "0.7rem 1.3rem"
    height: "2.875rem"
  button-primary-hover:
    backgroundColor: "{colors.cobre-vivo}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.serigrafia}"
    rounded: "{rounded.pad}"
    padding: "0.7rem 1.2rem"
    height: "2.875rem"
  input:
    backgroundColor: "{colors.mascara-honda}"
    textColor: "{colors.serigrafia}"
    rounded: "{rounded.pad}"
    padding: "0.6rem 0.8rem"
    height: "2.875rem"
  card-huella:
    backgroundColor: "{colors.mascara-honda}"
    rounded: "{rounded.pad}"
    padding: "20px"
  panel-placa:
    backgroundColor: "{colors.mascara-alta}"
    rounded: "{rounded.placa}"
  isla-cesta:
    backgroundColor: "{colors.cobre}"
    textColor: "{colors.mascara-honda}"
    rounded: "{rounded.full}"
    height: "44px"
---

# Design System: Muelle

## Overview

**Creative North Star: "La placa del teclado"**

La tienda entera es una PCB morada que se recorre. El fondo es máscara de soldadura mate; todo lo escrito es serigrafía blanca rota; el cobre con baño de oro (ENIG) marca pistas, vías, pads y la única acción principal de cada vista. Las piezas se numeran con designadores reales (SW1…SW7, U1, J1) y los paneles llevan taladros de montaje con anillo dorado en las esquinas. Nada es decoración ajena a la placa: si un elemento no existiría en una PCB, no entra.

La densidad es de ficha técnica cómoda: titulares serigrafiados grandes arriba, explicación en prosa corta y datos exactos con cifras tabulares debajo. El movimiento pertenece al circuito: las pistas se dibujan al entrar en pantalla y la pista del interruptor elegido destella con cada pulsación. Rechaza la tienda de producto sobre blanco y el negro gamer con luces RGB.

**Key Characteristics:**
- Fondo morado de máscara en tres profundidades, nunca blanco ni negro.
- Un solo acento: cobre, racionado a la acción principal, pistas, vías y precios.
- Rotulación en Chakra Petch 600 como serigrafía; texto corrido en Hanken Grotesk.
- Contornos dibujados con sombra interior de 1–1.5px, no con bordes ni elevación.
- Designadores reales y taladros como sistema de numeración y de esquinas.

## Colors

Una placa morada de tres profundidades, serigrafía lavanda casi blanca y un único metal dorado.

### Primary
- **Cobre ENIG** (cobre): la acción principal (pad), pistas, vías, anillos de taladro, la isla de la cesta, la selección activa y el foco de los campos. Una sola acción de cobre por vista.
- **Cobre encendido** (cobre-vivo): hover del pad, pista activa, enlace de navegación activo, precios, anillo de foco y cursor de texto.
- **Cobre oxidado** (cobre-hondo): pistas en reposo y halo bajo la pista; también el canto interior del taladro.

### Neutral
- **Máscara de soldadura** (mascara): fondo de todas las páginas y de la placa con textura.
- **Máscara sin cobre** (mascara-honda): zonas hundidas: campos, huellas de producto, pie de página, texto sobre cobre.
- **Plano de masa** (mascara-alta): superficies elevadas: paneles, tarjetas, opción seleccionada, hover de iconos.
- **Contorno serigrafiado apagado** (mascara-borde): silueta discontinua de huellas, contornos de botones secundarios y campos, divisores.
- **Serigrafía** (serigrafia): texto principal y titulares.
- **Serigrafía tenue** (serigrafia-tenue): texto secundario, designadores, enlaces de navegación en reposo.
- **Canto FR4** (fr4): el canto de fibra de la placa de portada y los avisos de demostración (texto en mascara-honda).
- **Alerta** (alerta) y **Correcto** (ok): solo estados de error y confirmación.

### Named Rules
**The Un Solo Cobre Rule.** Cada vista tiene una única acción en pad de cobre; las demás son pads de contorno. El cobre restante es circuito (pistas, vías, taladros) o dato (precio), nunca relleno decorativo.

**The FR4 Rule.** El crema de fibra se reserva para el canto de la placa y para declarar que la tienda es una demo. No es un fondo de sección.

## Typography

**Display Font:** Chakra Petch 600 (con Arial Narrow)
**Body Font:** Hanken Grotesk Variable (con system-ui)

**Character:** Chakra Petch es la serigrafía: angulosa, técnica y legible a cualquier tamaño, con un único peso. Hanken Grotesk lleva la explicación con calidez neutra.

### Hierarchy
- **Display** (600, clamp(2.9rem, 6vw, 5.4rem), 0.98): el titular de portada; los h1 de catálogo y ficha usan la misma escala ligeramente menor (hasta 4.6rem).
- **Headline** (600, clamp(2.2rem, 4.4vw, 3.6rem), 0.98): todos los h2 de sección.
- **Title** (600, 1.5rem): estaciones del montador, bloques internos; títulos de tarjeta a 1.25rem.
- **Body** (400, 1.0625rem, 1.6): prosa, en medidas de 46–64ch.
- **Label / designador** (600, 0.8125rem, 0.06em, serigrafía tenue): SW1, U1, J1 y la revisión de placa; no se pone en mayúsculas forzadas, los designadores ya lo son.

### Named Rules
**The Serigrafía Rule.** Toda rotulación (titulares, botones, logotipo, designadores) va en Chakra Petch 600; nunca otro peso ni otra display. Las cifras de precio, stock y medidas llevan cifras tabulares.

**The Designador Rule.** Un designador numera una pieza que existe (un interruptor, el teclado, un conector), en su huella y en orden. No se usa como antetítulo encima de un titular.

## Layout

Contenedor de 1360px centrado con márgenes laterales de 16 / 24 / 40px (móvil / sm / lg). Las secciones respiran con 96px verticales (64px en bloques secundarios) y se separan con una pista de cobre que quiebra a 45° con una vía en cada extremo. Las composiciones a dos columnas son asimétricas (0.8fr / 1.2fr o 0.9fr / 1.1fr), texto a un lado y pieza o teclado al otro, apiladas en móvil. La cabecera es fija, de 68px, con desenfoque sobre máscara al 90%. La fila de huellas SW1–SW7 es rejilla de siete en escritorio y carrusel con snap en móvil, donde la pista se convierte en bus horizontal. Separaciones habituales: 8, 12, 16 y 40px.

## Elevation & Depth

La placa es plana. La profundidad se cuenta por tono de máscara (honda, base, alta) y por contornos interiores de 1–1.5px en mascara-borde, como serigrafía. Hay sombra ambiental solo bajo objetos que se apoyan sobre la placa: el panel de placa, el pad y el teclado.

### Shadow Vocabulary
- **Contorno serigrafiado** (`box-shadow: inset 0 0 0 1px #6d4b94`): planos, huellas y paneles; 1.5px en campos y botones de contorno; 2px en cobre para selección y foco.
- **Apoyo del pad** (`box-shadow: 0 4px 14px -8px rgb(0 0 0 / 0.55)`): bajo el pad de cobre.
- **Apoyo del panel** (`box-shadow: 0 20px 40px -24px rgb(0 0 0 / 0.7)`): paneles de placa y canto de portada.
- **Brillo de pista** (`filter: drop-shadow(0 0 6px rgb(240 195 106 / 0.8))`): solo la pista viva que destella con una pulsación.

### Named Rules
**The Contorno Interior Rule.** Los límites se dibujan con sombra interior, no con `border` ni elevación. El cobre en el contorno significa selección o foco, nada más.

## Shapes

Esquinas de pad (4px) para botones, campos, tarjetas y huellas; esquinas de placa (14px) para paneles con taladros. Las píldoras completas son solo la isla de la cesta, los iconos de cabecera y los numerales de estación. Las huellas llevan una silueta serigrafiada discontinua a 2.5–4px del borde, con esquinas de 3px. Las pistas se trazan en ortogonales y diagonales de 45° con extremos redondeados; las vías y taladros son círculos de cobre con agujero de mascara-honda.

## Components

### Buttons
Pads de soldadura: planos, rotulados, firmes.
- **Shape:** esquina de pad (4px), alto mínimo 2.875rem.
- **Primary:** pad de cobre con texto mascara-honda en Chakra Petch 600 (0.7rem 1.3rem).
- **Hover / Focus:** pasa a cobre encendido en 140ms; al pulsar baja 1px; foco con anillo de 2px cobre encendido separado 3px; deshabilitado en gris apagado.
- **Secondary:** pad de contorno: transparente, texto serigrafía, contorno interior de 1.5px mascara-borde que se aclara a serigrafía tenue al pasar.

### Cards / Containers
- **Tarjeta de producto (huella):** fondo mascara-honda 4:3, contorno interior de 1px, silueta discontinua serigrafiada, designador arriba a la izquierda, ilustración del producto dentro. Al pasar, el contorno se vuelve cobre de 1.5px y la tarjeta se inclina levemente. Título en serigrafía 1.25rem, detalle en tenue, precio en cobre encendido con cifras tabulares. Sellos «Agotado» (serigrafía) y «Quedan N» (cobre).
- **Panel de placa:** plano de masa con esquinas de 14px, contorno interior y un taladro de 16px en cada esquina.

### Inputs / Fields
- **Style:** fondo mascara-honda, contorno interior de 1.5px mascara-borde, esquina de pad, alto 2.875rem, cursor cobre encendido.
- **Focus:** contorno interior de 2px cobre, sin outline.
- **Error:** contorno interior de 2px alerta y mensaje en alerta debajo.
- **Opción del montador:** la huella entera es la etiqueta del radio; seleccionada lleva contorno cobre de 2px y un tinte de cobre al 6%.

### Navigation
Cabecera fija de 68px: logotipo (silueta serigrafiada con una M de pista de cobre) y enlaces en Hanken 0.95rem, tenues en reposo, serigrafía al pasar y cobre encendido el activo. En móvil, menú desplegable con enlaces de 1.125rem.

### Isla de la cesta
Píldora de cobre de 44px con el número de unidades; al añadir algo crece con un muelle (0.45s, rebote 0.35) para contar el aviso y vuelve a su tamaño. Sin movimiento si se pide movimiento reducido.

### Huellas de interruptor (SW1–SW7)
Fila de huellas con designador, dos pads de cobre, la silueta del interruptor y su fuerza. De cada huella sube una pista de cobre oxidado hasta el teclado; la del elegido es cobre encendido y destella (420ms) con cada pulsación, del teclado físico o del dedo.

### Pista y separador
Pista SVG de cobre sobre un halo de cobre oxidado al 35%, dibujada con el scroll; el separador de sección es una pista con quiebro a 45° y una vía en cada extremo.

## Do's and Don'ts

### Do:
- **Do** usar un único pad de cobre por vista y pads de contorno para todo lo demás.
- **Do** dibujar límites con contorno interior de 1–1.5px en mascara-borde y reservar el contorno cobre para selección y foco.
- **Do** numerar piezas reales con designadores (SW, U, J) en su huella, en orden.
- **Do** separar secciones con la pista a 45° y poner taladros en las esquinas de los paneles de placa.
- **Do** mostrar precios, stock y medidas con cifras tabulares; precios en cobre encendido.
- **Do** respetar el movimiento reducido: pistas ya dibujadas y sin destello.

### Don't:
- **Don't** usar fondos blancos ni negro gamer con luces RGB; la superficie es siempre máscara morada.
- **Don't** usar el cobre como relleno de sección ni como degradado decorativo.
- **Don't** usar el crema FR4 fuera del canto de placa y de los avisos de demostración.
- **Don't** poner un designador o una etiqueta pequeña encima de un titular a modo de antetítulo.
- **Don't** usar Chakra Petch en otro peso que 600 ni otra fuente display.
