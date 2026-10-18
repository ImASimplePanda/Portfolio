import { useEffect, useRef } from 'react';
import { animate, useInView } from 'motion/react';

// Number Ticker, de Magic UI (magicui.design): la cifra cuenta hasta su valor al entrar en pantalla.
// Adaptado: formato español, cifras tabulares y sin animación con movimiento reducido.
const formato = new Intl.NumberFormat('es-ES');

export default function NumberTicker({ valor, desde = 0, className = '' }) {
  const ref = useRef(null);
  const visto = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  useEffect(() => {
    const el = ref.current;
    if (!el || !visto) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = formato.format(valor); return; }
    const a = animate(desde, valor, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { el.textContent = formato.format(Math.round(v)); } });
    return () => a.stop();
  }, [visto, valor, desde]);

  return <span ref={ref} className={`cifra ${className}`}>{formato.format(desde)}</span>;
}
