// Tarjeta de producto: la funda con el disco asomando. Al pasar el ratón (o enfocar),
// el disco sale un poco de la funda y empieza a girar.
import { Link } from 'react-router';
import Portada from './Portada.jsx';
import Vinilo from './Vinilo.jsx';
import Tocadiscos from './Tocadiscos.jsx';
import { euros } from '../lib/formato.js';

export function Grado({ disco, funda }) {
  if (!disco) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cobalto-claro text-cobalto-hondo text-xs font-semibold px-2 py-0.5" title="Estado del disco / de la funda">
      {disco}
      {funda ? <span className="font-normal">/ {funda}</span> : null}
    </span>
  );
}

export default function Tarjeta({ producto: p, prioridad = false }) {
  const vendido = p.stock <= 0;
  const esDisco = p.tipo === 'vinilo';
  return (
    <article className="group relative">
      {/* La imagen también enlaza, pero el enlace accesible es el del título (sin duplicar paradas de tabulador) */}
      <Link to={`/producto/${p.slug}`} className="block rounded-[var(--radius-funda)]" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-square">
          {esDisco ? (
            <div className="absolute inset-[4%] transition-transform duration-500 ease-[var(--ease-salida)] group-hover:translate-x-[22%] group-focus-within:translate-x-[22%] motion-reduce:transition-none">
              <Vinilo producto={p} className="disco-tarjeta" />
            </div>
          ) : null}
          <div className={`relative h-full overflow-hidden rounded-[var(--radius-funda)] shadow-[0_1px_0_rgba(0,0,0,0.06),0_12px_24px_-14px_rgba(22,24,26,0.45)] transition-transform duration-500 ease-[var(--ease-salida)] ${esDisco ? 'group-hover:-translate-x-[6%]' : ''} ${p.tipo === 'tocadiscos' ? 'bg-carton' : ''}`}>
            {p.tipo === 'tocadiscos' ? (
              <div className="p-[8%] h-full grid place-items-center"><Tocadiscos producto={p} /></div>
            ) : (
              <Portada producto={p} decorativa />
            )}
            {vendido ? <span className="absolute left-3 top-3 rounded-full bg-tinta text-white text-xs font-semibold px-2.5 py-1">Vendido</span> : null}
          </div>
        </div>
      </Link>
      <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
        <div className="min-w-0">
          <Link to={`/producto/${p.slug}`} className="block rounded focus-visible:outline-offset-2 hover:underline underline-offset-4 decoration-1">
            {p.artista ? <span className="block font-semibold leading-tight truncate">{p.artista}</span> : null}
            <span className={`block ${p.artista ? 'text-gris' : 'font-semibold'} leading-snug line-clamp-2`}>{p.titulo}</span>
            {vendido ? <span className="sr-only">, vendido</span> : null}
          </Link>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gris">
            <Grado disco={p.estado_disco} funda={p.estado_funda} />
            {p.anio ? <span>{p.anio}</span> : null}
            {p.formato && p.formato !== 'LP' ? <span>{p.formato}</span> : null}
          </p>
        </div>
        <p className={`shrink-0 font-semibold tabular-nums order-first sm:order-none ${vendido ? 'text-gris line-through' : ''}`}>{euros(p.precio)}</p>
      </div>
    </article>
  );
}

export function TarjetaVacia() {
  return (
    <div aria-hidden="true">
      <div className="aspect-square rounded-[var(--radius-funda)] bg-carton/70 animate-pulse" />
      <div className="mt-3 h-4 w-2/3 rounded bg-carton/70" />
      <div className="mt-2 h-4 w-1/2 rounded bg-carton/50" />
    </div>
  );
}
