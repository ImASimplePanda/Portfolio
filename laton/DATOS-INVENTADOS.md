# Datos inventados que hay que sustituir antes de abrir la web

Mientras `DEMO=1` esté en `laton.env`, la web muestra la franja de demostración, no se indexa y el pago es simulado.

| Dato | Dónde |
|---|---|
| Nombre "Latón", razón social Latón Bicicletas S.L., CIF B00000000 y registro mercantil | `src/paginas/Legal.jsx`, `src/componentes/Marco.jsx` (pie), `public/index.php` (datos estructurados) |
| Dirección (Carretera del Centro, 00, Tafira Alta), teléfono 928 000 000 y correo @laton.test | `src/componentes/Marco.jsx`, `src/paginas/Cita.jsx`, `src/paginas/VerCita.jsx`, `public/api/_lib/citas.php`, `public/index.php` |
| Horario del taller y de las citas | `src/componentes/Marco.jsx`, `public/api/_lib/citas.php` (`HORARIO`) |
| Personas: Néstor Cabrera, Ainhoa Suárez, su historia y la cita textual | `src/paginas/Inicio.jsx` (`ElTaller`) |
| "Desde 2014", "unas 35 bicis al año", "40 horas por cuadro" | `src/paginas/Inicio.jsx`, `src/componentes/Marco.jsx` |
| La Jable de Carmen (ejemplo del plano de portada) | `src/paginas/Inicio.jsx` (`CARMEN`) |
| Todos los precios, pesos y plazos | `public/api/_lib/opciones.json` |
| Fórmulas de talla (stack, reach, tubo de sillín a partir de altura y entrepierna) | `src/lib/configuracion.js` y `public/api/_lib/opciones.php`: son una aproximación verosímil, no un método de fitting |
| **Fotos generadas con IA**: Néstor, Ainhoa, el taller, los pasos del proceso y las bicis en Gran Canaria son imágenes inventadas, no del taller | `public/fotos/` |
| Encargos y citas de ejemplo (nombres y teléfonos) | `scripts/sembrar.php` |
| Fitters de confianza en Tenerife, Madrid y Barcelona | `src/paginas/Inicio.jsx` |
| Condiciones de encargo, garantía de por vida y textos legales: plantilla; que los revise un asesor | `src/paginas/Legal.jsx` |

Las marcas de componentes (Shimano, SRAM, DT Swiss, Sapim, SON, Gates, Brooks, Columbus) son reales; sus precios aquí no lo son.
