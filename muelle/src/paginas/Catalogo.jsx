import { useMemo } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import Tarjeta, { TarjetaVacia } from '../componentes/Tarjeta.jsx';
import { FAMILIAS, TIPOS } from '../lib/formato.js';
import NoEncontrada from './NoEncontrada.jsx';

const SECCIONES = { teclados: 'teclado', interruptores: 'interruptores', teclas: 'teclas', accesorios: 'accesorio' };
const INTRO = {
  todo: ['Toda la tienda', 'Teclados montados, interruptores, juegos de teclas y accesorios.'],
  teclado: ['Teclados montados', 'Combinaciones que nos gustan, montadas y probadas tecla a tecla. Salen en 24 horas.'],
  interruptores: ['Interruptores', 'Packs de 10, de tres pines y compatibles con cualquier placa hot-swap. Ábrelos y escúchalos en su ficha.'],
  teclas: ['Juegos de teclas', 'Distribución ISO española con Ñ y Ç, para 60 %, 65 %, 75 % y TKL.'],
  accesorio: ['Accesorios', 'Cables, herramientas y lo necesario para cuidar el teclado.'],
};

export default function Catalogo() {
  const { seccion } = useParams();
  const [q, setQ] = useSearchParams();
  const tipo = seccion ? SECCIONES[seccion] : null;
  const valido = !seccion || tipo;
  const [titulo, intro] = INTRO[tipo || 'todo'];
  usarTitulo(valido ? titulo : 'Página no encontrada');

  const ruta = useMemo(() => {
    const p = new URLSearchParams();
    if (tipo) p.set('tipo', tipo);
    for (const k of ['familia', 'formato', 'max', 'orden', 'q', 'disponibles', 'pagina']) if (q.get(k)) p.set(k, q.get(k));
    p.set('por', '24');
    return `/productos?${p}`;
  }, [tipo, q]);
  const { datos, cargando, error } = usarDatos(valido ? ruta : null, [...q.keys()].length ? null : `catalogo:${tipo || 'todo'}`);

  if (!valido) return <NoEncontrada />;
  const fijar = (k, v) => {
    const n = new URLSearchParams(q);
    if (v) n.set(k, v); else n.delete(k);
    n.delete('pagina');
    setQ(n, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pt-10">
      <h1 className="serigrafia text-[clamp(2.6rem,5.6vw,4.6rem)]">{titulo}</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-serigrafia-tenue">{intro}</p>

      <nav aria-label="Secciones de la tienda" className="mt-8 flex flex-wrap gap-2">
        {[['/tienda', 'Todo'], ...Object.entries(SECCIONES).map(([s, t]) => [`/tienda/${s}`, TIPOS[t]])].map(([to, t]) => (
          <NavLink viewTransition key={to} to={to} end className={({ isActive }) => `px-4 py-2 rounded-full text-[0.95rem] font-semibold transition-colors ${isActive ? 'bg-cobre text-mascara-honda' : 'shadow-[inset_0_0_0_1.5px_var(--color-mascara-borde)] hover:shadow-[inset_0_0_0_1.5px_var(--color-serigrafia-tenue)]'}`}>{t}</NavLink>
        ))}
      </nav>

      <form className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-end" role="search" onSubmit={(e) => { e.preventDefault(); fijar('q', new FormData(e.currentTarget).get('q')?.toString().trim()); }}>
        <div>
          <label htmlFor="buscar" className="etiqueta">Buscar</label>
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-serigrafia-tenue" aria-hidden="true" />
            <input id="buscar" name="q" defaultValue={q.get('q') || ''} className="campo pl-9" placeholder="Crema, nogal, clicky…" />
          </div>
        </div>
        {tipo === 'interruptores' ? (
          <div>
            <label htmlFor="familia" className="etiqueta">Tipo</label>
            <select id="familia" className="campo" value={q.get('familia') || ''} onChange={(e) => fijar('familia', e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(FAMILIAS).map(([id, f]) => <option key={id} value={id}>{f.nombre}</option>)}
            </select>
          </div>
        ) : null}
        {tipo === 'teclado' ? (
          <div>
            <label htmlFor="formato" className="etiqueta">Formato</label>
            <select id="formato" className="campo" value={q.get('formato') || ''} onChange={(e) => fijar('formato', e.target.value)}>
              <option value="">Todos</option>
              {[['60', '60 %'], ['65', '65 %'], ['75', '75 %'], ['tkl', 'TKL']].map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="orden" className="etiqueta">Orden</label>
          <select id="orden" className="campo" value={q.get('orden') || 'destacados'} onChange={(e) => fijar('orden', e.target.value === 'destacados' ? '' : e.target.value)}>
            <option value="destacados">Recomendados</option>
            <option value="precio-asc">Precio: de menor a mayor</option>
            <option value="precio-desc">Precio: de mayor a menor</option>
            <option value="nuevo">Lo último</option>
          </select>
        </div>
        <label className="flex items-center gap-2 min-h-[2.875rem] cursor-pointer">
          <input type="checkbox" className="size-5 accent-[var(--color-cobre)]" checked={!!q.get('disponibles')} onChange={(e) => fijar('disponibles', e.target.checked ? '1' : '')} />
          <span>Solo con stock</span>
        </label>
      </form>

      <p className="mt-6 text-sm text-serigrafia-tenue" role="status">{cargando ? 'Cargando…' : datos ? `${datos.total} ${datos.total === 1 ? 'producto' : 'productos'}` : ''}</p>
      {error ? <p className="mt-6 text-alerta">{error.message}</p> : null}

      <h2 className="sr-only">Productos</h2>
      <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cargando && !datos ? Array.from({ length: 8 }, (_, i) => <TarjetaVacia key={i} />) : (datos?.productos ?? []).map((p) => <Tarjeta key={p.id} producto={p} />)}
      </div>
      {datos && datos.total === 0 ? (
        <div className="mt-10 plano p-8 text-center">
          <p className="text-lg">No hay nada con esos filtros.</p>
          <button type="button" className="pad-linea mt-4" onClick={() => setQ({}, { replace: true })}>Quitar los filtros</button>
        </div>
      ) : null}
      {datos && datos.paginas > 1 ? (
        <nav aria-label="Páginas" className="mt-12 flex justify-center gap-2">
          {Array.from({ length: datos.paginas }, (_, i) => i + 1).map((n) => (
            <Link viewTransition key={n} to={`?${new URLSearchParams({ ...Object.fromEntries(q), pagina: n })}`} aria-current={n === datos.pagina ? 'page' : undefined}
              className={`grid place-items-center size-11 rounded numeros ${n === datos.pagina ? 'bg-cobre text-mascara-honda font-bold' : 'shadow-[inset_0_0_0_1.5px_var(--color-mascara-borde)]'}`}>{n}</Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
