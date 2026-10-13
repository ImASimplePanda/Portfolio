// Compila Surco dentro del portfolio (jeremimartin.com/demos/surco/) con su propia base de datos
// de demostración en una carpeta privada protegida. Uso: npm run build:portfolio
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';

const BASE = '/demos/surco/';
const OUT = resolve('../jeremi-martin-portfolio/demos/surco');
const PRIV = join(OUT, '_privado');
const PHP = process.env.PHP || 'C:/xampp/php/php.exe';
const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });

run(`npx vite build --base=${BASE} --outDir "${OUT}" --emptyOutDir`);

// Carpeta privada: configuración y base de datos, nunca accesibles desde la web
mkdirSync(join(PRIV, 'datos'), { recursive: true });
writeFileSync(join(PRIV, '.htaccess'), 'Require all denied\n');
const clave = randomBytes(15).toString('base64url');
writeFileSync(join(PRIV, 'surco.env'), [
  '# Demo de Surco en el portfolio. Pago simulado (sin Stripe) y sin correos reales.',
  'DEMO=1',
  'URL_BASE=https://jeremimartin.com/demos/surco',
  'ADMIN_EMAIL=admin@surco.test',
  `ADMIN_CLAVE=${clave}`,
  '',
].join('\n'));
writeFileSync(join(OUT, 'api/_lib/local.php'), "<?php\n// Generado por scripts/portfolio.mjs: la carpeta privada está junto a la demo, protegida.\nreturn dirname(__DIR__, 2) . '/_privado';\n");
run(`"${PHP}" scripts/sembrar.php --reset`, { SURCO_RAIZ: PRIV });

// Fotos de prueba subidas en local: no viajan a la demo
const subidas = join(OUT, 'subidas');
if (existsSync(subidas)) for (const f of readdirSync(subidas)) if (f.endsWith('.webp')) rmSync(join(subidas, f));
for (const f of ['sitemap.php', 'robots.php']) rmSync(join(OUT, f), { force: true });
console.log(`\n✓ Demo en ${OUT}\n  Acceso al panel: admin@surco.test (contraseña en _privado/surco.env)`);
