import { Link } from 'react-router';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { euros } from '../lib/formato.js';

export default function Resumen() {
  usarTitulo('Panel');
  const { datos, error } = usarDatos('/admin/resumen');
  const cifras = datos ? [
    ['Pedidos por enviar', datos.pendientes, '/admin/pedidos?estado=pagado'],
    ['Ventas este mes', euros(datos.ventas_mes), '/admin/pedidos'],
    ['Productos a la venta', datos.productos, '/admin/productos'],
    ['Sin stock', datos.sin_stock, '/admin/productos'],
  ] : [];
  return (
    <>
      <h1 className="serigrafia text-5xl">Resumen</h1>
      {error ? <p className="mt-6 text-alerta">{error.message}</p> : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cifras.map(([t, v, to]) => (
          <li key={t}>
            <Link to={to} className="block plano p-5 hover:border-tinta transition-colors">
              <p className="text-serigrafia-tenue">{t}</p>
              <p className="mt-2 text-4xl font-semibold numeros">{v}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/admin/productos/nuevo" className="pad">Añadir producto</Link>
        <Link to="/admin/pedidos?estado=pagado" className="pad-linea">Ver pedidos por enviar</Link>
      </div>
    </>
  );
}
