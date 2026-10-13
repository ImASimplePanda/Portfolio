// Basado en TextPressure de React Bits (MIT + Commons Clause), portado de
// https://codepen.io/JuanFuentes/full/rgXKGQ. Adaptado: fuente propia (sin
// CDN ni <style> en línea), tamaño ajustado al ancho real, pausa fuera de
// pantalla y estático con movimiento reducido o en pantallas táctiles.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

export default function TextPressure({
  text,
  as: Tag = 'span',
  minWdth = 62,
  maxWdth = 125,
  minWght = 300,
  maxWght = 900,
  restWdth = 100,
  restWght = 800,
  maxFontSize = 400,
  className = ''
}) {
  const boxRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);
  const [fontSize, setFontSize] = useState(null);
  const chars = text.split('');

  // Tamaño: el texto ocupa exactamente el ancho de su caja (con tope).
  useLayoutEffect(() => {
    const box = boxRef.current, title = titleRef.current;
    if (!box || !title) return;
    const medir = () => {
      const previo = title.style.fontSize;
      title.style.fontSize = '100px';
      // Ancho real de las letras (el contenedor es flex y siempre ocupa todo el ancho)
      const w = Array.from(title.children).reduce((t, el) => t + el.getBoundingClientRect().width, 0) || 1;
      const size = Math.min(maxFontSize, (100 * box.clientWidth) / w);
      title.style.fontSize = previo;
      setFontSize(Math.floor(size * 10) / 10);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(box);
    if (document.fonts?.ready) document.fonts.ready.then(medir);
    return () => ro.disconnect();
  }, [text, maxFontSize]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduce || !fino) return;

    const cursor = { x: -9999, y: -9999 };
    const mouse = { x: -9999, y: -9999 };
    let raf = 0, visible = true, activo = false;

    const onMove = (e) => {
      cursor.x = e.clientX; cursor.y = e.clientY;
      if (!activo) { mouse.x = cursor.x; mouse.y = cursor.y; activo = true; }
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const frame = () => {
      raf = 0;
      mouse.x += (cursor.x - mouse.x) / 12;
      mouse.y += (cursor.y - mouse.y) / 12;
      const title = titleRef.current;
      if (!title) return;
      const maxDist = title.getBoundingClientRect().width / 2;
      spansRef.current.forEach((span) => {
        if (!span) return;
        const r = span.getBoundingClientRect();
        const d = dist(mouse, { x: r.x + r.width / 2, y: r.y + r.height / 2 });
        // Lejos del cursor cada letra conserva su forma de reposo; cerca se comprime y se carga de tinta
        const t = Math.max(0, 1 - d / (maxDist * 0.55));
        const k = t * t * (3 - 2 * t);
        const wdth = Math.round(restWdth + (minWdth - restWdth) * k);
        const wght = Math.round(restWght + (maxWght - restWght) * k);
        const v = `'wght' ${wght}, 'wdth' ${wdth}`;
        if (span.style.fontVariationSettings !== v) span.style.fontVariationSettings = v;
      });
      if (Math.abs(cursor.x - mouse.x) > 0.5 || Math.abs(cursor.y - mouse.y) > 0.5) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(boxRef.current);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      spansRef.current.forEach((s) => s && (s.style.fontVariationSettings = ''));
    };
  }, [minWdth, maxWdth, minWght, maxWght, restWdth, restWght]);

  return (
    <span ref={boxRef} className={`text-pressure ${className}`} aria-hidden="true">
      <Tag
        ref={titleRef}
        className="text-pressure__title"
        style={{ ...(fontSize ? { fontSize: `${fontSize}px` } : null), '--rest-wdth': restWdth, '--rest-wght': restWght }}
      >
        {chars.map((c, i) => (
          <span key={i} ref={(el) => (spansRef.current[i] = el)}>
            {c}
          </span>
        ))}
      </Tag>
    </span>
  );
}
