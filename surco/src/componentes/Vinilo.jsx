// El disco: surcos, brillo y una galleta con los colores de su portada.
import { memo } from 'react';
import { PALETAS } from './Portada.jsx';

function Vinilo({ producto, girando = false, className = '' }) {
  const semilla = Number(producto?.portada?.semilla) || 7;
  const [, a, , c] = PALETAS[semilla % PALETAS.length];
  return (
    <svg className={`block w-full h-full ${className}`} viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <radialGradient id={`brillo-${semilla}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#3a3c40" />
          <stop offset="0.5" stopColor="#141517" />
          <stop offset="1" stopColor="#0a0b0c" />
        </radialGradient>
      </defs>
      <g className={girando ? 'girando' : ''} style={{ transformOrigin: '150px 150px' }}>
        <circle cx="150" cy="150" r="148" fill={`url(#brillo-${semilla})`} />
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx="150" cy="150" r={140 - i * 3.6} fill="none" stroke="#000" strokeOpacity={i % 5 === 0 ? 0.55 : 0.25} strokeWidth="0.7" />
        ))}
        <circle cx="150" cy="150" r="52" fill={a} />
        <path d="M150 98a52 52 0 0 1 52 52h-52z" fill={c} opacity="0.9" />
        <circle cx="150" cy="150" r="5" fill="#0a0b0c" />
      </g>
      {/* reflejo fijo: no gira con el disco, como la luz real */}
      <path d="M60 70 A130 130 0 0 1 150 22 L150 60 A92 92 0 0 0 88 92 Z" fill="#fff" opacity="0.06" />
    </svg>
  );
}

export default memo(Vinilo);
