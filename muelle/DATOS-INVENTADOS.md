# Datos inventados que hay que sustituir antes de abrir la tienda

Mientras `DEMO=1` esté en `muelle.env`, la tienda muestra la franja de demostración, no se indexa y el pago es simulado.

| Dato | Dónde |
|---|---|
| Marca «Muelle», razón social Muelle Teclados S.L., CIF B00000000 y registro mercantil | `src/paginas/Legal.jsx`, `src/componentes/Marco.jsx` (pie), `public/index.php` (datos estructurados) |
| Dirección del taller (Calle del Doctor Sumsi, 00, Valencia), horario, teléfono y correos @muelle.test | `src/componentes/Marco.jsx`, `src/paginas/Legal.jsx` |
| Los 7 interruptores (Crema, Seda, Granito, Bergamota, Grafito, Cigarra, Gorrión): nombres, fuerzas, recorridos y precios | `scripts/sembrar.php` |
| Los 7 juegos de teclas y sus colores | `scripts/sembrar.php` |
| Los 4 teclados montados y los accesorios | `scripts/sembrar.php` |
| Precios del montador (kits, carcasas, placas, extras, montaje) | `public/api/_lib/montador.json` |
| Tarifas de envío (4,90 € / 7,90 € / 12,90 €, gratis desde 80 € o 150 €) | `public/api/_lib/pedidos.php` y `src/lib/formato.js` |
| Plazos (24-48 h, 5 días para montajes), 30 días de devolución en montajes a medida, garantía de estabilizadores | `src/paginas/InicioResto.jsx` (preguntas), `src/paginas/Legal.jsx` |
| **El sonido es sintetizado**, no son grabaciones de interruptores reales; los parámetros son una aproximación | `src/lib/sonido.js`, `specs.sonido` de cada interruptor |
| Curvas de fuerza: generadas con una fórmula, no medidas | `src/componentes/CurvaFuerza.jsx` |
| Textos legales: plantilla; que los revise un asesor | `src/paginas/Legal.jsx` |

No hay fotos de producto: las piezas se dibujan por código (teclado en SVG y 3D, interruptores en SVG). Al subir fotos desde el panel se usan esas fotos.
