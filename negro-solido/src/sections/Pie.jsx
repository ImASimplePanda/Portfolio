import Marca from '../components/Marca.jsx';
import { estudio } from '../data/estudio.js';
import { B } from '../base.js';

export default function Pie() {
  const tel = estudio.telefono.replace(/\s/g, '');
  return (
    <footer className="pie">
      <div className="envoltura">
        <p className="pie__marca" aria-hidden="true">
          <Marca size={44} /> Negro Sólido
        </p>
        <div className="pie__rejilla">
          <div>
            <h2 className="pie__h">Estudio</h2>
            <address>
              {estudio.direccion.calle}
              <br />
              {estudio.direccion.cp} {estudio.direccion.ciudad}
            </address>
          </div>
          <div>
            <h2 className="pie__h">Horario</h2>
            <p>{estudio.horario}</p>
          </div>
          <div>
            <h2 className="pie__h">Contacto</h2>
            <p>
              <a href={`tel:${tel}`}>{estudio.telefono}</a>
              <br />
              <a href={`mailto:${estudio.email}`}>{estudio.email}</a>
              <br />
              <a href={estudio.instagram} target="_blank" rel="noopener">Instagram {estudio.instagramHandle}</a>
            </p>
          </div>
          <div>
            <h2 className="pie__h">Higiene</h2>
            <p>{estudio.titular.sanitario}. Material de un solo uso.</p>
          </div>
        </div>
        <div className="pie__base">
          <p>© {new Date().getFullYear()} {estudio.titular.razonSocial}</p>
          <p>Sin cookies ni analítica.</p>
          <p><a href={B + 'aviso-legal/'}>Aviso legal</a> · <a href={B + 'privacidad/'}>Privacidad</a></p>
        </div>
      </div>
    </footer>
  );
}
