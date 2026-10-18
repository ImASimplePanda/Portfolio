// ClickSpark (React Bits): chispas que salen del punto donde se pulsa.
// Aquí hace de chispa de soldadura al tocar una huella de la placa.
import { useCallback, useEffect, useRef } from 'react';

export default function ClickSpark({ sparkColor = '#f0c36a', sparkSize = 10, sparkRadius = 18, sparkCount = 8, duration = 380, easing = 'ease-out', extraScale = 1, children }) {
  const lienzo = useRef(null);
  const chispas = useRef([]);
  const inicio = useRef(null);

  useEffect(() => {
    const c = lienzo.current;
    const padre = c?.parentElement;
    if (!c || !padre) return;
    let t;
    const medir = () => {
      const { width, height } = padre.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = width * dpr;
      c.height = height * dpr;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(medir, 100); });
    ro.observe(padre);
    medir();
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  const curva = useCallback((x) => {
    if (easing === 'linear') return x;
    if (easing === 'ease-in') return x * x;
    if (easing === 'ease-in-out') return x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
    return x * (2 - x);
  }, [easing]);

  useEffect(() => {
    const c = lienzo.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let id;
    const dibujar = (ahora) => {
      if (!inicio.current) inicio.current = ahora;
      ctx.clearRect(0, 0, c.width, c.height);
      chispas.current = chispas.current.filter((s) => {
        const pasado = ahora - s.inicio;
        if (pasado >= duration) return false;
        const p = curva(pasado / duration);
        const dist = p * sparkRadius * extraScale;
        const largo = sparkSize * (1 - p);
        const x1 = s.x + dist * Math.cos(s.angulo);
        const y1 = s.y + dist * Math.sin(s.angulo);
        const x2 = s.x + (dist + largo) * Math.cos(s.angulo);
        const y2 = s.y + (dist + largo) * Math.sin(s.angulo);
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });
      id = requestAnimationFrame(dibujar);
    };
    id = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(id);
  }, [sparkColor, sparkSize, sparkRadius, duration, curva, extraScale]);

  const alPulsar = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = lienzo.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const ahora = performance.now();
    chispas.current.push(...Array.from({ length: sparkCount }, (_, i) => ({ x, y, angulo: (2 * Math.PI * i) / sparkCount, inicio: ahora })));
  };

  return (
    <div className="relative" onPointerDown={alPulsar}>
      <canvas ref={lienzo} className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      {children}
    </div>
  );
}
