import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import Plano from '../componentes/Plano.jsx';
import { SinTres } from '../componentes/Util.jsx';
import { OPCIONES as O, normalizar, precio, vale } from '../lib/configuracion.js';
import { euros } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarTitulo.js';
import { BASE } from '../lib/base.js';

const Escena = lazy(() => import('../tres/Escena.jsx'));

const CARMEN = normalizar({ modelo: 'jable', material: 'acero', acabado: 'tabaiba', transmision: 'grx', ruedas: 'dinamo', cinta: 'miel', extras: ['portabultos'], altura: 171, entrepierna: 79 });

const PASOS = [
  ['Te medimos', 'Hora y media en el taller: medidas del cuerpo, flexibilidad y cómo montas. Si tienes bici, tráela.', 'Medición de la entrepierna con un nivel contra la pared'],
  ['Diseñamos el cuadro', 'Con tus medidas dibujamos el plano. No cortamos un tubo hasta que tú le das el visto bueno.', 'Plano de un cuadro dibujado a lápiz con sus medidas'],
  ['Cortamos y soldamos', 'Inglete a inglete y unión a unión, con varilla de latón a unos 900 °C. Un cuadro lleva unas 40 horas.', 'Corte de un tubo de acero en la sierra'],
  ['Pintamos', 'Chorreado, imprimación y dos capas al horno con barniz. O acero visto, para que se vea la soldadura.', 'Cuadro recién pintado de verde colgado en la cabina'],
  ['Montamos', 'Ruedas radiadas y centradas a mano, cables por dentro y la transmisión ajustada en el soporte.', 'Bici de gravel a medio montar en el soporte del taller'],
  ['Te la llevas', 'Media hora de ajuste final contigo encima. Al mes la revisamos gratis, cuando ya ha asentado.', 'Ainhoa ajusta la altura del sillín a un cliente en la puerta del taller'],
];

// Foto con dos tamaños; el navegador elige según el ancho que ocupa
function Foto({ nombre, anchos, alto, alt, sizes, className = '' }) {
  const [a, b] = anchos;
  return (
    <img src={`${BASE}fotos/${nombre}-${b}.webp`} srcSet={`${BASE}fotos/${nombre}-${a}.webp ${a}w, ${BASE}fotos/${nombre}-${b}.webp ${b}w`}
      sizes={sizes} width={b} height={Math.round((b * alto[1]) / alto[0])} alt={alt} loading="lazy" decoding="async" className={className} />
  );
}

const PREGUNTAS = [
  ['¿Cuánto tarda?', 'Unas 8 semanas en acero y 12 en titanio, contadas desde la cita de medición. Te avisamos por correo cada vez que la bici cambia de fase.'],
  ['¿Qué pasa si después de medirme no me convence?', 'La señal se devuelve entera mientras no hayas aprobado el plano del cuadro. La cita de medición suelta cuesta 90 € y se descuenta si encargas la bici.'],
  ['¿Por qué acero, si el carbono pesa menos?', 'Un cuadro de acero bien hecho pesa unos 400 g más que uno de carbono de gama media. A cambio absorbe mejor el asfalto roto, no se agrieta con un golpe y se puede reparar en cualquier taller con soplete.'],
  ['¿Hacéis bicis para personas muy altas o muy bajas?', 'Precisamente para eso existe un cuadro a medida. Hacemos cuadros para ciclistas de 1,45 a 2,10 m.'],
  ['¿Y si vivo en otra isla o en la península?', 'Puedes medirte con un fitter de nuestra confianza en Tenerife, Madrid o Barcelona, o venir un sábado: la medición dura hora y media.'],
];

function desde(modelo) {
  const c = normalizar({ modelo, material: 'acero' });
  const barata = (lista) => lista.filter((x) => vale(x, c)).sort((a, b) => a.precio - b.precio)[0].id;
  return precio(normalizar({ ...c, transmision: barata(O.transmisiones), ruedas: barata(O.ruedas), acabado: 'tabaiba' })).total;
}

export default function Inicio() {
  usarTitulo(null);
  return (
    <>
      <Portada />
      <Proceso />
      <Modelos />
      <Materiales />
      <ElTaller />
      <Preguntas />
      <Cierre />
    </>
  );
}

function Portada() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 sm:px-6 pt-10 sm:pt-14 pb-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
      <div>
        <h1 className="rotulo text-[clamp(3.4rem,7.4vw,6.6rem)]">Bicicletas a tu medida, soldadas a mano en Gran Canaria</h1>
        <p className="mt-6 max-w-xl text-lg text-grafito">
          Te medimos en el taller de Tafira, dibujamos un cuadro de acero o de titanio para tu cuerpo y lo soldamos aquí mismo. Diseña la tuya y mira el precio mientras eliges.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/configurador" className="boton boton-laton text-lg !px-6 !min-h-13">Diseña tu bici</Link>
          <Link to="/cita" className="boton boton-linea text-lg !px-6 !min-h-13">Pide cita para medirte</Link>
        </div>
      </div>
      <figure>
        <Plano config={CARMEN} trazado className="w-full h-auto" titulo="Plano de la Jable de Carmen, una bici de gravel de talla 51" />
        <figcaption className="mt-3 text-[0.95rem] text-grafito max-w-lg">
          La Jable de Carmen: mide 1,71 m y tiene 79 cm de entrepierna. Stack, reach y tubo de sillín salen de esas dos medidas, en milímetros.
        </figcaption>
      </figure>
    </section>
  );
}

// La bici se monta pieza a pieza mientras se leen los pasos
function Proceso() {
  const seccion = useRef();
  const despiece = useRef(1);
  const [paso, setPaso] = useState(0);
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCerca(true); }, { rootMargin: '600px' });
    io.observe(seccion.current);
    const medir = () => {
      const r = seccion.current.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      // En escritorio la sección es alta y fija la bici; en móvil se monta mientras entra en pantalla
      const t = recorrido > 200
        ? Math.min(1, Math.max(0, -r.top / recorrido))
        : Math.min(1, Math.max(0, (window.innerHeight * 0.95 - r.top) / (window.innerHeight * 0.9)));
      despiece.current = 1 - Math.min(1, t / 0.85);
      setPaso(Math.min(PASOS.length - 1, Math.floor(t * PASOS.length)));
    };
    medir();
    window.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => { io.disconnect(); window.removeEventListener('scroll', medir); window.removeEventListener('resize', medir); };
  }, []);

  return (
    <section id="proceso" ref={seccion} aria-labelledby="proceso-t" className="relative bg-acero-claro border-y border-tinta/10 lg:h-[340vh]">
      <div className="lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] mx-auto max-w-[88rem] px-4 sm:px-6 py-14 lg:py-10 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-center">
        <div className="relative h-[42svh] lg:h-full min-h-64 order-2 lg:order-1">
          {cerca ? (
            <SinTres alternativa={<Plano config={CARMEN} cotas={false} className="w-full h-full" />}>
              <Suspense fallback={<Plano config={CARMEN} cotas={false} className="w-full h-full opacity-50" />}>
                <Escena config={CARMEN} despiece={despiece} controles={false} distancia={3.7} className="h-full" etiqueta="Una bici que se monta pieza a pieza: ruedas, horquilla, manillar, sillín y transmisión llegan al cuadro." />
              </Suspense>
            </SinTres>
          ) : null}
        </div>
        <div className="order-1 lg:order-2">
          <h2 id="proceso-t" className="rotulo text-6xl sm:text-7xl">Así se hace tu bici</h2>
          <ol className="mt-8 grid gap-1">
            {PASOS.map(([titulo, texto, alt], i) => (
              <li key={titulo} className={`grid grid-cols-[2.2rem_1fr] gap-x-3 py-3 border-t border-tinta/12 transition-opacity duration-300 ${i === paso ? 'opacity-100' : 'lg:opacity-40'}`} aria-current={i === paso ? 'step' : undefined}>
                <span className="rotulo text-3xl text-laton numeros">{i + 1}</span>
                <div className={`grid grid-cols-[1fr_5.5rem] sm:grid-cols-[1fr_7rem] gap-x-4 ${i === paso ? '' : 'lg:block'}`}>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight mt-1">{titulo}</h3>
                    <p className={`text-grafito leading-snug mt-1 ${i === paso ? '' : 'lg:hidden'}`}>{texto}</p>
                  </div>
                  <Foto nombre={`paso-${i + 1}`} anchos={[240, 400]} alto={[4, 5]} sizes="112px" alt={alt}
                    className={`w-full aspect-[4/5] object-cover rounded-[var(--radius-pieza)] mt-1 ${i === paso ? '' : 'lg:hidden'}`} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Modelos() {
  const fotosModelo = {
    alisio: 'Ciclista con una Alisio roja en una carretera de montaña, con el Roque Nublo al fondo',
    jable: 'Jable verde con bolsas de viaje en una pista de tierra roja al atardecer',
    calima: 'Calima azul con guardabarros y sillín de cuero en una calle empedrada de Vegueta',
  };
  const muestras = { alisio: { acabado: 'almagre', cinta: 'negro' }, jable: { acabado: 'tabaiba', cinta: 'miel', extras: ['anclajes'] }, calima: { acabado: 'atlantico', cinta: 'miel', extras: ['guardabarros'] } };
  return (
    <section id="modelos" aria-labelledby="modelos-t" className="mx-auto max-w-[88rem] px-4 sm:px-6 py-20">
      <h2 id="modelos-t" className="rotulo text-6xl sm:text-7xl">Tres bicis, tu talla</h2>
      <p className="mt-4 max-w-2xl text-lg text-grafito">Cada modelo es una geometría de partida. Luego el cuadro se dibuja para ti: no hay tallas S, M o L.</p>
      <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-3">
        {O.modelos.map((m) => (
          <article key={m.id} className="group flex flex-col">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-pieza)] bg-acero-claro">
              <Foto nombre={m.id} anchos={[480, 720]} alto={[3, 2]} sizes="(min-width: 768px) 30vw, 92vw" alt={fotosModelo[m.id]} className="absolute inset-0 size-full object-cover" />
              {/* Al pasar el ratón, la foto deja ver el plano de la misma bici */}
              <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-acero-claro p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [@media(hover:none)]:hidden">
                <Plano config={normalizar({ modelo: m.id, ...muestras[m.id] })} cotas={false} className="w-full h-auto" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t-2 border-tinta pt-3">
              <h3 className="rotulo text-5xl">{m.nombre}</h3>
              <p className="text-grafito">{m.tipo}</p>
            </div>
            <p className="mt-2 text-grafito flex-1">{m.resumen}</p>
            <dl className="mt-4 grid grid-cols-2 gap-y-1 text-[0.95rem]">
              <dt className="text-grafito">Ruedas</dt><dd>{m.pasoRueda}</dd>
              <dt className="text-grafito">Dirección</dt><dd className="numeros">{String(m.geometria.anguloDireccion).replace('.', ',')}°</dd>
              <dt className="text-grafito">Completa desde</dt><dd className="font-semibold">{euros(desde(m.id))}</dd>
            </dl>
            <Link to={`/configurador?modelo=${m.id}`} className="boton boton-linea mt-6 self-start">Configurar la {m.nombre}</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Materiales() {
  const filas = [
    ['Tacto', 'Vivo y cómodo: filtra la vibración del asfalto', 'Parecido al acero, algo más firme y muy reactivo'],
    ['Peso del cuadro', 'De 2 a 2,3 kg', 'De 1,5 a 1,75 kg'],
    ['Cuidados', 'Pintado y con cera por dentro contra el óxido', 'Ninguno: no se oxida ni se pinta'],
    ['Si se golpea', 'Se endereza o se cambia el tubo', 'Se repara en el taller, con más coste'],
    ['Plazo', 'Unas 8 semanas', 'Unas 12 semanas'],
    ['Cuadro a medida', `Desde ${euros(Math.min(...O.modelos.map((m) => m.cuadro.acero)))}`, `Desde ${euros(Math.min(...O.modelos.map((m) => m.cuadro.titanio)))}`],
  ];
  return (
    <section aria-labelledby="materiales-t" className="bg-pavonado text-acero-claro">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-20 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <h2 id="materiales-t" className="rotulo text-6xl sm:text-7xl text-papel">Acero o titanio</h2>
          <p className="mt-5 max-w-md text-acero">Los dos duran toda la vida. La diferencia está en el tacto, el peso y el cuidado que te apetece darle.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
            <figure>
              <Foto nombre="soldadura" anchos={[480, 720]} alto={[3, 2]} sizes="(min-width: 1024px) 220px, 46vw" alt="Unión de dos tubos de acero soldada con latón" className="w-full aspect-[3/2] object-cover rounded-[var(--radius-pieza)]" />
              <figcaption className="mt-2 text-sm text-acero">Acero unido con latón</figcaption>
            </figure>
            <figure>
              <Foto nombre="titanio" anchos={[480, 720]} alto={[3, 2]} sizes="(min-width: 1024px) 220px, 46vw" alt="Bici de titanio cepillado apoyada en un muro de piedra junto al mar" className="w-full aspect-[3/2] object-cover rounded-[var(--radius-pieza)]" />
              <figcaption className="mt-2 text-sm text-acero">Titanio cepillado, sin pintar</figcaption>
            </figure>
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[34rem] text-left">
            <caption className="sr-only">Comparación entre acero y titanio</caption>
            <thead>
              <tr className="border-b border-laton-vivo/60">
                <td />
                <th scope="col" className="rotulo text-4xl text-laton-claro pb-3 font-extrabold">Acero</th>
                <th scope="col" className="rotulo text-4xl text-laton-claro pb-3 font-extrabold">Titanio</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(([k, a, t]) => (
                <tr key={k} className="border-b border-white/10 align-top">
                  <th scope="row" className="py-3.5 pr-4 font-semibold text-papel w-36">{k}</th>
                  <td className="py-3.5 pr-6 text-acero">{a}</td>
                  <td className="py-3.5 text-acero">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ElTaller() {
  return (
    <section id="taller" aria-labelledby="taller-t" className="mx-auto max-w-[88rem] px-4 sm:px-6 py-20 grid gap-10 lg:grid-cols-2 lg:items-start">
      <div>
        <h2 id="taller-t" className="rotulo text-6xl sm:text-7xl">Un taller, dos personas</h2>
        <p className="mt-6 max-w-xl text-lg">
          Néstor Cabrera aprendió a soldar con latón en un taller de Bérgamo y volvió a la isla en 2014 con un soplete y una mesa de alineado. Ainhoa Suárez llegó dos años después desde la mecánica de competición: ella mide, monta y prueba cada bici.
        </p>
        <p className="mt-4 max-w-xl text-grafito">
          Hacemos unas 35 bicis al año. No tenemos más manos, y preferimos que cada una salga como debe.
        </p>
      </div>
      <blockquote className="lg:mt-24 border-l-4 border-laton-vivo pl-6">
        <p className="rotulo text-4xl sm:text-5xl leading-[0.95]">«Un cuadro a medida no es para correr más. Es para que a la quinta hora sigas queriendo pedalear.»</p>
        <footer className="mt-4 text-grafito">Néstor Cabrera, cuadrista</footer>
      </blockquote>
      <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
        {[
          ['nestor', 'Néstor suelda con latón una unión del cuadro', 'Néstor, en la mesa de soldar'],
          ['ainhoa', 'Ainhoa centra una rueda en el soporte', 'Ainhoa, centrando una rueda'],
          ['taller', 'El taller de Tafira, con la mesa de alineado y vistas a la cumbre', 'El taller, en Tafira Alta'],
        ].map(([n, alt, pie]) => (
          <figure key={n}>
            <Foto nombre={n} anchos={[480, 720]} alto={[3, 2]} sizes="(min-width: 640px) 31vw, 92vw" alt={alt} className="w-full aspect-[3/2] object-cover rounded-[var(--radius-pieza)]" />
            <figcaption className="mt-2 text-sm text-grafito">{pie}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Preguntas() {
  return (
    <section aria-labelledby="preguntas-t" className="border-t border-tinta/10">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-20 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <h2 id="preguntas-t" className="rotulo text-6xl sm:text-7xl">Preguntas antes de encargar</h2>
        <div>
          {PREGUNTAS.map(([p, r]) => (
            <details key={p} className="group border-b border-tinta/15 py-1">
              <summary className="flex justify-between gap-4 cursor-pointer list-none py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {p}
                <span aria-hidden="true" className="text-laton text-2xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 -mt-1 text-grafito max-w-2xl">{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cierre() {
  return (
    <section className="bg-laton-vivo">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h2 className="rotulo text-6xl sm:text-8xl">Empieza por medirte</h2>
          <p className="mt-4 max-w-xl text-lg">Hora y media en el taller por {euros(O.medicion.precio)}, que te descontamos si encargas la bici. De martes a sábado.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/cita" className="boton text-lg !px-6 !min-h-13">Elegir día y hora</Link>
          <Link to="/configurador" className="boton boton-linea text-lg !px-6 !min-h-13">Diseñarla antes</Link>
        </div>
      </div>
    </section>
  );
}
