import { useEffect, useRef, useState } from 'react';

// Magnet, de React Bits (reactbits.dev): el contenido se deja atraer por el cursor cuando se acerca.
// Adaptado: sin movimiento en pantallas táctiles ni con movimiento reducido.
export default function Magnet({ children, padding = 70, fuerza = 4, className = '' }) {
  const ref = useRef(null);
  const [activo, setActivo] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const quieto = window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches;
    if (quieto) return;
    const mover = (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding) {
        setActivo(true);
        setPos({ x: dx / fuerza, y: dy / fuerza });
      } else {
        setActivo(false);
        setPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener('mousemove', mover, { passive: true });
    return () => window.removeEventListener('mousemove', mover);
  }, [padding, fuerza]);

  return (
    <div ref={ref} className={`inline-block ${className}`}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, transition: activo ? 'transform 300ms cubic-bezier(0.16,1,0.3,1)' : 'transform 600ms cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }}>
      {children}
    </div>
  );
}
