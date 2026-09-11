import { useEffect, useState } from "react";
import { api, eur, fecha, nivelStock } from "../lib/nucleo.js";
import { useSesion } from "../lib/contexto.js";

export function Panel() {
  const { usuario } = useSesion();
  const esAdmin = usuario.rol === "admin";
  const [pestana, setPestana] = useState("clientes");
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/resumen").then(setResumen).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="a-cab">
        <h1>Panel</h1>
        <p className="cuenta">
          {usuario.rol === "admin" ? "Dirección" : "Equipo comercial"}
        </p>
      </div>

      {error && (
        <p className="error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      {resumen && (
        <dl className="panel-res">
          <div>
            <dt>Clientes activos</dt>
            <dd>{resumen.clientes}</dd>
          </div>
          <div>
            <dt>Referencias</dt>
            <dd>{resumen.productos}</dd>
          </div>
          <div>
            <dt>Bajo stock</dt>
            <dd style={{ color: resumen.bajoStock ? "var(--aviso)" : undefined }}>
              {resumen.bajoStock}
            </dd>
          </div>
          <div>
            <dt>Pedidos pendientes</dt>
            <dd>{resumen.pendientes}</dd>
          </div>
          <div>
            <dt>Facturado</dt>
            <dd style={{ fontSize: "1.5rem" }}>{eur(resumen.facturado)}</dd>
          </div>
        </dl>
      )}

      <div className="pestanas" role="tablist">
        <button
          role="tab"
          aria-selected={pestana === "clientes"}
          onClick={() => setPestana("clientes")}
        >
          Clientes
        </button>
        <button
          role="tab"
          aria-selected={pestana === "almacen"}
          onClick={() => setPestana("almacen")}
        >
          Almacén
        </button>
      </div>

      {pestana === "clientes" ? <Clientes esAdmin={esAdmin} /> : <Almacen esAdmin={esAdmin} />}
    </>
  );
}

/* ── Clientes ─────────────────────────────────────────────────────── */
function Clientes({ esAdmin }) {
  const { usuario: yo } = useSesion();
  const [usuarios, setUsuarios] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [alta, setAlta] = useState(false);

  const cargar = () => api("/admin/usuarios").then((d) => setUsuarios(d.usuarios)).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
    api("/admin/tarifas").then((d) => setTarifas(d.tarifas)).catch(() => {});
  }, []);

  async function cambiar(id, cambios) {
    setError("");
    setAviso("");
    try {
      await api(`/admin/usuarios/${id}`, { method: "PATCH", body: cambios });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      {error && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}
      {aviso && <p className="exito" role="status" style={{ marginBottom: "1rem" }}>{aviso}</p>}

      {esAdmin && (
        <div style={{ marginBottom: "1rem" }}>
          <button className="btn btn-sec btn-min" onClick={() => setAlta((v) => !v)}>
            {alta ? "Cancelar" : "Dar de alta un cliente"}
          </button>
        </div>
      )}

      {alta && (
        <FormAlta
          tarifas={tarifas}
          onHecho={(msg) => {
            setAlta(false);
            setAviso(msg);
            cargar();
          }}
        />
      )}

      <div className="tabla-caja">
        <table className="datos">
          <thead>
            <tr>
              <th scope="col">Cuenta</th>
              <th scope="col">Rol</th>
              <th scope="col">Tarifa</th>
              <th scope="col" className="num">Pedidos</th>
              <th scope="col">Alta</th>
              <th scope="col" className="num">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="nom">{u.empresa || u.nombre}</span>
                  <br />
                  <span className="sku">{u.email}</span>
                </td>
                <td className="det">{u.rol}</td>
                <td>
                  {u.rol === "cliente" ? (
                    esAdmin ? (
                      <select
                        value={u.tarifa_id ?? ""}
                        aria-label={`Tarifa de ${u.empresa || u.nombre}`}
                        onChange={(e) =>
                          cambiar(u.id, { tarifa_id: e.target.value ? Number(e.target.value) : null })
                        }
                        style={{ minHeight: 32, padding: ".2rem .4rem", fontSize: ".8125rem" }}
                      >
                        <option value="">Sin tarifa</option>
                        {tarifas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} (−{t.descuento_pct} %)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="det">
                        {u.tarifa ?? "—"} {u.descuento_pct ? `(−${u.descuento_pct} %)` : ""}
                      </span>
                    )
                  ) : (
                    <span className="det">—</span>
                  )}
                </td>
                <td className="num">{u.pedidos}</td>
                <td className="det">{fecha(u.creado)}</td>
                <td className="num">
                  {esAdmin && u.id !== yo.id ? (
                    <button
                      className="enlinea"
                      onClick={() => cambiar(u.id, { activo: u.activo ? 0 : 1 })}
                    >
                      {u.activo ? "desactivar" : "activar"}
                    </button>
                  ) : (
                    <span className={`estado ${u.activo ? "entregado" : "anulado"}`}>
                      {u.id === yo.id ? "usted" : u.activo ? "activo" : "baja"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FormAlta({ tarifas, onHecho }) {
  const [d, setD] = useState({ email: "", nombre: "", empresa: "", cif: "", clave: "", tarifa_id: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const campo = (k) => ({ value: d[k], onChange: (e) => setD({ ...d, [k]: e.target.value }) });

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await api("/admin/usuarios", {
        method: "POST",
        body: { ...d, rol: "cliente", tarifa_id: d.tarifa_id || null },
      });
      onHecho(`Cuenta creada para ${d.empresa || d.nombre}. Comuníquele la contraseña en persona.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      className="form"
      onSubmit={enviar}
      style={{
        background: "var(--cal)",
        border: "1px solid var(--linea)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      }}
    >
      {error && <p className="error" style={{ gridColumn: "1 / -1" }}>{error}</p>}
      <div className="campo">
        <label htmlFor="a-emp">Empresa</label>
        <input id="a-emp" {...campo("empresa")} required />
      </div>
      <div className="campo">
        <label htmlFor="a-nom">Persona de contacto</label>
        <input id="a-nom" {...campo("nombre")} required />
      </div>
      <div className="campo">
        <label htmlFor="a-em">Correo</label>
        <input id="a-em" type="email" {...campo("email")} required />
      </div>
      <div className="campo">
        <label htmlFor="a-cif">CIF</label>
        <input id="a-cif" {...campo("cif")} />
      </div>
      <div className="campo">
        <label htmlFor="a-tar">Tarifa</label>
        <select id="a-tar" {...campo("tarifa_id")}>
          <option value="">Sin tarifa</option>
          {tarifas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre} (−{t.descuento_pct} %)
            </option>
          ))}
        </select>
      </div>
      <div className="campo">
        <label htmlFor="a-cl">Contraseña provisional</label>
        <input id="a-cl" type="text" minLength="10" {...campo("clave")} required />
        <span className="pista">Mínimo 10 caracteres. El cliente la cambiará al entrar.</span>
      </div>
      <button className="btn" type="submit" disabled={enviando} style={{ gridColumn: "1 / -1" }}>
        {enviando ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}

/* ── Almacén ──────────────────────────────────────────────────────── */
function Almacen({ esAdmin }) {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");

  const cargar = () => api("/admin/productos").then((d) => setProductos(d.productos)).catch((e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, []);

  async function cambiar(id, cambios) {
    setError("");
    try {
      await api(`/admin/productos/${id}`, { method: "PATCH", body: cambios });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      {error && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}
      <div className="tabla-caja">
        <table className="datos">
          <thead>
            <tr>
              <th scope="col">Referencia</th>
              <th scope="col">Productor</th>
              <th scope="col" className="num">Stock</th>
              <th scope="col" className="num">Precio base</th>
              <th scope="col" className="num">Activo</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const st = nivelStock(p.stock);
              return (
                <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                  <td>
                    <span className="nom">{p.nombre}</span>
                    <br />
                    <span className="sku">{p.sku}</span>{" "}
                    <span className="det">· {p.formato}</span>
                  </td>
                  <td className="det">{p.productor}</td>
                  <td className="num">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.stock}
                      aria-label={`Stock de ${p.nombre}`}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== p.stock) cambiar(p.id, { stock: v });
                      }}
                      style={{
                        width: "4.5rem", minHeight: 32, textAlign: "right",
                        fontFamily: "var(--mono)", padding: ".2rem .4rem",
                        border: "1px solid var(--linea)", borderRadius: 2,
                      }}
                    />
                    <br />
                    <span className={`stock ${st.clase}`}>{st.clase === "ok" ? "" : st.texto}</span>
                  </td>
                  <td className="num">
                    {esAdmin ? (
                      <input
                        type="number"
                        min="1"
                        step="1"
                        defaultValue={p.precio_base_cent}
                        aria-label={`Precio base de ${p.nombre} en céntimos`}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== p.precio_base_cent) cambiar(p.id, { precio_base_cent: v });
                        }}
                        style={{
                          width: "5.5rem", minHeight: 32, textAlign: "right",
                          fontFamily: "var(--mono)", padding: ".2rem .4rem",
                          border: "1px solid var(--linea)", borderRadius: 2,
                        }}
                      />
                    ) : (
                      <span className="precio">{eur(p.precio_base_cent)}</span>
                    )}
                    <br />
                    <span className="det">{esAdmin ? `${eur(p.precio_base_cent)} · en céntimos` : ""}</span>
                  </td>
                  <td className="num">
                    <button className="enlinea" onClick={() => cambiar(p.id, { activo: p.activo ? 0 : 1 })}>
                      {p.activo ? "retirar" : "reponer"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
