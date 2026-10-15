import { createContext, useContext, useEffect, useState } from 'react';
import { api, fijarCsrf } from '../lib/api.js';

// Pide al servidor el token CSRF, si es la demo y si hay alguien del taller con la sesión abierta
const Contexto = createContext(null);

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState({ cargada: false, usuario: null, demo: true, stripe: false });
  const recargar = () =>
    api('/sesion')
      .then((s) => { fijarCsrf(s.csrf); setSesion({ cargada: true, usuario: s.usuario, demo: s.demo, stripe: s.stripe }); })
      .catch(() => setSesion((s) => ({ ...s, cargada: true })));
  useEffect(() => { recargar(); }, []);
  return <Contexto.Provider value={{ ...sesion, recargar, setSesion }}>{children}</Contexto.Provider>;
}

export const usarSesion = () => useContext(Contexto);
