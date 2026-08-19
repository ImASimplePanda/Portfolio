// Downloads OFL webfonts from Google Fonts and rewrites them as local, relative-path
// @font-face rules. Japanese faces are subset to exactly the glyphs the page renders.
import fs from 'node:fs';
import crypto from 'node:crypto';

const DIR = new URL('../assets/fonts/', import.meta.url);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const JP_GLYPHS = [
  '影夜山寺門庭苔灯籠手仕事残光月雨楓桜松霧火静寂道京都',
  '第一二三四五六七八九十章石段境内奥深森露草花枝葉土空',
  '天地心無常美陰翳礼讃時間記憶消風音闇朝薄明和紙木職人',
  '祈願鐘参拝路水鏡歩をのへるもみあり坂灰白炭朱',
].join('');

const css2 = async (params) => {
  const u = new URL('https://fonts.googleapis.com/css2');
  for (const [k, v] of params) u.searchParams.append(k, v);
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${u} -> ${r.status}`);
  return r.text();
};

const latinCss = await css2([
  ['family', 'Instrument Serif:ital@0;1'],
  ['family', 'Instrument Sans:wght@400;500;600'],
  ['display', 'swap'],
]);
const jpCss = await css2([
  ['family', 'Shippori Mincho:wght@500;700'],
  ['text', JP_GLYPHS],
  ['display', 'swap'],
]);

const seen = new Map(); // sha1 -> filename, so variable-font duplicates ship once
const faces = [];

const collect = async (css, keepSubset) => {
  const re = /(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{([\s\S]*?)\}/g;
  for (const [, subset, body] of css.matchAll(re)) {
    const tag = (subset || 'subset').trim();
    if (!keepSubset(tag)) continue;
    const fam = /font-family:\s*'([^']+)'/.exec(body)[1];
    const weight = (/font-weight:\s*([^;]+)/.exec(body)?.[1] || '400').trim().replace(/\s+/g, '-');
    const italic = /font-style:\s*italic/.test(body) ? '-italic' : '';
    const url = /url\((https:[^)]+)\)/.exec(body)[1];
    const range = /unicode-range:\s*([^;]+)/.exec(body)?.[1].trim();

    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    const hash = crypto.createHash('sha1').update(buf).digest('hex');
    let file = seen.get(hash);
    if (!file) {
      file = `${fam.toLowerCase().replace(/\s+/g, '-')}-${weight}${italic}-${tag.replace(/[[\]]/g, '')}.woff2`;
      fs.writeFileSync(new URL(file, DIR), buf);
      seen.set(hash, file);
    }
    faces.push({ fam, weight, italic: !!italic, file, range, bytes: buf.length });
  }
};

await collect(latinCss, (s) => s === 'latin' || s === 'latin-ext');
await collect(jpCss, () => true);

const rule = (f) => `@font-face {
  font-family: '${f.fam}';
  font-style: ${f.italic ? 'italic' : 'normal'};
  font-weight: ${f.weight};
  font-display: swap;
  src: url('./${f.file}') format('woff2');${f.range ? `\n  unicode-range: ${f.range};` : ''}
}`;

fs.writeFileSync(new URL('fonts.css', DIR), `/* Kage — self-hosted type, no runtime network requests.
 *
 * Instrument Serif and Instrument Sans (Rodrigo Fuenzalida, Aleksey Ivanov / Extратype)
 * and Shippori Mincho (FONTDASU) are licensed under the SIL Open Font License 1.1.
 * The Japanese faces are subset to only the glyphs this page renders.
 */

${faces.map(rule).join('\n\n')}
`);

console.table(faces.map((f) => ({ family: f.fam, weight: f.weight, file: f.file, kb: (f.bytes / 1024).toFixed(1) })));
console.log('unique files:', seen.size);
