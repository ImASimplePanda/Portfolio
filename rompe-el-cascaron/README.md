# Rompe el Cascarón

Juego idle/incremental de huevos. Web estática: HTML + CSS + JavaScript sin dependencias,
sin build y sin npm. Se abre con doble clic en `index.html`.

## Qué es

Un idle jugable que, mientras lo juegas, te va abriendo un **cuaderno de diseño** con doce
fichas sobre cómo funciona el género incremental y qué es lo más pedido en él. Cada ficha se
desbloquea justo cuando el juego te hace vivir esa mecánica.

## Cómo se juega

- **Cascar**: pulsa el huevo (o la barra espaciadora). Cada golpe le añade una grieta.
- **Eclosionar**: al llenar las grietas el huevo revienta, te da un bonus y aparece otro que
  pide más golpes.
- **Combo**: golpes encadenados suben un multiplicador temporal de hasta ×3.
- **Corral**: pollito, gallina, pato, avestruz, tortuga, dino, dragón y fénix producen yemas
  solos. A las 10, 25, 50… unidades, cada especie dobla su producción.
- **Huevera**: 13 skins. Cada una compra su multiplicador para siempre y puedes equiparla en
  el huevo del nido.
- **Poner de nuevo** (prestigio): reinicia a cambio de Genes, +10 % de producción cada uno.
- **Huevo dorado**: aparece solo, da ×7 durante 30 s.
- **Progreso offline**: al 50 % con techo de 8 h (hay que comprarlo con Genes).

## Ficheros

| Fichero | Qué hay dentro |
|---|---|
| `index.html` | Estructura de la página |
| `styles.css` | Temas claro y oscuro, escenario, tarjetas, responsive |
| `main.js` | Juego completo: economía, render, partículas, sonido y guardado |
| `favicon.svg` | Icono de pestaña |

## Detalles técnicos

- **Guardado**: `localStorage`, clave `rompe-el-cascaron-v1`, autoguardado cada 5 s. Hay
  exportar/importar partida en base64 desde la propia página.
- **Sonido**: sintetizado con la Web Audio API, sin ficheros de audio. El crujido es ruido
  blanco filtrado en banda con caída muy rápida y frecuencia aleatoria por golpe.
- **Gráficos**: SVG generado por JS (huevos, skins y animales) y un `<canvas>` para las
  partículas de cáscara.
- **Fuentes**: Fredoka y Luckiest Guy desde Google Fonts (requiere conexión; sin ella cae a
  la tipografía del sistema).
- **Accesibilidad**: respeta `prefers-reduced-motion` y `prefers-color-scheme`.

## Publicado

Copia en línea: https://claude.ai/code/artifact/b2e9047d-3658-47a2-9605-4e88bfe8110a
