import Teclado2D from './Teclado2D.jsx';
import { Cable, Hand, Wrench, Droplet, Grid3x3 } from 'lucide-react';

// Dibujos de las piezas: un interruptor visto de frente y las miniaturas de cada producto.

export function InterruptorSVG({ color = '#efe2c4', familia = 'lineal', hundido = false, className = '' }) {
  const carcasa = '#2a2730';
  const desplaza = hundido ? 7 : 0;
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true">
      {/* vástago en cruz */}
      <g transform={`translate(0 ${desplaza})`} style={{ transition: 'transform 70ms cubic-bezier(0.16,1,0.3,1)' }}>
        <rect x="28" y="6" width="8" height="18" rx="1.5" fill={color} />
        <rect x="22" y="10" width="20" height="6" rx="1.5" fill={color} />
        {familia === 'tactil' ? <path d="M36 18l4 3-4 3z" fill={color} opacity="0.8" /> : null}
      </g>
      {/* carcasa superior e inferior */}
      <path d="M8 22h48l-3 18H11z" fill={color} opacity="0.88" />
      <path d="M8 22h48l-3 18H11z" fill="url(#brillo)" />
      <rect x="6" y="40" width="52" height="16" rx="2" fill={carcasa} />
      {familia === 'clicky' ? <rect x="44" y="27" width="6" height="6" rx="1" fill="#f1ecf7" opacity="0.7" /> : null}
      {/* pines */}
      <rect x="18" y="56" width="3" height="12" rx="1" fill="var(--color-cobre)" />
      <rect x="40" y="56" width="3" height="10" rx="1" fill="var(--color-cobre)" />
      <rect x="29" y="56" width="6" height="7" rx="2" fill={carcasa} />
      <defs>
        <linearGradient id="brillo" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const ICONOS_ACCESORIO = { cable: Cable, reposamunecas: Hand, extractor: Wrench, lubricado: Droplet, probador: Grid3x3 };

// Miniatura de cualquier producto o línea de cesta
export function Miniatura({ producto, vista, className = '' }) {
  const v = vista ?? producto?.vista;
  if (v) return <Teclado2D formato={v.formato} colores={v.colores} carcasa={v.carcasa?.hex} rotulos={false} className={className} titulo="" />;
  if (producto?.tipo === 'teclas') return <Teclado2D formato="65" colores={producto.specs?.colores} carcasa="#24152f" rotulos={false} className={className} titulo="" />;
  if (producto?.tipo === 'interruptores') {
    return (
      <div className={`grid place-items-center ${className}`}>
        <InterruptorSVG color={producto.color} familia={producto.familia} className="h-[78%] w-auto" />
      </div>
    );
  }
  const clave = Object.keys(ICONOS_ACCESORIO).find((k) => producto?.slug?.includes(k)) || 'extractor';
  const Icono = ICONOS_ACCESORIO[clave];
  return (
    <div className={`grid place-items-center ${className}`} style={{ color: producto?.color || 'var(--color-cobre)' }}>
      <Icono className="h-1/2 w-1/2" strokeWidth={1.4} aria-hidden="true" />
    </div>
  );
}
