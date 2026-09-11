import { useEffect, useState } from "react";
import { cubierta } from "../datos/proyectos";
import { Revelar, Regla } from "./Revelar";

const LETRAS = ["T", "R", "A", "M", "A"];

export function Cubierta() {
  /* las letras arrancan amontonadas y se reparten en el primer fotograma
     tras montar; así la transición se ve en vez de aplicarse de golpe */
  const [compuesta, setCompuesta] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setCompuesta(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    /* `is-compuesta`, no `lista`: la hoja ya usa .lista para el <ol> del
       índice, y con la misma especificidad su `padding: 0` ganaba aquí */
    <section
      className={`portada${compuesta ? " is-compuesta" : ""}`}
      id="portada"
    >
      <div className="portada-in">
        <Regla />

        <h1 className="titulo" aria-label="TRAMA">
          {LETRAS.map((l, i) => (
            <span key={i} className="l" style={{ "--i": i }} aria-hidden="true">
              {l}
            </span>
          ))}
        </h1>

        <Regla />

        <dl className="colofon-fila">
          {cubierta.map((d, i) => (
            <Revelar as="div" className="cf" i={i} key={d.k}>
              <dt>{d.k}</dt>
              <dd>{d.pendiente ? <span className="pend">{d.v}</span> : d.v}</dd>
            </Revelar>
          ))}
        </dl>

        <Regla />

        <Revelar as="p" className="declaracion">
          Un estudio pequeño que hace pocas cosas al año y no las suelta hasta
          que funcionan solas.
        </Revelar>
      </div>
    </section>
  );
}
