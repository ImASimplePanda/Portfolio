<?php
// robots.txt con la URL absoluta del sitemap. En modo demo no se indexa nada.
declare(strict_types=1);
require __DIR__ . '/api/_lib/base.php';
header('Content-Type: text/plain; charset=utf-8');
if (esDemo()) { echo "User-agent: *\nDisallow: /\n"; exit; }
echo "User-agent: *\nDisallow: /api/\nDisallow: /admin\nDisallow: /cesta\nDisallow: /caja\nDisallow: /cuenta\nDisallow: /pedido/\n\nSitemap: " . urlBase() . "/sitemap.xml\n";
