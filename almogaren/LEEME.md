# Almogarén

Portal B2B de una distribuidora de producto canario a hostelería y tienda
especializada en Gran Canaria. React sobre Node y SQLite, con catálogo de precio
por cliente, borrador de pedido y panel de gestión.

```bash
npm install
npm run dev      # API en :5190 y cliente en :5191
npm run build    # cliente a dist/
npm start        # producción: un solo proceso sirve API y cliente
npm run lint
```

La primera vez se crea `datos/almogaren.db` con datos de ejemplo. Todas las
cuentas usan la contraseña `almogaren`:

| Cuenta | Rol |
|---|---|
| `admin@almogaren.test` | Dirección — panel completo, altas, tarifas y precios |
| `comercial@almogaren.test` | Comercial — panel sin tocar precios ni dar altas |
| `compras@hotelmaspalomas.test` | Cliente — tarifa −15 % y un precio negociado |
| `pedidos@restaurantevegueta.test` | Cliente — tarifa hostelería −8 % |
| `hola@tiendateror.test` | Cliente — tarifa general |

## El precio depende del cliente

Es la razón de que el catálogo esté tras un login. Para un mismo artículo:

```
precio negociado  >  descuento de su tarifa  >  precio base
```

El queso `QFG-001` cuesta 48,50 € de base, 44,62 € para la tarifa de hostelería
y 39,90 € para la cadena, que lo tiene cerrado por contrato. Sin sesión no se
muestra ningún precio, porque un precio público sería falso para casi todos.

El cálculo se hace **siempre en el servidor**, también al confirmar el pedido:
si el navegador envía un importe, se ignora.

## Estructura

```
servidor/
  db.js            esquema, semilla y cálculo de precio por cliente
  auth.js          scrypt, tokens y límite de intentos
  sesiones.js      cookies y middleware de rol
  rutas/           cuenta · catalogo · pedidos · borrador · admin
  index.js         Express, cabeceras de seguridad y estáticos
src/
  lib/             api, formato, enrutado por hash, sesión, borrador
  paginas/         Puerta · Catalogo · Pedidos · Panel · Cuenta
  estilo.css       sistema de diseño
public/img/        héroe en AVIF y WebP, cuatro anchos
_originales/       fotos sin procesar, no se publican
datos/almogaren.db se crea solo, no se versiona
```

Dependencias de producción: `express`, `better-sqlite3`, `react` y `react-dom`.
El hash de contraseñas, los tokens de sesión, el límite de intentos, el lector
de cookies y las cabeceras de seguridad van escritos a mano.

## Borrador de pedido

Cada cliente tiene un borrador guardado en su cuenta, no en el navegador. Se
salva con 600 ms de retardo para no lanzar una petición por tecla, sobrevive al
cierre de sesión y del navegador, y puede retomarse desde otro equipo. Al
confirmar el pedido se elimina en la misma transacción que lo crea.

Se almacenan solo SKU y cantidad. El nombre y el importe se resuelven contra el
catálogo que ve ese cliente al pintarlo, de modo que un cambio de precio no deja
cifras antiguas en pantalla.

## Diseño

Dos registros unidos por el login:

- **Puerta** (pública): héroe a sangre con la costa de la isla, tipografía
  grande sobre la foto y la franja de datos operativos encima de la imagen. Lee
  del catálogo real, así que las familias y los productores salen de la misma
  base de datos que el almacén.
- **Almacén** (privado): denso y tabular. Tabla con stock, precio propio y una
  casilla de cantidad por línea.

Una sola familia tipográfica, Schibsted Grotesk en pesos 400 a 900: el contraste
lo dan el peso y el tamaño. Las cifras se alinean con `tabular-nums`.

| | |
|---|---|
| Cal | `#EDEBE4` fondo |
| Picón | `#1A1714` tinta y barra del almacén (14,5:1) |
| Barranco | `#2C3A2E` bloque oscuro |
| Vino | `#8C2E1F` acento (7,0:1) |

Los colores semánticos del almacén (`ok`, `aviso`, `falta`) son independientes
del acento, para que un stock bajo no compita con un enlace.

El héroe admite vídeo sin tocar nada más: basta sustituir el `<picture>` de
`Puerta.jsx` por un `<video muted playsinline loop poster="...">`.

## Seguridad

- Contraseñas con scrypt, sal aleatoria por usuario y comparación en tiempo
  constante. Los parámetros de coste se guardan junto al hash, así que pueden
  subirse sin invalidar las claves existentes.
- Tokens de sesión de 32 bytes guardados hasheados: leer la base no permite
  suplantar una sesión abierta.
- Cookie `httpOnly` y `SameSite=Lax`.
- Un cliente no puede ver el pedido de otro; la respuesta es 404 y no 403, para
  no confirmar que la referencia existe.
- Mismo mensaje de error si el correo no existe o si la contraseña falla.
- Límite de intentos por correo y por origen, para que nadie pueda bloquear la
  cuenta de otro fallando adrede.
- Roles comprobados en el servidor, no sólo ocultando botones.
- El pedido se graba en una transacción: si una línea falla por stock, no queda
  medio pedido ni stock descontado a medias.
- Nadie puede desactivarse ni cambiar su propio rol.
- El dinero se guarda en céntimos enteros.

Pendiente para producción:

- HTTPS. Hoy la cookie sólo lleva `secure` con `NODE_ENV=production`.
- Recuperación de contraseña por correo, ahora manual desde el panel.
- Auditoría de cambios de precio y de stock.
- Copias de seguridad de `datos/almogaren.db`.
- Con varios procesos, el límite de intentos debe salir de memoria a la base.

## Despliegue

`npm run build` y `npm start`: un solo proceso sirve la API y el cliente
compilado, así que basta un VPS con Node. No funciona en hosting compartido de
tipo PHP.

La API usa la variable `PORT_API` (5190 por defecto) y no `PORT`, porque muchos
lanzadores inyectan `PORT` para el servidor web y la API acabaría intentando
ocupar ese mismo puerto.

## Contenido de ejemplo

Productores, precios, stock, clientes y pedidos son inventados y no corresponden
a ninguna empresa existente. Lo marcado con subrayador amarillo está pendiente
de rellenar.

Los tipos de producto y los sellos (Queso de Flor de Guía DOP, DO Gran Canaria,
café de Agaete, Miel de Gran Canaria DOP, Gofio Canario IGP, papa antigua IGP)
proceden de conocimiento general y **no están verificados contra el registro
oficial**. Antes de usar el catálogo con un cliente real hay que comprobar uno
por uno que la denominación y el ámbito son exactos.

La fotografía del héroe es de banco de imágenes libre.
