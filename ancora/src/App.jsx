import { useEffect, useId, useRef, useState } from 'react';
import Recorrido from './componentes/Recorrido.jsx';
import RelojVivo, { ESFERAS } from './componentes/RelojVivo.jsx';
import Plano from './componentes/Plano.jsx';
import Magnet from './componentes/rb/Magnet.jsx';
import NumberTicker from './componentes/ui/NumberTicker.jsx';

const PRECIO = '2.450 €';
const TEXTO_ESFERA = {
  medianoche: 'El azul de la serie. Rayado solar sobre latón y catorce capas de laca: cambia de casi negro a azul vivo según le dé la luz.',
  grafito: 'Gris oscuro con el mismo rayado solar. La más discreta: de lejos parece lisa, de cerca se ve el grabado.',
  abeto: 'Verde muy profundo, casi negro bajo luz artificial. Con sol aparece el verde.',
  salmon: 'El tono cobrizo de los relojes de los años cuarenta, con las inscripciones en marrón.',
};

// Revelado al entrar en pantalla, con red de seguridad: el contenido nunca se queda invisible
function usarRevelado() {
  useEffect(() => {
    const els = [...document.querySelectorAll('.revela')];
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('dentro');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.03 });
    els.forEach((el) => io.observe(el));
    const t = setTimeout(() => els.forEach((el) => el.classList.add('dentro')), 3000);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <path d="M3 9 L11 13 L19 9 M11 13 V4 M3 9 L1.6 7 M19 9 L20.4 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="11" cy="13" r="1.6" fill="var(--color-aguja)" />
        <circle cx="11" cy="15.5" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
      <span className="titular text-[1.35rem] tracking-[0.22em]">ÁNCORA</span>
    </span>
  );
}

function Cabecera() {
  const [solida, setSolida] = useState(false);
  useEffect(() => {
    const f = () => setSolida(window.scrollY > window.innerHeight * 5.4);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${solida ? 'bg-noche/85 backdrop-blur-md shadow-[0_1px_0_var(--color-linea)]' : ''}`}>
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 sm:px-8 landscape:px-[6vw] landscape:max-w-none">
        <a href="#recorrido" aria-label="Áncora, al principio" className="text-white"><Logo /></a>
        <nav aria-label="Principal" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1 text-[0.95rem]">
            <li><a className="px-3 py-2 text-acero-tenue transition-colors hover:text-white" href="#calibre">El calibre</a></li>
            <li><a className="px-3 py-2 text-acero-tenue transition-colors hover:text-white" href="#esferas">Esferas</a></li>
          </ul>
        </nav>
        <a href="#reserva" className="boton-linea ml-auto !min-h-10 !px-4 text-sm md:ml-0">Reservar</a>
      </div>
    </header>
  );
}

function Cifras() {
  const datos = [
    [28800, 'alternancias por hora', 'El volante oscila a 4 Hz: el segundero da ocho saltos por segundo.'],
    [72, 'horas de reserva de marcha', 'Tres días quieto en un cajón y sigue en hora el lunes.'],
    [212, 'piezas en el calibre', 'Montadas por la misma persona, de la platina a la última aguja.'],
    [300, 'relojes por esfera', 'Cada uno numerado y grabado en el fondo de la caja.'],
  ];
  return (
    <section aria-labelledby="cifras-t" className="mx-auto max-w-[1400px] px-5 sm:px-8 landscape:px-[6vw] landscape:max-w-none py-28 sm:py-36">
      <h2 id="cifras-t" className="titular revela max-w-[16ch] text-[clamp(2.4rem,4.6vw,4.4rem)] text-white">Lo que cabe en <em>41 milímetros.</em></h2>
      <dl className="mt-16 grid gap-px overflow-hidden rounded-[2px] bg-linea sm:grid-cols-2 lg:grid-cols-4">
        {datos.map(([v, t, d], i) => (
          <div key={t} className="revela bg-noche p-7 sm:p-8" style={{ '--i': i }}>
            <dt className="sr-only">{t}</dt>
            <dd>
              <NumberTicker valor={v} className="block text-[clamp(2.6rem,4.4vw,3.6rem)] leading-none text-white" />
              <span className="grabado mt-4 block !text-acero">{t}</span>
              <span className="mt-3 block max-w-[30ch] text-[0.95rem] text-acero-tenue">{d}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="grabado revela mt-8">Caja de acero 316L · 41 × 11 mm · Hermético a 100 m · Zafiro por las dos caras</p>
    </section>
  );
}

function Calibre() {
  const pasos = [
    ['01', 'Montaje', 'Una sola persona monta las 212 piezas en dos días, con lupa y pinzas de latón para no rayar los puentes.'],
    ['02', 'Regulación', 'Se ajusta en cinco posiciones hasta quedarse entre −2 y +4 segundos al día.'],
    ['03', 'Quince días de prueba', 'Antes de salir, cada reloj marcha quince días en el taller y se anota su desvío cada mañana.'],
  ];
  return (
    <section id="calibre" aria-labelledby="calibre-t" className="border-t border-linea">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 landscape:px-[6vw] landscape:max-w-none py-28 sm:py-36 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
        <Plano className="w-full max-w-[720px] justify-self-center" />
        <div>
          <p className="grabado revela">Calibre A-1 · Automático</p>
          <h2 id="calibre-t" className="titular revela mt-5 max-w-[15ch] text-[clamp(2.4rem,4.2vw,4rem)] text-white">Nos llamamos como la pieza que <em>cuenta el tiempo.</em></h2>
          <p className="revela mt-6 max-w-[48ch] text-acero-tenue">El áncora es la palanca diminuta que frena y suelta la rueda de escape. Lo hace 28.800 veces por hora y es lo que oyes cuando acercas el reloj al oído. Sin ella, el muelle se descargaría de golpe.</p>
          <ol className="mt-12 grid gap-0">
            {pasos.map(([n, t, d], i) => (
              <li key={n} className="revela grid grid-cols-[3.2rem_1fr] gap-x-4 border-t border-linea py-6" style={{ '--i': i }}>
                <span className="cifra pt-1 text-sm text-acero-tenue">{n}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t}</h3>
                  <p className="mt-1.5 max-w-[46ch] text-acero-tenue">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Esferas({ esfera, setEsfera }) {
  const grupo = useId();
  return (
    <section id="esferas" aria-labelledby="esferas-t" className="border-t border-linea bg-carbon">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 landscape:px-[6vw] landscape:max-w-none py-28 sm:py-36 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <figure className="revela">
          <RelojVivo esfera={esfera} className="mx-auto w-full max-w-[520px] drop-shadow-[0_40px_60px_rgb(0_0_0/0.55)]" etiqueta={`Esfera ${esfera.nombre} del A-41 marcando la hora actual`} />
          <figcaption className="grabado mt-8 text-center">Es la hora de ahora · el segundero salta ocho veces por segundo</figcaption>
        </figure>
        <div>
          <p className="grabado revela">A-41 · Serie numerada</p>
          <h2 id="esferas-t" className="titular revela mt-5 max-w-[14ch] text-[clamp(2.4rem,4.2vw,4rem)] text-white">Cuatro esferas. <em>Trescientas de cada.</em></h2>
          <fieldset className="revela mt-10">
            <legend className="grabado mb-4">Elige esfera</legend>
            <div className="flex flex-wrap gap-3">
              {ESFERAS.map((e) => (
                <label key={e.id} className={`group flex cursor-pointer items-center gap-3 rounded-full py-2 pl-2 pr-4 transition-shadow duration-200 ${esfera.id === e.id ? 'shadow-[inset_0_0_0_1px_var(--color-acero)]' : 'shadow-[inset_0_0_0_1px_var(--color-linea)] hover:shadow-[inset_0_0_0_1px_var(--color-acero-tenue)]'}`}>
                  <input type="radio" name={grupo} value={e.id} checked={esfera.id === e.id} onChange={() => setEsfera(e)} className="sr-only" />
                  <span aria-hidden="true" className="size-8 rounded-full shadow-[inset_0_0_0_2px_rgb(255_255_255/0.25)]" style={{ background: `radial-gradient(circle at 38% 32%, ${e.luz}, ${e.fondo} 70%)` }} />
                  <span className={esfera.id === e.id ? 'text-white' : 'text-acero-tenue group-hover:text-acero'}>{e.nombre}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-6 min-h-[3.2em] max-w-[46ch] text-acero-tenue" aria-live="polite">{TEXTO_ESFERA[esfera.id]}</p>
          <div className="revela mt-10 flex flex-wrap items-end gap-x-10 gap-y-6 border-t border-linea pt-8">
            <div>
              <p className="grabado">Precio</p>
              <p className="cifra mt-2 text-[2.2rem] leading-none text-white">{PRECIO}</p>
            </div>
            <Magnet>
              <a href="#reserva" className="boton">Reservar el {esfera.nombre} <span aria-hidden="true">→</span></a>
            </Magnet>
          </div>
          <p className="mt-5 text-sm text-acero-tenue">Brazalete de acero con cierre desplegable · Garantía de 5 años · Entrega en seis semanas</p>
        </div>
      </div>
    </section>
  );
}

function Reserva({ esfera, setEsfera }) {
  const [hecha, setHecha] = useState(null);
  const formulario = useRef(null);
  function enviar(ev) {
    ev.preventDefault();
    const f = formulario.current;
    if (!f.reportValidity()) return;
    const datos = new FormData(f);
    const numero = 37 + ((datos.get('correo').length * 53 + datos.get('nombre').length * 17) % 180);
    setHecha({ nombre: String(datos.get('nombre')).split(' ')[0], esfera: ESFERAS.find((e) => e.id === datos.get('esfera'))?.nombre, numero });
  }
  const campo = 'mt-2 block w-full rounded-[3px] bg-noche px-4 py-3.5 text-white shadow-[inset_0_0_0_1px_var(--color-linea)] outline-none transition-shadow placeholder:text-acero-tenue/60 focus:shadow-[inset_0_0_0_1.5px_var(--color-acero)] user-invalid:shadow-[inset_0_0_0_1.5px_var(--color-aguja)]';
  return (
    <section id="reserva" aria-labelledby="reserva-t" className="border-t border-linea">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 landscape:px-[6vw] landscape:max-w-none py-28 sm:py-36 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <div>
          <p className="grabado revela">Reserva</p>
          <h2 id="reserva-t" className="titular revela mt-5 max-w-[13ch] text-[clamp(2.4rem,4.2vw,4rem)] text-white">Te guardamos <em>un número.</em></h2>
          <p className="revela mt-6 max-w-[44ch] text-acero-tenue">Sin pago por adelantado. Te escribimos cuando tu reloj entre en el banco de montaje y otra vez cuando termine la prueba de quince días. Entonces decides.</p>
        </div>
        <div className="revela">
          {hecha ? (
            <div role="status" className="rounded-[3px] p-8 shadow-[inset_0_0_0_1px_var(--color-linea)]">
              <p className="grabado">Reserva anotada</p>
              <p className="titular mt-5 text-[2.6rem] text-white">Gracias, {hecha.nombre}.</p>
              <p className="mt-4 text-acero-tenue">Tu A-41 {hecha.esfera} será el número <span className="cifra text-white">{String(hecha.numero).padStart(3, '0')}/300</span>.</p>
              <p className="mt-6 text-sm text-acero-tenue">Esto es una demostración: no se ha enviado nada.</p>
              <button type="button" className="boton-linea mt-8" onClick={() => setHecha(null)}>Hacer otra reserva</button>
            </div>
          ) : (
            <form ref={formulario} onSubmit={enviar} noValidate className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block"><span className="text-sm text-acero">Nombre</span>
                  <input name="nombre" required autoComplete="name" className={campo} /></label>
                <label className="block"><span className="text-sm text-acero">Correo electrónico</span>
                  <input name="correo" type="email" required autoComplete="email" inputMode="email" className={campo} /></label>
              </div>
              <label className="block"><span className="text-sm text-acero">Esfera</span>
                <select name="esfera" value={esfera.id} onChange={(e) => setEsfera(ESFERAS.find((x) => x.id === e.target.value))} className={campo}>
                  {ESFERAS.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select></label>
              <label className="block"><span className="text-sm text-acero">Talla de muñeca <span className="text-acero-tenue">(opcional, para ajustar el brazalete)</span></span>
                <input name="muneca" inputMode="decimal" placeholder="Por ejemplo, 17,5 cm" className={campo} /></label>
              <label className="flex items-start gap-3 text-sm text-acero-tenue">
                <input type="checkbox" required className="mt-1 size-4 accent-[var(--color-acero)]" />
                <span>Acepto que Áncora guarde estos datos para avisarme de mi reserva. Nada más.</span>
              </label>
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <button type="submit" className="boton">Reservar mi número</button>
                <span className="text-sm text-acero-tenue">Demostración: no se envía nada.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Pie() {
  return (
    <footer className="border-t border-linea">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-5 sm:px-8 landscape:px-[6vw] landscape:max-w-none py-10 text-sm text-acero-tenue">
        <span className="text-acero"><Logo /></span>
        <p className="max-w-[60ch]">Proyecto de demostración: la marca Áncora, el reloj y sus datos son ficticios. Imágenes y vídeo generados con IA.</p>
      </div>
    </footer>
  );
}

export default function App() {
  const [esfera, setEsfera] = useState(ESFERAS[0]);
  usarRevelado();
  return (
    <>
      <a href="#calibre" className="boton fixed left-4 top-3 z-50 -translate-y-24 focus:translate-y-0">Saltar el recorrido</a>
      <Cabecera />
      <main>
        <Recorrido />
        <Cifras />
        <Calibre />
        <Esferas esfera={esfera} setEsfera={setEsfera} />
        <Reserva esfera={esfera} setEsfera={setEsfera} />
      </main>
      <Pie />
    </>
  );
}
