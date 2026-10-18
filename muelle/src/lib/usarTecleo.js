import { useCallback, useEffect, useRef, useState } from 'react';
import { pulsar, soltar, despertar } from './sonido.js';

const ANCHOS = { Space: 6.25, Backspace: 2, ShiftRight: 2.75, Enter: 1.5, CapsLock: 1.75, Tab: 1.5, ShiftLeft: 1.25 };
const enCampo = (el) => el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

// Escucha el teclado físico (y los toques en pantalla) y hace sonar el interruptor elegido.
// Devuelve las teclas hundidas en una referencia (para el 3D, sin renderizar) y en estado (para el 2D).
export function usarTecleo(sonido, { activo = true, capturarEspacio = false, alPulsar } = {}) {
  const pulsadas = useRef(new Set());
  const [visibles, setVisibles] = useState(() => new Set());
  const [pulsaciones, setPulsaciones] = useState(0);
  const sonidoRef = useRef(sonido);
  sonidoRef.current = sonido;
  const alPulsarRef = useRef(alPulsar);
  alPulsarRef.current = alPulsar;

  const bajar = useCallback((codigo, ancho = ANCHOS[codigo] || 1) => {
    if (pulsadas.current.has(codigo)) return;
    pulsadas.current.add(codigo);
    setVisibles(new Set(pulsadas.current));
    setPulsaciones((n) => n + 1);
    pulsar(sonidoRef.current, ancho);
    alPulsarRef.current?.(codigo);
  }, []);
  const subir = useCallback((codigo, ancho = ANCHOS[codigo] || 1) => {
    if (!pulsadas.current.delete(codigo)) return;
    setVisibles(new Set(pulsadas.current));
    soltar(sonidoRef.current, ancho);
  }, []);

  useEffect(() => {
    if (!activo) return;
    const abajo = (e) => {
      if (e.repeat || enCampo(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (capturarEspacio && (e.code === 'Space' || e.code.startsWith('Arrow'))) e.preventDefault();
      despertar();
      bajar(e.code);
    };
    const arriba = (e) => subir(e.code);
    // Si la ventana pierde el foco con teclas pulsadas, se sueltan todas
    const limpiar = () => { pulsadas.current.clear(); setVisibles(new Set()); };
    window.addEventListener('keydown', abajo);
    window.addEventListener('keyup', arriba);
    window.addEventListener('blur', limpiar);
    return () => { window.removeEventListener('keydown', abajo); window.removeEventListener('keyup', arriba); window.removeEventListener('blur', limpiar); };
  }, [activo, capturarEspacio, bajar, subir]);

  return { pulsadas, visibles, pulsaciones, bajar, subir };
}
