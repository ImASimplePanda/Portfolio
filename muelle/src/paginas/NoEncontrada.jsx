import { Link } from 'react-router';
import Teclado2D from '../componentes/Teclado2D.jsx';
import { usarTitulo } from '../lib/usarDatos.js';

export default function NoEncontrada({ titulo = 'Esta tecla no hace nada' }) {
  usarTitulo('Página no encontrada');
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-16 grid gap-10 md:grid-cols-[1fr_minmax(0,420px)] items-center">
      <div>
        <h1 className="serigrafia text-[clamp(2.8rem,7vw,5rem)]">{titulo}</h1>
        <p className="mt-5 text-lg text-serigrafia-tenue">La página no existe o se ha movido. Vuelve a la tienda y sigue buscando.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link viewTransition to="/" className="pad">Ir al inicio</Link><Link viewTransition to="/tienda" className="pad-linea">Ver la tienda</Link></div>
      </div>
      <Teclado2D formato="60" pulsadas={new Set(['Digit4', 'Digit0'])} carcasa="#1e102f" className="w-full h-auto" titulo="Teclado con las teclas 4 y 0 pulsadas" />
    </div>
  );
}
