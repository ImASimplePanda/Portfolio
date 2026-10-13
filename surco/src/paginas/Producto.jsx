import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { DeliveryTruck01Icon, Shield01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import Portada from '../componentes/Portada.jsx';
import Vinilo from '../componentes/Vinilo.jsx';
import Tocadiscos from '../componentes/Tocadiscos.jsx';
import Tarjeta from '../componentes/Tarjeta.jsx';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { euros, GRADOS } from '../lib/formato.js';
import { useTienda } from '../contexto/Tienda.jsx';

function Visor({ p }) {
  const [fuera, setFuera] = useState(false);
  const [encendido, setEncendido] = useState(false);
  if (p.tipo === 'tocadiscos') {
    return (
      <div>
        <div className="rounded-2xl bg-carton/60 p-6 sm:p-10"><Tocadiscos producto={p} encendido={encendido} /></div>
        <button type="button" className="boton-linea mt-4" aria-pressed={encendido} onClick={() => setEncendido((v) => !v)}>{encendido ? 'Parar el plato' : 'Ponerlo a girar'}</button>
      </div>
    );
  }
  if (p.tipo !== 'vinilo') return <div className="aspect-square rounded-2xl overflow-hidden"><Portada producto={p} tamanos="(max-width: 1024px) 100vw, 640px" /></div>;
  return (
    <div>
      <div className="relative aspect-[1.32/1]">
        <div className={`absolute top-[4%] bottom-[4%] aspect-square left-[3%] transition-transform duration-700 ease-[var(--ease-salida)] motion-reduce:transition-none ${fuera ? 'translate-x-[32%]' : 'translate-x-0'}`}>
          <Vinilo producto={p} girando={fuera} />
        </div>
        <div className="absolute top-0 bottom-0 left-0 aspect-square rounded-[var(--radius-funda)] overflow-hidden shadow-[0_24px_40px_-24px_rgba(22,24,26,0.6)]">
          <Portada producto={p} tamanos="(max-width: 1024px) 76vw, 520px" />
        </div>
      </div>
      <button type="button" className="boton-linea mt-4" aria-pressed={fuera} onClick={() => setFuera((v) => !v)}>{fuera ? 'Guardar en la funda' : 'Sacar el disco'}</button>
    </div>
  );
}

export default function Producto() {
  const { slug } = useParams();
  const { datos, error, cargando } = usarDatos(`/productos/${slug}`);
  const { anadir, avisar } = useTienda();
  const p = datos?.producto;
  usarTitulo(p ? (p.artista ? `${p.artista}: ${p.titulo}` : p.titulo) : null);

  if (error) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-24 text-center">
        <h1 className="rotulo text-5xl">{error.estado === 404 ? 'Este disco ya no está' : 'No hemos podido cargarlo'}</h1>
        <p className="mt-4 text-gris text-lg">{error.message}</p>
        <Link to="/discos" className="boton mt-8">Ver otros discos</Link>
      </div>
    );
  }
  if (cargando || !p) return <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pt-12 grid gap-12 lg:grid-cols-2" aria-busy="true"><div className="aspect-square rounded-2xl bg-carton/60 animate-pulse" /><div className="space-y-4"><div className="h-12 w-2/3 rounded bg-carton/60" /><div className="h-6 w-1/3 rounded bg-carton/50" /></div></div>;

  const vendido = p.stock <= 0;
  const comprar = () => {
    if (anadir(p) === 'tope') avisar('Ya está en tu cesta', p.stock === 1 ? 'Es un ejemplar único.' : 'No quedan más unidades.');
    else avisar('Añadido a la cesta', p.artista ? `${p.artista}: ${p.titulo}` : p.titulo);
  };
  const datosTabla = p.tipo === 'vinilo'
    ? [['Sello', p.sello], ['Catálogo', p.catalogo], ['Año', p.anio], ['País', p.pais], ['Formato', p.formato], ['Género', p.genero]]
    : [['Marca', p.marca], ['Año', p.anio]];
  const mitad = Math.ceil((p.tracklist?.length || 0) / 2);

  return (
    <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pt-8">
      <nav aria-label="Migas" className="text-sm text-gris mb-6">
        <Link to={p.tipo === 'vinilo' ? '/discos' : p.tipo === 'tocadiscos' ? '/tocadiscos' : '/accesorios'} className="hover:text-tinta underline-offset-4 hover:underline">
          {p.tipo === 'vinilo' ? 'Discos' : p.tipo === 'tocadiscos' ? 'Tocadiscos' : 'Accesorios'}
        </Link>
        {p.genero ? <> / <Link to={`/discos?genero=${encodeURIComponent(p.genero)}`} className="hover:text-tinta underline-offset-4 hover:underline">{p.genero}</Link></> : null}
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
        <Visor p={p} />

        <div className="lg:sticky lg:top-24">
          {p.artista ? <p className="text-xl font-semibold">{p.artista}</p> : null}
          <h1 className="rotulo text-[clamp(2.4rem,4.6vw,4rem)] mt-1">{p.titulo}</h1>
          <p className="mt-5 text-3xl font-semibold tabular-nums">{euros(p.precio)}</p>
          <p className="text-sm text-gris">IGIC incluido. {p.stock === 1 ? 'Ejemplar único.' : vendido ? '' : `${p.stock} disponibles.`}</p>

          {p.estado_disco ? (
            <dl className="mt-6 grid grid-cols-2 gap-px rounded-2xl overflow-hidden border border-linea bg-linea">
              <div className="bg-papel p-4">
                <dt className="text-sm text-gris">Disco</dt>
                <dd><span className="rotulo-ancho text-2xl text-cobalto">{p.estado_disco}</span> <span className="font-semibold">{GRADOS[p.estado_disco]?.nombre}</span></dd>
                <dd className="mt-1 text-sm text-gris">{GRADOS[p.estado_disco]?.texto}</dd>
              </div>
              <div className="bg-papel p-4">
                <dt className="text-sm text-gris">Funda</dt>
                <dd><span className="rotulo-ancho text-2xl text-cobalto">{p.estado_funda}</span> <span className="font-semibold">{GRADOS[p.estado_funda]?.nombre}</span></dd>
                <dd className="mt-1 text-sm text-gris">{GRADOS[p.estado_funda]?.texto}</dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-6">
            <button type="button" className="boton w-full sm:w-auto min-w-64" onClick={comprar} disabled={vendido}>{vendido ? 'Vendido' : 'Añadir a la cesta'}</button>
          </div>

          <ul className="mt-6 grid gap-2 text-gris">
            <li className="flex gap-3"><HugeiconsIcon icon={DeliveryTruck01Icon} size={22} strokeWidth={1.5} className="shrink-0 text-tinta" />Envío en 24-48 h. Gratis en Canarias desde 60 € y en la península desde 120 €.</li>
            <li className="flex gap-3"><HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} strokeWidth={1.5} className="shrink-0 text-tinta" />14 días para devolverlo si no es lo que esperabas.</li>
            {p.tipo === 'tocadiscos' ? <li className="flex gap-3"><HugeiconsIcon icon={Shield01Icon} size={22} strokeWidth={1.5} className="shrink-0 text-tinta" />Un año de garantía.</li> : null}
          </ul>

          {p.descripcion ? <p className="mt-8 max-w-[62ch]">{p.descripcion}</p> : null}

          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {datosTabla.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-sm text-gris">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
          </dl>

          {p.tracklist?.length ? (
            <section className="mt-10" aria-labelledby="canciones-t">
              <h2 id="canciones-t" className="font-semibold text-lg mb-3">Canciones</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {[p.tracklist.slice(0, mitad), p.tracklist.slice(mitad)].map((lado, i) => lado.length ? (
                  <div key={i}>
                    <h3 className="text-sm text-gris mb-2">Cara {i ? 'B' : 'A'}</h3>
                    <ol className="grid gap-1.5">{lado.map((t, j) => <li key={j} className="flex gap-3"><span className="text-gris tabular-nums w-6">{i ? 'B' : 'A'}{j + 1}</span>{t}</li>)}</ol>
                  </div>
                ) : null)}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {datos.relacionados?.length ? (
        <section className="mt-24" aria-labelledby="rel-t">
          <h2 id="rel-t" className="rotulo text-[clamp(2rem,4vw,3rem)] mb-8">{p.genero ? `Más ${p.genero.toLowerCase()}` : 'También te puede gustar'}</h2>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">{datos.relacionados.map((r) => <li key={r.id}><Tarjeta producto={r} /></li>)}</ul>
        </section>
      ) : null}
    </div>
  );
}
