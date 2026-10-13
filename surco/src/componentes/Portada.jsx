// Portadas generadas por código para los discos de la demo: seis familias de diseño
// de sello (bloques, círculos, franjas, tipografía, ondas y retícula) con paletas de época.
// Si el producto tiene fotos subidas desde el panel, se usa la foto en su lugar.
import { memo, useId } from 'react';
import { subida } from '../lib/base.js';

const PALETAS = [
  ['#ece4d2', '#d4472a', '#1d3a8a', '#f0b232', '#161616'],
  ['#0f2f4a', '#f2e6cf', '#e0643b', '#7fb7be', '#0b1a28'],
  ['#f4f1ea', '#111111', '#e63b2e', '#f4f1ea', '#111111'],
  ['#1b4d3e', '#e9dfc7', '#f2a541', '#c44536', '#0e2a22'],
  ['#e8d9f1', '#3a2463', '#ff6b4a', '#ffd23f', '#1d1236'],
  ['#d9e7ec', '#0b3954', '#bfd7ea', '#ff5a5f', '#08263a'],
  ['#2b2b2b', '#f6c85f', '#6f4e7c', '#9dd866', '#ca472f'],
  ['#fbe9d0', '#244f26', '#e5a823', '#bc4b51', '#0f2410'],
  ['#c7d3d4', '#1f2a44', '#e4572e', '#29335c', '#f3a712'],
  ['#ffe5d9', '#9d0208', '#370617', '#f48c06', '#03071e'],
];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tinta legible sobre un color: oscura sobre fondos claros, clara sobre oscuros
function sobre(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.32 ? '#141414' : '#f7f5f0';
}

const corto = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '');

// Texto que se ajusta a su hueco: estima el ancho y, si no cabe, lo comprime con textLength
function T({ x, y, max, size, ancho = 0.5, children, fill, peso = 700, stretch = '100%', espaciado }) {
  const txt = String(children || '');
  const estimado = txt.length * size * ancho;
  const ajustar = estimado > max;
  return (
    <text x={x} y={y} fill={fill} className="font-display" textLength={ajustar ? max : undefined} lengthAdjust={ajustar ? 'spacingAndGlyphs' : undefined}
      style={{ fontWeight: peso, fontStretch: stretch, fontSize: size, letterSpacing: espaciado }}>{txt}</text>
  );
}

function Diseno({ familia, r, pal, titulo, artista, idc }) {
  const [fondo, a, b, c, tinta] = pal;
  switch (familia) {
    case 0: { // bloques de color al estilo de los sellos de jazz
      const x = 40 + r() * 120, y = 60 + r() * 100;
      return (
        <>
          <rect width="300" height="300" fill={fondo} />
          <rect x="0" y="0" width={x} height="300" fill={a} />
          <rect x={x} y={y} width={300 - x} height={300 - y} fill={b} />
          <rect x={x + 20} y={y + 30} width="46" height="46" fill={c} />
          <g transform={`translate(${Math.min(x - 12, 54)} 284) rotate(-90)`}>
            <T x={0} y={0} max={262} size={40} ancho={0.6} fill={sobre(a)} peso={850} stretch="62%">{corto(artista || titulo, 26).toUpperCase()}</T>
          </g>
          <T x={x + 14} y={285} max={300 - x - 28} size={15} fill={sobre(b)}>{corto(titulo, 30)}</T>
        </>
      );
    }
    case 1: { // círculos concéntricos desplazados
      const cx = 90 + r() * 120, cy = 90 + r() * 120;
      return (
        <>
          <rect width="300" height="300" fill={a} />
          {[150, 118, 88, 60, 34].map((rad, i) => <circle key={i} cx={cx} cy={cy} r={rad} fill={[fondo, b, c, tinta, fondo][i]} />)}
          <rect x="0" y="252" width="300" height="48" fill={tinta} />
          <T x={16} y={283} max={268} size={17} ancho={0.62} fill={sobre(tinta)} peso={800} stretch="120%">{corto(artista, 30)}</T>
          <T x={16} y={30} max={268} size={13} fill={sobre(a)} peso={600}>{corto(titulo, 40)}</T>
        </>
      );
    }
    case 2: { // franjas de anchura variable
      const franjas = [];
      let x = 0, i = 0;
      while (x < 300) { const w = 12 + r() * 46; franjas.push(<rect key={i} x={x} y="0" width={w} height="300" fill={[a, b, c, fondo][i % 4]} />); x += w; i++; }
      return (
        <>
          <g transform={`rotate(${r() > 0.5 ? -18 : 0} 150 150)`}>{franjas}</g>
          <rect x="0" y="206" width="300" height="94" fill={tinta} />
          <T x={16} y={246} max={268} size={30} ancho={0.48} fill={sobre(tinta)} peso={850} stretch="80%">{corto(titulo, 30)}</T>
          <T x={16} y={276} max={268} size={15} fill={sobre(tinta)} peso={500}>{corto(artista, 36)}</T>
        </>
      );
    }
    case 3: { // tipografía gigante recortada
      const palabra = (titulo || '').split(' ').sort((p, q) => q.length - p.length)[0] || 'LP';
      return (
        <>
          <rect width="300" height="300" fill={b} />
          <text x="-8" y="214" fill={c} className="font-display" style={{ fontWeight: 900, fontStretch: '50%', fontSize: 210, letterSpacing: '-0.04em' }}>{palabra.toUpperCase()}</text>
          <rect x="16" y="16" width="120" height="4" fill={sobre(b)} />
          <T x={16} y={44} max={268} size={16} fill={sobre(b)}>{corto(artista, 34)}</T>
          <T x={16} y={284} max={268} size={13} fill={sobre(b)} peso={500}>{corto(titulo, 44)}</T>
        </>
      );
    }
    case 4: { // ondas de osciloscopio
      const lineas = [];
      const fase = r() * 6, amp = 14 + r() * 22, frec = 0.02 + r() * 0.03;
      for (let k = 0; k < 14; k++) {
        let d = '';
        for (let x = 0; x <= 300; x += 6) {
          const y = 70 + k * 12 + Math.sin(x * frec + fase + k * 0.5) * amp * Math.sin((x / 300) * Math.PI);
          d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
        }
        lineas.push(<path key={k} d={d} fill="none" stroke={k % 3 === 0 ? c : a} strokeWidth="2" />);
      }
      return (
        <>
          <rect width="300" height="300" fill={tinta} />
          {lineas}
          <T x={16} y={40} max={268} size={20} ancho={0.66} fill={sobre(tinta)} peso={800} stretch="130%">{corto(artista, 28)}</T>
          <T x={16} y={282} max={268} size={14} fill={sobre(tinta)} peso={600}>{corto(titulo, 40)}</T>
        </>
      );
    }
    case 5: { // retícula de puntos con uno destacado
      const elegido = Math.floor(r() * 36);
      const puntos = [];
      for (let i = 0; i < 36; i++) {
        const cx = 45 + (i % 6) * 42, cy = 45 + Math.floor(i / 6) * 34;
        puntos.push(<circle key={i} cx={cx} cy={cy} r={i === elegido ? 16 : 9} fill={i === elegido ? c : a} />);
      }
      return (
        <>
          <rect width="300" height="300" fill={fondo} />
          {puntos}
          <rect x="0" y="244" width="300" height="56" fill={b} />
          <T x={16} y={270} max={268} size={17} fill={sobre(b)} peso={800} stretch="90%">{corto(artista, 32)}</T>
          <T x={16} y={290} max={268} size={12} fill={sobre(b)} peso={500}>{corto(titulo, 46)}</T>
        </>
      );
    }
    default:
      return <rect width="300" height="300" fill={fondo} />;
  }
}

function Portada({ producto, className = '', tamanos = '(max-width: 640px) 50vw, 300px', decorativa = false }) {
  const idc = useId();
  const foto = producto?.imagenes?.[0];
  if (foto) {
    return (
      <img
        className={`block w-full h-full object-cover ${className}`}
        src={subida(foto, 960)}
        srcSet={`${subida(foto, 480)} 480w, ${subida(foto, 960)} 960w, ${subida(foto, 1600)} 1600w`}
        sizes={tamanos}
        width="960"
        height="960"
        alt={decorativa ? '' : `Portada de ${producto.titulo}`}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const spec = producto?.portada || {};
  const semilla = Number(spec.semilla) || 7;
  const r = rng(semilla);
  const pal = PALETAS[semilla % PALETAS.length];
  const familia = typeof spec.familia === 'number' ? spec.familia : 0;
  return (
    <svg className={`block w-full h-full ${className}`} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" {...(decorativa ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': `Portada de ${producto?.titulo ?? 'disco'}` })}>
      <Diseno familia={familia} r={r} pal={pal} titulo={producto?.titulo} artista={producto?.artista} idc={idc} />
      {/* desgaste de cartón: un velo muy leve en los bordes */}
      <rect width="300" height="300" fill="none" stroke="#000" strokeOpacity="0.08" strokeWidth="6" />
    </svg>
  );
}

export default memo(Portada);
export { PALETAS };
