import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// Datos que el servidor deja dentro de la página (script JSON, no ejecutable). Se usan una sola vez.
let iniciales = null;
function inicial(clave) {
  if (iniciales === null) {
    try { iniciales = JSON.parse(document.getElementById('surco-inicial')?.textContent || '{}'); } catch { iniciales = {}; }
  }
  const v = iniciales[clave];
  delete iniciales[clave];
  return v ?? null;
}

// Carga datos de la API y vuelve a cargarlos cuando cambia la ruta pedida.
export function usarDatos(ruta, claveInicial) {
  const [estado, setEstado] = useState(() => {
    const d = claveInicial ? inicial(claveInicial) : null;
    return { datos: d, error: null, cargando: !d, desdeServidor: !!d };
  });
  const [vuelta, setVuelta] = useState(0);
  useEffect(() => {
    if (!ruta) return;
    if (estado.desdeServidor && vuelta === 0) return;
    const c = new AbortController();
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    api(ruta, { senal: c.signal })
      .then((datos) => setEstado({ datos, error: null, cargando: false, desdeServidor: false }))
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
    document.title = titulo ? `${titulo} · Surco` : 'Surco · Discos y tocadiscos de segunda mano en Las Palmas';
  }, [titulo]);
}
