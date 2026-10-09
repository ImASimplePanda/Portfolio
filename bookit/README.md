# Bookit · web de la librería

PHP 8 + MySQL, sin build. Probado en local con PHP 8.2 y SQLite.

## Probar en local

```
C:\xampp\php\php.exe -S localhost:8080 router.php
```

Abre http://localhost:8080. La base SQLite (`data/bookit.sqlite`) se crea sola con el catálogo de ejemplo.
Para probar con datos extremos: `php _src/worst-case.php` (y `php _src/worst-case.php quitar`).

## Subir a Hostinger (cuando lo confirmes)

1. hPanel → Bases de datos → crea una base MySQL y un usuario.
2. Crea `config.local.php` junto a `config.php`:
   ```php
   <?php return [
       'db_driver' => 'mysql', 'db_host' => 'localhost',
       'db_name' => '...', 'db_user' => '...', 'db_pass' => '...',
       'site_url' => 'https://tudominio.es',
       'install_key' => 'una-clave-larga',
       'tienda' => ['direccion' => '...', 'cp_ciudad' => '...', 'horario' => '...', 'telefono' => '...', 'email' => '...', 'mapa_url' => '...'],
   ];
   ```
3. Sube todo menos `_src/`, `.impeccable/`, `.claude/` y `data/bookit.sqlite`.
4. Visita `/install.php?key=una-clave-larga` una vez y borra `install.php`.
5. Cuando cargues el catálogo real, pon `'demo' => false`.

## Estructura

- `index.php`, `catalogo.php`, `libro.php`, `cesta.php`, `pedido.php`, `entrar.php`, `cuenta.php`, `deseados.php`: páginas.
- `api/`: cesta, deseados y boletín (responden JSON a `bookit.js` y funcionan también sin JavaScript).
- `inc/`: arranque, base de datos, maqueta, catálogo de ejemplo.
- `DESIGN.md`: sistema visual. `PRODUCT.md`: contexto de producto.
