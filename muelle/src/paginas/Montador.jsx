import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Check, ShoppingBag, TriangleAlert } from 'lucide-react';
import Cifra from '../componentes/Cifra.jsx';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { api } from '../lib/api.js';
import { useTienda } from '../contexto/Tienda.jsx';
import { MONTADOR as M, BUILD_INICIAL, normalizarBuild, precioBuild, packsNecesarios, porId } from '../lib/montador.js';
import { Probador, BotonSonido } from '../componentes/Probador.jsx';
import Teclado2D from '../componentes/Teclado2D.jsx';
import { InterruptorSVG } from '../componentes/Piezas.jsx';
import { DISTRIBUCIONES } from '../lib/distribuciones.js';
import { combinar, pulsar, despertar } from '../lib/sonido.js';
import { euros, FAMILIAS } from '../lib/formato.js';
import { volarACesta } from '../lib/vuelo.js';

const BORRADOR = 'muelle:montaje';
const leer = () => { try { return JSON.parse(localStorage.getItem(BORRADOR) || 'null'); } catch { return null; } };

export default function Montador() {
  usarTitulo('Monta tu teclado');
  const [q] = useSearchParams();
  const { datos } = usarDatos('/montador/piezas', 'piezas');
  const interruptores = datos?.interruptores ?? [];
  const juegos = datos?.teclas ?? [];
  const [b, setB] = useState(() => ({ ...BUILD_INICIAL, ...(leer() || {}), ...(q.get('interruptor') ? { interruptor: Number(q.get('interruptor')) } : {}), ...(q.get('teclas') ? { teclas: Number(q.get('teclas')) } : {}) }));
  const build = useMemo(() => normalizarBuild(b, interruptores, juegos), [b, interruptores, juegos]);
  useEffect(() => { try { localStorage.setItem(BORRADOR, JSON.stringify(build)); } catch { /* sin almacenamiento */ } }, [build]);

  const sw = interruptores.find((x) => x.id === build.interruptor);
  const juego = juegos.find((x) => x.id === build.teclas);
  const carcasa = porId(M.carcasas, build.carcasa);
  const color = porId(carcasa.colores, build.color);
  const local = precioBuild(build, sw, juego);
  const packs = packsNecesarios(build.formato);
  const cambiar = (k, v) => setB((x) => ({ ...x, ...build, [k]: v }));

  const { anadirMontaje, avisar, sesion } = useTienda();

  // El servidor confirma precio y stock cada vez que cambia el montaje
  const [servidor, setServidor] = useState({ estado: 'cargando' });
  useEffect(() => {
    if (!sw || !juego || sesion.cargando) return;
    const t = setTimeout(() => {
      setServidor({ estado: 'cargando' });
      api('/montador/presupuesto', { metodo: 'POST', datos: { montaje: build } })
        .then((r) => setServidor({ estado: 'ok', ...r }))
        .catch((e) => setServidor({ estado: 'error', error: e.message }));
    }, 250);
    return () => clearTimeout(t);
  }, [build, sw, juego, sesion.cargando]);

  const total = servidor.estado === 'ok' ? servidor.total : local.total;
  const disponible = servidor.estado !== 'ok' || servidor.disponible;
  const vista = { formato: build.formato, colores: juego?.specs?.colores, carcasa: { hex: color.hex, material: carcasa.id }, placa: build.placa, interruptor: sw?.color, sonido: sw?.specs?.sonido };

  function comprar(e) {
    if (servidor.estado !== 'ok') return;
    const r = anadirMontaje({ montaje: servidor.montaje, titulo: servidor.titulo, precio: servidor.total, vista });
    if (r !== 'tope') volarACesta(e?.currentTarget);
    if (r === 'tope') avisar('Ya tienes tres iguales', 'Si necesitas más, escríbenos.', 'error');
    else avisar('Teclado a medida en la cesta', servidor.titulo);
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_30rem] lg:h-[calc(100dvh-68px-var(--alto-aviso,0px))]">
      {/* Escenario */}
      <section aria-label="Tu teclado" className="sticky top-[68px] z-10 lg:relative lg:top-0 lg:z-0 textura-placa border-b lg:border-b-0 lg:border-r border-mascara-borde h-[42svh] lg:h-auto flex flex-col">
        <div className="flex-1 min-h-0 grid place-items-center px-4">
          {sw && juego ? (
            <Probador formato={build.formato} colores={vista.colores} carcasa={vista.carcasa} placa={build.placa} interruptor={sw.color} sonido={sw.specs?.sonido}
              distancia={{ 60: 0.4, 65: 0.44, 75: 0.47, tkl: 0.54 }[build.formato]} className="w-full h-full max-h-full" etiqueta={`Tu teclado ${porId(M.formatos, build.formato).nombre}. Escribe para oírlo.`} />
          ) : <div className="w-full max-w-2xl h-48 rounded bg-mascara-alta animate-pulse" aria-hidden="true" />}
        </div>
        <div className="hidden lg:flex items-center justify-between gap-4 px-8 pb-6 text-sm text-serigrafia-tenue">
          <p>Escribe en tu teclado: suena con los interruptores {sw?.titulo}, placa de {porId(M.placas, build.placa).nombre.toLowerCase()} y carcasa de {carcasa.nombre.toLowerCase()}.</p>
          <BotonSonido />
        </div>
      </section>

      {/* Estaciones */}
      <div className="lg:overflow-y-auto lg:overscroll-contain bg-mascara-honda flex flex-col">
        <div className="px-4 sm:px-6 pt-7 pb-44 lg:pb-8 grid gap-10">
          <header>
            <h1 className="serigrafia text-5xl">Monta tu teclado</h1>
            <p className="mt-2 text-serigrafia-tenue">Cinco estaciones, en orden. Lo montamos y lo probamos en 5 días laborables.</p>
          </header>

          <Estacion n={1} titulo="Formato">
            <div className="grid grid-cols-2 gap-2">
              {M.formatos.map((f) => (
                <label key={f.id} className="huella-opcion">
                  <input type="radio" name="formato" checked={build.formato === f.id} onChange={() => cambiar('formato', f.id)} />
                  <Teclado2D formato={f.id} colores={juego?.specs?.colores} carcasa={color.hex} rotulos={false} className="w-full h-auto" titulo="" />
                  <span className="mt-2 flex justify-between items-baseline"><span className="serigrafia text-xl">{f.nombre}</span><span className="text-xs text-serigrafia-tenue numeros">{f.teclas} teclas</span></span>
                </label>
              ))}
            </div>
            <p className="text-sm text-serigrafia-tenue">{DISTRIBUCIONES[build.formato].detalle}</p>
          </Estacion>

          <Estacion n={2} titulo="Carcasa">
            <div className="grid gap-2">
              {M.carcasas.map((c) => (
                <label key={c.id} className="huella-opcion">
                  <input type="radio" name="carcasa" checked={build.carcasa === c.id} onChange={() => setB((x) => ({ ...x, ...build, carcasa: c.id, color: c.colores[0].id }))} />
                  <span className="flex justify-between gap-3 font-semibold">{c.nombre}<span className="numeros font-normal text-serigrafia-tenue">{c.precio ? `+${euros(c.precio)}` : 'Incluida'}</span></span>
                  <span className="block mt-1 text-sm text-serigrafia-tenue">{c.detalle}</span>
                </label>
              ))}
            </div>
            <fieldset>
              <legend className="text-sm font-semibold mb-2">Color: {color.nombre}</legend>
              <div className="flex flex-wrap gap-2.5">
                {carcasa.colores.map((c) => (
                  <label key={c.id} title={c.nombre} className="cursor-pointer">
                    <input type="radio" name="color" className="peer sr-only" checked={build.color === c.id} onChange={() => cambiar('color', c.id)} />
                    <span className="block size-10 rounded-full ring-1 ring-white/20 peer-checked:ring-[3px] peer-checked:ring-cobre peer-checked:ring-offset-2 peer-checked:ring-offset-mascara-honda peer-focus-visible:outline-2 peer-focus-visible:outline-cobre-vivo peer-focus-visible:outline-offset-4" style={{ background: c.hex }} />
                    <span className="sr-only">{c.nombre}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Estacion>

          <Estacion n={3} titulo="Placa" ayuda="Cambia el sonido: escribe después de elegir para notarlo.">
            <div className="grid grid-cols-2 gap-2">
              {M.placas.map((pl) => (
                <label key={pl.id} className="huella-opcion">
                  <input type="radio" name="placa" checked={build.placa === pl.id} onChange={() => { cambiar('placa', pl.id); despertar(); if (sw) pulsar(combinar(sw.specs?.sonido, pl.id, build.carcasa)); }} />
                  <span className="flex justify-between gap-2 font-semibold">{pl.nombre}<span className="numeros font-normal text-serigrafia-tenue text-sm">{pl.precio ? `+${euros(pl.precio)}` : 'Incluida'}</span></span>
                  <span className="block mt-1 text-sm text-serigrafia-tenue leading-snug">{pl.detalle}</span>
                </label>
              ))}
            </div>
          </Estacion>

          <Estacion n={4} titulo="Interruptores" ayuda={`Tu formato lleva ${packs} packs de 10. Púlsalos para oírlos.`}>
            <div className="grid gap-2">
              {interruptores.map((x) => {
                const falta = x.stock < packs;
                return (
                  <label key={x.id} className="huella-opcion grid grid-cols-[3rem_1fr_auto] items-center gap-3">
                    <input type="radio" name="interruptor" disabled={falta} checked={build.interruptor === x.id}
                      onChange={() => { cambiar('interruptor', x.id); despertar(); pulsar(combinar(x.specs?.sonido, build.placa, build.carcasa)); }} />
                    <InterruptorSVG color={x.color} familia={x.familia} className="h-11 w-auto" />
                    <span>
                      <span className="block font-semibold">{x.titulo}</span>
                      <span className="block text-sm text-serigrafia-tenue">{FAMILIAS[x.familia]?.nombre}, {x.specs?.fuerza} g{falta ? `. No quedan ${packs} packs` : ''}</span>
                    </span>
                    <span className="numeros text-sm text-serigrafia-tenue">{euros(x.precio * packs)}</span>
                  </label>
                );
              })}
            </div>
          </Estacion>

          <Estacion n={5} titulo="Teclas">
            <div className="grid grid-cols-2 gap-2">
              {juegos.map((j) => (
                <label key={j.id} className="huella-opcion">
                  <input type="radio" name="teclas" disabled={j.stock < 1} checked={build.teclas === j.id} onChange={() => cambiar('teclas', j.id)} />
                  <Teclado2D formato="60" colores={j.specs?.colores} carcasa="#1e102f" rotulos={false} className="w-full h-auto" titulo="" />
                  <span className="mt-2 flex justify-between items-baseline gap-2"><span className="serigrafia text-lg">{j.titulo}</span><span className="numeros text-sm text-serigrafia-tenue">{euros(j.precio)}</span></span>
                  {j.stock < 1 ? <span className="text-xs text-alerta">Agotado</span> : null}
                </label>
              ))}
            </div>
          </Estacion>

          <section className="grid gap-3">
            <h2 className="serigrafia text-2xl">Extras</h2>
            {M.extras.map((e) => {
              const marcado = build.extras.includes(e.id);
              const precio = e.precioPorTecla ? e.precioPorTecla * porId(M.formatos, build.formato).teclas : e.precio;
              return (
                <label key={e.id} className="huella-opcion grid grid-cols-[1.5rem_1fr_auto] gap-3 items-start">
                  <input type="checkbox" checked={marcado} onChange={() => cambiar('extras', marcado ? build.extras.filter((x) => x !== e.id) : [...build.extras, e.id])} />
                  <span aria-hidden="true" className={`mt-0.5 size-5 rounded-[3px] grid place-items-center ${marcado ? 'bg-cobre text-mascara-honda' : 'shadow-[inset_0_0_0_1.5px_var(--color-mascara-borde)]'}`}>{marcado ? <Check size={14} strokeWidth={3} /> : null}</span>
                  <span><span className="block font-semibold">{e.nombre}</span><span className="block text-sm text-serigrafia-tenue">{e.detalle}</span></span>
                  <span className="numeros text-sm text-serigrafia-tenue">{euros(precio)}</span>
                </label>
              );
            })}
          </section>

          <section className="grid gap-2" aria-labelledby="desglose-t">
            <h2 id="desglose-t" className="serigrafia text-2xl">Desglose</h2>
            <table className="w-full text-[0.93rem]">
              <tbody>
                {(servidor.estado === 'ok' ? servidor.lineas : local.lineas).map(([n, c], i) => (
                  <tr key={i} className="border-b border-mascara-borde/70">
                    <th scope="row" className="py-2 pr-3 text-left font-normal">{n}</th>
                    <td className="py-2 text-right numeros whitespace-nowrap">{c ? euros(c) : 'Incluido'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-serigrafia-tenue">IVA incluido. Envío gratis a la península.</p>
          </section>
        </div>

        {/* Barra de total */}
        <div className="fixed lg:sticky bottom-0 inset-x-0 z-30 mt-auto bg-mascara/95 backdrop-blur border-t border-mascara-borde px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-serigrafia-tenue" role="status">
                {servidor.estado === 'cargando' ? 'Comprobando stock…' : servidor.estado === 'error' ? servidor.error : disponible ? 'Precio y stock comprobados' : 'Falta stock de alguna pieza'}
              </p>
              <p className="serigrafia text-[2.4rem] leading-none text-cobre-vivo numeros"><Cifra valor={total / 100} moneda /></p>
            </div>
            <button type="button" className="pad !min-h-12 !px-5" disabled={servidor.estado !== 'ok' || !disponible} onClick={comprar}>
              {disponible ? <ShoppingBag size={18} aria-hidden="true" /> : <TriangleAlert size={18} aria-hidden="true" />} Añadir a la cesta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Estacion({ n, titulo, ayuda, children }) {
  return (
    <section className="grid gap-3" aria-labelledby={`est-${n}`}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid place-items-center size-9 rounded-full bg-cobre text-mascara-honda serigrafia">{n}</span>
        <div>
          <h2 id={`est-${n}`} className="serigrafia text-2xl leading-none"><span className="sr-only">Paso {n}: </span>{titulo}</h2>
          {ayuda ? <p className="text-sm text-serigrafia-tenue mt-1">{ayuda}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
