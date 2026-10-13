import { proceso } from '../data/estudio.js';

// Tarjetas que se apilan al bajar: position: sticky, sin JavaScript.
export default function Proceso() {
  return (
    <section className="seccion proceso" id="proceso" aria-labelledby="proceso-t">
      <div className="envoltura">
        <p className="ceja">Cómo funciona</p>
        <h2 id="proceso-t" className="titular">De la idea a la piel</h2>
      </div>
      <ol className="pila envoltura">
        {proceso.map((p, i) => (
          <li key={p.titulo} className="pila__carta" data-i={i}>
            <div className="pila__texto">
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
            <img src={p.foto} alt={p.alt} width="627" height="627" loading="lazy" decoding="async" />
          </li>
        ))}
      </ol>
    </section>
  );
}
