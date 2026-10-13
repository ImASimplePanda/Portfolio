# Surco · tienda online de discos y tocadiscos de segunda mano (demo)

React 19 + Vite + Tailwind CSS 4 + componentes de React Bits en el frontend; PHP 8 con PDO en el backend (SQLite en local, MySQL en Hostinger). Pago con Stripe Checkout; sin claves de Stripe funciona en modo de pago simulado.

## Arrancar en local
1. `C:/xampp/php/php.exe scripts/sembrar.php` crea la base de datos (`datos/surco.sqlite`) con 32 productos de ejemplo y la cuenta de administración de `surco.env`.
2. Servidor de la API: `php -d extension=gd -S 127.0.0.1:8091 -t public public/api/index.php`.
3. Frontend: `npm run dev` (http://localhost:5197, con `/api` redirigido al PHP).

Para probar la versión compilada como en el hosting: `npm run build` y `php -d extension=gd -S 127.0.0.1:8092 -t dist scripts/servidor-produccion.php`.

## Publicar en Hostinger (su propio dominio)
1. `npm run build` y subir el contenido de `dist/` a `public_html/`.
2. Crear una base de datos MySQL en hPanel.
3. Crear `surco.env` **en la carpeta superior a `public_html`** (nunca dentro):
   ```
   DEMO=0
   DB_DSN=mysql:host=localhost;dbname=uXXXX_surco;charset=utf8mb4
   DB_USER=uXXXX_surco
   DB_PASS=...
   URL_BASE=https://tu-dominio.com
   STRIPE_SECRET=sk_live_...        (o sk_test_ para probar)
   STRIPE_WEBHOOK_SECRET=whsec_...
   MAIL_FROM=pedidos@tu-dominio.com
   ADMIN_EMAIL=...
   ADMIN_CLAVE=...                  (mínimo 10 caracteres)
   ```
4. Ejecutar `php scripts/sembrar.php` una vez (por SSH), o crear los productos desde el panel.
5. En Stripe, crear un webhook a `https://tu-dominio.com/api/stripe/webhook` con los eventos `checkout.session.completed` y `checkout.session.expired`.
6. Las fotos subidas viven en `public_html/subidas/`: no borrar esa carpeta al volver a subir la web.

## Demo en el portfolio
`npm run build:portfolio` compila en `jeremi-martin-portfolio/demos/surco/` con su propia base de datos de demostración y su configuración en `_privado/` (protegida). Cada compilación genera una contraseña nueva de administración (está en `_privado/surco.env`).

## Seguridad
- Consultas preparadas (PDO), CSRF en toda petición que cambia datos, `password_hash`, sesión con cookie HttpOnly/SameSite y límite de intentos de acceso.
- El precio y el envío los calcula siempre el servidor; el stock se reserva con un `UPDATE ... WHERE stock >= ?` dentro de una transacción.
- Subida de imágenes: se comprueba el tipo real, se recodifica a WebP con GD (nunca se guarda el original) y en `subidas/` no se ejecuta código.
- `.htaccess`: HTTPS, HSTS, CSP estricta (`'self'`), sin listado de carpetas y bloqueo de ficheros de configuración.
- Webhook de Stripe con verificación de firma.

## Componentes de React Bits
CircularText (texto que gira en la galleta del vinilo), Counter (número de la cesta), SwipeToast (avisos) y TearTicket (resguardo del pedido). La cubeta, las portadas generadas y la ilustración de los tocadiscos son propias.
