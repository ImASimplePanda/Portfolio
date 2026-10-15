import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { OPCIONES as O, INICIAL, LIMITES, normalizar, porId, precio, plazo, peso, senal, talla, vale } from '../lib/configuracion.js';
import { api } from '../lib/api.js';
import { euros, kg } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarTitulo.js';
import Plano from '../componentes/Plano.jsx';
import { DatosContacto, SinTres, contactoVacio } from '../componentes/Util.jsx';
import Precio from '../componentes/Precio.jsx';

const Escena = lazy(() => import('../tres/Escena.jsx'));
const BORRADOR = 'laton:borrador';

function leerBorrador() {
  try { return JSON.parse(localStorage.getItem(BORRADOR) || 'null'); } catch { return null; }
}

export default function Configurador() {
  const { codigo } = useParams();
  const [busqueda] = useSearchParams();
  const navegar = useNavigate();
  const [config, setConfig] = useState(() => normalizar({ ...INICIAL, ...(leerBorrador() || {}), ...(busqueda.get('modelo') ? { modelo: busqueda.get('modelo') } : {}) }));
  const [guardada, setGuardada] = useState(null); // { codigo, json } de la última versión guardada
  const [aviso, setAviso] = useState('');
  const [errorCarga, setErrorCarga] = useState('');
  const [vista, setVista] = useState('3d');
  const [encargo, setEncargo] = useState(false);
  const m = porId(O.modelos, config.modelo);
  usarTitulo(codigo ? `Bici ${codigo}` : 'Diseña tu bici');

  // Una bici guardada se abre con su código
  useEffect(() => {
    if (!codigo) return;
    api(`/configuraciones/${codigo}`)
      .then((r) => { const c = normalizar(r.configuracion); setConfig(c); setGuardada({ codigo, json: JSON.stringify(c) }); })
      .catch((e) => setErrorCarga(e.message));
  }, [codigo]);

  useEffect(() => {
    try { localStorage.setItem(BORRADOR, JSON.stringify(config)); } catch { /* sin almacenamiento: no pasa nada */ }
  }, [config]);

  const cambiar = (campo, valor) => setConfig((c) => normalizar({ ...c, [campo]: valor }));
  const alternarExtra = (id) => setConfig((c) => normalizar({ ...c, extras: c.extras.includes(id) ? c.extras.filter((x) => x !== id) : [...c.extras, id] }));

  const p = useMemo(() => precio(config), [config]);
  const t = useMemo(() => talla(config), [config]);
  const json = JSON.stringify(config);
  const codigoActual = guardada?.json === json ? guardada.codigo : null;

  async function guardar() {
    if (codigoActual) return codigoActual;
    const r = await api('/configuraciones', { metodo: 'POST', datos: { configuracion: config } });
    setGuardada({ codigo: r.codigo, json: JSON.stringify(normalizar(r.configuracion)) });
    navegar(`/configurador/${r.codigo}`, { replace: true });
    return r.codigo;
  }

  async function compartir() {
    setAviso('');
    try {
      const c = await guardar();
      const url = `${location.origin}${import.meta.env.BASE_URL}configurador/${c}`;
      try { await navigator.clipboard.writeText(url); setAviso(`Guardada como ${c}. Enlace copiado.`); }
      catch { setAviso(`Guardada como ${c}. Comparte el enlace de la barra de direcciones.`); }
    } catch (e) { setAviso(e.message); }
  }

  async function pedirCita() {
    try { navegar(`/cita?configuracion=${await guardar()}`); } catch (e) { setAviso(e.message); }
  }

  if (errorCarga) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <h1 className="rotulo text-6xl">No encontramos esa bici</h1>
        <p className="mt-4">{errorCarga}</p>
        <Link to="/configurador" className="boton mt-8">Empezar una nueva</Link>
      </div>
    );
  }

  const plano = <Plano config={config} className="w-full h-full max-h-full" />;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_28rem] lg:h-[calc(100dvh-var(--alto-cabecera))]">
      {/* Escenario: la bici en 3D o el plano con las cotas */}
      <section aria-label="Vista de tu bici" className="sticky top-0 z-10 lg:relative lg:z-0 h-[46svh] lg:h-auto bg-[radial-gradient(ellipse_at_50%_40%,#eef0ec_0%,#d3d6d1_70%)] border-b lg:border-b-0 lg:border-r border-tinta/10 overflow-hidden">
        <div className="absolute inset-0">
          {vista === '3d' ? (
            <SinTres alternativa={<div className="h-full p-6 grid place-items-center">{plano}</div>}>
              <Suspense fallback={<div className="h-full p-6 grid place-items-center opacity-60">{plano}</div>}>
                <Escena config={config} className="h-full" etiqueta={`Tu ${m.nombre} en 3D. Arrastra para girarla.`} distancia={2.7} />
              </Suspense>
            </SinTres>
          ) : (
            <div className="h-full p-4 sm:p-10 grid place-items-center">{<Plano config={config} className="w-full h-full" />}</div>
          )}
        </div>
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex rounded-[var(--radius-pieza)] bg-papel/90 p-1 shadow-sm" role="group" aria-label="Tipo de vista">
          {[['3d', 'En 3D'], ['plano', 'Plano con medidas']].map(([v, txt]) => (
            <button key={v} type="button" onClick={() => setVista(v)} aria-pressed={vista === v}
              className={`px-3 py-1.5 text-sm font-semibold rounded-[2px] transition-colors ${vista === v ? 'bg-tinta text-papel' : 'hover:bg-tinta/8'}`}>
              {txt}
            </button>
          ))}
        </div>
        {vista === '3d' ? <p className="absolute left-4 bottom-3 sm:left-6 sm:bottom-5 text-sm text-grafito pointer-events-none">Arrastra para girarla. {m.nombre} de {config.material}, talla {t.nombre}.</p> : null}
      </section>

      {/* Panel de opciones */}
      <div className="lg:overflow-y-auto lg:overscroll-contain bg-acero-claro flex flex-col">
        <div className="px-4 sm:px-6 pt-6 pb-40 lg:pb-8 grid gap-9">
          <header>
            <h1 className="rotulo text-5xl">Diseña tu bici</h1>
            <p className="mt-2 text-grafito">Elige y mira el precio al momento. En la cita de medición ajustamos el cuadro al milímetro.</p>
            {codigoActual ? <p className="mt-3 text-sm">Guardada como <strong className="numeros">{codigoActual}</strong>.</p> : null}
          </header>

          <Grupo titulo="Modelo">
            <div className="grid gap-2">
              {O.modelos.map((x) => (
                <label key={x.id} className="opcion">
                  <input type="radio" name="modelo" value={x.id} checked={config.modelo === x.id} onChange={() => cambiar('modelo', x.id)} />
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="rotulo text-3xl">{x.nombre}</span>
                    <span className="text-sm text-grafito">{x.tipo}</span>
                  </span>
                  <span className="block mt-1 text-[0.92rem] leading-snug text-grafito">{x.resumen}</span>
                </label>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Tus medidas" ayuda="Descalzo y en centímetros. Es una primera aproximación: en el taller te medimos de verdad.">
            <Medida id="altura" etiqueta="Altura" valor={config.altura} limites={LIMITES.altura} onChange={(v) => cambiar('altura', v)} />
            <Medida id="entrepierna" etiqueta="Entrepierna" valor={config.entrepierna} limites={LIMITES.entrepierna} onChange={(v) => cambiar('entrepierna', v)} />
            <details className="text-[0.92rem] text-grafito">
              <summary className="cursor-pointer font-semibold text-tinta">Cómo medir la entrepierna</summary>
              <p className="mt-2">De pie contra una pared, sin zapatos, coloca un libro entre las piernas con el lomo hacia arriba, apretado como un sillín. Mide desde el lomo hasta el suelo.</p>
            </details>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[['Talla', t.nombre], ['Stack', `${t.stack} mm`], ['Reach', `${t.reach} mm`]].map(([k, v]) => (
                <div key={k} className="bg-papel rounded-[var(--radius-pieza)] py-2">
                  <dt className="text-xs text-grafito">{k}</dt>
                  <dd className="font-semibold numeros">{v}</dd>
                </div>
              ))}
            </dl>
          </Grupo>

          <Grupo titulo="Material">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {O.materiales.map((x) => (
                <label key={x.id} className="opcion">
                  <input type="radio" name="material" value={x.id} checked={config.material === x.id} onChange={() => cambiar('material', x.id)} />
                  <span className="flex justify-between gap-2 font-semibold">
                    {x.nombre}
                    <span className="numeros font-normal text-grafito">{euros(m.cuadro[x.id])}</span>
                  </span>
                  <span className="block mt-1 text-[0.9rem] leading-snug text-grafito">{x.detalle}</span>
                  <span className="block mt-2 text-sm">Unas {x.plazo} semanas</span>
                </label>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Acabado" ayuda={config.material === 'titanio' ? 'El titanio no se pinta: se cepilla a mano.' : 'Pintura al horno en dos capas con barniz. El acero visto deja ver las soldaduras de latón.'}>
            <fieldset>
              <legend className="sr-only">Color del cuadro</legend>
              <div className="flex flex-wrap gap-2.5">
                {O.acabados.filter((x) => vale(x, config)).map((x) => (
                  <label key={x.id} title={x.nombre} className="relative cursor-pointer">
                    <input type="radio" name="acabado" value={x.id} className="peer sr-only" checked={config.acabado === x.id} onChange={() => cambiar('acabado', x.id)} />
                    <span className="block size-11 rounded-full ring-1 ring-tinta/20 peer-checked:ring-[3px] peer-checked:ring-tinta peer-checked:ring-offset-2 peer-checked:ring-offset-acero-claro peer-focus-visible:outline-2 peer-focus-visible:outline-laton peer-focus-visible:outline-offset-4"
                      style={{ background: x.tipo === 'titanio' ? (x.id === 'anodizado' ? 'linear-gradient(135deg,#a9aaa6 45%,#8d84c9 50%,#c7a76a 60%,#a9aaa6 66%)' : 'linear-gradient(135deg,#c8c9c4,#8f908b)') : x.tipo === 'crudo' ? 'radial-gradient(circle at 70% 70%,#c6953f 0 18%,#8d9093 20%)' : x.tipo === 'metal' ? `radial-gradient(circle at 35% 30%, #ffffff55, transparent 45%), ${x.hex}` : x.hex }} />
                    <span className="sr-only">{x.nombre}{x.precio ? `, ${euros(x.precio)} más` : ''}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-[0.95rem]"><strong>{porId(O.acabados, config.acabado).nombre}</strong>{porId(O.acabados, config.acabado).precio ? ` · ${euros(porId(O.acabados, config.acabado).precio)}` : ' · incluido'}</p>
          </Grupo>

          <Lista titulo="Transmisión" nombre="transmision" lista={O.transmisiones} config={config} cambiar={cambiar} />
          <Lista titulo="Ruedas" nombre="ruedas" lista={O.ruedas} config={config} cambiar={cambiar} />

          <Grupo titulo={m.geometria.manillar === 'recto' ? 'Puños' : 'Cinta del manillar'}>
            <div className="flex flex-wrap gap-2">
              {O.cintas.map((x) => (
                <label key={x.id} className="opcion !py-2 !px-3 flex items-center gap-2">
                  <input type="radio" name="cinta" value={x.id} checked={config.cinta === x.id} onChange={() => cambiar('cinta', x.id)} />
                  <span className="size-4 rounded-full ring-1 ring-tinta/25" style={{ background: x.hex }} aria-hidden="true" />
                  {x.nombre}
                </label>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Extras">
            <div className="grid gap-2">
              {O.extras.filter((x) => vale(x, config)).map((x) => (
                <label key={x.id} className="opcion flex items-center gap-3">
                  <input type="checkbox" checked={config.extras.includes(x.id)} onChange={() => alternarExtra(x.id)} />
                  <span aria-hidden="true" className="size-5 shrink-0 rounded-[3px] ring-1.5 ring-tinta/40 grid place-items-center bg-papel shadow-[inset_0_0_0_1.5px_rgb(26_30_33/0.45)]">
                    {config.extras.includes(x.id) ? <svg viewBox="0 0 16 16" className="size-3.5"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg> : null}
                  </span>
                  <span className="flex-1">{x.nombre}</span>
                  <span className="numeros text-grafito text-sm">{euros(x.precio)}</span>
                </label>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Tu bici">
            <table className="w-full text-[0.93rem]">
              <caption className="sr-only">Desglose del precio</caption>
              <tbody>
                {p.lineas.map(([n, c], i) => (
                  <tr key={i} className="border-b border-tinta/10">
                    <th scope="row" className="py-2 pr-3 text-left font-normal">{n}</th>
                    <td className="py-2 text-right numeros whitespace-nowrap">{c ? euros(c) : 'Incluido'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th scope="row" className="pt-3 text-left">Total</th><td className="pt-3 text-right font-semibold numeros">{euros(p.total)}</td></tr>
              </tfoot>
            </table>
            <p className="text-sm text-grafito">Peso aproximado {kg(peso(config))} sin pedales. Entrega en unas {plazo(config)} semanas desde la medición. IGIC incluido.</p>
          </Grupo>
        </div>

        {/* Barra de precio y acciones */}
        <div className="fixed lg:sticky bottom-0 inset-x-0 z-30 mt-auto bg-papel/95 backdrop-blur border-t border-tinta/15 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-grafito">Total, entrega en {plazo(config)} semanas</p>
              <Precio centimos={p.total} className="rotulo text-[2.6rem] leading-none" />
            </div>
            <p className="text-sm text-grafito text-right">Señal para empezar<br /><span className="numeros text-tinta font-semibold">{euros(senal(p.total))}</span></p>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
            <button type="button" className="boton boton-laton" onClick={() => setEncargo(true)}>Encargar</button>
            <button type="button" className="boton boton-linea" onClick={pedirCita}>Pedir cita</button>
            <button type="button" className="boton boton-linea" onClick={compartir}>Guardar</button>
          </div>
          <p className="text-sm mt-2 min-h-5" role="status">{aviso}</p>
        </div>
      </div>

      {encargo ? <Encargo total={p.total} guardar={guardar} cerrar={() => setEncargo(false)} /> : null}
    </div>
  );
}

function Grupo({ titulo, ayuda, children }) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-lg font-semibold">{titulo}</h2>
        {ayuda ? <p className="text-[0.92rem] text-grafito leading-snug">{ayuda}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Lista({ titulo, nombre, lista, config, cambiar }) {
  return (
    <Grupo titulo={titulo}>
      <fieldset className="grid gap-2">
        <legend className="sr-only">{titulo}</legend>
        {lista.filter((x) => vale(x, config)).map((x) => (
          <label key={x.id} className="opcion">
            <input type="radio" name={nombre} value={x.id} checked={config[nombre] === x.id} onChange={() => cambiar(nombre, x.id)} />
            <span className="flex justify-between gap-3 font-semibold leading-snug">
              {x.nombre}
              <span className="numeros font-normal text-grafito whitespace-nowrap">{euros(x.precio)}</span>
            </span>
            <span className="block mt-1 text-[0.9rem] leading-snug text-grafito">{x.detalle}</span>
          </label>
        ))}
      </fieldset>
    </Grupo>
  );
}

function Medida({ id, etiqueta, valor, limites, onChange }) {
  const [texto, setTexto] = useState(String(valor));
  useEffect(() => setTexto(String(valor)), [valor]);
  return (
    <div className="grid grid-cols-[1fr_6.5rem] items-center gap-3">
      <div>
        <label htmlFor={`${id}-r`} className="etiqueta !mb-1">{etiqueta}</label>
        <input id={`${id}-r`} type="range" min={limites[0]} max={limites[1]} value={valor} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[var(--color-laton-vivo)]" aria-valuetext={`${valor} centímetros`} />
      </div>
      <div className="relative">
        <input type="number" inputMode="numeric" min={limites[0]} max={limites[1]} aria-label={`${etiqueta} en centímetros`} className="campo pr-10 numeros"
          value={texto} onChange={(e) => setTexto(e.target.value)} onBlur={() => onChange(Number(texto) || valor)}
          onKeyDown={(e) => { if (e.key === 'Enter') onChange(Number(texto) || valor); }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-grafito text-sm pointer-events-none">cm</span>
      </div>
    </div>
  );
}

// Encargo con señal: se guarda la configuración y se crea el pedido. Con Stripe, se paga allí.
function Encargo({ total, guardar, cerrar }) {
  const ref = useRef();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(contactoVacio);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { ref.current?.showModal(); }, []);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true); setError(''); setErrores({});
    try {
      const configuracion = await guardar();
      const r = await api('/pedidos', { metodo: 'POST', datos: { ...datos, configuracion } });
      try { localStorage.removeItem(BORRADOR); } catch { /* nada */ }
      if (r.url) { window.location.href = r.url; return; }
      navegar(`/pedido/${r.codigo}?t=${r.token}`);
    } catch (err) {
      setError(err.message); setErrores(err.campos || {}); setEnviando(false);
    }
  }

  return (
    <dialog ref={ref} onClose={cerrar} aria-labelledby="encargo-t" className="m-auto w-[min(34rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-[4px] bg-acero-claro p-0 backdrop:bg-tinta/60">
      <form onSubmit={enviar} noValidate className="p-6 grid gap-5">
        <div>
          <h2 id="encargo-t" className="rotulo text-5xl">Encarga tu bici</h2>
          <p className="mt-2 text-grafito">Pagas ahora la señal de <strong className="text-tinta numeros">{euros(senal(total))}</strong> (el 30 %) y el resto cuando la recojas. Después te llamamos para la cita de medición, que va incluida.</p>
        </div>
        <DatosContacto datos={datos} set={setDatos} errores={errores} />
        {error ? <p className="error-campo" role="alert">{error}</p> : null}
        <div className="flex flex-wrap gap-2 justify-end">
          <button type="button" className="boton boton-linea" onClick={() => ref.current?.close()}>Seguir configurando</button>
          <button className="boton boton-laton" disabled={enviando}>{enviando ? 'Un momento…' : `Pagar la señal de ${euros(senal(total))}`}</button>
        </div>
        <p className="text-sm text-grafito">Puedes cancelar sin coste hasta que aprobemos juntos el plano del cuadro. Lee las <a className="underline" href={`${import.meta.env.BASE_URL}legal/condiciones`} target="_blank" rel="noopener">condiciones de encargo</a>.</p>
      </form>
    </dialog>
  );
}
