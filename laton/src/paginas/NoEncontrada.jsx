import { Link } from 'react-router';
import { usarTitulo } from '../lib/usarTitulo.js';

export default function NoEncontrada() {
  usarTitulo('Página no encontrada');
  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-24">
      <h1 className="rotulo text-[clamp(4rem,12vw,10rem)]">Pinchazo</h1>
      <p className="mt-4 text-lg max-w-lg">Esta página no existe o la hemos movido. Desde el inicio llegas a todo lo demás.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="boton">Ir al inicio</Link>
        <Link to="/configurador" className="boton boton-linea">Diseñar una bici</Link>
      </div>
    </div>
  );
}
