import { useRef, useState } from "react";
import { useScrollRaf } from "../hooks/movimiento";

const enlaces = [
  ["#indice", "Índice"],
  ["#laminas", "Láminas"],
  ["#notas", "Notas"],
  ["#colofon", "Colofón"],
];

export function Barra() {
  const [linea, setLinea] = useState(false);
  const [oculta, setOculta] = useState(false);
  const anterior = useRef(0);

  useScrollRaf((y) => {
    setLinea(y > 40);
    setOculta(y > anterior.current && y > window.innerHeight * 0.9);
    anterior.current = y;
  });

  return (
    <header
      className={`barra${linea ? " is-linea" : ""}${oculta ? " is-hidden" : ""}`}
    >
      <a className="barra-marca" href="#portada">
        TRAMA
      </a>
      <nav className="barra-nav" aria-label="Principal">
        <ul>
          {enlaces.map(([href, texto]) => (
            <li key={href}>
              <a href={href}>{texto}</a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="barra-est">
        <span className="punto" aria-hidden="true" />
        Abierto para 2026
      </p>
    </header>
  );
}
