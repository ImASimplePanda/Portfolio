import { useEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import Masonry from '../components/rb/Masonry.jsx';
import { estilos, trabajos } from '../data/estudio.js';

export default function Trabajo({ filtro, setFiltro }) {
  const [elegido, setElegido] = useState(null);
  const dialogo = useRef(null);
  const items = useMemo(() => (filtro === 'todos' ? trabajos : trabajos.filter((t) => t.estilo === filtro)), [filtro]);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (elegido && !d.open) d.showModal();
    if (!elegido && d.open) d.close();
  }, [elegido]);

  const opciones = [{ id: 'todos', nombre: 'Todos' }, ...estilos];

  return (
    <section className="seccion trabajo" id="trabajo" aria-labelledby="trabajo-t">
      <div className="envoltura">
        <p className="ceja">Diseños del estudio</p>
        <h2 id="trabajo-t" className="titular">Dibujado aquí, para tatuar aquí</h2>
        <div className="filtros" role="group" aria-label="Filtrar por estilo">
          {opciones.map((o) => (
            <button key={o.id} type="button" className="filtro" aria-pressed={filtro === o.id} onClick={() => setFiltro(o.id)}>
              {o.nombre}
            </button>
          ))}
        </div>
        <p className="sr" aria-live="polite">{items.length} diseños</p>
        <Masonry key={filtro} items={items} onSelect={setElegido} />
      </div>

      <dialog ref={dialogo} className="visor" aria-labelledby="visor-t" onClose={() => setElegido(null)} onClick={(e) => e.target === e.currentTarget && setElegido(null)}>
        {elegido && (
          <div className="visor__caja">
            <img src={elegido.img} alt={elegido.alt} width={elegido.w} height={elegido.h} />
            <div className="visor__info">
              <h3 id="visor-t">{elegido.titulo}</h3>
              <p>Diseño de {elegido.autor}. Se adapta al tamaño y la zona que elijas.</p>
              <a className="boton" href="#cita" onClick={() => setElegido(null)}>Pide cita</a>
            </div>
            <button type="button" className="visor__cerrar" aria-label="Cerrar" onClick={() => setElegido(null)}>
              <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.6} />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}
