import { useEffect, useRef } from 'react';

// Plano técnico del calibre A-1 que se traza a medida que bajas (anime.js: createDrawable + onScroll).
// Ruedas del tren de rodaje, barrilete, áncora y volante con sus ejes y cotas, como en un plano de taller.

const R = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;
function dientes(cx, cy, r, n, h = 3) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 0.5) / n) * Math.PI * 2;
    d += `M${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} L${(cx + Math.cos(a) * (r + h)).toFixed(1)} ${(cy + Math.sin(a) * (r + h)).toFixed(1)} L${(cx + Math.cos(b) * (r + h)).toFixed(1)} ${(cy + Math.sin(b) * (r + h)).toFixed(1)} L${(cx + Math.cos(b) * r).toFixed(1)} ${(cy + Math.sin(b) * r).toFixed(1)} `;
  }
  return d;
}

const RUEDAS = [
  { id: 'barrilete', cx: 205, cy: 205, r: 58, n: 72, nota: 'Barrilete · 72 h', nx: 70, ny: 120 },
  { id: 'centro', cx: 300, cy: 300, r: 40, n: 60, nota: 'Rueda de centro', nx: 470, ny: 150 },
  { id: 'tercera', cx: 362, cy: 238, r: 30, n: 48 },
  { id: 'segundos', cx: 410, cy: 318, r: 26, n: 42, nota: 'Rueda de segundos', nx: 520, ny: 300 },
  { id: 'escape', cx: 380, cy: 405, r: 20, n: 15, h: 6, nota: 'Rueda de escape', nx: 520, ny: 440 },
];

export default function Plano({ className = '' }) {
  const svg = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let anim;
    let vivo = true;
    import('animejs').then(({ animate, createDrawable, onScroll, stagger }) => {
      if (!vivo || !svg.current) return;
      const trazos = createDrawable(svg.current.querySelectorAll('[data-trazo]'));
      anim = animate(trazos, {
        draw: ['0 0', '0 1'],
        ease: 'inOutSine',
        duration: 1600,
        delay: stagger(40),
        autoplay: onScroll({ target: svg.current, enter: 'bottom-=5% top', leave: 'center+=10% top', sync: 0.9 }),
      });
    });
    return () => { vivo = false; anim?.revert(); };
  }, []);

  const linea = { fill: 'none', stroke: 'var(--color-acero)', strokeWidth: 1.1, vectorEffect: 'non-scaling-stroke' };
  const fina = { ...linea, strokeWidth: 0.7, stroke: 'var(--color-acero-tenue)' };
  return (
    <svg ref={svg} viewBox="-95 0 830 605" className={className} role="img" aria-label="Plano del calibre A-1: barrilete, tren de rodaje, rueda de escape, áncora y volante">
      {/* platina y cota del diámetro */}
      <path data-trazo d={R(300, 300, 250)} {...linea} />
      <path data-trazo d={R(300, 300, 238)} {...fina} strokeDasharray="2 5" />
      <path data-trazo d="M50 570 L550 570 M50 562 L50 578 M550 562 L550 578" {...fina} />
      <text x="300" y="592" textAnchor="middle" className="cifra" fontSize="12" fill="var(--color-acero-tenue)">Ø 30,0 mm</text>
      {/* ejes */}
      <path data-trazo d="M30 300 L570 300 M300 30 L300 570" {...fina} strokeDasharray="10 4 2 4" />

      {RUEDAS.map((w) => (
        <g key={w.id}>
          <path data-trazo d={R(w.cx, w.cy, w.r)} {...linea} />
          <path data-trazo d={dientes(w.cx, w.cy, w.r, w.n, w.h)} {...fina} />
          <path data-trazo d={R(w.cx, w.cy, w.r * 0.28)} {...fina} />
          <path data-trazo d={`M${w.cx - w.r * 0.85} ${w.cy} L${w.cx + w.r * 0.85} ${w.cy} M${w.cx} ${w.cy - w.r * 0.85} L${w.cx} ${w.cy + w.r * 0.85}`} {...fina} />
          {w.nota ? (
            <>
              <path data-trazo d={`M${w.cx + (w.nx > w.cx ? w.r : -w.r) * 0.7} ${w.cy - w.r * 0.7} L${w.nx} ${w.ny + 6}`} {...fina} />
              <text x={w.nx} y={w.ny} textAnchor={w.nx > w.cx ? 'start' : 'end'} className="cifra" fontSize="14" letterSpacing="1.4" fill="var(--color-acero)">{w.nota.toUpperCase()}</text>
            </>
          ) : null}
        </g>
      ))}

      {/* el áncora: la pieza que da nombre a la casa */}
      <path data-trazo d="M352 452 L392 468 L432 452 M392 468 L392 430 M352 452 L346 444 M432 452 L438 444" stroke="var(--color-aguja)" strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <path data-trazo d={R(392, 468, 4)} stroke="var(--color-aguja)" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
      <path data-trazo d="M440 470 L520 500" {...fina} />
      <text x="526" y="504" className="cifra" fontSize="14" letterSpacing="1.4" fill="var(--color-aguja)">ÁNCORA</text>

      {/* volante con sus brazos y espiral */}
      <path data-trazo d={R(250, 440, 52)} {...linea} />
      <path data-trazo d={R(250, 440, 46)} {...fina} />
      <path data-trazo d="M250 394 L250 486 M204 440 L296 440" {...fina} />
      <path data-trazo d="M250 440 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 1 12 12 a18 18 0 1 1 -18 -18 a24 24 0 1 1 24 24" {...fina} />
      <path data-trazo d="M205 470 L120 520" {...fina} />
      <text x="114" y="524" textAnchor="end" className="cifra" fontSize="14" letterSpacing="1.4" fill="var(--color-acero)">VOLANTE · 4 HZ</text>
    </svg>
  );
}
