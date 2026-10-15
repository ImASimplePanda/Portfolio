import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { usarSesion } from '../contexto/Sesion.jsx';

// Chapa de dirección: la placa que llevan los cuadros artesanos en el tubo delantero
export function Chapa({ className = '' }) {
  return (
    <svg viewBox="0 0 40 52" className={className} aria-hidden="true">
      <path d="M20 1.5c9.9 0 17.5 6.8 17.5 17.4 0 13.3-9.2 24.6-17.5 31.6C11.7 43.5 2.5 32.2 2.5 18.9 2.5 8.3 10.1 1.5 20 1.5Z" fill="var(--color-laton-vivo)" stroke="var(--color-tinta)" strokeWidth="2" />
      <path d="M15 12v21h11" fill="none" stroke="var(--color-tinta)" strokeWidth="4.2" strokeLinecap="square" />
      <circle cx="20" cy="6.5" r="1.6" fill="var(--color-tinta)" />
      <circle cx="20" cy="42" r="1.6" fill="var(--color-tinta)" />
    </svg>
  );
}

const enlaces = [
  ['/#modelos', 'Modelos'],
  ['/#proceso', 'Cómo trabajamos'],
  ['/#taller', 'El taller'],
  ['/cita', 'Pide cita'],
];

export default function Marco() {
  const { demo } = usarSesion();
  const { pathname, hash } = useLocation();
  const [menu, setMenu] = useState(false);
  const enConfigurador = pathname.startsWith('/configurador');

  // Navegación con anclas dentro de la portada y vuelta arriba al cambiar de página
  useEffect(() => {
    setMenu(false);
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="min-h-dvh flex flex-col" style={{ '--alto-cabecera': demo ? '6rem' : '4rem' }}>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 boton">Saltar al contenido</a>
      {demo ? (
        <p className="bg-tinta text-acero-claro text-center text-sm px-4 py-1.5">
          Web de demostración: el taller, los precios y los encargos son inventados. No se cobra nada.
        </p>
      ) : null}
      <header className={`${enConfigurador ? '' : 'sticky top-0'} z-40 bg-acero/92 backdrop-blur-md border-b border-tinta/10`}>
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 h-16 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 rounded" aria-label="Latón, inicio">
            <Chapa className="h-9 w-auto" />
            <span className="rotulo text-[2rem] tracking-wide">Latón</span>
          </Link>
          <nav aria-label="Principal" className="hidden lg:block ml-4">
            <ul className="flex gap-7 text-[0.95rem] font-medium">
              {enlaces.map(([a, t]) => (
                <li key={a}><Link to={a} className="py-2 hover:text-laton underline-offset-[6px] hover:underline">{t}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/configurador" className="boton boton-laton !min-h-10 !px-4 text-[0.95rem]">Diseña tu bici</NavLink>
            <button type="button" className="lg:hidden boton boton-linea !min-h-10 !px-3" aria-expanded={menu} aria-controls="menu-movil" onClick={() => setMenu((m) => !m)}>
              Menú
            </button>
          </div>
        </div>
        {menu ? (
          <nav id="menu-movil" aria-label="Principal" className="lg:hidden border-t border-tinta/10 px-4 pb-4">
            <ul className="flex flex-col text-lg font-medium">
              {enlaces.map(([a, t]) => <li key={a}><Link to={a} className="block py-3 border-b border-tinta/10">{t}</Link></li>)}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      {enConfigurador ? null : <Pie />}
    </div>
  );
}

function Pie() {
  return (
    <footer className="bg-pavonado text-acero-claro">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Chapa className="h-11 w-auto" />
            <span className="rotulo text-4xl">Latón</span>
          </div>
          <p className="mt-4 max-w-sm text-acero">Bicicletas a medida con cuadro de acero o de titanio, soldadas a mano en Tafira Alta desde 2014.</p>
        </div>
        <div>
          <h2 className="font-semibold text-papel">El taller</h2>
          <address className="not-italic mt-3 text-acero leading-relaxed">
            Carretera del Centro, 00<br />35017 Tafira Alta<br />Las Palmas de Gran Canaria
          </address>
        </div>
        <div>
          <h2 className="font-semibold text-papel">Horario</h2>
          <p className="mt-3 text-acero leading-relaxed">De martes a viernes, de 10:00 a 14:00 y de 16:30 a 20:00.<br />Sábados, de 10:00 a 14:00.</p>
        </div>
        <div>
          <h2 className="font-semibold text-papel">Contacto</h2>
          <p className="mt-3 text-acero leading-relaxed">
            <a href="tel:+34928000000" className="hover:text-laton-claro">928 000 000</a><br />
            <a href="mailto:taller@laton.test" className="hover:text-laton-claro">taller@laton.test</a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-acero/80">
          <span>© {new Date().getFullYear()} Latón Bicicletas S.L.</span>
          <Link to="/legal/aviso-legal" className="hover:text-papel">Aviso legal</Link>
          <Link to="/legal/privacidad" className="hover:text-papel">Privacidad</Link>
          <Link to="/legal/condiciones" className="hover:text-papel">Condiciones de encargo</Link>
          <Link to="/legal/cookies" className="hover:text-papel">Cookies</Link>
          <Link to="/taller" className="hover:text-papel ml-auto">Acceso del taller</Link>
        </div>
      </div>
    </footer>
  );
}
