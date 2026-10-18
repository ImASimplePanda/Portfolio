import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Plus } from 'lucide-react';
import { Probador } from '../componentes/Probador.jsx';
import { Panel, SeparadorPista } from '../componentes/Placa.jsx';
import CurvaFuerza from '../componentes/CurvaFuerza.jsx';
import Teclado2D from '../componentes/Teclado2D.jsx';
import Tarjeta, { TarjetaVacia } from '../componentes/Tarjeta.jsx';
import { Marquee } from '../componentes/ui/marquee.jsx';
import { FAMILIAS, euros } from '../lib/formato.js';
import { MONTADOR } from '../lib/montador.js';

// Todo lo que va debajo de la portada: llega después para que la primera pantalla pinte antes
const CARCASA_PORTADA = { hex: '#4a2d52', material: 'aluminio' };

export default function InicioResto({ interruptores, juegos, juego, sw, montados }) {
  return (
    <>
      <Familias interruptores={interruptores} />
      <Anatomia juego={juego} sw={sw} />
      <Juegos juegos={juegos} />
      <Montados datos={montados.datos} cargando={montados.cargando} />
      <Estaciones />
      <SeparadorPista className="mt-24" />
      <Preguntas />
    </>
  );
}

// Lineal, táctil o clicky: la diferencia se oye, pero también se ve en la curva de fuerza
function Familias({ interruptores }) {
  const [familia, setFamilia] = useState('tactil');
  const ejemplo = interruptores.find((x) => x.familia === familia);
  return (
    <section aria-labelledby="familias-t" className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 py-24">
      <SeparadorPista className="!px-0 mb-20" />
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 id="familias-t" className="serigrafia text-[clamp(2.2rem,4.4vw,3.6rem)]">Tres formas de pulsar una tecla</h2>
          <p className="mt-5 max-w-[52ch] text-lg text-serigrafia-tenue">Todos los interruptores bajan unos 4 milímetros. Lo que cambia es lo que notas por el camino.</p>
          <div className="mt-8 grid gap-2" role="radiogroup" aria-label="Tipo de interruptor">
            {Object.entries(FAMILIAS).map(([id, f]) => (
              <label key={id} className="huella-opcion">
                <input type="radio" name="familia" value={id} checked={familia === id} onChange={() => setFamilia(id)} />
                <span className="flex items-baseline justify-between gap-3">
                  <span className="serigrafia text-2xl">{f.nombre}</span>
                  <span className="text-sm text-serigrafia-tenue">{interruptores.filter((x) => x.familia === id).map((x) => x.titulo).join(', ')}</span>
                </span>
                <span className="block mt-1 text-serigrafia-tenue">{f.texto}</span>
              </label>
            ))}
          </div>
        </div>
        <Panel className="p-6 sm:p-10">
          <figure>
            <CurvaFuerza familia={familia} fuerza={ejemplo?.specs?.fuerza ?? 55} recorrido={ejemplo?.specs?.recorrido ?? 4} className="w-full h-auto" />
            <figcaption className="designador mt-2">Curva de fuerza del interruptor {ejemplo?.titulo}</figcaption>
          </figure>
          <p className="mt-4 text-sm text-serigrafia-tenue max-w-[56ch]">
            {familia === 'lineal' ? 'La fuerza sube recta hasta el fondo: nada interrumpe la bajada.' : familia === 'tactil' ? 'El bache de arriba avisa de que la tecla ya ha contado. Puedes soltar antes de llegar al fondo.' : 'Después del bache la fuerza cae de golpe: ahí es donde suena el clic.'}
          </p>
        </Panel>
      </div>
    </section>
  );
}

// Anatomía: al bajar, el teclado se separa en sus cinco capas
const CAPAS = [
  ['U1', 'Teclas', 'Lo que tocas. El plástico (PBT o ABS) y el perfil cambian el tacto y el tono.'],
  ['SW1–SW69', 'Interruptores', 'Uno por tecla. Deciden la fuerza, el recorrido y la mitad del sonido.'],
  ['P1', 'Placa', 'Sujeta los interruptores. Latón suena agudo y firme; policarbonato, grave y blando.'],
  ['PCB', 'Circuito', 'Lee cada pulsación. Los nuestros son hot-swap: cambias interruptores sin soldar.'],
  ['C1', 'Carcasa', 'Aluminio, policarbonato o nogal. Cuanto más maciza, más profundo el sonido.'],
];

function Anatomia({ juego, sw }) {
  const seccion = useRef();
  const lienzo = useRef();
  const despiece = useRef(0);
  const [movil, setMovil] = useState(false);
  const [capa, setCapa] = useState(0);
  const [cerca, setCerca] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCerca(true); }, { rootMargin: '500px' });
    io.observe(seccion.current);
    const medir = () => {
      const r = seccion.current.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      const fija = window.matchMedia('(min-width: 1024px)').matches && recorrido > 200; // en escritorio la sección es alta y el teclado queda fijo
      setMovil(!fija);
      const t = fija ? Math.min(1, Math.max(0, -r.top / recorrido)) : Math.min(1, Math.max(0, (window.innerHeight - r.top) / window.innerHeight));
      if (fija) {
        // Se separa en la primera mitad y se vuelve a montar en la última parte
        despiece.current = t < 0.5 ? t / 0.5 : t > 0.85 ? Math.max(0, 1 - (t - 0.85) / 0.15) : 1;
      } else if (lienzo.current) {
        // En móvil se separa mientras el teclado sube desde abajo hasta el centro de la pantalla
        const c = lienzo.current.getBoundingClientRect();
        const centro = (c.top + c.height / 2) / window.innerHeight;
        despiece.current = Math.min(1, Math.max(0, (1 - centro) / 0.5));
      }
      setCapa(Math.min(CAPAS.length - 1, Math.floor(t * CAPAS.length)));
    };
    medir();
    window.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => { io.disconnect(); window.removeEventListener('scroll', medir); window.removeEventListener('resize', medir); };
  }, []);

  return (
    <section ref={seccion} aria-labelledby="anatomia-t" className="relative bg-mascara-honda border-y border-mascara-borde lg:h-[300vh]">
      <div className="lg:sticky lg:top-[68px] lg:h-[calc(100dvh-68px)] mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 py-16 lg:py-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
        <div ref={lienzo} className="relative aspect-[4/3] lg:aspect-auto lg:h-full order-2 lg:order-1">
          {cerca ? (
            <Probador escucha={false} capaActiva={capa} distancia={movil ? 0.6 : 0.62} altura={movil ? 0.45 : 0.55} formato="65" colores={juego?.specs?.colores} carcasa={CARCASA_PORTADA} interruptor={sw?.color} sonido={sw?.specs?.sonido} despiece={despiece}
              className="w-full h-full" etiqueta="Las cinco capas de un teclado: teclas, interruptores, placa, circuito y carcasa" />
          ) : null}
        </div>
        <div className="order-1 lg:order-2">
          <h2 id="anatomia-t" className="serigrafia text-[clamp(2.2rem,4.4vw,3.6rem)]">Lo que hay debajo de cada tecla</h2>
          <ol className="mt-8 grid">
            {CAPAS.map(([d, t, texto], i) => (
              <li key={t} className={`grid grid-cols-[6.5rem_1fr] gap-3 py-3.5 border-t border-mascara-borde transition-opacity duration-300 ${i === capa ? 'opacity-100' : 'lg:opacity-45'}`} aria-current={i === capa ? 'step' : undefined}>
                <span className="designador pt-1">{d}</span>
                <div>
                  <h3 className="serigrafia text-xl">{t}</h3>
                  <p className={`text-serigrafia-tenue mt-1 ${i === capa ? '' : 'lg:hidden'}`}>{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Juegos de teclas en una cinta (Marquee de Magic UI)
function Juegos({ juegos }) {
  return (
    <section aria-labelledby="juegos-t" className="py-24 overflow-hidden">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="juegos-t" className="serigrafia text-[clamp(2.2rem,4.4vw,3.6rem)]">Siete juegos de teclas</h2>
          <p className="mt-3 max-w-[50ch] text-lg text-serigrafia-tenue">En distribución española, con Ñ y Ç. Valen para cualquiera de nuestros cuatro formatos.</p>
        </div>
        <Link viewTransition to="/tienda/teclas" className="pad-linea">Ver todos <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <Marquee pauseOnHover className="mt-10 [--duration:55s] [--gap:1.25rem] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {juegos.map((j) => (
          <Link viewTransition key={j.id} to={`/producto/${j.slug}`} className="group block w-[19rem] rounded-[var(--radius-pad)] p-4 bg-mascara-alta shadow-[inset_0_0_0_1px_var(--color-mascara-borde)] hover:shadow-[inset_0_0_0_1.5px_var(--color-cobre)]">
            <Teclado2D formato="65" colores={j.specs?.colores} carcasa="#1e102f" rotulos={false} className="w-full h-auto" titulo={`Juego de teclas ${j.titulo}`} />
            <span className="mt-3 flex items-baseline justify-between">
              <span className="serigrafia text-xl">{j.titulo}</span>
              <span className="numeros text-cobre-vivo font-semibold">{euros(j.precio)}</span>
            </span>
          </Link>
        ))}
      </Marquee>
    </section>
  );
}

function Montados({ datos, cargando }) {
  return (
    <section aria-labelledby="montados-t" className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pb-24">
      <SeparadorPista className="!px-0 mb-16" />
      <h2 id="montados-t" className="serigrafia text-[clamp(2.2rem,4.4vw,3.6rem)]">Teclados listos para enchufar</h2>
      <p className="mt-3 max-w-[52ch] text-lg text-serigrafia-tenue">Combinaciones que nos gustan, montadas y probadas tecla a tecla. Salen en 24 horas.</p>
      <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {cargando ? [0, 1, 2, 3].map((i) => <TarjetaVacia key={i} />) : (datos?.productos ?? []).map((p) => <Tarjeta key={p.id} producto={p} />)}
      </div>
    </section>
  );
}

// El montador por estaciones, en orden (la secuencia es real: cada paso depende del anterior)
function Estaciones() {
  const pasos = [
    ['Formato', `${MONTADOR.formatos.map((f) => f.nombre).join(', ')}.`],
    ['Carcasa', 'Aluminio, policarbonato o nogal, en el color que quieras.'],
    ['Placa', 'Latón, aluminio, policarbonato o FR4: cambia el sonido.'],
    ['Interruptores', 'Los siete de la tienda, que puedes oír antes de elegir.'],
    ['Teclas', 'Siete juegos, con Ñ y Ç.'],
  ];
  return (
    <section aria-labelledby="estaciones-t" className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10">
      <Panel className="px-6 py-12 sm:px-12 sm:py-16 overflow-hidden">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <h2 id="estaciones-t" className="serigrafia text-[clamp(2.2rem,4.4vw,3.6rem)]">Monta el tuyo en cinco pasos</h2>
            <p className="mt-4 text-lg text-serigrafia-tenue max-w-[46ch]">Ves el teclado en 3D y lo oyes mientras eliges. El precio y el stock se comprueban en el momento.</p>
            <Link viewTransition to="/montador" className="pad mt-8 text-lg !px-6 !min-h-13">Empezar a montar <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <ol className="relative grid gap-3">
            {pasos.map(([t, d], i) => (
              <li key={t} className="relative grid grid-cols-[2.75rem_1fr] items-start gap-4">
                <span className="grid place-items-center size-11 rounded-full bg-cobre text-mascara-honda serigrafia text-lg">{i + 1}</span>
                <div className="pt-1.5">
                  <h3 className="serigrafia text-xl">{t}</h3>
                  <p className="text-serigrafia-tenue">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Panel>
    </section>
  );
}

const PREGUNTAS = [
  ['¿Suena igual de verdad?', 'Es una aproximación sintetizada: respeta lo que distingue a cada interruptor (grave o agudo, con clic o sin él) y cómo lo cambian la placa y la carcasa. Si quieres oírlos de verdad, el probador de interruptores cuesta 19 € y te lo descontamos si después compras un teclado.'],
  ['¿Qué es hot-swap?', 'Que los interruptores van a presión, sin soldar. Puedes cambiarlos tú en cinco minutos con el extractor que incluimos.'],
  ['¿Por qué distribución española?', 'Porque escribimos en español: Ñ, Ç, acentos y la tecla Intro grande. Todos nuestros juegos de teclas la incluyen.'],
  ['¿Cuánto tarda un montaje a medida?', 'Unos 5 días laborables: montamos, lubricamos si lo pides, ajustamos los estabilizadores y probamos cada tecla antes de enviarlo.'],
  ['¿Y si no me convence?', 'Tienes 30 días para devolverlo si está como llegó. En los montajes a medida también: es nuestro compromiso, no lo exige la ley.'],
];

function Preguntas() {
  return (
    <section aria-labelledby="preguntas-t" className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pt-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <h2 id="preguntas-t" className="serigrafia text-[clamp(2.2rem,4.4vw,3.6rem)]">Preguntas antes de comprar</h2>
        <div>
          {PREGUNTAS.map(([p, r]) => (
            <details key={p} className="group border-b border-mascara-borde">
              <summary className="flex justify-between gap-4 cursor-pointer list-none py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {p}
                <Plus aria-hidden="true" className="text-cobre shrink-0 mt-1 transition-transform group-open:rotate-45" size={22} />
              </summary>
              <p className="pb-5 -mt-1 text-serigrafia-tenue max-w-[64ch]">{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
