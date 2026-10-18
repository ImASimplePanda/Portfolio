// Estado global de la tienda: sesión (usuario y CSRF), cesta (en localStorage) y avisos.
// La cesta guarda dos tipos de línea: productos sueltos ({id}) y teclados a medida ({montaje}).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, fijarCsrf } from '../lib/api.js';

const Ctx = createContext(null);
export const useTienda = () => useContext(Ctx);

const CLAVE_CESTA = 'muelle:cesta';
let sesionEnCurso = null;
const valida = (x) => x && typeof x.clave === 'string' && Number.isInteger(x.cantidad) && ((Number.isInteger(x.id) && x.producto) || (x.montaje && Number.isInteger(x.precio)));
const leerCesta = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE_CESTA) || '[]');
    return Array.isArray(v) ? v.filter(valida) : [];
  } catch {
    return [];
  }
};

export const claveMontaje = (m) => 'm:' + JSON.stringify([m.formato, m.carcasa, m.color, m.placa, m.interruptor, m.teclas, [...m.extras].sort()]);
export const precioLinea = (x) => (x.montaje ? x.precio : x.producto.precio);

export function TiendaProvider({ children }) {
  const [sesion, setSesion] = useState({ cargando: true, usuario: null, demo: true, stripe: false });
  const [cesta, setCesta] = useState(leerCesta);
  const [avisos, setAvisos] = useState([]);
  const idAviso = useRef(0);

  const cargarSesion = useCallback(async (forzar = false) => {
    try {
      // Una sola petición de sesión aunque el efecto se ejecute dos veces (modo estricto): dos a la vez
      // crearían dos sesiones con tokens distintos y la siguiente petición fallaría con 419
      if (forzar || !sesionEnCurso) sesionEnCurso = api('/sesion');
      const s = await sesionEnCurso;
      fijarCsrf(s.csrf);
      setSesion({ cargando: false, usuario: s.usuario, demo: s.demo, stripe: s.stripe });
    } catch {
      setSesion((x) => ({ ...x, cargando: false }));
    }
  }, []);
  useEffect(() => { cargarSesion(); }, [cargarSesion]);

  useEffect(() => {
    try { localStorage.setItem(CLAVE_CESTA, JSON.stringify(cesta)); } catch { /* modo privado: la cesta vive en memoria */ }
  }, [cesta]);

  // Otra pestaña cambió la cesta
  useEffect(() => {
    const f = (e) => e.key === CLAVE_CESTA && setCesta(leerCesta());
    window.addEventListener('storage', f);
    return () => window.removeEventListener('storage', f);
  }, []);

  // Avisos: la isla de la cabecera muestra el último
  const avisar = useCallback((titulo, descripcion = '', tipo = 'ok') => {
    const id = ++idAviso.current;
    setAvisos((a) => [...a.slice(-2), { id, titulo, descripcion, tipo }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 4200);
  }, []);
  const cerrarAviso = useCallback((id) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const cestaRef = useRef(cesta);
  cestaRef.current = cesta;

  // Devuelve 'ok' o 'tope' (ya tienes en la cesta todas las unidades que hay)
  const anadir = useCallback((p, cantidad = 1) => {
    const clave = `p:${p.id}`;
    const max = Math.max(0, p.stock);
    const ya = cestaRef.current.find((x) => x.clave === clave);
    if ((ya?.cantidad ?? 0) >= max) return 'tope';
    setCesta((c) => (c.some((x) => x.clave === clave)
      ? c.map((x) => (x.clave === clave ? { ...x, cantidad: Math.min(max, x.cantidad + cantidad), producto: p, agotado: false } : x))
      : [...c, { clave, id: p.id, cantidad: Math.min(max, cantidad), producto: p }]));
    return 'ok';
  }, []);

  // Un teclado a medida: el mismo montaje dos veces suma unidades (máximo 3)
  const anadirMontaje = useCallback(({ montaje, titulo, precio, vista }) => {
    const clave = claveMontaje(montaje);
    const ya = cestaRef.current.find((x) => x.clave === clave);
    if ((ya?.cantidad ?? 0) >= 3) return 'tope';
    setCesta((c) => (ya
      ? c.map((x) => (x.clave === clave ? { ...x, cantidad: x.cantidad + 1, precio, titulo, agotado: false } : x))
      : [...c, { clave, montaje, titulo, precio, vista, cantidad: 1 }]));
    return 'ok';
  }, []);

  const cambiarCantidad = useCallback((clave, cantidad) => setCesta((c) => c.map((x) => (x.clave === clave ? { ...x, cantidad } : x))), []);
  const quitar = useCallback((clave) => setCesta((c) => c.filter((x) => x.clave !== clave)), []);
  const vaciar = useCallback(() => setCesta([]), []);

  // Sustituye los datos guardados por los del servidor (precio y stock reales)
  const sincronizar = useCallback((lineas) => {
    setCesta((c) => c.map((x) => {
      const l = lineas.find((y) => y.clave === x.clave);
      if (!l) return x;
      if (x.montaje) {
        if (l.error) return { ...x, agotado: true, error: l.error };
        return { ...x, precio: l.precio, titulo: l.titulo, agotado: l.disponible <= 0, error: null };
      }
      return { ...x, producto: l.producto ?? { ...x.producto, stock: 0 }, cantidad: Math.max(0, Math.min(x.cantidad, l.disponible)) || x.cantidad, agotado: l.disponible <= 0 };
    }));
  }, []);

  const unidades = cesta.reduce((n, x) => n + x.cantidad, 0);
  const subtotal = cesta.filter((x) => !x.agotado).reduce((n, x) => n + precioLinea(x) * x.cantidad, 0);

  const valor = useMemo(() => ({
    sesion, setSesion, cargarSesion,
    cesta, unidades, subtotal, anadir, anadirMontaje, cambiarCantidad, quitar, vaciar, sincronizar,
    avisos, avisar, cerrarAviso,
  }), [sesion, cargarSesion, cesta, unidades, subtotal, anadir, anadirMontaje, cambiarCantidad, quitar, vaciar, sincronizar, avisos, avisar, cerrarAviso]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
