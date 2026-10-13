# Datos inventados que hay que sustituir antes de abrir la tienda

Mientras `DEMO=1` esté en `surco.env`, la tienda muestra la franja amarilla, no se indexa y el pago es simulado.

| Dato | Dónde |
|---|---|
| Nombre "Surco", razón social Surco Discos S.L., CIF B00000000 y registro mercantil | `src/paginas/Legal.jsx`, `src/componentes/Marco.jsx` (pie), `public/index.php` (datos estructurados) |
| Dirección (Calle Perdomo, 00), horario, teléfono y correos (@surco.test), WhatsApp +34 600 00 00 00 | `src/componentes/Marco.jsx`, `src/paginas/Legal.jsx`, `src/paginas/Vender.jsx` |
| Los 24 discos: artistas, títulos, sellos, números de catálogo, años y precios | `scripts/sembrar.php` (son ficticios) |
| Los 5 tocadiscos: modelos reales, pero precios, años y revisiones inventados | `scripts/sembrar.php` |
| Portadas: generadas por código, no son portadas reales | `src/componentes/Portada.jsx` (se sustituyen solas al subir fotos desde el panel) |
| Tarifas de envío (4,90 € / 9,90 €, gratis desde 60 € / 120 €) | `public/api/_lib/pedidos.php` y `src/lib/formato.js` |
| Política de compra de colecciones (crédito +20 %) | `src/paginas/Vender.jsx` |
| Afirmación "los trámites aduaneros desde Canarias corren de nuestra cuenta" | `src/paginas/Caja.jsx`, `src/paginas/Legal.jsx` |
| Textos legales: plantilla; que los revise un asesor | `src/paginas/Legal.jsx` |
