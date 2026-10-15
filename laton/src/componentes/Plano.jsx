import { useId } from 'react';
import { geometria } from '../lib/geometria.js';
import { OPCIONES, porId } from '../lib/configuracion.js';

const rad = (d) => (d * Math.PI) / 180;

// Plano de perfil de la bici con las cotas que importan al cliente (stack, reach, tubo de sillín,
// distancia entre ejes). Todo sale de la configuración: cambia la talla y cambia el dibujo.
export default function Plano({ config, cotas = true, trazado = false, className = '', titulo }) {
  const id = useId();
  const g = geometria(config);
  const acabado = porId(OPCIONES.acabados, config.acabado);
  const cinta = porId(OPCIONES.cintas, config.cinta)?.hex ?? '#1d1d1f';
  const R = g.radioRueda;

  const margen = cotas ? 150 : 40;
  const x0 = g.ejeTrasero[0] - R - margen * 0.6;
  const x1 = g.ejeDelantero[0] + R + (cotas ? 300 : margen * 0.6);
  const yArriba = Math.max(g.sillin[1], g.potencia[1], g.direccionArriba[1]) + (cotas ? 120 : 50);
  const yAbajo = g.suelo - (cotas ? 110 : 20);
  const P = ([x, y]) => [x - x0, yArriba - y]; // de milímetros a coordenadas del dibujo
  const W = x1 - x0;
  const H = yArriba - yAbajo;

  const linea = (a, b, props) => {
    const [ax, ay] = P(a);
    const [bx, by] = P(b);
    return <line x1={ax} y1={ay} x2={bx} y2={by} pathLength="1" {...props} />;
  };
  const r = (k) => ({ style: { '--largo': 1, '--retraso': `${k * 0.12}s` }, className: 'trazo' });

  const pintura = acabado.tipo === 'titanio' ? '#a6a7a2' : acabado.hex;
  const tubo = { stroke: pintura, strokeLinecap: 'round', fill: 'none' };
  const fino = { stroke: 'var(--color-tinta)', strokeWidth: 5, strokeLinecap: 'round', fill: 'none' };

  const [ptx, pty] = P(g.ejeTrasero);
  const [pdx, pdy] = P(g.ejeDelantero);
  const [pbx, pby] = P(g.pedalier);
  const [psx, psy] = P(g.sillin);
  const [pmx, pmy] = P(g.potencia);
  const manillar = g.g.manillar;

  // Manillar visto de lado: curva de carretera/gravel o recto con puño
  const curva = manillar === 'recto'
    ? `M${pmx - 10} ${pmy} l -95 6`
    : `M${pmx} ${pmy} c 70 -4 95 30 88 72 c -6 40 -26 62 -18 96 l 8 26`;

  // Cotas: línea con dos topes y el número en medio
  const Cota = ({ a, b, texto, lado = 1, vertical = false }) => {
    const [ax, ay] = a;
    const [bx, by] = b;
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const tope = 16;
    return (
      <g className="cota" style={{ '--retraso': '0.3s' }}>
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--color-laton-vivo)" strokeWidth="3" />
        {vertical ? (
          <>
            <line x1={ax - tope} y1={ay} x2={ax + tope} y2={ay} stroke="var(--color-laton-vivo)" strokeWidth="3" />
            <line x1={bx - tope} y1={by} x2={bx + tope} y2={by} stroke="var(--color-laton-vivo)" strokeWidth="3" />
          </>
        ) : (
          <>
            <line x1={ax} y1={ay - tope} x2={ax} y2={ay + tope} stroke="var(--color-laton-vivo)" strokeWidth="3" />
            <line x1={bx} y1={by - tope} x2={bx} y2={by + tope} stroke="var(--color-laton-vivo)" strokeWidth="3" />
          </>
        )}
        <text x={vertical ? mx + 22 * lado : mx} y={vertical ? my : my - 18 * lado} textAnchor={vertical ? (lado > 0 ? 'start' : 'end') : 'middle'}
          dominantBaseline={vertical ? 'middle' : lado > 0 ? 'auto' : 'hanging'} fontSize="34" fontWeight="600" fill="var(--color-laton)" className="numeros" style={{ fontFamily: 'var(--font-sans)' }}>
          {texto}
        </text>
      </g>
    );
  };

  const [dax, day] = P(g.direccionArriba);
  const t = g.talla;
  const sueloY = P([0, g.suelo])[1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`${trazado ? 'plano-trazado' : ''} ${className}`} role="img" aria-labelledby={`${id}-t`}>
      <title id={`${id}-t`}>{titulo ?? `Plano de la ${g.modelo.nombre}: stack ${t.stack} mm, reach ${t.reach} mm, tubo de sillín ${t.tuboSillin} mm, distancia entre ejes ${g.distanciaEjes} mm`}</title>
      {/* suelo */}
      <line x1={0} x2={W} y1={sueloY} y2={sueloY} stroke="var(--color-grafito)" strokeWidth="2" strokeDasharray="6 10" opacity="0.6" />

      {/* ruedas */}
      {[[ptx, pty], [pdx, pdy]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={R - g.g.neumatico / 2} fill="none" stroke="var(--color-tinta)" strokeWidth={g.g.neumatico} pathLength="1" {...r(i)} />
          <circle cx={cx} cy={cy} r={R - g.g.neumatico - 18} fill="none" stroke="var(--color-grafito)" strokeWidth="4" pathLength="1" {...r(i + 0.5)} />
          <circle cx={cx} cy={cy} r="16" fill="var(--color-grafito)" />
        </g>
      ))}

      {/* transmisión */}
      <circle cx={pbx} cy={pby} r="95" fill="none" stroke="var(--color-grafito)" strokeWidth="6" pathLength="1" {...r(3)} />
      {linea([g.pedalier[0], g.pedalier[1] + 95], [g.ejeTrasero[0], g.ejeTrasero[1] + 40], { ...fino, strokeWidth: 4, stroke: 'var(--color-grafito)', ...r(3) })}
      {linea([g.pedalier[0], g.pedalier[1] - 95], [g.ejeTrasero[0], g.ejeTrasero[1] - 40], { ...fino, strokeWidth: 4, stroke: 'var(--color-grafito)', ...r(3) })}
      {linea(g.pedalier, [g.pedalier[0] + 120, g.pedalier[1] - 115], { ...fino, strokeWidth: 16, ...r(3.5) })}

      {/* cuadro */}
      <g {...tubo}>
        {linea(g.pedalier, g.ejeTrasero, { strokeWidth: 20, ...r(1) })}
        {linea(g.tiranteArriba, g.ejeTrasero, { strokeWidth: 16, ...r(1.3) })}
        {linea(g.pedalier, g.sillinArriba, { strokeWidth: 28, ...r(1.6) })}
        {linea(g.horizontalAtras, g.horizontalDelante, { strokeWidth: 28, ...r(1.9) })}
        {linea(g.pedalier, g.diagonalDelante, { strokeWidth: 34, ...r(2.2) })}
        {linea(g.direccionArriba, g.direccionAbajo, { strokeWidth: 40, strokeLinecap: 'butt', ...r(2.5) })}
        {/* horquilla */}
        <path d={`M${P(g.coronaHorquilla).join(' ')} Q ${P([g.ejeDelantero[0] - 20, (g.coronaHorquilla[1] + g.ejeDelantero[1]) / 2]).join(' ')} ${pdx} ${pdy}`}
          strokeWidth="22" pathLength="1" {...r(2.7)} />
      </g>

      {/* tija, sillín, potencia y manillar */}
      {linea(g.sillinArriba, [g.sillin[0] + 8, g.sillin[1] - 20], { ...fino, strokeWidth: 16, stroke: '#7d8286', ...r(3) })}
      <path d={`M${psx - 130} ${psy - 8} q 30 -14 90 -12 q 70 2 130 18 l -6 10 q -110 -6 -214 -16 z`} fill={config.extras.includes('sillin') ? '#7a4a1e' : 'var(--color-tinta)'} pathLength="1" {...r(3.2)} />
      {linea(g.tuboArriba, g.potencia, { ...fino, strokeWidth: 18, ...r(3.4) })}
      <path d={curva} {...fino} strokeWidth="16" stroke={manillar === 'recto' ? 'var(--color-tinta)' : cinta} pathLength="1" {...r(3.6)} />
      {manillar === 'recto' ? <line x1={pmx - 70} y1={pmy + 4} x2={pmx - 110} y2={pmy + 7} stroke={cinta} strokeWidth="24" strokeLinecap="round" /> : null}

      {/* guardabarros y portabultos */}
      {config.extras.includes('guardabarros')
        ? [[ptx, pty, 200, 75], [pdx, pdy, 135, -15]].map(([cx, cy, desde, hasta], i) => {
            const rf = R + 24;
            const pt = (a) => `${cx + rf * Math.cos(rad(a))} ${cy - rf * Math.sin(rad(a))}`;
            return <path key={i} d={`M${pt(desde)} A ${rf} ${rf} 0 0 1 ${pt(hasta)}`} fill="none" stroke="#9aa0a3" strokeWidth="9" strokeLinecap="round" />;
          })
        : null}
      {config.extras.includes('portabultos') ? (
        <g stroke="var(--color-tinta)" strokeWidth="7" strokeLinecap="round" fill="none">
          <line x1={pdx - 120} y1={pdy - R - 60} x2={pdx + 140} y2={pdy - R - 60} />
          <line x1={pdx + 120} y1={pdy - R - 60} x2={pdx + 10} y2={pdy - 10} />
        </g>
      ) : null}

      {cotas ? (
        <>
          <g className="cota" stroke="var(--color-laton-vivo)" strokeWidth="2" strokeDasharray="4 8" opacity="0.7">
            <line x1={dax + 24} y1={day} x2={pdx + R + 74} y2={day} />
            <line x1={pdx + R + 10} y1={pby} x2={pdx + R + 74} y2={pby} />
          </g>
          <Cota vertical lado={1} a={[pdx + R + 60, pby]} b={[pdx + R + 60, day]} texto={`Stack ${t.stack}`} />
          <Cota lado={1} a={[pbx, day - 70]} b={[dax, day - 70]} texto={`Reach ${t.reach}`} />
          <Cota lado={-1} a={[ptx, sueloY + 60]} b={[pdx, sueloY + 60]} texto={`Entre ejes ${g.distanciaEjes}`} />
          <g className="cota">
            <text x={P(g.sillinArriba)[0] - 40} y={(P(g.sillinArriba)[1] + pby) / 2} textAnchor="end" fontSize="34" fontWeight="600" fill="var(--color-laton)" className="numeros" style={{ fontFamily: 'var(--font-sans)' }}>
              Sillín {t.tuboSillin}
            </text>
            <text x={dax + 34} y={day + 70} fontSize="30" fill="var(--color-grafito)" style={{ fontFamily: 'var(--font-sans)' }}>
              {String(g.g.anguloDireccion).replace('.', ',')}°
            </text>
          </g>
        </>
      ) : null}
    </svg>
  );
}
