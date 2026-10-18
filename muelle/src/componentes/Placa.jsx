import { useEffect, useRef } from 'react';

// Piezas de la placa: pistas de cobre a 45°, taladros con anillo y designadores de serigrafía.

const reducido = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Pista de cobre que se dibuja (anime.js) cuando entra en pantalla al hacer scroll.
// `d` es un trazado SVG en el viewBox dado; los extremos llevan su vía.
export function Pista({ d, viewBox = '0 0 100 100', className = '', grosor = 2.4, vias = [], encendida = false, alScroll = true }) {
  const ref = useRef();
  useEffect(() => {
    if (!alScroll || reducido() || !ref.current) return;
    let a;
    let vivo = true;
    import('animejs').then(({ animate, createDrawable, onScroll }) => {
      if (!vivo || !ref.current) return;
      const [dibujable] = createDrawable(ref.current);
      a = animate(dibujable, { draw: ['0 0', '0 1'], ease: 'inOutQuad', autoplay: onScroll({ enter: 'bottom-=10% top', leave: 'center top', sync: 0.6 }) });
    });
    return () => { vivo = false; a?.revert(); };
  }, [alScroll]);
  return (
    <svg viewBox={viewBox} className={`pointer-events-none overflow-visible ${className}`} aria-hidden="true" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--color-cobre-hondo)" strokeWidth={grosor + 2} strokeLinejoin="round" strokeLinecap="round" opacity="0.35" vectorEffect="non-scaling-stroke" />
      <path ref={ref} d={d} fill="none" stroke={encendida ? 'var(--color-cobre-vivo)' : 'var(--color-cobre)'} strokeWidth={grosor} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"
        style={{ filter: encendida ? 'drop-shadow(0 0 4px rgb(240 195 106 / 0.7))' : undefined, transition: 'stroke 120ms, filter 120ms' }} />
      {vias.map(([x, y], i) => <Via key={i} x={x} y={y} />)}
    </svg>
  );
}

export function Via({ x, y, r = 2.2 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 1.6} fill="var(--color-cobre)" />
      <circle cx={x} cy={y} r={r * 0.55} fill="var(--color-mascara-honda)" />
    </g>
  );
}

// Taladro de montaje en las esquinas de un panel
export function Taladro({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" className={`size-4 ${className}`} aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="var(--color-cobre)" />
      <circle cx="10" cy="10" r="5.2" fill="var(--color-mascara-honda)" />
      <circle cx="10" cy="10" r="9" fill="none" stroke="var(--color-cobre-hondo)" strokeWidth="1" />
    </svg>
  );
}

// Panel con forma de placa: cantos redondeados, borde de serigrafía y cuatro taladros
export function Panel({ as: Etiqueta = 'div', className = '', children, taladros = true, ...resto }) {
  return (
    <Etiqueta className={`relative rounded-[var(--radius-placa)] bg-mascara-alta shadow-[inset_0_0_0_1px_var(--color-mascara-borde),0_20px_40px_-24px_rgb(0_0_0/0.7)] ${className}`} {...resto}>
      {taladros ? (
        <>
          <Taladro className="absolute left-3 top-3" />
          <Taladro className="absolute right-3 top-3" />
          <Taladro className="absolute left-3 bottom-3" />
          <Taladro className="absolute right-3 bottom-3" />
        </>
      ) : null}
      {children}
    </Etiqueta>
  );
}

// Designador de serigrafía (SW1, U2…) con la silueta de la huella al lado
export function Designador({ children, className = '' }) {
  return <span className={`designador ${className}`}>{children}</span>;
}

// Separador entre secciones: una pista que baja con un quiebro a 45°, con una vía en cada extremo
export function SeparadorPista({ className = '' }) {
  const via = 'absolute size-[11px] rounded-full bg-cobre after:absolute after:inset-[3px] after:rounded-full after:bg-mascara';
  return (
    <div aria-hidden="true" className={`mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 ${className}`}>
      <div className="flex h-6">
        <div className="relative flex-1">
          <span className="absolute left-1 right-0 top-[4px] h-[3px] rounded-l-full bg-cobre" />
          <span className={`${via} left-0 top-0`} />
        </div>
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 overflow-visible"><path d="M-1 5.5 L4 5.5 L18.5 20 L25 20" fill="none" stroke="var(--color-cobre)" strokeWidth="3" strokeLinejoin="round" /></svg>
        <div className="relative w-[28%]">
          <span className="absolute left-0 right-1 bottom-[2.5px] h-[3px] rounded-r-full bg-cobre" />
          <span className={`${via} right-0 bottom-[-1.5px]`} />
        </div>
      </div>
    </div>
  );
}
