import { lazy, Suspense, useEffect, useState } from 'react';
import TextPressure from '../components/rb/TextPressure.jsx';

// El rastro de diseños solo tiene sentido con ratón: se descarga aparte y solo entonces
const ImageTrail = lazy(() => import('../components/rb/ImageTrail.jsx'));
const conRaton = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
import Magnet from '../components/rb/Magnet.jsx';
import { estudio, trabajos } from '../data/estudio.js';
import { B } from '../base.js';

const rastro = trabajos.filter((t) => t.w === t.h).slice(0, 10).map((t) => t.img);

export default function Hero() {
  // La altura máxima de cada línea depende de la ventana: el titular nunca empuja los botones fuera
  const [tope, setTope] = useState(() => Math.max(80, window.innerHeight * 0.27));
  useEffect(() => {
    const r = () => setTope(Math.max(80, window.innerHeight * 0.27));
    window.addEventListener('resize', r, { passive: true });
    return () => window.removeEventListener('resize', r);
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="hero-titulo">
      <span id="centinela" className="hero__centinela" aria-hidden="true" />
      {conRaton() && (
        <div className="hero__rastro">
          <Suspense fallback={null}>
            <ImageTrail items={rastro} variant={1} />
          </Suspense>
        </div>
      )}
      <img className="hero__pieza" src={B + 'arte/mandala-1-claro.svg'} alt="" width="400" height="400" fetchPriority="high" decoding="async" />
      <div className="hero__contenido">
        <h1 id="hero-titulo" className="hero__titulo">
          <span className="sr">Negro Sólido, estudio de tatuaje</span>
          <TextPressure text="NEGRO" maxFontSize={tope} restWdth={125} />
          <TextPressure text="SÓLIDO" maxFontSize={tope} restWdth={125} />
        </h1>
        <div className="hero__pie">
          <p className="hero__intro">{estudio.intro}</p>
          <div className="hero__cta">
            <Magnet padding={60} magnetStrength={4} disabled={!window.matchMedia('(hover: hover) and (pointer: fine)').matches}>
              <a className="boton" href="#cita">Pide cita</a>
            </Magnet>
            <a className="boton boton--linea" href="#trabajo">Ver diseños</a>
          </div>
        </div>
      </div>
    </section>
  );
}
