import { useEffect, useRef, useState } from 'react';
import StickerPeel from '../components/rb/StickerPeel.jsx';
import { flash } from '../data/estudio.js';

// Las pegatinas usan WebGL2: solo en escritorio con ratón y sin movimiento reducido.
function useLado(ref) {
  const [lado, setLado] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setLado(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return lado;
}

function usePegatinas() {
  const [si, setSi] = useState(false);
  useEffect(() => {
    const ok =
      window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !!document.createElement('canvas').getContext('webgl2');
    setSi(ok);
  }, []);
  return si;
}

const mesa = [
  { id: 'daga-1', width: 150, rotate: -8, pos: { x: -0.24, y: -0.12 } },
  { id: 'polilla-1', width: 220, rotate: 6, pos: { x: 0.2, y: -0.2 } },
  { id: 'luna-2', width: 200, rotate: -4, pos: { x: 0.04, y: 0.22 } },
];

export default function Flash({ onReservar }) {
  const pegatinas = usePegatinas();
  const mesaRef = useRef(null);
  const lado = useLado(mesaRef);
  return (
    <section className="seccion flash" id="flash" aria-labelledby="flash-t">
      <div className="envoltura flash__rejilla">
        <div className="flash__mesa" ref={mesaRef} aria-hidden={pegatinas ? 'true' : undefined}>
          {pegatinas && lado > 0 ? (
            mesa.map((m) => {
              const f = flash.find((x) => x.id === m.id);
              return (
                <div key={m.id} className="flash__hueco">
                  <StickerPeel imageSrc={f.pegatina} width={Math.round(m.width * lado / 600)} initialPosition={{ x: m.pos.x * lado, y: m.pos.y * lado }} rotate={m.rotate} peelDirection={m.rotate * 4} finish="matte" shadowIntensity={0.5} lightingIntensity={0.35} />
                </div>
              );
            })
          ) : (
            <div className="flash__estatica">
              {mesa.map((m) => {
                const f = flash.find((x) => x.id === m.id);
                return <img key={m.id} src={f.pegatina} alt="" width={f.w + 60} height={f.h + 60} loading="lazy" decoding="async" data-pos={m.id} />;
              })}
            </div>
          )}
          {pegatinas && <p className="flash__pista">Arrastra y despega las pegatinas</p>}
        </div>

        <div className="flash__lista">
          <h2 id="flash-t" className="titular">Flash del mes</h2>
          <p className="entradilla">Diseños cerrados a precio fijo. Cada uno se tatúa una sola vez y después se retira.</p>
          <ul role="list">
            {flash.map((f) => (
              <li key={f.id} className="flash__item">
                <img src={f.img} alt="" width={f.w} height={f.h} loading="lazy" decoding="async" />
                <div>
                  <h3>{f.nombre}</h3>
                  <p>{f.tamano}</p>
                </div>
                <p className="flash__precio">{f.precio} €</p>
                <button type="button" className="boton boton--peq boton--linea" onClick={() => onReservar(f)}>
                  Reservar<span className="sr"> {f.nombre}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
