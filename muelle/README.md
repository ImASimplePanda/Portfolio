# Muelle · tienda de teclados mecánicos (demo)

Tienda online de una marca ficticia de teclados mecánicos en Valencia. Se puede **oír** cada interruptor (sonido sintetizado con Web Audio, sin grabaciones) y **ver** el teclado en 3D mientras se monta, con el precio y el stock comprobados por el servidor.

## Tecnología
- **Frontend:** React 19, Vite, Tailwind CSS 4, three.js con React Three Fiber y drei.
- **Componentes de terceros:**
  - React Bits: ClickSpark y TearTicket.
  - Magic UI: Marquee.
  - SmoothUI: técnica de la Dynamic Island en la isla de la cesta.
  - unlumen UI: Tilt, para las tarjetas.
  - shadcn/ui: Sheet, para la cesta lateral.
  - anime.js: dibujo de curvas y pistas.
  - motion: cifras animadas e isla.
- **Backend:** PHP 8 con PDO (SQLite en local, MySQL en Hostinger). Pago con Stripe Checkout; sin claves de Stripe, el pago es simulado.

## Qué hace
- **Probador de sonido.** Escribes en tu teclado físico, o tocas la pantalla en el móvil, y suena el interruptor elegido. La placa (latón, aluminio, policarbonato, FR4) y la carcasa (aluminio, policarbonato, nogal) cambian el tono y el cuerpo del sonido (`src/lib/sonido.js`).
- **Teclado en 3D** hecho con primitivas a partir de la distribución ISO española (`src/lib/distribuciones.js`): 60 %, 65 %, 75 % y TKL. Las teclas se hunden al pulsarlas y los rótulos salen de un único lienzo.
- **Anatomía en la portada:** al hacer scroll, el teclado se separa en sus cinco capas.
- **Montador en cinco estaciones:** formato, carcasa, placa, interruptores y teclas.
  - El servidor recalcula el precio con el mismo `montador.json`.
  - Al comprar, reserva de forma atómica los packs de interruptores y el juego de teclas que necesita el montaje.
- **Tienda:** catálogo con filtros, fichas (con curva de fuerza en los interruptores), cesta lateral, caja con envío por código postal, pedido con resguardo, cuentas de cliente y panel de administración. En el panel, cada interruptor tiene su sonido ajustable.

## Arrancar en local
1. Crea `muelle.env` en la raíz:
   ```
   DEMO=1
   ADMIN_EMAIL=taller@muelle.test
   ADMIN_CLAVE=una-clave-larga
   ```
2. `C:/xampp/php/php.exe scripts/sembrar.php --reset` crea la base de datos con 23 productos.
3. API: `php -d extension=gd -S 127.0.0.1:8096 -t public public/api/index.php`.
4. Web: `npm run dev` (http://localhost:5199).

Versión compilada como en el hosting: `npm run build` y `php -d extension=gd -S 127.0.0.1:8097 -t dist scripts/servidor-produccion.php`.

## Publicar en Hostinger (su propio dominio)
1. `npm run build` y subir `dist/` a `public_html/`. Incluye la carpeta `.vite`, que `index.php` usa para precargar el código de cada página.
2. Crear una base de datos MySQL y `muelle.env` **fuera de `public_html`**, con `DEMO=0`, `DB_DSN`, `DB_USER`, `DB_PASS`, `URL_BASE`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `MAIL_FROM`, `ADMIN_EMAIL` y `ADMIN_CLAVE`.
3. `php scripts/sembrar.php` una vez, o crear los productos desde el panel.
4. Webhook de Stripe a `https://tu-dominio.com/api/stripe/webhook` con `checkout.session.completed` y `checkout.session.expired`.

## Demo en el portfolio
`npm run build:portfolio` compila en `jeremi-martin-portfolio/demos/muelle/` con su base de datos en `_privado/` (protegida). Cada compilación crea una contraseña nueva del panel, que queda en `_privado/muelle.env`.

## Seguridad
- **Formularios y sesión:** consultas preparadas, CSRF en toda petición que cambia algo, `password_hash` y límite de intentos de acceso.
- **Precios y stock:** el precio y el envío los calcula siempre el servidor. El stock se reserva con `UPDATE ... WHERE stock >= ?` dentro de una transacción, también para las piezas de un montaje.
- **CSP estricta:** la envía `index.php` con un nonce por petición, y solo admite estilos propios más los que el panel lateral crea con ese nonce. Nada se incrusta en `data:`.
- **Fotos subidas:** se recodifican a WebP con GD y en `subidas/` no se ejecuta código.

## Rendimiento
three.js (unos 260 KB comprimidos) solo se descarga para el teclado 3D. Debajo de la primera pantalla, la portada llega en un bloque aparte, y el servidor deja dentro de cada página los datos de su primera pantalla.

En un móvil lento simulado (4G lento y CPU ×4):

| Página | Carga |
|---|---|
| Portada | 2,4 s |
| Montador, fichas y catálogo | 3,2–3,5 s |
