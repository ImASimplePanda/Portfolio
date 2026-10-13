// Panel de la tienda: solo para cuentas con rol admin (el servidor lo vuelve a comprobar en cada petición).
import { Link, Navigate, NavLink, Route, Routes } from 'react-router';
import { useTienda } from '../contexto/Tienda.jsx';
import { Logo } from '../componentes/Marco.jsx';
import Resumen from './Resumen.jsx';
import Pedidos from './Pedidos.jsx';
import Productos from './Productos.jsx';
import EditarProducto from './EditarProducto.jsx';

export default function Admin() {
  const { sesion } = useTienda();
  if (sesion.cargando) return <div className="min-h-screen" aria-busy="true" />;
  if (!sesion.usuario) return <Navigate to="/cuenta?volver=/admin" replace />;
  if (sesion.usuario.rol !== 'admin') return <Navigate to="/cuenta" replace />;

  const enlace = ({ isActive }) => `block px-3 py-2.5 rounded-xl font-medium ${isActive ? 'bg-tinta text-white' : 'hover:bg-carton/60'}`;
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="border-b lg:border-b-0 lg:border-r border-linea bg-papel p-4 lg:p-6 lg:min-h-screen">
        <Link to="/" aria-label="Ir a la tienda"><Logo /></Link>
        <p className="mt-2 text-sm text-gris">Panel de la tienda</p>
        <nav aria-label="Panel" className="mt-6">
          <ul className="flex lg:grid gap-1 overflow-x-auto">
            <li><NavLink end to="/admin" className={enlace}>Resumen</NavLink></li>
            <li><NavLink to="/admin/pedidos" className={enlace}>Pedidos</NavLink></li>
            <li><NavLink to="/admin/productos" className={enlace}>Productos</NavLink></li>
            <li><Link to="/" className="block px-3 py-2.5 rounded-xl hover:bg-carton/60 text-gris">Ver la tienda</Link></li>
          </ul>
        </nav>
      </aside>
      <main id="contenido" className="p-4 sm:p-8 lg:p-10 min-w-0">
        <Routes>
          <Route index element={<Resumen />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos/nuevo" element={<EditarProducto />} />
          <Route path="productos/:id" element={<EditarProducto />} />
        </Routes>
      </main>
    </div>
  );
}
