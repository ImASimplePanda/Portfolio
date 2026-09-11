import { createContext, useContext } from "react";

/* En su propio fichero para que sesion.jsx exporte unicamente el
   componente: si un modulo mezcla componentes y utilidades, el refresco
   en caliente de Vite deja de funcionar en ese fichero. */
export const CtxSesion = createContext(null);
export const useSesion = () => useContext(CtxSesion);
