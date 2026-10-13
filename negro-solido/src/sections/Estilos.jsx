import FlowingMenu from '../components/rb/FlowingMenu.jsx';
import { estilos } from '../data/estudio.js';

export default function Estilos({ onSelect }) {
  const items = estilos.map((e) => ({ id: e.id, link: '#trabajo', text: e.nombre, image: e.imagen }));
  return (
    <section className="seccion estilos" id="estilos" aria-labelledby="estilos-t">
      <div className="envoltura">
        <h2 id="estilos-t" className="titular">Cinco maneras de llevar negro</h2>
        <p className="entradilla">Pasa por encima de cada estilo para verlo en movimiento. Al pulsarlo, filtramos los diseños.</p>
      </div>
      <div className="estilos__menu">
        <FlowingMenu
          items={items}
          onSelect={onSelect}
          label="Estilos de tatuaje"
          speed={18}
          textColor="#ebe8e2"
          bgColor="transparent"
          marqueeBgColor="#ebe8e2"
          marqueeTextColor="#0d0c0c"
          borderColor="rgba(235, 232, 226, 0.16)"
        />
      </div>
      <ul className="estilos__notas" role="list">
        {estilos.map((e) => (
          <li key={e.id}><b>{e.nombre}.</b> {e.texto}</li>
        ))}
      </ul>
    </section>
  );
}
