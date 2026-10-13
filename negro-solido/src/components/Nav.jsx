import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import Marca from './Marca.jsx';

const enlaces = [
  ['estilos', 'Estilos'],
  ['trabajo', 'Diseños'],
  ['flash', 'Flash'],
  ['artistas', 'Artistas'],
  ['preguntas', 'Preguntas'],
];

export default function Nav() {
  const [abierto, setAbierto] = useState(false);
  const [solida, setSolida] = useState(false);

  useEffect(() => {
    // Un solo observador en vez de escuchar el scroll
    const centinela = document.getElementById('centinela');
    if (!centinela) return;
    const io = new IntersectionObserver(([e]) => setSolida(!e.isIntersecting), { threshold: 0 });
    io.observe(centinela);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const esc = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [abierto]);

  return (
    <header className={`nav${solida ? ' nav--solida' : ''}${abierto ? ' nav--abierta' : ''}`}>
      <a className="nav__logo" href="#top" aria-label="Negro Sólido, inicio">
        <Marca />
        <span>Negro Sólido</span>
      </a>
      <nav id="menu" className="nav__menu" aria-label="Principal">
        <ul>
          {enlaces.map(([id, txt]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={() => setAbierto(false)}>{txt}</a>
            </li>
          ))}
        </ul>
      </nav>
      <a className="boton boton--peq" href="#cita">Pide cita</a>
      <button
        className="nav__toggle"
        type="button"
        aria-expanded={abierto}
        aria-controls="menu"
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setAbierto((v) => !v)}
      >
        <HugeiconsIcon icon={abierto ? Cancel01Icon : Menu01Icon} size={22} strokeWidth={1.6} />
      </button>
    </header>
  );
}
