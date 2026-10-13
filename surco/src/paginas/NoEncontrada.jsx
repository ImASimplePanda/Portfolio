import { Link } from 'react-router';
import Vinilo from '../componentes/Vinilo.jsx';
import { usarTitulo } from '../lib/usarDatos.js';

export default function NoEncontrada() {
  usarTitulo('Página no encontrada');
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-16 grid gap-10 md:grid-cols-[1fr_280px] items-center">
      <div>
        <h1 className="rotulo text-[clamp(2.8rem,7vw,5rem)]">Esta página se ha rayado.</h1>
        <p className="mt-5 text-lg text-gris">No existe o se ha movido. Vuelve a la tienda y sigue buscando.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link to="/" className="boton">Ir al inicio</Link><Link to="/discos" className="boton-linea">Ver discos</Link></div>
      </div>
      <div className="w-56 md:w-full"><Vinilo producto={{ portada: { semilla: 404 } }} /></div>
    </div>
  );
}
