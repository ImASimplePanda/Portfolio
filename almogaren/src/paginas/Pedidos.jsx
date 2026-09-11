import { useEffect, useState } from "react";
import { api, eur, fecha } from "../lib/nucleo.js";
import { useSesion } from "../lib/contexto.js";

const ESTADOS = ["recibido", "preparando", "enviado", "entregado", "anulado"];

export function Pedidos() {
  const { usuario } = useSesion();
  const gestiona = usuario.rol !== "cliente";
  const [pedidos, setPedidos] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = () =>
    api("/pedidos")
      .then((d) => setPedidos(d.pedidos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));

  useEffect(() => {
    cargar();
  }, []);

  function abrir(ref) {
    if (abierto === ref) {
      setAbierto(null);
      return;
    }
    setAbierto(ref);
    setDetalle(null);
    api(`/pedidos/${ref}`)
      .then((d) => setDetalle(d.pedido))
      .catch((e) => setError(e.message));
  }

  async function cambiarEstado(ref, estado) {
    setError("");
    try {
      await api(`/admin/pedidos/${ref}`, { method: "PATCH", body: { estado } });
      await cargar();
      /* si el detalle de ese pedido está abierto, se recarga sin cerrarlo */
      if (abierto === ref) {
        const d = await api(`/pedidos/${ref}`);
        setDetalle(d.pedido);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <p className="cargando">Cargando pedidos…</p>;

  return (
    <>
      <div className="a-cab">
        <h1>{gestiona ? "Pedidos" : "Mis pedidos"}</h1>
        <p className="cuenta">{pedidos.length} en total</p>
      </div>

      {error && (
        <p className="error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      <div className="tabla-caja">
        <table className="datos">
          <thead>
            <tr>
              <th scope="col">Referencia</th>
              {gestiona && <th scope="col">Cliente</th>}
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col" className="num">Total</th>
              <th scope="col" className="num">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.referencia}>
                <td className="mono">{p.referencia}</td>
                {gestiona && (
                  <td>
                    <span className="nom">{p.empresa}</span>
                    <br />
                    <span className="det">{p.contacto}</span>
                  </td>
                )}
                <td className="det">{fecha(p.creado)}</td>
                <td>
                  {gestiona ? (
                    <select
                      value={p.estado}
                      aria-label={`Estado del pedido ${p.referencia}`}
                      onChange={(e) => cambiarEstado(p.referencia, e.target.value)}
                      style={{ minHeight: 32, padding: ".2rem .4rem", fontSize: ".8125rem" }}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`estado ${p.estado}`}>{p.estado}</span>
                  )}
                </td>
                <td className="num precio">{eur(p.total_cent)}</td>
                <td className="num">
                  <button className="enlinea" onClick={() => abrir(p.referencia)}>
                    {abierto === p.referencia ? "cerrar" : "ver"}
                  </button>
                </td>
              </tr>
            ))}
            {!pedidos.length && (
              <tr>
                <td colSpan={gestiona ? 6 : 5} className="vacia">
                  Todavía no hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {abierto && (
        <section style={{ marginTop: "1.5rem" }} aria-live="polite">
          <div className="sec-cab">
            <h2 style={{ fontSize: "1.2rem" }}>Pedido {abierto}</h2>
            {detalle?.nota && <p className="det">Nota: {detalle.nota}</p>}
          </div>
          {detalle ? (
            <div className="tabla-caja">
              <table className="datos">
                <thead>
                  <tr>
                    <th scope="col">Artículo</th>
                    <th scope="col" className="num">Cantidad</th>
                    <th scope="col" className="num">Precio</th>
                    <th scope="col" className="num">IVA</th>
                    <th scope="col" className="num">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.lineas.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <span className="nom">{l.nombre}</span>
                        <br />
                        <span className="sku">{l.sku}</span>{" "}
                        <span className="det">· {l.formato}</span>
                      </td>
                      <td className="num">{l.cantidad}</td>
                      <td className="num">{eur(l.precio_cent)}</td>
                      <td className="num det">{l.iva_pct} %</td>
                      <td className="num precio">{eur(l.precio_cent * l.cantidad)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="4" className="num">
                      <strong>Total sin IVA</strong>
                    </td>
                    <td className="num precio">{eur(detalle.total_cent)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="cargando">Cargando líneas…</p>
          )}
        </section>
      )}
    </>
  );
}
