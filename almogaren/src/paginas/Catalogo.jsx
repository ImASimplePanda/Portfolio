import { useCallback, useEffect, useMemo, useState } from "react";
import { api, eur, nivelStock } from "../lib/nucleo.js";

export function Catalogo({ pedido, ir }) {
  /* `revisar` es estable (useCallback sin dependencias); se saca del objeto
     `pedido`, cuya identidad cambia en cada render, para que el efecto no
     se dispare de mas. */
  const { revisar, nota, setNota } = pedido;
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  /* No marca "cargando" al empezar: el estado ya arranca en true y las
     recargas posteriores son tan rápidas que un parpadeo molesta más de lo
     que informa. Así el efecto tampoco llama a setState de forma síncrona. */
  const cargar = useCallback(
    () =>
      api("/productos")
        .then((d) => {
          setProductos(d.productos);
          /* Repasa el pedido guardado con los precios de ESTE cliente */
          revisar(d.productos);
        })
        .catch((e) => setError(e.message))
        .finally(() => setCargando(false)),
    [revisar],
  );

  useEffect(() => {
    cargar();
    api("/categorias").then((d) => setCategorias(d.categorias)).catch(() => {});
  }, [cargar]);

  const visibles = useMemo(() => {
    const t = buscar.trim().toLowerCase();
    return productos.filter(
      (p) =>
        (!filtro || p.categoria === filtro) &&
        (!t ||
          p.nombre.toLowerCase().includes(t) ||
          p.sku.toLowerCase().includes(t) ||
          (p.productor || "").toLowerCase().includes(t)),
    );
  }, [productos, filtro, buscar]);

  const cantidadDe = (sku) => pedido.lineas.find((l) => l.sku === sku)?.cantidad ?? "";

  async function confirmar() {
    setError("");
    setAviso("");
    setEnviando(true);
    try {
      const d = await api("/pedidos", {
        method: "POST",
        body: { lineas: pedido.crudas, nota },
      });
      pedido.vaciar();
      cargar(); // el stock ha cambiado
      setAviso(`Pedido ${d.pedido.ref} recibido. Total ${eur(d.pedido.total)}.`);
    } catch (e) {
      setError(e.message);
      cargar(); // puede que el stock haya cambiado por debajo
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="a-cab">
        <h1>Catálogo</h1>
        <p className="cuenta">
          {cargando ? "cargando…" : `${visibles.length} de ${productos.length} referencias`}
        </p>
      </div>

      <div className="cat-cols">
        <div>
          <div className="filtros">
            <input
              type="search"
              placeholder="Buscar por nombre, SKU o productor…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              aria-label="Buscar en el catálogo"
            />
            <button
              className="chip"
              aria-pressed={filtro === null}
              onClick={() => setFiltro(null)}
            >
              Todo
            </button>
            {categorias.map((c) => (
              <button
                className="chip"
                key={c.categoria}
                aria-pressed={filtro === c.categoria}
                onClick={() => setFiltro(filtro === c.categoria ? null : c.categoria)}
              >
                {c.categoria}
              </button>
            ))}
          </div>

          {aviso && (
            <p className="exito" role="status" style={{ marginBottom: "1rem" }}>
              {aviso}{" "}
              <button className="enlinea" onClick={() => ir("/pedidos")}>
                Ver mis pedidos
              </button>
            </p>
          )}
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
                  <th scope="col">Formato</th>
                  <th scope="col" className="num">Stock</th>
                  <th scope="col" className="num">Su precio</th>
                  <th scope="col" className="num">Pedir</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => {
                  const st = nivelStock(p.stock);
                  const hayDto = p.precio && p.precio.cent < p.precio.base_cent;
                  return (
                    <tr key={p.sku}>
                      <td>
                        <span className="nom">{p.nombre}</span>
                        {p.sello && <span className="sello">{p.sello}</span>}
                        <br />
                        <span className="sku">{p.sku}</span>{" "}
                        <span className="det">· {p.productor}</span>
                      </td>
                      <td className="det">
                        {p.formato}
                        {p.unidad_caja > 1 && <><br />caja de {p.unidad_caja}</>}
                      </td>
                      <td className="num">
                        <span className={`stock ${st.clase}`}>{st.texto}</span>
                      </td>
                      <td className="num">
                        {p.precio ? (
                          <span className="precio">
                            {eur(p.precio.cent)}
                            {hayDto && (
                              <small>
                                <span className="tachado">{eur(p.precio.base_cent)}</span>{" "}
                                {p.precio.origen === "negociado" ? "negociado" : `−${p.precio.dto} %`}
                              </small>
                            )}
                          </span>
                        ) : (
                          <span className="det">—</span>
                        )}
                      </td>
                      <td className="num">
                        <div className="cantidad">
                          <input
                            type="number"
                            min="0"
                            max={p.stock}
                            step="1"
                            value={cantidadDe(p.sku)}
                            disabled={p.stock <= 0}
                            aria-label={`Cantidad de ${p.nombre}`}
                            onChange={(e) => pedido.poner(p, e.target.value)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!cargando && !visibles.length && (
                  <tr>
                    <td colSpan="5" className="vacia">
                      Nada coincide con esa búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="cesta" aria-label="Pedido en curso">
          <div className="cesta-cab">
            <h2>Pedido en curso</h2>
            <span className="det" aria-live="polite">
              {pedido.estado === "guardando"
                ? "guardando…"
                : pedido.lineas.length
                  ? `${pedido.lineas.length} ${pedido.lineas.length === 1 ? "línea" : "líneas"} · guardado`
                  : `${pedido.lineas.length} líneas`}
            </span>
          </div>

          {pedido.lineas.length ? (
            <>
              <div className="cesta-lista">
                {pedido.lineas.map((l) => (
                  <div className="cesta-l" key={l.sku}>
                    <span className="n">{l.nombre}</span>
                    <span className="m">{eur(l.precio_cent * l.cantidad)}</span>
                    <span className="q">
                      {l.cantidad} × {eur(l.precio_cent)}
                      <button className="quitar" onClick={() => pedido.quitar(l.sku)}>
                        quitar
                      </button>
                    </span>
                  </div>
                ))}
              </div>
              <div className="cesta-pie">
                <div className="campo">
                  <label htmlFor="nota">Nota para el reparto</label>
                  <textarea
                    id="nota"
                    rows="2"
                    maxLength="500"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Horario de entrega, puerta de servicio…"
                  />
                </div>
                <div className="cesta-tot">
                  <span className="rotulo">Total sin IVA</span>
                  <span className="g">{eur(pedido.total)}</span>
                </div>
                <button className="btn" onClick={confirmar} disabled={enviando}>
                  {enviando ? "Enviando…" : "Confirmar pedido"}
                </button>
                <button className="btn btn-sec btn-min" onClick={pedido.vaciar}>
                  Vaciar
                </button>
              </div>
            </>
          ) : (
            <p className="vacia">
              Añada cantidades en la columna «Pedir» y aparecerán aquí.
              <br />
              Se guarda en su cuenta: puede salir y seguir en otro momento.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
