import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { euros } from '../lib/formato.js';

// Precio que corre hasta el valor nuevo cuando cambia una opción
export default function Precio({ centimos, className = '' }) {
  const [v, setV] = useState(centimos);
  const anterior = useRef(centimos);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(centimos); anterior.current = centimos; return; }
    const c = animate(anterior.current, centimos, { duration: 0.45, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x / 100) * 100) });
    anterior.current = centimos;
    return () => c.stop();
  }, [centimos]);
  return <span className={`numeros ${className}`}>{euros(v)}</span>;
}

