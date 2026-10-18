import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// Datos que el servidor deja dentro de la página (script JSON, no ejecutable). Se usan una sola vez.
let iniciales = null;
function inicial(clave) {
  if (iniciales === null) {
    try { iniciales = JSON.parse(document.getElementById('muelle-inicial')?.textContent || '{}'); } catch { iniciales = {}; }
  }
  const v = iniciales[clave];
  delete iniciales[clave];
  return v ?? null;
}

// Caché corta de lecturas públicas (catálogo y fichas): permite pedirlas antes de llegar a la página
// (al pasar el ratón por un enlace) y que al hacer clic ya estén. El precio y el stock se vuelven a
// comprobar en el servidor al añadir y al pagar, así que unos segundos de antigüedad no importan.
const VIDA = 30000;
const cache = new Map();
const publica = (r) => r.startsWith('/productos') || r === '/montador/piezas';
const fresco = (r) => { const c = cache.get(r); return c && Date.now() - c.t < VIDA ? c : null; };
export function precargar(ruta) {
  if (!ruta || !publica(ruta)) return null;
  const c = fresco(ruta);
  if (c) return c.p;
  const p = api(ruta).then((datos) => { const e = cache.get(ruta); if (e) e.datos = datos; return datos; });
  p.catch(() => cache.delete(ruta));
  cache.set(ruta, { t: Date.now(), p, datos: null });
  return p;
}

// Carga datos de la API y vuelve a cargarlos cuando cambia la ruta pedida.
export function usarDatos(ruta, claveInicial) {
  const [estado, setEstado] = useState(() => {
    const d = (claveInicial ? inicial(claveInicial) : null) ?? (ruta ? fresco(ruta)?.datos : null) ?? null;
    return { datos: d, error: null, cargando: !d, desdeServidor: !!d };
  });
  const [vuelta, setVuelta] = useState(0);
  // Los datos de la página valen solo para la ruta con la que se abrió; si cambia, se piden
  const [rutaInicial] = useState(ruta);
  useEffect(() => {
    if (!ruta) return;
    if (estado.desdeServidor && vuelta === 0 && ruta === rutaInicial) return;
    const c = new AbortController();
    const listo = fresco(ruta)?.datos;
    if (listo) { setEstado({ datos: listo, error: null, cargando: false, desdeServidor: false }); return; }
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    (publica(ruta) && vuelta === 0 ? precargar(ruta) : api(ruta, { senal: c.signal }))
      .then((datos) => { if (!c.signal.aborted) setEstado({ datos, error: null, cargando: false, desdeServidor: false }); })
      .catch((error) => { if (error.name !== 'AbortError') setEstado({ datos: null, error, cargando: false }); });
    return () => c.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta, vuelta]);
  const recargar = useCallback(() => setVuelta((v) => v + 1), []);
  return { ...estado, recargar };
}

// Título de la pestaña por página
export function usarTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Muelle` : 'Muelle · Teclados mecánicos que puedes oír antes de comprar';
  }, [titulo]);
}
