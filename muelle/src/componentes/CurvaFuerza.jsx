import { useEffect, useRef } from 'react';

// Curva de fuerza frente a recorrido, como en la hoja de datos de un interruptor.
// La curva se dibuja (anime.js) cada vez que cambia: lineal recta, táctil con bache, clicky con caída brusca.
function puntos(familia, fuerza, recorrido) {
  const pre = 2; // mm hasta la activación
  const p = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * recorrido;
    let y = 30 + (fuerza - 30) * (x / recorrido) ** 0.9;
    const campana = (c, ancho) => Math.exp(-(((x - c) / ancho) ** 2));
    if (familia === 'tactil') y += campana(pre * 0.6, 0.38) * 24 - campana(pre * 1.05, 0.4) * 10;
    if (familia === 'clicky') y += campana(pre * 0.68, 0.22) * 28 - campana(pre * 0.92, 0.16) * 18;
    if (x > recorrido - 0.35) y += ((x - (recorrido - 0.35)) / 0.35) ** 2 * 60; // fondo
    p.push([x, y]);
  }
  return p;
}

export default function CurvaFuerza({ familia = 'lineal', fuerza = 55, recorrido = 4, className = '' }) {
  const ref = useRef();
  const W = 320;
  const H = 180;
  const maxF = 120;
  const pts = puntos(familia, fuerza, recorrido);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${((x / recorrido) * (W - 40) + 30).toFixed(1)} ${(H - 24 - (Math.min(y, maxF) / maxF) * (H - 40)).toFixed(1)}`).join(' ');

  useEffect(() => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // anime.js se descarga solo cuando hace falta dibujar una curva
    let a;
    let vivo = true;
    import('animejs').then(({ animate, createDrawable }) => {
      if (!vivo || !ref.current) return;
      const [dib] = createDrawable(ref.current);
      a = animate(dib, { draw: ['0 0', '0 1'], duration: 900, ease: 'outExpo' });
    });
    return () => { vivo = false; a?.revert(); };
  }, [d]);

  const yDe = (g) => H - 24 - (g / maxF) * (H - 40);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`Curva de fuerza: ${fuerza} gramos, ${recorrido} milímetros de recorrido`}>
      {[0, 40, 80, 120].map((g) => (
        <g key={g}>
          <line x1="30" x2={W - 10} y1={yDe(g)} y2={yDe(g)} stroke="var(--color-mascara-borde)" strokeDasharray="2 4" />
          <text x="24" y={yDe(g) + 4} textAnchor="end" fontSize="10" fill="var(--color-serigrafia-tenue)" className="numeros">{g}</text>
        </g>
      ))}
      <text x={W - 10} y={H - 6} textAnchor="end" fontSize="10" fill="var(--color-serigrafia-tenue)">recorrido (mm)</text>
      <text x="30" y="10" fontSize="10" fill="var(--color-serigrafia-tenue)">fuerza (g)</text>
      <path ref={ref} d={d} fill="none" stroke="var(--color-cobre-vivo)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
