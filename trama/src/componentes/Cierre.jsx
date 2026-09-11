import { useRef } from "react";
import {
  cifras,
  contacto,
  disciplinas,
  margenes,
  notas,
} from "../datos/proyectos";
import { Revelar, Regla } from "./Revelar";
import { useContador, useEnPantalla } from "../hooks/movimiento";

/* ─────────────────────────────── Notas ─────────────────────────────── */
export function Notas() {
  return (
    <section className="notas" id="notas">
      <div className="sec-cab">
        <h2>Notas del estudio</h2>
        <p className="sec-meta">Sobre cómo trabajamos</p>
      </div>

      <div className="notas-cuerpo">
        <div className="notas-txt">
          {notas.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>

        <aside className="margen">
          {margenes.map((t, i) => (
            <p className="margen-n" key={i}>
              <span>Nota</span>
              {t}
            </p>
          ))}
        </aside>
      </div>
    </section>
  );
}

/* ────────────────────────────── Colofón ────────────────────────────── */
function Cifra({ dato, activo }) {
  const valor = useContador(dato.v, activo);
  return (
    <div>
      <dt>{dato.k}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

export function Colofon() {
  const ref = useRef(null);
  const dentro = useEnPantalla(ref);

  return (
    <section className="colofon" id="colofon">
      <div className="sec-cab">
        <h2>Colofón</h2>
        <p className="sec-meta">
          <span className="pend">Datos de ejemplo</span>
        </p>
      </div>

      <div className="col-red">
        <Revelar as="div" className="col-bloque" i={0}>
          <h3>Cifras</h3>
          <dl className="col-dl" ref={ref}>
            {cifras.map((c) => (
              <Cifra dato={c} activo={dentro} key={c.k} />
            ))}
          </dl>
        </Revelar>

        <Revelar as="div" className="col-bloque" i={1}>
          <h3>Disciplinas</h3>
          <ul className="col-lista">
            {disciplinas.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Revelar>

        <Revelar as="div" className="col-bloque" i={2}>
          <h3>Contacto</h3>
          <dl className="col-dl">
            {contacto.map((c) => (
              <div key={c.k}>
                <dt>{c.k}</dt>
                <dd>
                  {c.prefijo}
                  {c.pendiente ? <span className="pend">{c.v}</span> : c.v}
                </dd>
              </div>
            ))}
          </dl>
        </Revelar>
      </div>

      <Regla gruesa />

      <Revelar as="p" className="cierre">
        Escríbenos con dos párrafos y un plazo. Contestamos en 48 horas, aunque
        sea para decir que no es para nosotros.
      </Revelar>
    </section>
  );
}

/* ──────────────────────────────── Pie ──────────────────────────────── */
export function Pie() {
  return (
    <footer className="pie">
      <div className="regla dentro" aria-hidden="true" />
      <div className="pie-red">
        <p className="pie-m">TRAMA</p>
        <p className="pie-t">
          Sitio de demostración. Los textos, las cifras y los datos de contacto
          son de ejemplo y están marcados como <span className="pend">Pendiente</span>.
        </p>
        <p className="pie-t">
          Fotografías de Dietmar Becker, Florian Klauer, Ariana Prestes,
          Elisabetta Foco y Daniel Ebersole, vía{" "}
          <a href="https://unsplash.com" rel="noopener">
            Unsplash
          </a>
          .
        </p>
        <p className="pie-t pie-fin">Compuesto en Bricolage Grotesque y Martian&nbsp;Mono</p>
      </div>
    </footer>
  );
}
