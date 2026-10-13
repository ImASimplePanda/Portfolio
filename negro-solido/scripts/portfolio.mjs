// Compila la web dentro del portfolio, en /demos/negro-solido/, y deja public/ como estaba.
import { execSync } from 'node:child_process';
const BASE = '/demos/negro-solido/';
const OUT = '../jeremi-martin-portfolio/demos/negro-solido';
const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
run('node scripts/generar-arte.mjs');
run('node scripts/generar-legal.mjs', { BASE });
run(`npx vite build --base=${BASE} --outDir ${OUT} --emptyOutDir`);
run('node scripts/generar-legal.mjs');
// En el portfolio sobran mapa del sitio, robots, 404 y .htaccess propios: los pone el portfolio
// (y las redirecciones del .htaccess romperían la ruta dentro de una subcarpeta)
import { rmSync } from 'node:fs';
for (const f of ['sitemap.xml', 'robots.txt', '404.html', '.htaccess']) rmSync(`${OUT}/${f}`, { force: true });
console.log(`✓ demo en ${OUT}`);
