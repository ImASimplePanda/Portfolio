// Compila Latón dentro del portfolio (jeremimartin.com/demos/laton/) con su propia base de datos
// de demostración en una carpeta privada protegida. Uso: npm run build:portfolio
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';

const BASE = '/demos/laton/';
const OUT = resolve('../jeremi-martin-portfolio/demos/laton');
const PRIV = join(OUT, '_privado');
const PHP = process.env.PHP || 'C:/xampp/php/php.exe';
const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });

run(`npx vite build --base=${BASE} --outDir "${OUT}" --emptyOutDir`);

// Carpeta privada: configuración y base de datos, nunca accesibles desde la web
mkdirSync(join(PRIV, 'datos'), { recursive: true });
writeFileSync(join(PRIV, '.htaccess'), 'Require all denied\n');
const clave = randomBytes(15).toString('base64url');
writeFileSync(join(PRIV, 'laton.env'), [
  '# Demo de Latón en el portfolio. Pago simulado (sin Stripe) y sin correos reales.',
  'DEMO=1',
  'URL_BASE=https://jeremimartin.com/demos/laton',
  'ADMIN_EMAIL=taller@laton.test',
  `ADMIN_CLAVE=${clave}`,
  '',
].join('\n'));
writeFileSync(join(OUT, 'api/_lib/local.php'), "<?php\n// Generado por scripts/portfolio.mjs: la carpeta privada está junto a la demo, protegida.\nreturn dirname(__DIR__, 2) . '/_privado';\n");
run(`"${PHP}" scripts/sembrar.php --reset`, { LATON_RAIZ: PRIV });

for (const f of ['sitemap.php', 'robots.php']) rmSync(join(OUT, f), { force: true });
console.log(`\n✓ Demo en ${OUT}\n  Acceso al panel: taller@laton.test (contraseña en _privado/laton.env)`);
