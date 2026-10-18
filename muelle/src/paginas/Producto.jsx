import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Minus, Plus, ShoppingBag, Wrench } from 'lucide-react';
import Cifra from '../componentes/Cifra.jsx';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { useTienda } from '../contexto/Tienda.jsx';
import { Probador, BotonSonido } from '../componentes/Probador.jsx';
import { InterruptorSVG, Miniatura } from '../componentes/Piezas.jsx';
import CurvaFuerza from '../componentes/CurvaFuerza.jsx';
import Tarjeta from '../componentes/Tarjeta.jsx';
import ClickSpark from '../componentes/rb/ClickSpark.jsx';
import { Panel } from '../componentes/Placa.jsx';
import { combinar, pulsar, soltar, despertar } from '../lib/sonido.js';
import { euros, FAMILIAS, TIPOS } from '../lib/formato.js';
import { MONTADOR, porId } from '../lib/montador.js';
import NoEncontrada from './NoEncontrada.jsx';
import { volarACesta } from '../lib/vuelo.js';

const CARCASA_DEMO = { hex: '#24152f', material: 'aluminio' };
const SECCION = { teclado: 'teclados', interruptores: 'interruptores', teclas: 'teclas', accesorio: 'accesorios' };

export default function Producto() {
  const { slug } = useParams();
  const { datos, cargando, error } = usarDatos(`/productos/${slug}`, `producto:${slug}`);
  const p = datos?.producto;
  usarTitulo(p?.titulo ?? (error ? 'Producto no encontrado' : null));
  if (error?.estado === 404) return <NoEncontrada titulo="Este producto ya no está en la tienda" />;
  if (cargando || !p) return <div className="min-h-[70vh]" aria-busy="true" />;
  return (
    <>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pt-8">
        <nav aria-label="Migas" className="text-sm text-serigrafia-tenue">
          <Link viewTransition to="/tienda" className="hover:text-serigrafia">Tienda</Link> <span aria-hidden="true">/</span>{' '}
          <Link viewTransition to={`/tienda/${SECCION[p.tipo]}`} className="hover:text-serigrafia">{TIPOS[p.tipo]}</Link>
        </nav>
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
          <Vista p={p} />
          <Compra p={p} />
        </div>
        <Ficha p={p} />
      </div>
      {datos.relacionados?.length ? (
        <section aria-labelledby="rel-t" className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 mt-24">
          <h2 id="rel-t" className="serigrafia text-3xl">También en {TIPOS[p.tipo].toLowerCase()}</h2>
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{datos.relacionados.map((r) => <Tarjeta key={r.id} producto={r} />)}</div>
        </section>
      ) : null}
    </>
  );
}

// La parte visual: se oye y se ve lo que se compra
function Vista({ p }) {
  const [formato, setFormato] = useState('65');
  if (p.tipo === 'teclado' && p.vista) {
    return (
      <div>
        <Probador formato={p.vista.formato} colores={p.vista.colores} carcasa={p.vista.carcasa} placa={p.vista.placa} interruptor={p.vista.interruptor} sonido={p.vista.sonido}
          distancia={p.vista.formato === 'tkl' ? 0.4 : 0.34} className="aspect-[16/10] w-full rounded-[var(--radius-placa)] bg-mascara-honda" etiqueta={`${p.titulo}. Escribe para oírlo.`} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-serigrafia-tenue"><p>Escribe en tu teclado para oír este teclado tal cual sale del taller.</p><BotonSonido /></div>
      </div>
    );
  }
  if (p.tipo === 'interruptores') return <VistaInterruptor p={p} />;
  if (p.tipo === 'teclas') {
    return (
      <div>
        <Probador formato={formato} colores={p.specs?.colores} carcasa={CARCASA_DEMO} distancia={formato === 'tkl' ? 0.4 : 0.32}
          className="aspect-[16/10] w-full rounded-[var(--radius-placa)] bg-mascara-honda" etiqueta={`Juego de teclas ${p.titulo} sobre un teclado ${formato}`} />
        <div className="mt-3 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Ver en el formato">
          <span className="text-sm text-serigrafia-tenue mr-1">Ver en:</span>
          {MONTADOR.formatos.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={formato === f.id} onClick={() => setFormato(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${formato === f.id ? 'bg-cobre text-mascara-honda' : 'shadow-[inset_0_0_0_1.5px_var(--color-mascara-borde)]'}`}>{f.nombre}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <Panel className="aspect-[4/3] grid place-items-center p-10">
      <Miniatura producto={p} className="w-2/3 h-2/3" />
    </Panel>
  );
}

function VistaInterruptor({ p }) {
  const [hundido, setHundido] = useState(false);
  const s = combinar(p.specs?.sonido, 'aluminio', 'aluminio');
  return (
    <div className="grid gap-4">
      <Panel className="grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 p-8 sm:p-10 items-center">
        <ClickSpark sparkRadius={28} sparkCount={10}>
          <button type="button" className="group grid w-full place-items-center rounded-[var(--radius-pad)] py-6 bg-mascara-honda shadow-[inset_0_0_0_1px_var(--color-mascara-borde)] active:shadow-[inset_0_0_0_2px_var(--color-cobre)]"
            onPointerDown={() => { despertar(); setHundido(true); pulsar(s); }} onPointerUp={() => { setHundido(false); soltar(s); }} onPointerLeave={() => setHundido(false)}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) { setHundido(true); pulsar(s); } } }}
            onKeyUp={() => { setHundido(false); soltar(s); }}>
            <InterruptorSVG color={p.color} familia={p.familia} hundido={hundido} className="h-40 w-auto" />
            <span className="mt-3 serigrafia text-lg">Púlsalo</span>
          </button>
        </ClickSpark>
        <figure>
          <CurvaFuerza familia={p.familia} fuerza={p.specs?.fuerza} recorrido={p.specs?.recorrido} className="w-full h-auto" />
          <figcaption className="designador mt-2">Curva de fuerza del {p.titulo}</figcaption>
        </figure>
      </Panel>
      <div>
        <h2 className="serigrafia text-2xl">En un teclado completo</h2>
        <p className="text-serigrafia-tenue mt-1">Escribe para oír 69 interruptores {p.titulo} sobre placa de aluminio.</p>
        <Probador formato="65" carcasa={{ hex: '#24152f', material: 'aluminio' }} interruptor={p.color} sonido={p.specs?.sonido} distancia={0.32} className="mt-4 aspect-[16/9] w-full rounded-[var(--radius-placa)] bg-mascara-honda" etiqueta={`Teclado con interruptores ${p.titulo}`} />
      </div>
    </div>
  );
}

function Compra({ p }) {
  const { anadir, avisar } = useTienda();
  const [cantidad, setCantidad] = useState(p.tipo === 'interruptores' ? 7 : 1);
  const max = Math.max(0, Math.min(p.stock, p.tipo === 'interruptores' ? 20 : 5));
  const agotado = p.stock <= 0;
  const detalle = p.tipo === 'interruptores' ? `${FAMILIAS[p.familia]?.nombre}, ${p.specs?.fuerza} g, pack de 10` : p.tipo === 'teclas' ? `Perfil ${p.specs?.perfil}, ${p.specs?.material}` : p.tipo === 'teclado' ? 'Montado y probado en Valencia' : null;

  function comprar(e) {
    const r = anadir(p, Math.min(cantidad, max));
    if (r !== 'tope') volarACesta(e?.currentTarget);
    if (r === 'tope') avisar('No quedan más', `Ya tienes en la cesta todo el stock de ${p.titulo}.`, 'error');
    else avisar(`${p.titulo} en la cesta`, p.tipo === 'interruptores' ? `${cantidad * 10} interruptores` : '');
  }

  return (
    <div className="lg:sticky lg:top-24">
      <h1 className="serigrafia text-[clamp(2.4rem,4.6vw,3.8rem)]">{p.titulo}</h1>
      {detalle ? <p className="mt-2 text-serigrafia-tenue">{detalle}</p> : null}
      <p className="mt-5 text-lg max-w-[52ch]">{p.resumen}</p>
      <p className="mt-6 serigrafia text-4xl text-cobre-vivo numeros">
        <Cifra valor={(p.precio * (p.tipo === 'interruptores' ? cantidad : 1)) / 100} moneda />
      </p>
      {p.tipo === 'interruptores' ? <p className="text-sm text-serigrafia-tenue">{euros(p.precio)} cada pack de 10</p> : null}

      {agotado ? (
        <p className="mt-6 plano p-4">Agotado. Volverá en unas semanas: mientras, el montador te propone alternativas.</p>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {max > 1 ? (
            <div className="flex items-center rounded shadow-[inset_0_0_0_1.5px_var(--color-mascara-borde)]" role="group" aria-label="Cantidad">
              <button type="button" className="grid place-items-center size-12 disabled:opacity-40" aria-label="Uno menos" disabled={cantidad <= 1} onClick={() => setCantidad((c) => c - 1)}><Minus size={17} /></button>
              <span className="w-12 text-center numeros text-lg" aria-live="polite"><Cifra valor={cantidad} /></span>
              <button type="button" className="grid place-items-center size-12 disabled:opacity-40" aria-label="Uno más" disabled={cantidad >= max} onClick={() => setCantidad((c) => c + 1)}><Plus size={17} /></button>
            </div>
          ) : null}
          <button type="button" className="pad text-lg !min-h-12 !px-6" onClick={comprar}><ShoppingBag size={18} aria-hidden="true" /> Añadir a la cesta</button>
        </div>
      )}
      {p.tipo === 'interruptores' ? (
        <p className="mt-4 text-sm text-serigrafia-tenue max-w-[48ch]">
          Cuántos packs necesitas: {MONTADOR.formatos.map((f) => `${f.nombre}, ${Math.ceil(f.teclas / 10)}`).join('; ')}. Si te sobra alguno, mejor: siempre viene bien tener repuestos.
        </p>
      ) : null}
      {p.stock > 0 && p.stock <= 5 ? <p className="mt-3 text-sm text-cobre-vivo">Quedan {p.stock}.</p> : null}
      {p.tipo !== 'teclado' && p.tipo !== 'accesorio' ? (
        <Link viewTransition to={`/montador?${p.tipo === 'interruptores' ? 'interruptor' : 'teclas'}=${p.id}`} className="pad-linea mt-6"><Wrench size={16} aria-hidden="true" /> Montar un teclado con {p.tipo === 'interruptores' ? 'estos interruptores' : 'estas teclas'}</Link>
      ) : null}
    </div>
  );
}

function Ficha({ p }) {
  const filas = [];
  if (p.tipo === 'interruptores') filas.push(['Tipo', FAMILIAS[p.familia]?.nombre], ['Fuerza de activación', `${p.specs?.fuerza} g`], ['Recorrido total', `${String(p.specs?.recorrido).replace('.', ',')} mm`], ['Carcasa', p.specs?.carcasa], ['Pines', p.specs?.pines], ['Unidades por pack', p.specs?.pack]);
  if (p.tipo === 'teclas') filas.push(['Perfil', p.specs?.perfil], ['Material', p.specs?.material], ['Distribución', 'ISO española (Ñ, Ç)'], ['Formatos', '60 %, 65 %, 75 % y TKL']);
  if (p.tipo === 'teclado' && p.specs?.montaje) {
    const m = p.specs.montaje;
    const carcasa = porId(MONTADOR.carcasas, m.carcasa);
    filas.push(['Formato', porId(MONTADOR.formatos, m.formato)?.nombre], ['Carcasa', `${carcasa?.nombre}, ${porId(carcasa?.colores ?? [], m.color)?.nombre.toLowerCase()}`], ['Placa', porId(MONTADOR.placas, m.placa)?.nombre], ['Conexión', 'USB-C'], ['Interruptores', 'Hot-swap, 3 y 5 pines']);
  }
  return (
    <section aria-labelledby="ficha-t" className="mt-16 grid gap-10 lg:grid-cols-2">
      <div>
        <h2 id="ficha-t" className="serigrafia text-3xl">Cómo es</h2>
        <p className="mt-4 text-serigrafia-tenue max-w-[64ch]">{p.descripcion}</p>
      </div>
      {filas.length ? (
        <dl className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] border-t border-mascara-borde">
          {filas.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="py-3 border-b border-mascara-borde text-serigrafia-tenue">{k}</dt>
              <dd className="py-3 border-b border-mascara-borde font-semibold numeros">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
