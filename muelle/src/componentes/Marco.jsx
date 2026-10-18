// Cabecera, pie y avisos: lo que rodea a todas las páginas.
import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useTienda } from '../contexto/Tienda.jsx';
import { Taladro } from './Placa.jsx';

const enlaces = [
  ['/tienda', 'Tienda'],
  ['/tienda/interruptores', 'Interruptores'],
  ['/tienda/teclas', 'Teclas'],
  ['/montador', 'Monta el tuyo'],
];

// El logotipo es un componente de la placa: su silueta serigrafiada y su designador
export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="28" viewBox="0 0 34 28" aria-hidden="true">
        <rect x="1" y="1" width="32" height="26" rx="3" fill="none" stroke="var(--color-serigrafia)" strokeWidth="1.6" />
        <path d="M8 20V8l9 7 9-7v12" fill="none" stroke="var(--color-cobre)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5" cy="5" r="1.4" fill="var(--color-serigrafia)" />
      </svg>
      <span className="serigrafia text-[1.4rem] tracking-[0.08em]">MUELLE</span>
    </span>
  );
}

const IslaAnimada = lazy(() => import('./Isla.jsx'));
const CestaLateral = lazy(() => import('./CestaLateral.jsx'));

// Mientras llega la isla animada, una pastilla igual pero quieta
function IslaQuieta({ abrir }) {
  const { unidades } = useTienda();
  return (
    <button type="button" onClick={abrir} className="flex items-center gap-2.5 h-11 pl-3.5 pr-4 rounded-full bg-cobre text-mascara-honda font-semibold"
      aria-haspopup="dialog">
      <span className="sr-only">Cesta: </span>
      <ShoppingBag size={19} strokeWidth={2} aria-hidden="true" /><span className="numeros">{unidades}</span><span className="sr-only"> {unidades === 1 ? 'producto' : 'productos'}</span>
    </button>
  );
}

function Cabecera() {
  const { sesion } = useTienda();
  const [menu, setMenu] = useState(false);
  const [cesta, setCestaBase] = useState(false);
  const [cestaVista, setCestaVista] = useState(false); // una vez abierta, se queda montada para animar el cierre
  const setCesta = (v) => { setCestaBase(v); if (v) setCestaVista(true); };
  const loc = useLocation();
  useEffect(() => { setMenu(false); setCesta(false); }, [loc.pathname]);

  const claseEnlace = ({ isActive }) => `relative px-3 py-2.5 text-[0.95rem] font-medium transition-colors ${isActive ? 'text-cobre-vivo' : 'text-serigrafia-tenue hover:text-serigrafia'}`;
  return (
    <header className="cabecera sticky top-0 z-40 bg-mascara/90 backdrop-blur-md border-b border-mascara-borde/70">
      <div className="mx-auto max-w-[1360px] h-[68px] px-4 sm:px-6 lg:px-10 flex items-center gap-4">
        <Link viewTransition to="/" aria-label="Muelle, inicio" className="rounded"><Logo /></Link>
        <nav aria-label="Principal" className="hidden lg:block ml-6">
          <ul className="flex gap-1">{enlaces.map(([to, t]) => <li key={to}><NavLink viewTransition end={to === '/tienda'} to={to} className={claseEnlace}>{t}</NavLink></li>)}</ul>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link viewTransition to={sesion.usuario?.rol === 'admin' ? '/admin' : '/cuenta'} className="grid place-items-center size-11 rounded-full text-serigrafia-tenue hover:text-serigrafia hover:bg-mascara-alta"
            aria-label={sesion.usuario ? `Tu cuenta (${sesion.usuario.nombre})` : 'Entrar o crear cuenta'}>
            <User size={21} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <span data-cesta className="inline-flex rounded-full"><Suspense fallback={<IslaQuieta abrir={() => setCesta(true)} />}><IslaAnimada abrir={() => setCesta(true)} /></Suspense></span>
          <button type="button" className="lg:hidden grid place-items-center size-11 rounded-full hover:bg-mascara-alta" aria-expanded={menu} aria-controls="menu-movil"
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenu((v) => !v)}>
            {menu ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav id="menu-movil" aria-label="Principal" className={`lg:hidden border-t border-mascara-borde/70 ${menu ? 'block' : 'hidden'}`}>
        <ul className="px-4 py-3 grid gap-1">{enlaces.map(([to, t]) => <li key={to}><NavLink viewTransition end={to === '/tienda'} to={to} className={({ isActive }) => `block px-3 py-3 rounded text-lg ${isActive ? 'text-cobre-vivo' : ''}`}>{t}</NavLink></li>)}</ul>
      </nav>
      {cesta || cestaVista ? <Suspense fallback={null}><CestaLateral abierta={cesta} cambiar={setCesta} /></Suspense> : null}
    </header>
  );
}

function Pie() {
  return (
    <footer className="mt-28 border-t border-mascara-borde bg-mascara-honda">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[38ch] text-serigrafia-tenue">Teclados mecánicos, interruptores y teclas. Montamos y probamos cada teclado a mano en Valencia.</p>
          <p className="designador mt-6">MUELLE REV 2.6, VALENCIA</p>
        </div>
        <div>
          <h2 className="serigrafia text-lg mb-3">Tienda</h2>
          <ul className="grid gap-2 text-serigrafia-tenue">
            <li><Link viewTransition className="hover:text-serigrafia" to="/tienda/teclados">Teclados montados</Link></li>
            <li><Link viewTransition className="hover:text-serigrafia" to="/tienda/interruptores">Interruptores</Link></li>
            <li><Link viewTransition className="hover:text-serigrafia" to="/tienda/teclas">Juegos de teclas</Link></li>
            <li><Link viewTransition className="hover:text-serigrafia" to="/tienda/accesorios">Accesorios</Link></li>
            <li><Link viewTransition className="hover:text-serigrafia" to="/montador">Monta el tuyo</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="serigrafia text-lg mb-3">Ayuda</h2>
          <ul className="grid gap-2 text-serigrafia-tenue">
            <li><Link viewTransition className="hover:text-serigrafia" to="/legal/envios">Envíos y devoluciones</Link></li>
            <li><Link viewTransition className="hover:text-serigrafia" to="/legal/garantia">Garantía</Link></li>
            <li><Link viewTransition className="hover:text-serigrafia" to="/legal/condiciones">Condiciones de venta</Link></li>
            <li><Link viewTransition className="hover:text-serigrafia" to="/cuenta">Tu cuenta</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="serigrafia text-lg mb-3">El taller</h2>
          <address className="not-italic text-serigrafia-tenue">Calle del Doctor Sumsi, 00<br />46005 Valencia<br />De lunes a viernes, de 9:00 a 18:00</address>
        </div>
      </div>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 py-6 border-t border-mascara-borde flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-serigrafia-tenue">
        <Taladro />
        <p>© {new Date().getFullYear()} Muelle Teclados S.L.</p>
        <Link viewTransition className="hover:text-serigrafia" to="/legal/aviso-legal">Aviso legal</Link>
        <Link viewTransition className="hover:text-serigrafia" to="/legal/privacidad">Privacidad</Link>
        <Link viewTransition className="hover:text-serigrafia" to="/legal/cookies">Cookies</Link>
      </div>
    </footer>
  );
}

export default function Marco() {
  const { sesion } = useTienda();
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => {
    const el = document.querySelector('[data-aviso-demo]');
    if (!el) { document.documentElement.style.setProperty('--alto-aviso', '0px'); return; }
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--alto-aviso', `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, [sesion.demo]);
  return (
    <>
      <a href="#contenido" className="fixed left-4 top-3 z-50 -translate-y-24 focus:translate-y-0 transition-transform pad">Saltar al contenido</a>
      {sesion.demo ? (
        <p data-aviso-demo className="bg-fr4 text-mascara-honda text-center text-sm font-semibold px-4 py-1.5">Tienda de demostración: la marca, los productos y los precios son inventados y el pago es simulado.</p>
      ) : null}
      <Cabecera />
      <main id="contenido" tabIndex={-1} className="outline-none"><Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}><Outlet /></Suspense></main>
      {loc.pathname.startsWith('/montador') ? null : <Pie />}
    </>
  );
}
