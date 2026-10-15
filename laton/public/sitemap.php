<?php
// Mapa del sitio (servido como /sitemap.xml)
declare(strict_types=1);
require __DIR__ . '/api/_lib/base.php';
header('Content-Type: application/xml; charset=utf-8');
$b = htmlspecialchars(urlBase(), ENT_XML1);
echo '<?xml version="1.0" encoding="UTF-8"?>', "\n", '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', "\n";
foreach (['/', '/configurador', '/cita', '/legal/condiciones', '/legal/aviso-legal', '/legal/privacidad'] as $r) echo "  <url><loc>$b$r</loc></url>\n";
echo "</urlset>\n";
