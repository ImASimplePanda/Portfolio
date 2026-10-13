// Basado en Masonry de React Bits (MIT + Commons Clause). Adaptado: alturas
// proporcionales a cada imagen, la caja reserva su altura (sin saltos), entrada
// al aparecer en pantalla, botones accesibles con <img alt> y solo transform/opacity.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './Masonry.css';

const useColumnas = () => {
  const consultas = ['(min-width:1200px)', '(min-width:760px)', '(min-width:0px)'];
  const valores = [4, 3, 2];
  const leer = () => valores[consultas.findIndex((q) => window.matchMedia(q).matches)] ?? 2;
  const [n, setN] = useState(leer);
  useEffect(() => {
    const mqs = consultas.map((q) => window.matchMedia(q));
    const h = () => setN(leer);
    mqs.forEach((m) => m.addEventListener('change', h));
    return () => mqs.forEach((m) => m.removeEventListener('change', h));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return n;
};

export default function Masonry({ items, gap = 12, onSelect, hoverScale = 0.97 }) {
  const columnas = useColumnas();
  const ref = useRef(null);
  const [ancho, setAncho] = useState(0);
  const vistos = useRef(false);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const { grid, alto } = useMemo(() => {
    if (!ancho) return { grid: [], alto: 0 };
    const colW = (ancho - gap * (columnas - 1)) / columnas;
    const alturas = new Array(columnas).fill(0);
    const grid = items.map((it) => {
      const col = alturas.indexOf(Math.min(...alturas));
      const h = colW * (it.h / it.w);
      const pos = { ...it, x: col * (colW + gap), y: alturas[col], cw: colW, ch: h };
      alturas[col] += h + gap;
      return pos;
    });
    return { grid, alto: Math.max(...alturas) - gap };
  }, [items, ancho, columnas, gap]);

  // Entrada escalonada la primera vez que la rejilla aparece en pantalla.
  useEffect(() => {
    const el = ref.current;
    if (!el || !grid.length || vistos.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tarjetas = el.querySelectorAll('.item-wrapper');
    if (reduce) { vistos.current = true; return; }
    gsap.set(tarjetas, { opacity: 0, yPercent: 18 });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      vistos.current = true;
      gsap.to(tarjetas, { opacity: 1, yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, clearProps: 'transform' });
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    const seguro = setTimeout(() => { if (!vistos.current) gsap.set(tarjetas, { opacity: 1, yPercent: 0 }); }, 4000);
    return () => { io.disconnect(); clearTimeout(seguro); };
  }, [grid.length]);

  const enter = (e) => gsap.to(e.currentTarget.firstChild, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
  const leave = (e) => gsap.to(e.currentTarget.firstChild, { scale: 1, duration: 0.4, ease: 'power2.out' });

  return (
    <div ref={ref} className="list" style={{ height: alto ? `${alto}px` : undefined }}>
      {grid.map((it) => (
        <button
          key={it.id}
          type="button"
          className="item-wrapper"
          style={{ left: `${it.x}px`, top: `${it.y}px`, width: `${it.cw}px`, height: `${it.ch}px` }}
          onClick={() => onSelect?.(it)}
          onPointerEnter={enter}
          onPointerLeave={leave}
          onFocus={enter}
          onBlur={leave}
        >
          <span className="item-img">
            <img src={it.img} alt={it.alt} width={it.w} height={it.h} loading="lazy" decoding="async" />
          </span>
        </button>
      ))}
    </div>
  );
}
