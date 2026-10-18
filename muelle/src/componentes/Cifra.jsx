import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';

// Número que corre hasta su valor nuevo (precios, unidades). No inyecta estilos, así cumple la CSP estricta.
const formatos = {};
const formato = (moneda) => (formatos[moneda ?? 'n'] ??= new Intl.NumberFormat('es-ES', moneda ? { style: 'currency', currency: 'EUR', useGrouping: 'always' } : { useGrouping: 'always' }));

export default function Cifra({ valor, moneda = false, className = '' }) {
  const [v, setV] = useState(valor);
  const anterior = useRef(valor);
  useEffect(() => {
    if (anterior.current === valor) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(valor); anterior.current = valor; return; }
    const c = animate(anterior.current, valor, { duration: 0.45, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(moneda ? Math.round(x * 100) / 100 : Math.round(x)) });
    anterior.current = valor;
    return () => c.stop();
  }, [valor, moneda]);
  return <span className={`numeros ${className}`}>{formato(moneda).format(v)}</span>;
}
