<?php
// Mapa del sitio generado desde la base de datos (servido como /sitemap.xml)
declare(strict_types=1);
require __DIR__ . '/api/_lib/base.php';
header('Content-Type: application/xml; charset=utf-8');
$b = htmlspecialchars(urlBase(), ENT_XML1);
echo '<?xml version="1.0" encoding="UTF-8"?>', "\n", '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', "\n";
foreach (['/', '/discos', '/tocadiscos', '/accesorios', '/vender', '/legal/condiciones', '/legal/envios'] as $r) echo "  <url><loc>$b$r</loc></url>\n";
foreach (db()->query('SELECT slug, creado FROM productos WHERE activo = 1 ORDER BY id') as $p) {
    echo "  <url><loc>$b/producto/" . htmlspecialchars($p['slug'], ENT_XML1) . '</loc><lastmod>' . substr($p['creado'], 0, 10) . "</lastmod></url>\n";
}
echo "</urlset>\n";
