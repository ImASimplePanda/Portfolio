// Cliente de la API: añade el token CSRF a las peticiones que cambian algo y
// convierte los errores del servidor en excepciones con mensaje y campos.
import { BASE } from './base.js';

let csrf = '';
export const fijarCsrf = (t) => { csrf = t || csrf; };

export class ErrorApi extends Error {
  constructor(mensaje, estado, campos = {}) {
    super(mensaje);
    this.estado = estado;
    this.campos = campos;
  }
}

export async function api(ruta, { metodo = 'GET', datos, formulario, senal } = {}) {
  const cabeceras = { Accept: 'application/json' };
  if (metodo !== 'GET') cabeceras['X-CSRF-Token'] = csrf;
  if (datos !== undefined) cabeceras['Content-Type'] = 'application/json';
  let r;
  try {
    r = await fetch(`${BASE}api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: formulario ?? (datos !== undefined ? JSON.stringify(datos) : undefined),
      credentials: 'same-origin',
      signal: senal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ErrorApi('No hay conexión con el taller. Comprueba tu conexión y vuelve a intentarlo.', 0);
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ErrorApi(j.error || 'Algo ha fallado. Prueba de nuevo.', r.status, j.campos || {});
  return j;
}
