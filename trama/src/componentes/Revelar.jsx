import { useRef } from "react";
import { useEnPantalla } from "../hooks/movimiento";

/* Envoltorio del revelado al entrar en pantalla.
   `i` es el puesto en el escalonado; la CSS lo lee como --i. */
export function Revelar({
  as: Tag = "div",
  i = 0,
  className = "",
  children,
  ...resto
}) {
  const ref = useRef(null);
  const dentro = useEnPantalla(ref);
  return (
    <Tag
      ref={ref}
      className={`rv${dentro ? " dentro" : ""}${className ? " " + className : ""}`}
      style={{ "--i": i }}
      {...resto}
    >
      {children}
    </Tag>
  );
}

/* Las reglas de la retícula se dibujan solas al entrar */
export function Regla({ gruesa = false }) {
  const ref = useRef(null);
  const dentro = useEnPantalla(ref);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`regla${gruesa ? " regla-gruesa" : ""}${dentro ? " dentro" : ""}`}
    />
  );
}
