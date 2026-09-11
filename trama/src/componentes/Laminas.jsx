import { useRef, useState } from "react";
import { proyectos } from "../datos/proyectos";
import { srcSet, src, SIZES } from "../datos/imagenes";
import {
  useMedia,
  useMedir,
  useMovimientoReducido,
  useScrollRaf,
} from "../hooks/movimiento";

export function Laminas() {
  const seccion = useRef(null);
  const pista = useRef(null);
  const progreso = useRef(null);
  const medida = useRef({ top: 0, rango: 1, recorrido: 0 });
  const indiceRef = useRef(-1);
  const [activa, setActiva] = useState(0);

  const reduce = useMovimientoReducido();
  const ancho = useMedia("(min-width: 901px)");
  const gobernado = ancho && !reduce;

  useMedir(() => {
    const sec = seccion.current;
    const pis = pista.current;
    if (!sec || !pis) return;
    if (!gobernado) {
      pis.style.transform = "";
      return;
    }
    /* Chrome no cuenta el relleno derecho en el scrollWidth de un flex
       que desborda: se mide desde la última lámina y se le suma el margen */
    const ultima = pis.lastElementChild;
    const margen = parseFloat(getComputedStyle(pis).paddingLeft) || 0;
    const total = ultima
      ? ultima.offsetLeft + ultima.offsetWidth + margen
      : pis.scrollWidth;
    medida.current = {
      top: sec.getBoundingClientRect().top + window.scrollY,
      rango: Math.max(sec.offsetHeight - window.innerHeight, 1),
      recorrido: Math.max(total - window.innerWidth, 0),
    };
  }, [gobernado]);

  useScrollRaf((y) => {
    const pis = pista.current;
    if (!pis) return;
    const { top, rango, recorrido } = medida.current;

    let p = (y - top) / rango;
    p = p < 0 ? 0 : p > 1 ? 1 : p;

    /* tramos de sostén: la primera y la última se quedan quietas un momento */
    let pe = (p - 0.08) / 0.84;
    pe = pe < 0 ? 0 : pe > 1 ? 1 : pe;

    /* el transform se escribe directo en el nodo, no en el estado:
       un setState por fotograma volvería a renderizar 60 veces por segundo */
    pis.style.transform = `translate3d(${(-pe * recorrido).toFixed(1)}px,0,0)`;
    if (progreso.current)
      progreso.current.style.transform = `scaleX(${pe.toFixed(4)})`;

    const i = Math.min(Math.floor(pe * proyectos.length), proyectos.length - 1);
    if (i !== indiceRef.current) {
      indiceRef.current = i;
      setActiva(i); // esto sí cambia pocas veces: cinco en todo el recorrido
    }
  }, gobernado);

  return (
    <section className="laminas" id="laminas" aria-label="Láminas" ref={seccion}>
      <div className="lam-sticky">
        <div className="lam-cab">
          <h2>Láminas</h2>
          <p className="lam-cont">
            <span className="lam-act">{proyectos[activa].n}</span>
            <span aria-hidden="true"> / </span>05
          </p>
        </div>

        <div className="lam-pista" ref={pista}>
          {proyectos.map((p) => (
            <figure className="lam" key={p.id}>
              <div className="lam-img">
                <img
                  src={src(p.img, "560")}
                  srcSet={srcSet(p.img)}
                  sizes={SIZES.lamina}
                  width="1600"
                  height="1067"
                  loading="lazy"
                  decoding="async"
                  alt={p.alt}
                />
              </div>
              <figcaption>
                <span>{p.n}</span>
                {p.pie}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="lam-barra">
          <span className="lam-prog" ref={progreso} />
        </div>
      </div>
    </section>
  );
}
