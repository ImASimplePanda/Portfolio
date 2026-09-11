import { useCallback, useEffect, useState } from "react";
import { api } from "./nucleo.js";
import { CtxSesion } from "./contexto.js";

/* ── Sesión ────────────────────────────────────────────────────────
   Una sola fuente de verdad sobre quién está dentro. Se pregunta al
   servidor al arrancar: la cookie es httpOnly, así que el JavaScript
   no puede leerla y tiene que preguntar. */
export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    api("/yo")
      .then((d) => vivo && setUsuario(d.usuario))
      .catch(() => {})
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, []);

  const entrar = useCallback(async (email, clave) => {
    const d = await api("/login", { method: "POST", body: { email, clave } });
    setUsuario(d.usuario);
    return d.usuario;
  }, []);

  const salir = useCallback(async () => {
    /* No se borra el borrador: es del cliente y vive en su cuenta, asi
       que al volver a entrar lo encuentra donde lo dejo. */
    await api("/logout", { method: "POST" }).catch(() => {});
    setUsuario(null);
    window.location.hash = "/";
  }, []);

  return (
    <CtxSesion.Provider value={{ usuario, cargando, entrar, salir }}>{children}</CtxSesion.Provider>
  );
}

