// Ilustración cenital de un tocadiscos, con el acabado de cada modelo.
// Con "encendido", el plato gira y el brazo baja al disco.
import { memo } from 'react';

const ACABADOS = {
  plata: { base: '#c9ccd0', borde: '#9da2a8', detalle: '#2a2d31' },
  madera: { base: '#8a5a36', borde: '#5e3a20', detalle: '#1e1e1e' },
  negro: { base: '#2a2c30', borde: '#141518', detalle: '#c9ccd0' },
  blanco: { base: '#efefec', borde: '#c9c9c4', detalle: '#2a2d31' },
};

function Tocadiscos({ producto, encendido = false, className = '' }) {
  const acabado = ACABADOS[producto?.portada?.color] || ACABADOS.negro;
  return (
    <svg className={`block w-full h-full ${className}`} viewBox="0 0 400 320" role="img" aria-label={`Ilustración de un ${producto?.titulo ?? 'tocadiscos'}`}>
      <rect x="6" y="6" width="388" height="308" rx="14" fill={acabado.borde} />
      <rect x="12" y="12" width="376" height="296" rx="10" fill={acabado.base} />
      {/* plato y disco */}
      <circle cx="160" cy="160" r="132" fill="#1a1b1d" />
      <g className={encendido ? 'girando' : ''} style={{ transformOrigin: '160px 160px' }}>
        <circle cx="160" cy="160" r="124" fill="#0e0f10" />
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx="160" cy="160" r={118 - i * 4.4} fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="0.6" />)}
        <circle cx="160" cy="160" r="40" fill="#2440e6" />
        <path d="M160 120a40 40 0 0 1 40 40h-40z" fill="#dfe4ff" opacity="0.85" />
        <circle cx="160" cy="160" r="4" fill="#c9ccd0" />
      </g>
      {/* brazo: pivota sobre su base y baja al disco al encender */}
      <circle cx="338" cy="70" r="26" fill={acabado.detalle} opacity="0.18" />
      <circle cx="338" cy="70" r="14" fill={acabado.detalle} />
      <g style={{ transformOrigin: '338px 70px', transform: `rotate(${encendido ? 24 : 0}deg)`, transition: 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <path d="M338 70 L322 236 L296 262" fill="none" stroke={acabado.detalle} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="282" y="256" width="24" height="14" rx="3" fill={acabado.detalle} transform="rotate(-42 294 263)" />
        <circle cx="342" cy="40" r="9" fill={acabado.detalle} />
      </g>
      {/* mandos */}
      <circle cx="40" cy="282" r="10" fill={acabado.detalle} />
      <rect x="62" y="276" width="28" height="12" rx="3" fill={acabado.detalle} opacity="0.8" />
      <rect x="96" y="276" width="28" height="12" rx="3" fill={acabado.detalle} opacity="0.8" />
      <circle cx="40" cy="282" r="4" fill={encendido ? '#ff4b3a' : '#5a1a14'} />
      <rect x="352" y="140" width="10" height="120" rx="4" fill={acabado.detalle} opacity="0.35" />
      <rect x="348" y="190" width="18" height="10" rx="2" fill={acabado.detalle} />
    </svg>
  );
}

export default memo(Tocadiscos);
