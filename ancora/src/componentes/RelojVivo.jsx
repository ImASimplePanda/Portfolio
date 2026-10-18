import { useEffect, useMemo, useRef } from 'react';

// La esfera del A-41 dibujada en SVG y en hora: el segundero avanza a 8 saltos por segundo,
// como un calibre de 28.800 alternancias por hora (con movimiento reducido, uno por segundo).
// Las agujas se mueven por refs: nada de esto pasa por el render.

export const ESFERAS = [
  { id: 'medianoche', nombre: 'Medianoche', fondo: '#1b2a4d', luz: '#46639f', tinta: '#e9edf3' },
  { id: 'grafito', nombre: 'Grafito', fondo: '#222428', luz: '#575c66', tinta: '#e9edf3' },
  { id: 'abeto', nombre: 'Abeto', fondo: '#15302a', luz: '#3b6b5a', tinta: '#e9edf3' },
  { id: 'salmon', nombre: 'Salmón', fondo: '#c08670', luz: '#efc1aa', tinta: '#2a1d18' },
];

const C = 200;
const rayos = Array.from({ length: 180 }, (_, i) => i * 2);

export default function RelojVivo({ esfera = ESFERAS[0], className = '', etiqueta }) {
  const hora = useRef(null);
  const minuto = useRef(null);
  const segundo = useRef(null);
  const caja = useRef(null);
  const dia = useMemo(() => new Date().getDate(), []);

  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paso = reducido ? 1000 : 125;
    let t = null;
    const girar = (el, a) => el?.setAttribute('transform', `rotate(${a.toFixed(3)} ${C} ${C})`);
    const tic = () => {
      const d = new Date();
      const ms = d.getMilliseconds();
      const s = d.getSeconds() + Math.floor(ms / paso) * (paso / 1000);
      const m = d.getMinutes() + s / 60;
      const h = (d.getHours() % 12) + m / 60;
      girar(segundo.current, s * 6);
      girar(minuto.current, m * 6);
      girar(hora.current, h * 30);
    };
    // Solo late mientras se ve
    const io = new IntersectionObserver(([e]) => {
      clearInterval(t);
      if (e.isIntersecting) { tic(); t = setInterval(tic, paso); }
    });
    tic();
    if (caja.current) io.observe(caja.current);
    return () => { clearInterval(t); io.disconnect(); };
  }, []);

  const id = esfera.id;
  return (
    <svg ref={caja} viewBox="0 0 400 400" className={className} role="img" aria-label={etiqueta}>
      <defs>
        <radialGradient id={`g-${id}`} cx="42%" cy="36%" r="75%">
          <stop offset="0" stopColor={esfera.luz} />
          <stop offset="0.55" stopColor={esfera.fondo} />
          <stop offset="1" stopColor={esfera.fondo} stopOpacity="0.92" />
        </radialGradient>
        <linearGradient id="acero" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="0.45" stopColor="#9da2aa" />
          <stop offset="0.7" stopColor="#e6e8eb" />
          <stop offset="1" stopColor="#6d727a" />
        </linearGradient>
        <linearGradient id="indice" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#a9aeb6" />
          <stop offset="1" stopColor="#f2f3f5" />
        </linearGradient>
      </defs>

      {/* caja y bisel pulido */}
      <circle cx={C} cy={C} r="196" fill="url(#acero)" />
      <circle cx={C} cy={C} r="182" fill="#0d0e10" />
      <circle cx={C} cy={C} r="178" fill="url(#acero)" opacity="0.55" />
      {/* esfera con rayado solar */}
      <circle cx={C} cy={C} r="170" fill={`url(#g-${id})`} style={{ transition: 'fill 500ms' }} />
      <g opacity="0.16">
        {rayos.map((a) => (
          <line key={a} x1={C} y1={C} x2={C} y2={C - 170} stroke={a % 4 ? '#000' : '#fff'} strokeWidth="0.6" transform={`rotate(${a} ${C} ${C})`} />
        ))}
      </g>
      {/* minutero exterior */}
      <g>
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1={C} y1={C - 164} x2={C} y2={C - (i % 5 ? 159 : 156)} stroke={esfera.tinta} strokeOpacity={i % 5 ? 0.45 : 0.8} strokeWidth={i % 5 ? 0.8 : 1.4} transform={`rotate(${i * 6} ${C} ${C})`} />
        ))}
      </g>
      {/* índices aplicados (doble a las 12, ventana de fecha a las 3) */}
      {Array.from({ length: 12 }, (_, i) => {
        if (i === 3) return null;
        const doble = i === 0;
        return (
          <g key={i} transform={`rotate(${i * 30} ${C} ${C})`}>
            {(doble ? [-5.5, 5.5] : [0]).map((dx) => (
              <rect key={dx} x={C - 3.4 + dx} y={C - 146} width="6.8" height="34" rx="1.2" fill="url(#indice)" stroke="#5c6168" strokeWidth="0.5" />
            ))}
          </g>
        );
      })}
      <rect x={C + 104} y={C - 12} width="34" height="24" rx="2" fill="#f4f1ea" stroke="url(#acero)" strokeWidth="2" />
      <text x={C + 121} y={C + 6.5} textAnchor="middle" fontFamily="'Schibsted Grotesk Variable', sans-serif" fontSize="17" fontWeight="600" fill="#111">{dia}</text>
      <text x={C} y={C - 92} textAnchor="middle" fontFamily="'Bodoni Moda', serif" fontSize="17" letterSpacing="3" fill={esfera.tinta} opacity="0.92">ÁNCORA</text>
      <text x={C} y={C + 88} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="8.5" letterSpacing="2.4" fill={esfera.tinta} opacity="0.7">AUTOMÁTICO · 72 H</text>

      {/* agujas: hora y minuto tipo espada, segundero con punta roja y contrapeso */}
      <g ref={hora}>
        <path d={`M${C - 6} ${C + 18} L${C - 5} ${C - 70} L${C} ${C - 92} L${C + 5} ${C - 70} L${C + 6} ${C + 18} Z`} fill="url(#indice)" stroke="#4d525a" strokeWidth="0.6" />
      </g>
      <g ref={minuto}>
        <path d={`M${C - 4.5} ${C + 22} L${C - 3.6} ${C - 120} L${C} ${C - 146} L${C + 3.6} ${C - 120} L${C + 4.5} ${C + 22} Z`} fill="url(#indice)" stroke="#4d525a" strokeWidth="0.6" />
      </g>
      <g ref={segundo}>
        <rect x={C - 0.9} y={C - 150} width="1.8" height="186" fill="#eceef1" />
        <rect x={C - 0.9} y={C - 162} width="1.8" height="14" fill="var(--color-aguja)" />
        <circle cx={C} cy={C + 30} r="4.5" fill="#eceef1" />
      </g>
      <circle cx={C} cy={C} r="6" fill="url(#acero)" stroke="#4d525a" strokeWidth="0.6" />
      <circle cx={C} cy={C} r="2" fill="#2a2c30" />
      {/* reflejo del zafiro */}
      <path d={`M${C - 150} ${C - 40} A170 170 0 0 1 ${C + 40} ${C - 150}`} fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="30" strokeLinecap="round" />
    </svg>
  );
}
