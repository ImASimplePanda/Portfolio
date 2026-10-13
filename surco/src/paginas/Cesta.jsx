import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Add01Icon, MinusSignIcon } from '@hugeicons/core-free-icons';
import Portada from '../componentes/Portada.jsx';
import Tocadiscos from '../componentes/Tocadiscos.jsx';
import { useTienda } from '../contexto/Tienda.jsx';
import { api } from '../lib/api.js';
import { euros } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarDatos.js';

export function Miniatura({ p }) {
  return (
    <div className={`size-20 sm:size-24 shrink-0 rounded-[var(--radius-funda)] overflow-hidden ${p.tipo === 'tocadiscos' ? 'bg-carton p-1.5' : ''}`}>
      {p.tipo === 'tocadiscos' ? <Tocadiscos producto={p} /> : <Portada producto={p} tamanos="96px" />}
    </div>
  );
}

export default function Cesta() {
  usarTitulo('Tu cesta');
  const { cesta, subtotal, quitar, cambiarCantidad, sincronizar, sesion } = useTienda();
  const [params] = useSearchParams();
  const [comprobando, setComprobando] = useState(false);

  // Al entrar, se comprueba la cesta con la tienda: precio actual y si sigue disponible
  useEffect(() => {
    if (sesion.cargando || !cesta.length) return;
    setComprobando(true);
    api('/cesta', { metodo: 'POST', datos: { lineas: cesta.map((x) => ({ id: x.id })) } })
      .then((r) => sincronizar(r.lineas))
      .catch(() => {})
      .finally(() => setComprobando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion.cargando]);

  const agotados = cesta.filter((x) => x.agotado);

  if (!cesta.length) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-24 text-center">
        <h1 className="rotulo text-[clamp(2.6rem,6vw,4.4rem)]">Tu cesta está vacía</h1>
        <p className="mt-4 text-gris text-lg">Los discos buenos se van rápido. Échale un ojo a lo que acaba de llegar.</p>
        <Link to="/discos" className="boton mt-8">Ver discos</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-10 pt-10">
      <h1 className="rotulo text-[clamp(2.6rem,6vw,4.4rem)]">Tu cesta</h1>
      {params.get('cancelado') ? <p className="mt-6 rounded-2xl bg-cobalto-claro text-cobalto-hondo p-4 font-medium" role="status">Has vuelto sin pagar. Tus discos siguen en la cesta.</p> : null}
      {agotados.length ? <p className="mt-6 rounded-2xl bg-alerta-claro text-alerta p-4 font-medium" role="alert">{agotados.length === 1 ? 'Un producto se ha vendido' : `${agotados.length} productos se han vendido`} mientras tanto. Quítalo de la cesta para seguir.</p> : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <ul className="divide-y divide-linea border-y border-linea" aria-busy={comprobando}>
          {cesta.map(({ id, cantidad, producto: p, agotado }) => (
            <li key={id} className={`py-5 flex gap-4 sm:gap-6 ${agotado ? 'opacity-60' : ''}`}>
              <Link to={`/producto/${p.slug}`} tabIndex={-1} aria-hidden="true"><Miniatura p={p} /></Link>
              <div className="min-w-0 grow">
                <Link to={`/producto/${p.slug}`} className="hover:underline underline-offset-4">
                  {p.artista ? <p className="font-semibold leading-tight">{p.artista}</p> : null}
                  <p className={p.artista ? 'text-gris' : 'font-semibold'}>{p.titulo}</p>
                </Link>
                {p.estado_disco ? <p className="mt-1 text-sm text-gris">Disco {p.estado_disco}, funda {p.estado_funda}</p> : null}
                {agotado ? <p className="mt-1 text-sm font-semibold text-alerta">Vendido</p> : null}
                <div className="mt-3 flex items-center gap-3">
                  {p.stock > 1 && !agotado ? (
                    <div className="inline-flex items-center rounded-full border border-linea" role="group" aria-label={`Cantidad de ${p.titulo}`}>
                      <button type="button" className="size-10 grid place-items-center disabled:opacity-30" aria-label="Quitar una" disabled={cantidad <= 1} onClick={() => cambiarCantidad(id, cantidad - 1)}><HugeiconsIcon icon={MinusSignIcon} size={16} /></button>
                      <span className="w-8 text-center tabular-nums" aria-live="polite">{cantidad}</span>
                      <button type="button" className="size-10 grid place-items-center disabled:opacity-30" aria-label="Añadir una" disabled={cantidad >= Math.min(10, p.stock)} onClick={() => cambiarCantidad(id, cantidad + 1)}><HugeiconsIcon icon={Add01Icon} size={16} /></button>
                    </div>
                  ) : null}
                  <button type="button" className="inline-flex items-center gap-1.5 min-h-10 px-2 text-sm text-gris hover:text-alerta" onClick={() => quitar(id)}>
                    <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={1.6} /> Quitar<span className="sr-only"> {p.titulo}</span>
                  </button>
                </div>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">{euros(p.precio * cantidad)}</p>
            </li>
          ))}
        </ul>

        <aside className="rounded-2xl bg-papel border border-linea p-6 lg:sticky lg:top-24" aria-label="Resumen">
          <dl className="grid gap-2">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums font-semibold">{euros(subtotal)}</dd></div>
            <div className="flex justify-between text-gris"><dt>Envío</dt><dd>Se calcula en la caja</dd></div>
          </dl>
          <p className="mt-4 text-sm text-gris">Gratis en Canarias desde 60 € y en la península desde 120 €.</p>
          <Link to={agotados.length ? '#' : '/caja'} aria-disabled={agotados.length > 0} onClick={(e) => agotados.length && e.preventDefault()} className={`boton w-full mt-6 ${agotados.length ? 'opacity-50 pointer-events-none' : ''}`}>Ir a la caja</Link>
          <Link to="/discos" className="block text-center mt-4 text-sm underline underline-offset-4">Seguir mirando discos</Link>
        </aside>
      </div>
    </div>
  );
}
