import { Link } from 'react-router';
import { Tilt } from './unlumen/tilt.jsx';
import { Miniatura } from './Piezas.jsx';
import { euros, FAMILIAS } from '../lib/formato.js';

// Tarjeta de producto como huella de componente: silueta serigrafiada, designador y pads.
// La inclinación al pasar el ratón es el Tilt de unlumen UI.
export default function Tarjeta({ producto: p }) {
  const agotado = p.stock <= 0;
  const detalle = p.tipo === 'interruptores' ? `${FAMILIAS[p.familia]?.nombre}, ${p.specs?.fuerza} g, pack de 10`
    : p.tipo === 'teclas' ? `Perfil ${p.specs?.perfil}, ${p.specs?.material}`
      : p.tipo === 'teclado' ? `Formato ${p.formato === 'tkl' ? 'TKL' : p.formato + ' %'}, montado` : p.resumen;
  return (
    <article className="group revela">
      <Tilt rotationFactor={6} className="relative rounded-[var(--radius-pad)]">
        <Link viewTransition to={`/producto/${p.slug}`} className="block rounded-[var(--radius-pad)]" tabIndex={-1} aria-hidden="true">
          <div className="relative aspect-[4/3] rounded-[var(--radius-pad)] bg-mascara-honda shadow-[inset_0_0_0_1px_var(--color-mascara-borde)] p-5 transition-shadow group-hover:shadow-[inset_0_0_0_1.5px_var(--color-cobre)]">
            {/* silueta serigrafiada de la huella */}
            <span aria-hidden="true" className="absolute inset-2.5 rounded-[3px] border border-dashed border-mascara-borde" />
            <span aria-hidden="true" className="designador absolute left-4 top-3">{p.designador}</span>
            <Miniatura producto={p} className="relative w-full h-full" />
            {agotado ? <span className="absolute right-3 top-3 rounded bg-serigrafia text-mascara-honda text-xs font-bold px-2 py-1">Agotado</span>
              : p.stock <= 10 && p.tipo !== 'teclado' ? <span className="absolute right-3 top-3 rounded bg-cobre text-mascara-honda text-xs font-bold px-2 py-1">Quedan {p.stock}</span> : null}
          </div>
        </Link>
      </Tilt>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="serigrafia text-xl leading-tight"><Link viewTransition to={`/producto/${p.slug}`} className="hover:text-cobre-vivo rounded">{p.titulo}{agotado ? <span className="sr-only">, agotado</span> : null}</Link></h3>
          <p className="text-sm text-serigrafia-tenue mt-0.5 line-clamp-1">{detalle}</p>
        </div>
        <p className={`numeros font-semibold whitespace-nowrap ${agotado ? 'text-serigrafia-tenue line-through' : 'text-cobre-vivo'}`}>{euros(p.precio)}</p>
      </div>
    </article>
  );
}

export function TarjetaVacia() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/3] rounded bg-mascara-alta animate-pulse" />
      <div className="mt-3 h-5 w-2/3 rounded bg-mascara-alta animate-pulse" />
    </div>
  );
}
