// Estado global de la tienda: sesión (usuario y CSRF), cesta (en localStorage) y avisos.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, fijarCsrf } from '../lib/api.js';

const Ctx = createContext(null);
export const useTienda = () => useContext(Ctx);

const CLAVE_CESTA = 'surco:cesta';
const leerCesta = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE_CESTA) || '[]');
    return Array.isArray(v) ? v.filter((x) => x && Number.isInteger(x.id) && x.producto) : [];
  } catch {
    return [];
  }
};

export function TiendaProvider({ children }) {
  const [sesion, setSesion] = useState({ cargando: true, usuario: null, demo: true, stripe: false });
  const [cesta, setCesta] = useState(leerCesta);
  const [avisos, setAvisos] = useState([]);
  const idAviso = useRef(0);

  const cargarSesion = useCallback(async () => {
    try {
      const s = await api('/sesion');
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

  const avisar = useCallback((titulo, descripcion = '') => {
    const id = ++idAviso.current;
    setAvisos((a) => [...a.slice(-2), { id, titulo, descripcion }]);
  }, []);
  const cerrarAviso = useCallback((id) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const cestaRef = useRef(cesta);
  cestaRef.current = cesta;
  // Devuelve 'ok' o 'tope' (ya tienes en la cesta todas las unidades que hay)
  const anadir = useCallback((p, cantidad = 1) => {
    const max = Math.max(0, p.stock);
    const ya = cestaRef.current.find((x) => x.id === p.id);
    if ((ya?.cantidad ?? 0) >= max) return 'tope';
    setCesta((c) => (c.some((x) => x.id === p.id)
      ? c.map((x) => (x.id === p.id ? { ...x, cantidad: Math.min(max, x.cantidad + cantidad), producto: p, agotado: false } : x))
      : [...c, { id: p.id, cantidad: Math.min(max, cantidad), producto: p }]));
    return 'ok';
  }, []);
  const cambiarCantidad = useCallback((id, cantidad) => setCesta((c) => c.map((x) => (x.id === id ? { ...x, cantidad } : x))), []);
  const quitar = useCallback((id) => setCesta((c) => c.filter((x) => x.id !== id)), []);
  const vaciar = useCallback(() => setCesta([]), []);
  // Sustituye los datos guardados por los del servidor (precio y stock reales)
  const sincronizar = useCallback((lineas) => {
    setCesta((c) => c.map((x) => {
      const l = lineas.find((y) => y.id === x.id);
      if (!l) return x;
      return { ...x, producto: l.producto ?? { ...x.producto, stock: 0 }, cantidad: Math.max(0, Math.min(x.cantidad, l.disponible)) || x.cantidad, agotado: l.disponible <= 0 };
    }));
  }, []);

  const unidades = cesta.reduce((n, x) => n + x.cantidad, 0);
  const subtotal = cesta.filter((x) => !x.agotado).reduce((n, x) => n + x.producto.precio * x.cantidad, 0);

  const valor = useMemo(() => ({
    sesion, setSesion, cargarSesion,
    cesta, unidades, subtotal, anadir, cambiarCantidad, quitar, vaciar, sincronizar,
    avisos, avisar, cerrarAviso,
  }), [sesion, cargarSesion, cesta, unidades, subtotal, anadir, cambiarCantidad, quitar, vaciar, sincronizar, avisos, avisar, cerrarAviso]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
