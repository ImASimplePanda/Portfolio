import { useState } from "react";
import { api } from "../lib/nucleo.js";
import { useSesion } from "../lib/contexto.js";

export function Cuenta() {
  const { usuario, salir } = useSesion();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError(""); setAviso(""); setEnviando(true);
    try {
      const d = await api("/clave", { method: "POST", body: { actual, nueva } });
      setAviso(d.aviso);
      /* Cambiar la clave cierra la sesión a propósito: hay que volver a entrar. */
      setTimeout(salir, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const datos = [
    ["Empresa", usuario.empresa || "—"],
    ["Contacto", usuario.nombre],
    ["Correo", usuario.email],
    ["CIF", usuario.cif || "—"],
    ["Rol", usuario.rol],
    ["Tarifa", usuario.tarifa ? `${usuario.tarifa} (−${usuario.descuento_pct} %)` : "—"],
  ];

  return (
    <>
      <div className="a-cab"><h1>Mi cuenta</h1></div>
      <div className="cat-cols">
        <div className="tabla-caja">
          <table className="datos">
            <tbody>
              {datos.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" style={{ width: "12rem", color: "var(--medio)", fontWeight: 500 }}>{k}</th>
                  <td className="nom">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="cesta">
          <div className="cesta-cab"><h2>Cambiar contraseña</h2></div>
          <form className="form" onSubmit={enviar} style={{ padding: "1rem" }}>
            {error && <p className="error" role="alert">{error}</p>}
            {aviso && <p className="exito" role="status">{aviso}</p>}
            <div className="campo">
              <label htmlFor="c-act">Contraseña actual</label>
              <input id="c-act" type="password" autoComplete="current-password" required
                     value={actual} onChange={(e) => setActual(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="c-nue">Contraseña nueva</label>
              <input id="c-nue" type="password" autoComplete="new-password" minLength="10" required
                     value={nueva} onChange={(e) => setNueva(e.target.value)} />
              <span className="pista">Mínimo 10 caracteres. Se cerrarán las demás sesiones.</span>
            </div>
            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Cambiar"}
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
