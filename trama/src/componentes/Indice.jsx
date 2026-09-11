import { useState } from "react";
import { proyectos } from "../datos/proyectos";
import { Revelar } from "./Revelar";
import { srcSet, src, SIZES } from "../datos/imagenes";

export function Indice() {
  /* la fila viva la marcan tanto el puntero como el foco: con teclado
     se ve exactamente lo mismo que con ratón */
  const [viva, setViva] = useState(null);
  const [abierta, setAbierta] = useState(null);

  /* Una imagen dentro de un desplegable cerrado se descarga igual: el
     colapso con grid 0fr no la saca del maquetado, y loading="lazy" se
     dispara al pasar por delante. Se monta sólo cuando la ficha se abre
     por primera vez, y a partir de ahí se queda para no volver a pedirla. */
  const [abiertasAlguna, setAbiertasAlguna] = useState(() => new Set());

  /* si no hay ninguna señalada, la vista previa se queda en la última
     que estuvo viva; el primer render arranca en la 01 */
  const [ultima, setUltima] = useState(proyectos[0]);

  const marcar = (p) => {
    setViva(p.id);
    setUltima(p);
  };
  const desmarcar = (p) => setViva((v) => (v === p.id ? null : v));

  return (
    <section className="indice" id="indice">
      <div className="sec-cab">
        <h2>Índice de trabajo</h2>
        <p className="sec-meta">
          05 entradas · <span className="pend">Fichas pendientes</span>
        </p>
      </div>

      <div className="indice-cuerpo">
        <ol className="lista">
          {proyectos.map((p, i) => {
            const estaAbierta = abierta === p.id;
            return (
              <Revelar
                as="li"
                key={p.id}
                i={i}
                className={`fila${viva === p.id ? " is-viva" : ""}`}
                onMouseEnter={() => marcar(p)}
                onMouseLeave={() => desmarcar(p)}
              >
                <h3 className="fila-h">
                  <button
                    type="button"
                    className="fila-btn"
                    aria-expanded={estaAbierta}
                    aria-controls={`det-${p.id}`}
                    onFocus={() => marcar(p)}
                    onBlur={() => desmarcar(p)}
                    onClick={() => {
                      setAbierta(estaAbierta ? null : p.id);
                      if (!estaAbierta)
                        setAbiertasAlguna((s) => new Set(s).add(p.id));
                    }}
                  >
                    <span className="f-n">{p.n}</span>
                    <span className="f-nom">{p.nombre}</span>
                    <span className="f-dis">{p.disciplina}</span>
                    <span className="f-ano">{p.ano}</span>
                    <span className="f-cruz" aria-hidden="true" />
                  </button>
                </h3>

                {/* el desplegable se anima con grid-template-rows 0fr → 1fr:
                    sin medir alturas a mano, y `inert` lo saca del foco y
                    del lector de pantalla mientras está cerrado */}
                <div
                  className={`fila-det${estaAbierta ? " abierta" : ""}`}
                  id={`det-${p.id}`}
                  inert={!estaAbierta}
                >
                  <div className="fila-det-in">
                    <p>{p.resumen}</p>
                    <ul className="f-datos">
                      <li>
                        <span>Alcance</span>
                        <span>{p.alcance}</span>
                      </li>
                      <li>
                        <span>Equipo</span>
                        <span>{p.equipo}</span>
                      </li>
                    </ul>
                    {abiertasAlguna.has(p.id) && (
                      <figure className="f-fig">
                        <img
                          src={src(p.img, "450")}
                          srcSet={srcSet(p.img)}
                          sizes={SIZES.ficha}
                          width="1600"
                          height="1067"
                          decoding="async"
                          alt={p.alt}
                        />
                      </figure>
                    )}
                  </div>
                </div>
              </Revelar>
            );
          })}
        </ol>

        <aside className="vista" aria-hidden="true">
          <div className="vista-marco">
            {proyectos.map((p) => (
              <img
                key={p.id}
                className={`vista-img${ultima.id === p.id ? " on" : ""}`}
                src={src(p.img, "450")}
                srcSet={srcSet(p.img)}
                sizes={SIZES.vista}
                width="1600"
                height="1067"
                alt=""
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
          <p className="vista-pie">
            <span className="vista-n">{ultima.n}</span>
            <span className="vista-nom">{ultima.nombre}</span>
          </p>
        </aside>
      </div>
    </section>
  );
}
