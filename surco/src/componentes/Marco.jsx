// Cabecera, pie y avisos: lo que rodea a todas las páginas.
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag02Icon, UserIcon, Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
const Counter = lazy(() => import('./rb/Counter.jsx'));
const SwipeToast = lazy(() => import('./rb/SwipeToast.jsx'));
import { useTienda } from '../contexto/Tienda.jsx';

const enlaces = [
  ['/discos', 'Discos'],
  ['/tocadiscos', 'Tocadiscos'],
  ['/accesorios', 'Accesorios'],
  ['/vender', 'Vender tus discos'],
];

export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="#16181a" />
        <circle cx="16" cy="16" r="11" fill="none" stroke="#fff" strokeOpacity="0.18" />
        <circle cx="16" cy="16" r="7.5" fill="none" stroke="#fff" strokeOpacity="0.18" />
        <circle cx="16" cy="16" r="5" fill="#2440e6" />
        <circle cx="16" cy="16" r="1.4" fill="#16181a" />
      </svg>
      <span className="rotulo-ancho text-[1.35rem] tracking-tight">surco</span>
    </span>
  );
}

function Cabecera() {
  const { unidades, sesion } = useTienda();
  const [abierto, setAbierto] = useState(false);
  const loc = useLocation();
  useEffect(() => setAbierto(false), [loc.pathname]);
  useEffect(() => {
    if (!abierto) return;
    const f = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [abierto]);

  const claseEnlace = ({ isActive }) => `px-3 py-2.5 rounded-full text-[0.95rem] font-medium transition-colors ${isActive ? 'bg-tinta text-white' : 'hover:bg-carton/60'}`;

  return (
    <header className="sticky top-0 z-40 bg-funda/92 backdrop-blur-sm border-b border-linea/70">
      <div className="mx-auto max-w-[1360px] h-[68px] px-4 sm:px-6 lg:px-10 flex items-center gap-4">
        <Link to="/" aria-label="Surco, inicio" className="rounded-full"><Logo /></Link>
        <nav aria-label="Principal" className="hidden md:block ml-6">
          <ul className="flex gap-1">{enlaces.map(([to, t]) => <li key={to}><NavLink to={to} className={claseEnlace}>{t}</NavLink></li>)}</ul>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link to={sesion.usuario ? (sesion.usuario.rol === 'admin' ? '/admin' : '/cuenta') : '/cuenta'} className="grid place-items-center size-11 rounded-full hover:bg-carton/60" aria-label={sesion.usuario ? `Tu cuenta (${sesion.usuario.nombre})` : 'Entrar o crear cuenta'}>
            <HugeiconsIcon icon={UserIcon} size={22} strokeWidth={1.6} />
          </Link>
          <Link to="/cesta" className="relative flex items-center gap-2 h-11 pl-3 pr-3.5 rounded-full bg-tinta text-white hover:bg-tinta/85 transition-colors" aria-label={`Cesta, ${unidades} ${unidades === 1 ? 'producto' : 'productos'}`}>
            <HugeiconsIcon icon={ShoppingBag02Icon} size={20} strokeWidth={1.6} />
            <span aria-hidden="true" className="tabular-nums">
              <Suspense fallback={<span className="font-semibold">{unidades}</span>}>
                <Counter value={unidades} fontSize={16} padding={2} gap={0} horizontalPadding={0} gradientHeight={0} gradientFrom="transparent" fontWeight={600} />
              </Suspense>
            </span>
          </Link>
          <button type="button" className="md:hidden grid place-items-center size-11 rounded-full hover:bg-carton/60" aria-expanded={abierto} aria-controls="menu-movil" aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setAbierto((v) => !v)}>
            <HugeiconsIcon icon={abierto ? Cancel01Icon : Menu01Icon} size={22} strokeWidth={1.6} />
          </button>
        </div>
      </div>
      <nav id="menu-movil" aria-label="Principal" className={`md:hidden border-t border-linea/70 ${abierto ? 'block' : 'hidden'}`}>
        <ul className="px-4 py-3 grid gap-1">{enlaces.map(([to, t]) => <li key={to}><NavLink to={to} className={({ isActive }) => `block px-3 py-3 rounded-xl text-lg ${isActive ? 'bg-tinta text-white' : ''}`}>{t}</NavLink></li>)}</ul>
      </nav>
    </header>
  );
}

function Pie() {
  return (
    <footer className="mt-24 border-t border-linea bg-papel">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[36ch] text-gris">Discos y tocadiscos de segunda mano, revisados uno a uno en Las Palmas de Gran Canaria.</p>
        </div>
        <div>
          <h2 className="font-semibold mb-3">Tienda</h2>
          <ul className="grid gap-2 text-gris">
            <li><Link className="hover:text-tinta" to="/discos">Discos</Link></li>
            <li><Link className="hover:text-tinta" to="/tocadiscos">Tocadiscos</Link></li>
            <li><Link className="hover:text-tinta" to="/accesorios">Accesorios</Link></li>
            <li><Link className="hover:text-tinta" to="/vender">Vender tus discos</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-3">Ayuda</h2>
          <ul className="grid gap-2 text-gris">
            <li><Link className="hover:text-tinta" to="/legal/envios">Envíos y devoluciones</Link></li>
            <li><Link className="hover:text-tinta" to="/legal/condiciones">Condiciones de venta</Link></li>
            <li><Link className="hover:text-tinta" to="/cuenta">Tu cuenta</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-3">La tienda</h2>
          <address className="not-italic text-gris">Calle Perdomo, 00<br />35002 Las Palmas de Gran Canaria<br />Lunes a sábado, 10:30 a 14:00 y 17:00 a 20:30</address>
        </div>
      </div>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 py-6 border-t border-linea flex flex-wrap gap-x-6 gap-y-2 text-sm text-gris">
        <p>© {new Date().getFullYear()} Surco Discos S.L.</p>
        <Link className="hover:text-tinta" to="/legal/aviso-legal">Aviso legal</Link>
        <Link className="hover:text-tinta" to="/legal/privacidad">Privacidad</Link>
        <Link className="hover:text-tinta" to="/legal/cookies">Cookies</Link>
      </div>
    </footer>
  );
}

function Avisos() {
  const { avisos, cerrarAviso } = useTienda();
  return (
    <div className="fixed z-50 bottom-4 right-4 left-4 sm:left-auto grid gap-2 justify-items-end pointer-events-none">
      <Suspense fallback={null}>
      {avisos.map((a) => (
        <div key={a.id} className="pointer-events-auto">
          <SwipeToast title={a.titulo} description={a.descripcion} onClose={() => cerrarAviso(a.id)} background="#16181a" color="#f8f9f8" fuseColor="#2440e6" width={340} radius={14} duration={3500} inline />
        </div>
      ))}
      </Suspense>
    </div>
  );
}

export default function Marco() {
  const { sesion } = useTienda();
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <>
      <a href="#contenido" className="fixed left-4 top-3 z-50 -translate-y-24 focus:translate-y-0 transition-transform rounded-full bg-cobalto text-white px-4 py-2 font-semibold">Saltar al contenido</a>
      {sesion.demo ? (
        <p className="bg-[#ffd23f] text-[#1d1600] text-center text-sm font-semibold px-4 py-1.5">Tienda de demostración: los productos son ficticios y el pago es simulado.</p>
      ) : null}
      <Cabecera />
      <main id="contenido" tabIndex={-1} className="outline-none"><Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}><Outlet /></Suspense></main>
      <Pie />
      <Avisos />
    </>
  );
}
