// La cubeta: discos de pie dentro de una caja, como en la tienda. Se hojean con la rueda,
// arrastrando, con las flechas del teclado o con los botones. Al pulsar el de delante,
// el vinilo sale de la funda y gira con su nombre alrededor de la galleta.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import Portada from './Portada.jsx';
import Vinilo from './Vinilo.jsx';
// El texto que gira (React Bits, con motion) solo se descarga al sacar el primer disco
const CircularText = lazy(() => import('./rb/CircularText.jsx'));
import { euros } from '../lib/formato.js';
import { useTienda } from '../contexto/Tienda.jsx';

const VISIBLES = 6;

export default function Cubeta({ discos }) {
  const [actual, setActual] = useState(0);
  const [sacado, setSacado] = useState(false);
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const zona = useRef(null);
  const ultimo = useRef(0);
  const arrastre = useRef(null);
  const { anadir, avisar } = useTienda();
  const total = discos.length;

  const ir = useCallback((dir) => {
    setSacado(false);
    setActual((a) => Math.max(0, Math.min(total - 1, a + dir)));
  }, [total]);

  // Rueda: hojea la cubeta; en los extremos deja pasar el scroll de la página
  useEffect(() => {
    const el = zona.current;
    if (!el) return;
    const rueda = (e) => {
      const dir = e.deltaY > 0 ? 1 : -1;
      const enExtremo = (dir < 0 && actual === 0) || (dir > 0 && actual === total - 1);
      if (enExtremo || Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      const ahora = performance.now();
      if (ahora - ultimo.current < 160) return;
      ultimo.current = ahora;
      ir(dir);
    };
    el.addEventListener('wheel', rueda, { passive: false });
    return () => el.removeEventListener('wheel', rueda);
  }, [actual, total, ir]);

  const teclas = (e) => {
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); ir(1); }
    else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); ir(-1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSacado((s) => !s); }
    else if (e.key === 'Escape') setSacado(false);
  };

  const pulsar = (e) => { arrastre.current = { y: e.clientY, x: e.clientX, movido: false }; };
  const mover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    const d = Math.abs(e.clientY - a.y) > Math.abs(e.clientX - a.x) ? e.clientY - a.y : e.clientX - a.x;
    if (Math.abs(d) > 44) { ir(d < 0 ? 1 : -1); a.y = e.clientY; a.x = e.clientX; a.movido = true; }
  };
  const soltar = () => { const a = arrastre.current; arrastre.current = null; return a?.movido; };

  const disco = discos[actual];
  // Transiciones CSS con curva de muelle: sin librería y solo transform/opacity
  const transicion = reduce ? 'none' : 'transform 650ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 400ms ease';

  const comprar = () => {
    if (anadir(disco) === 'tope') avisar('Ya está en tu cesta', 'Es un ejemplar único.');
    else avisar('Añadido a la cesta', `${disco.artista}: ${disco.titulo}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] items-end">
      <div
        ref={zona}
        className="relative select-none touch-pan-y"
        style={{ perspective: '1700px' }}
        onPointerDown={pulsar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={() => { arrastre.current = null; }}
      >
        <div
          role="group"
          aria-roledescription="cubeta de discos"
          aria-label={`Discos destacados. ${actual + 1} de ${total}: ${disco.artista}, ${disco.titulo}. Usa las flechas para pasar discos e Intro para sacarlo de la funda.`}
          tabIndex={0}
          onKeyDown={teclas}
          className="relative mx-auto aspect-[1/1.12] w-[min(100%,440px)] rounded-xl focus-visible:outline-offset-8"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {discos.map((d, i) => {
            const r = i - actual;
            if (r < -2 || r > VISIBLES) return null;
            const delante = r === 0;
            const transform = r < 0
              ? 'translate3d(0, 46%, 40px) rotateX(82deg)'
              : `translate3d(0, ${-r * 6.5}%, ${-r * 70}px) rotateX(${delante ? 0 : -3}deg)`;
            return (
              <div
                key={d.id}
                className="absolute left-0 right-0 bottom-[20%] mx-auto w-[86%] aspect-square"
                style={{ transformOrigin: '50% 100%', zIndex: 100 - Math.abs(r), transform, opacity: r < 0 ? 0 : 1 - r * 0.06, transition: transicion }}
                aria-hidden={!delante}
              >
                {delante ? (
                  <div
                    className="absolute inset-[5%]"
                    style={{ transform: `translateY(${sacado ? -58 : 0}%)`, transition: reduce ? 'none' : 'transform 800ms cubic-bezier(0.22, 1.15, 0.36, 1)' }}
                  >
                    <Vinilo producto={d} girando={sacado && !reduce} />
                    {sacado ? (
                      <div className="absolute inset-[35.5%] pointer-events-none text-white">
                        <Suspense fallback={null}>
                          <CircularText text={`${d.artista} · ${d.titulo} · ${d.anio} · `.toUpperCase()} spinDuration={reduce ? 100000 : 14} onHover="" className="galleta" />
                        </Suspense>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <button
                  type="button"
                  tabIndex={-1}
                  className="relative block w-full h-full rounded-[var(--radius-funda)] overflow-hidden shadow-[0_-2px_0_rgba(255,255,255,0.4)_inset,0_18px_30px_-18px_rgba(0,0,0,0.6)] cursor-pointer"
                  onClick={(e) => { if (arrastre.current?.movido) return; if (delante) setSacado((s) => !s); else setActual(i); e.currentTarget.blur(); }}
                  aria-label={delante ? (sacado ? 'Guardar el disco en la funda' : 'Sacar el disco de la funda') : `Ir a ${d.artista}, ${d.titulo}`}
                >
                  <Portada producto={d} decorativa />
                </button>
              </div>
            );
          })}
          {/* frontal de la caja: tapa la parte de abajo de las fundas */}
          <div className="absolute inset-x-0 bottom-0 h-[30%] rounded-b-xl rounded-t-[4px] bg-[#c9a979] shadow-[inset_0_10px_18px_-10px_rgba(0,0,0,0.45)] z-[200]" style={{ transform: 'translateZ(60px)' }} aria-hidden="true">
            <div className="absolute inset-0 rounded-b-xl rounded-t-[4px] opacity-40 bg-[repeating-linear-gradient(0deg,transparent_0_14px,rgba(70,40,10,0.18)_14px_15px)]" />
            <div className="absolute left-1/2 top-[30%] -translate-x-1/2 h-[18%] w-[34%] rounded-full bg-[#7a5a33]/60 shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)]" />
            <p className="absolute right-[6%] bottom-[16%] rotate-[-2deg] bg-papel text-tinta text-sm font-semibold px-3 py-1.5 rounded-sm shadow-sm">Recién llegados</p>
          </div>
        </div>
      </div>

      <div className="lg:pb-[12%]">
        <p className="text-sm text-gris tabular-nums" aria-hidden="true">{actual + 1} de {total}</p>
        <h2 className="mt-1 text-xl font-semibold leading-tight">{disco.artista}</h2>
        <p className="text-gris text-lg leading-snug">{disco.titulo}, {disco.anio}</p>
        <p className="mt-3 text-2xl font-semibold tabular-nums">{euros(disco.precio)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/producto/${disco.slug}`} className="boton">Ver disco</Link>
          <button type="button" className="boton-linea" onClick={comprar} disabled={disco.stock <= 0}>{disco.stock <= 0 ? 'Vendido' : 'Añadir a la cesta'}</button>
        </div>
        <div className="mt-6 flex gap-2">
          <button type="button" className="grid place-items-center size-12 rounded-full border border-tinta/25 hover:border-tinta disabled:opacity-35" onClick={() => ir(-1)} disabled={actual === 0} aria-label="Disco anterior">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} strokeWidth={1.8} />
          </button>
          <button type="button" className="grid place-items-center size-12 rounded-full border border-tinta/25 hover:border-tinta disabled:opacity-35" onClick={() => ir(1)} disabled={actual === total - 1} aria-label="Disco siguiente">
            <HugeiconsIcon icon={ArrowRight01Icon} size={22} strokeWidth={1.8} />
          </button>
        </div>
        <p className="mt-3 text-sm text-gris">Pasa discos con la rueda o arrastrando. Pulsa el de delante para sacarlo.</p>
      </div>
    </div>
  );
}
