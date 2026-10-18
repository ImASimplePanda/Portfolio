import { useMemo } from 'react';
import { teclas } from '../lib/distribuciones.js';

// Teclado dibujado en SVG desde arriba: el mismo dato de distribución que el 3D.
// `pulsadas` es un Set de códigos (KeyboardEvent.code) que se dibujan hundidos.
export const COLORES_BASE = { letras: '#efe3cf', letrasRotulo: '#4a2d52', mods: '#4a2d52', modsRotulo: '#efe3cf', acento: '#e3a92f', acentoRotulo: '#2e1a33' };

export function colorDe(papel, colores) {
  const c = { ...COLORES_BASE, ...colores };
  if (papel === 'mod') return [c.mods, c.modsRotulo];
  if (papel === 'acento') return [c.acento, c.acentoRotulo];
  return [c.letras, c.letrasRotulo];
}

const U = 40; // unidad del dibujo
const AIRE = 3; // separación entre teclas

export default function Teclado2D({ formato = '65', colores, carcasa = '#4a2d52', pulsadas, onPulsar, onSoltar, rotulos = true, className = '', titulo }) {
  const { lista, ancho, alto } = useMemo(() => teclas(formato), [formato]);
  const borde = 14;
  const W = ancho * U + borde * 2;
  const H = alto * U + borde * 2;
  const interactivo = !!onPulsar;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role={interactivo ? 'group' : titulo === '' ? undefined : 'img'} aria-hidden={titulo === '' && !interactivo ? 'true' : undefined} aria-label={titulo === '' ? undefined : (titulo ?? `Teclado ${formato}`)}>
      <rect x="0" y="0" width={W} height={H} rx="16" fill={carcasa} />
      <rect x="4" y="4" width={W - 8} height={H - 8} rx="13" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1.5" />
      <rect x={borde - 4} y={borde - 4} width={ancho * U + 8} height={alto * U + 8} rx="6" fill="rgb(0 0 0 / 0.35)" />
      {lista.map((t) => {
        const [fondo, tinta] = colorDe(t.papel, colores);
        const abajo = pulsadas?.has(t.codigo);
        const x = borde + t.x * U + AIRE / 2;
        const y = borde + t.y * U + AIRE / 2 + (abajo ? 2 : 0);
        const w = t.u * U - AIRE;
        const h = (t.h || 1) * U - AIRE;
        const cuerpo = (
          <>
            <rect x={x} y={y} width={w} height={h} rx="5" fill={fondo} style={{ filter: abajo ? 'brightness(0.82)' : undefined }} />
            <rect x={x + 4} y={y + 3} width={w - 8} height={h - 10} rx="4" fill="rgb(255 255 255 / 0.10)" />
            {rotulos && t.rotulo ? (
              <text x={x + 8} y={y + 16} fill={tinta} fontSize={t.rotulo.length > 2 ? 9 : 13} fontWeight="600" style={{ fontFamily: 'var(--font-sans)' }} aria-hidden="true">{t.rotulo}</text>
            ) : null}
          </>
        );
        if (!interactivo) return <g key={t.codigo + t.x + t.y}>{cuerpo}</g>;
        return (
          <g key={t.codigo + t.x + t.y} role="button" tabIndex={-1} aria-label={t.rotulo || 'Espacio'} style={{ cursor: 'pointer', touchAction: 'manipulation' }}
            onPointerDown={(e) => { e.preventDefault(); onPulsar(t.codigo, t.u); }} onPointerUp={() => onSoltar?.(t.codigo, t.u)} onPointerLeave={(e) => { if (e.buttons) onSoltar?.(t.codigo, t.u); }}>
            {cuerpo}
          </g>
        );
      })}
    </svg>
  );
}
