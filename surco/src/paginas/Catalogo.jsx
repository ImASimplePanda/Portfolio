import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, FilterHorizontalIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
import Tarjeta, { TarjetaVacia } from '../componentes/Tarjeta.jsx';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { GRADOS, ORDEN_GRADOS } from '../lib/formato.js';

const TITULOS = { vinilo: 'Discos', tocadiscos: 'Tocadiscos', accesorio: 'Accesorios' };
const ENTRADILLAS = {
  vinilo: 'Cada disco está limpio, graduado y escuchado entero. La nota de la izquierda es la del vinilo; la de la derecha, la de la funda.',
  tocadiscos: 'Revisados en nuestro taller, con correa y aguja nuevas y un año de garantía.',
  accesorio: 'Lo necesario para que tus discos suenen bien y duren décadas.',
};

function Chip({ activo, onClick, children }) {
  return (
    <button type="button" aria-pressed={activo} onClick={onClick}
      className={`min-h-10 px-3.5 rounded-full border text-sm font-medium transition-colors ${activo ? 'bg-tinta border-tinta text-white' : 'border-linea hover:border-tinta bg-papel'}`}>
      {children}
    </button>
  );
}

function Filtros({ params, poner, facetas, tipo }) {
  if (tipo !== 'vinilo') return null;
  return (
    <div className="grid gap-7">
      <fieldset>
        <legend className="font-semibold mb-3">Género</legend>
        <div className="flex flex-wrap gap-2">
          <Chip activo={!params.get('genero')} onClick={() => poner('genero', '')}>Todos</Chip>
          {facetas?.generos.map((g) => <Chip key={g.genero} activo={params.get('genero') === g.genero} onClick={() => poner('genero', g.genero)}>{g.genero} <span className="opacity-60">{g.n}</span></Chip>)}
        </div>
      </fieldset>
      <fieldset>
        <legend className="font-semibold mb-3">Formato</legend>
        <div className="flex flex-wrap gap-2">
          <Chip activo={!params.get('formato')} onClick={() => poner('formato', '')}>Todos</Chip>
          {facetas?.formatos.map((f) => <Chip key={f.formato} activo={params.get('formato') === f.formato} onClick={() => poner('formato', f.formato)}>{f.formato}</Chip>)}
        </div>
      </fieldset>
      <fieldset>
        <legend className="font-semibold mb-3">Década</legend>
        <div className="flex flex-wrap gap-2">
          <Chip activo={!params.get('decada')} onClick={() => poner('decada', '')}>Todas</Chip>
          {facetas?.decadas.map((d) => <Chip key={d} activo={params.get('decada') === String(d)} onClick={() => poner('decada', String(d))}>{String(d).slice(2)}s</Chip>)}
        </div>
      </fieldset>
      <div>
        <label htmlFor="f-estado" className="font-semibold block mb-2">Estado mínimo del disco</label>
        <select id="f-estado" className="campo" value={params.get('estado') || ''} onChange={(e) => poner('estado', e.target.value)}>
          <option value="">Cualquiera</option>
          {ORDEN_GRADOS.map((g) => <option key={g} value={g}>{g}, {GRADOS[g].nombre}</option>)}
        </select>
        {params.get('estado') ? <p className="mt-2 text-sm text-gris">{GRADOS[params.get('estado')]?.texto}</p> : null}
      </div>
      <div>
        <label htmlFor="f-max" className="font-semibold flex justify-between mb-2"><span>Precio máximo</span><span className="tabular-nums text-gris">{params.get('max') ? `${params.get('max')} €` : 'Sin límite'}</span></label>
        <input id="f-max" type="range" min="10" max="100" step="5" value={params.get('max') || 100} onChange={(e) => poner('max', e.target.value === '100' ? '' : e.target.value)} className="w-full accent-cobalto" />
      </div>
      <label className="flex items-center gap-3 min-h-11 cursor-pointer">
        <input type="checkbox" className="size-5 accent-cobalto" checked={params.get('disponibles') === '1'} onChange={(e) => poner('disponibles', e.target.checked ? '1' : '')} />
        <span>Ocultar los vendidos</span>
      </label>
    </div>
  );
}

export default function Catalogo({ tipo }) {
  usarTitulo(TITULOS[tipo]);
  const [params, setParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get('q') || '');
  const [panel, setPanel] = useState(false);

  const poner = (k, v) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v); else p.delete(k);
    if (k !== 'pagina') p.delete('pagina');
    setParams(p, { replace: k !== 'pagina' });
  };
  // Búsqueda con pausa: no se pide nada hasta que dejas de escribir
  useEffect(() => {
    const t = setTimeout(() => { if ((params.get('q') || '') !== busqueda.trim()) poner('q', busqueda.trim()); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  const consulta = useMemo(() => {
    const p = new URLSearchParams(params);
    p.set('tipo', tipo);
    p.set('por', '24');
    return `/productos?${p}`;
  }, [params, tipo]);
  const { datos, error, cargando, recargar } = usarDatos(consulta);
  const facetas = usarDatos(tipo === 'vinilo' ? '/facetas' : null).datos;
  const pagina = Number(params.get('pagina') || 1);
  const filtrosActivos = ['genero', 'formato', 'decada', 'estado', 'max', 'disponibles', 'q'].filter((k) => params.get(k)).length;

  return (
    <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pt-10">
      <h1 className="rotulo text-[clamp(2.8rem,7vw,5.6rem)]">{TITULOS[tipo]}</h1>
      <p className="mt-4 max-w-[62ch] text-gris text-lg">{ENTRADILLAS[tipo]}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative grow max-w-md">
          <label htmlFor="buscar" className="sr-only">Buscar por artista, título o sello</label>
          <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.6} className="absolute left-4 top-1/2 -translate-y-1/2 text-gris pointer-events-none" />
          <input id="buscar" type="search" className="campo pl-11" placeholder={tipo === 'vinilo' ? 'Artista, título o sello' : 'Marca o modelo'} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <label htmlFor="orden" className="sr-only">Ordenar</label>
        <select id="orden" className="campo w-auto" value={params.get('orden') || 'nuevo'} onChange={(e) => poner('orden', e.target.value === 'nuevo' ? '' : e.target.value)}>
          <option value="nuevo">Recién llegados</option>
          <option value="precio-asc">Precio: de menor a mayor</option>
          <option value="precio-desc">Precio: de mayor a menor</option>
          <option value="anio">Año de edición</option>
        </select>
        {tipo === 'vinilo' ? (
          <button type="button" className="boton-linea lg:hidden" aria-expanded={panel} aria-controls="filtros" onClick={() => setPanel((v) => !v)}>
            <HugeiconsIcon icon={FilterHorizontalIcon} size={20} strokeWidth={1.6} /> Filtros{filtrosActivos ? ` (${filtrosActivos})` : ''}
          </button>
        ) : null}
      </div>

      <div className={`mt-10 grid gap-10 ${tipo === 'vinilo' ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : ''}`}>
        {tipo === 'vinilo' ? (
          <aside id="filtros" aria-label="Filtros" className={`${panel ? 'block' : 'hidden'} lg:block`}>
            <Filtros params={params} poner={poner} facetas={facetas} tipo={tipo} />
            {filtrosActivos ? <button type="button" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4" onClick={() => { setBusqueda(''); setParams(new URLSearchParams(), { replace: true }); }}><HugeiconsIcon icon={Cancel01Icon} size={16} /> Quitar filtros</button> : null}
          </aside>
        ) : null}

        <section aria-label="Resultados" aria-busy={cargando}>
          <p className="mb-5 text-sm text-gris" role="status">{datos ? `${datos.total} ${datos.total === 1 ? 'resultado' : 'resultados'}` : ' '}</p>
          {error ? (
            <div className="rounded-2xl border border-alerta/30 bg-alerta-claro p-6">
              <p className="font-semibold text-alerta">{error.message}</p>
              <button type="button" className="boton mt-4" onClick={recargar}>Reintentar</button>
            </div>
          ) : datos && datos.productos.length === 0 ? (
            <div className="rounded-2xl border border-linea bg-papel p-10 text-center">
              <p className="rotulo text-3xl">Nada en esta cubeta.</p>
              <p className="mt-3 text-gris">Prueba con menos filtros o busca otro artista. Entran discos nuevos cada semana.</p>
              <button type="button" className="boton mt-6" onClick={() => { setBusqueda(''); setParams(new URLSearchParams(), { replace: true }); }}>Ver todo</button>
            </div>
          ) : (
            <ul className={`grid grid-cols-2 gap-x-5 gap-y-10 ${tipo === 'vinilo' ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'} ${cargando && datos ? 'opacity-60 transition-opacity' : ''}`}>
              {datos ? datos.productos.map((p) => <li key={p.id}><Tarjeta producto={p} /></li>) : Array.from({ length: 9 }, (_, i) => <li key={i}><TarjetaVacia /></li>)}
            </ul>
          )}
          {datos && datos.paginas > 1 ? (
            <nav aria-label="Páginas" className="mt-12 flex flex-wrap gap-2">
              {Array.from({ length: datos.paginas }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" aria-current={n === pagina ? 'page' : undefined} onClick={() => { poner('pagina', n === 1 ? '' : String(n)); window.scrollTo({ top: 0 }); }}
                  className={`size-11 rounded-full font-semibold tabular-nums ${n === pagina ? 'bg-tinta text-white' : 'border border-linea hover:border-tinta'}`}>{n}</button>
              ))}
            </nav>
          ) : null}
        </section>
      </div>
      {tipo !== 'vinilo' ? <p className="mt-16 text-gris">¿Buscas algo concreto? <Link to="/vender" className="underline underline-offset-4">Escríbenos</Link> y te avisamos cuando entre.</p> : null}
    </div>
  );
}
