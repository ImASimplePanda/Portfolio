# Latón · bicicletas a medida con configurador 3D (demo)

Web de un taller ficticio de cuadros de acero y titanio en Gran Canaria. React 19 + Vite + Tailwind CSS 4 + three.js (React Three Fiber) en el frontend; PHP 8 con PDO en el backend (SQLite en local, MySQL en Hostinger). Pago de la señal con Stripe Checkout; sin claves de Stripe funciona con pago simulado.

## Qué hace
- **Configurador**: modelo, medidas del ciclista, material, acabado, transmisión, ruedas y extras. La bici se ve en 3D (hecha con primitivas, sin modelos descargados) o como plano con cotas. El precio, el plazo y el peso se recalculan al momento.
- **Una sola geometría** (`src/lib/geometria.js`) alimenta el plano SVG y el modelo 3D: cambia la talla y cambian los dos.
- **Bicis guardadas** con código (`LT-XXXXXX`) para compartirlas.
- **Citas de medición** con calendario de huecos reales; dos personas no pueden coger el mismo hueco (índice único en base de datos).
- **Encargo con señal** (30 %) y página privada de seguimiento con las etapas de fabricación.
- **Panel del taller** (`/taller`): citas, encargos y avance de cada bici (el cliente recibe un correo en cada cambio).

## Arrancar en local
1. Crea `laton.env` en la raíz del proyecto:
   ```
   DEMO=1
   ADMIN_EMAIL=taller@laton.test
   ADMIN_CLAVE=una-clave-larga
   ```
2. `C:/xampp/php/php.exe scripts/sembrar.php --reset` crea la base de datos con encargos y citas de ejemplo.
3. API: `php -S 127.0.0.1:8094 -t public public/api/index.php`.
4. Web: `npm run dev` (http://localhost:5198, con `/api` redirigido al PHP).

Versión compilada como en el hosting: `npm run build` y `php -S 127.0.0.1:8095 -t dist scripts/servidor-produccion.php`.

## Publicar en Hostinger (su propio dominio)
1. `npm run build` y subir el contenido de `dist/` a `public_html/` (incluida la carpeta `.vite`, que usa `index.php`).
2. Crear una base de datos MySQL en hPanel.
3. Crear `laton.env` **en la carpeta superior a `public_html`**, nunca dentro:
   ```
   DEMO=0
   DB_DSN=mysql:host=localhost;dbname=uXXXX_laton;charset=utf8mb4
   DB_USER=uXXXX_laton
   DB_PASS=...
   URL_BASE=https://tu-dominio.com
   STRIPE_SECRET=sk_live_...        (o sk_test_ para probar)
   STRIPE_WEBHOOK_SECRET=whsec_...
   MAIL_FROM=taller@tu-dominio.com
   ADMIN_EMAIL=...
   ADMIN_CLAVE=...                  (mínimo 10 caracteres)
   ```
4. Ejecutar `php scripts/sembrar.php` una vez para crear la cuenta del taller (y borrar luego los encargos de ejemplo desde la base de datos, o no ejecutar la parte de ejemplos).
5. En Stripe, webhook a `https://tu-dominio.com/api/stripe/webhook` con `checkout.session.completed` y `checkout.session.expired`.

## Demo en el portfolio
`npm run build:portfolio` compila en `jeremi-martin-portfolio/demos/laton/` con su base de datos de demostración en `_privado/` (protegida). Cada compilación genera una contraseña nueva del panel (está en `_privado/laton.env`).

## Seguridad
- Consultas preparadas, CSRF en toda petición que cambia datos, `password_hash`, cookie de sesión HttpOnly/SameSite y límite de intentos (acceso al panel, citas, encargos, guardado).
- El precio lo calcula siempre el servidor con las mismas reglas que el configurador (`public/api/_lib/opciones.php` y `src/lib/configuracion.js` leen el mismo `opciones.json`).
- Enlaces privados de cita y encargo con token aleatorio de 128 bits comparado en tiempo constante.
- `.htaccess`: HTTPS, HSTS, CSP estricta (`'self'`, sin `unsafe-inline`), sin listado de carpetas y bloqueo de ficheros de configuración.

## Rendimiento
three.js (unos 270 KB comprimidos) solo se descarga al llegar a la sección del montaje o al configurador. La portada pinta en unos 2,3 s en un móvil lento simulado (4G lento y CPU ×4). El servidor precarga el código de cada página según la ruta.
