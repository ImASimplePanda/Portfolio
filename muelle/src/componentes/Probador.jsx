import { Component, Suspense, lazy, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Teclado2D from './Teclado2D.jsx';
import { InterruptorSVG } from './Piezas.jsx';
import { usarTecleo } from '../lib/usarTecleo.js';
import { combinar, pulsar, despertar, silenciar, estaSilenciado } from '../lib/sonido.js';
import { FAMILIAS } from '../lib/formato.js';
import { paginas } from '../lib/precarga.js';

const Escena = lazy(paginas.escena);

// Si WebGL falla, se ve el teclado dibujado en su lugar
class SinTres extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? this.props.alternativa : this.props.children; }
}

function usarWebGL() {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setOk(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch { setOk(false); }
  }, []);
  return ok;
}

// Teclado que suena con el interruptor elegido. En ordenador responde al teclado físico;
// en el móvil se toca en pantalla (versión dibujada, más fácil de pulsar con el dedo).
export function Probador({ ola = false, escucha = true, alPulsar, capaActiva, distancia, altura, formato = '65', colores, carcasa, placa = 'aluminio', interruptor, sonido, despiece, className = '', capturarEspacio = false, etiqueta }) {
  const s = combinar(sonido, placa, carcasa?.material);
  const { pulsadas, visibles, pulsaciones, bajar, subir } = usarTecleo(s, { capturarEspacio, activo: escucha, alPulsar });
  const webgl = usarWebGL();
  const [tactil, setTactil] = useState(false);
  useEffect(() => { setTactil(window.matchMedia('(hover: none)').matches); }, []);

  const dibujado = (
    <Teclado2D formato={formato} colores={colores} carcasa={carcasa?.hex} pulsadas={visibles} className="w-full h-auto drop-shadow-[0_24px_30px_rgb(0_0_0/0.45)]"
      onPulsar={(c, u) => { despertar(); bajar(c, u); }} onSoltar={(c, u) => subir(c, u)} titulo={etiqueta} />
  );
  if (tactil || webgl === false) return <div className={className}>{dibujado}</div>;
  return (
    <div className={className}>
      {webgl ? (
        <SinTres alternativa={dibujado}>
          <Suspense fallback={<div className="opacity-60">{dibujado}</div>}>
            <Escena ola={ola} capaActiva={capaActiva} distancia={distancia} altura={altura} formato={formato} colores={colores} carcasa={carcasa} placa={placa} interruptor={interruptor} pulsadas={pulsadas} despiece={despiece}
              onTecla={(c, u, abajo) => { despertar(); (abajo ? bajar : subir)(c, u); }} className="w-full h-full" etiqueta={etiqueta} />
          </Suspense>
        </SinTres>
      ) : <div className="opacity-60">{dibujado}</div>}
      <span className="sr-only" aria-live="polite">{pulsaciones ? `${pulsaciones} pulsaciones` : ''}</span>
    </div>
  );
}

export function BotonSonido() {
  const [mudo, setMudo] = useState(estaSilenciado());
  return (
    <button type="button" className="pad-linea !min-h-10 !px-3 text-sm" aria-pressed={mudo} onClick={() => { silenciar(!mudo); setMudo(!mudo); }}>
      {mudo ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
      {mudo ? 'Sonido apagado' : 'Sonido encendido'}
    </button>
  );
}

// Fila de huellas SW1…SW7: cada interruptor suena al pulsarlo y se elige para el teclado.
// De cada huella sube una pista de cobre hasta el teclado; la del elegido se enciende con cada pulsación.
export function HuellasInterruptores({ encender = false, interruptores: lista, elegido, onElegir, pulso = 0, placa = 'aluminio', carcasa = 'aluminio', className = '' }) {
  const [hundido, setHundido] = useState(null);
  // En orden de designador (SW1, SW2…), como en la serigrafía
  const interruptores = [...lista].sort((a, b) => Number(a.designador?.slice(2)) - Number(b.designador?.slice(2)));
  const n = interruptores.length || 7;
  return (
    <div className={className}>
      <svg className="hidden sm:block w-full h-10 overflow-visible" aria-hidden="true">
        {interruptores.map((x, i) => {
          const cx = `${((i + 0.5) / n) * 100}%`;
          const activo = x.id === elegido;
          return (
            <g key={x.id}>
              {/* al cargar, las pistas se trazan desde el teclado hasta cada huella; al teclear, un pulso sube por la del interruptor elegido */}
              <line x1={cx} x2={cx} y1="0" y2="100%" pathLength="1" className={encender ? 'traza-dibuja' : undefined} style={{ '--d': 520 + i * 60 }} stroke={activo ? 'var(--color-cobre-vivo)' : 'var(--color-cobre-hondo)'} strokeWidth="3" strokeLinecap="round" />
              {activo && pulso ? <line key={pulso} x1={cx} x2={cx} y1="0" y2="100%" pathLength="1" className="electron" stroke="#fff3cf" strokeWidth="5" strokeLinecap="round" /> : null}
              <circle cx={cx} cy="0" r="5" fill="var(--color-cobre)" /><circle cx={cx} cy="0" r="2" fill="var(--color-mascara-honda)" />
            </g>
          );
        })}
      </svg>
      {/* móvil: la pista baja del teclado y recorre la fila como un bus */}
      <span aria-hidden="true" className="sm:hidden block ml-[2.8rem] h-5 w-[3px] bg-cobre-hondo" />
      <ul className="flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0" aria-label="Interruptores: pulsa uno para oírlo y probarlo en el teclado">
        {interruptores.map((x) => {
          const activo = x.id === elegido;
          return (
            <li key={x.id} className={`relative shrink-0 w-[6.4rem] sm:w-auto snap-start pt-4 sm:pt-0 ${encender ? 'entra' : ''}`} style={encender ? { '--d': 600 + interruptores.indexOf(x) * 60 } : undefined}>
              <span aria-hidden="true" className="sm:hidden absolute top-0 -left-1 -right-1 h-[3px] bg-cobre-hondo" />
              <span aria-hidden="true" className={`sm:hidden absolute top-0 left-1/2 -translate-x-1/2 h-4 w-[3px] ${activo ? 'bg-cobre-vivo' : 'bg-cobre-hondo'}`} />
              {activo ? <span key={pulso} aria-hidden="true" className="sm:hidden pista-viva absolute top-0 left-1/2 -translate-x-1/2 h-4 w-[5px] bg-cobre-vivo" /> : null}
              <button type="button" aria-pressed={activo}
                onPointerDown={() => { despertar(); setHundido(x.id); pulsar(combinar(x.specs?.sonido, placa, carcasa)); }}
                onPointerUp={() => setHundido(null)} onPointerLeave={() => setHundido(null)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pulsar(combinar(x.specs?.sonido, placa, carcasa)); onElegir(x); } }}
                onClick={() => onElegir(x)}
                className={`group relative w-full text-left rounded-[var(--radius-pad)] p-2 sm:p-2.5 pt-6 transition-colors ${activo ? 'bg-mascara-alta' : 'bg-mascara-honda hover:bg-mascara-alta/60'}`}>
                {/* contorno serigrafiado de la huella y sus dos pads de cobre */}
                <span aria-hidden="true" className={`absolute inset-1 rounded-[3px] border border-dashed ${activo ? 'border-cobre' : 'border-mascara-borde'}`} />
                <span aria-hidden="true" className="absolute right-2.5 top-2 flex gap-1"><span className="size-2 rounded-full bg-cobre" /><span className="size-2 rounded-full bg-cobre" /></span>
                <span className="designador absolute left-2.5 top-1.5">{x.designador}</span>
                <InterruptorSVG color={x.color} familia={x.familia} hundido={hundido === x.id} className="h-12 w-auto mx-auto" />
                <span className="mt-1.5 block serigrafia text-[0.95rem] sm:text-[0.82rem] 2xl:text-[0.95rem] leading-none truncate">{x.titulo}</span>
                <span className="block text-xs text-serigrafia-tenue mt-1 whitespace-nowrap"><span className="hidden sm:inline">{FAMILIAS[x.familia]?.nombre}, </span>{x.specs?.fuerza}&nbsp;g</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
