import { lazy, Suspense, useEffect, useState } from 'react';

import Noise from './components/rb/Noise.jsx';
import Nav from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Pie from './sections/Pie.jsx';
import { demo } from './data/estudio.js';

// Todo lo que va debajo del primer pliegue llega en un segundo paquete
const cargarResto = () => import('./sections/Resto.jsx');
const Resto = lazy(cargarResto);

export default function App() {
  // Filtro de estilo compartido (Estilos → Trabajo) y diseño elegido (Flash → Reserva)
  const [filtro, setFiltro] = useState('todos');
  const [flashElegido, setFlashElegido] = useState(null);

  // Scroll suave solo en escritorio con ratón y sin movimiento reducido (se carga aparte)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduce || !fino) return;
    let limpiar = () => {};
    let vivo = true;
    Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      if (!vivo) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -72 } });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
      limpiar = () => { gsap.ticker.remove(tick); lenis.destroy(); delete window.__lenis; };
    });
    return () => { vivo = false; limpiar(); };
  }, []);

  const irA = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 });
    else el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <>
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <Noise fixed opacity={0.07} fps={12} size={1.2} blendMode="overlay" zIndex={60} />
      <Nav />
      {demo && <p className="demo" role="note">Demo · datos ficticios</p>}
      <main id="contenido">
        <Hero />
        <Suspense fallback={<div className="cargando" aria-hidden="true" />}>
          <Resto
            filtro={filtro}
            setFiltro={setFiltro}
            flashElegido={flashElegido}
            onEstilo={(id) => { setFiltro(id); irA('trabajo'); }}
            onFlash={(f) => { setFlashElegido(f); irA('cita'); }}
          />
        </Suspense>
      </main>
      <Pie />
    </>
  );
}
