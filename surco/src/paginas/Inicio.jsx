import { useState } from 'react';
import { Link } from 'react-router';
import Cubeta from '../componentes/Cubeta.jsx';
import Tarjeta, { TarjetaVacia } from '../componentes/Tarjeta.jsx';
import Tocadiscos from '../componentes/Tocadiscos.jsx';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { euros, GRADOS, ORDEN_GRADOS } from '../lib/formato.js';

function Seccion({ titulo, enlace, children, id }) {
  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 mt-24" aria-labelledby={id}>
      <div className="flex items-end justify-between gap-6 mb-8">
        <h2 id={id} className="rotulo text-[clamp(2rem,5vw,3.6rem)]">{titulo}</h2>
        {enlace}
      </div>
      {children}
    </section>
  );
}

function TocadiscoDestacado({ p }) {
  const [encendido, setEncendido] = useState(false);
  return (
    <li className="grid gap-5 sm:grid-cols-[1.1fr_1fr] items-center rounded-2xl bg-papel border border-linea p-5 sm:p-7"
      onPointerEnter={() => setEncendido(true)} onPointerLeave={() => setEncendido(false)}>
      <div className="aspect-[4/3.2]"><Tocadiscos producto={p} encendido={encendido} /></div>
      <div>
        <p className="text-gris">{p.marca}, {p.anio}</p>
        <h3 className="rotulo text-3xl mt-1">{p.titulo}</h3>
        <p className="mt-3 text-xl font-semibold tabular-nums">{euros(p.precio)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/producto/${p.slug}`} className="boton">Ver tocadiscos</Link>
          <button type="button" className="boton-linea" aria-pressed={encendido} onClick={() => setEncendido((v) => !v)}>{encendido ? 'Parar' : 'Ponerlo a girar'}</button>
        </div>
      </div>
    </li>
  );
}

export default function Inicio() {
  usarTitulo(null);
  // El servidor ya mete estos dos listados en la página: no hace falta esperar a la API
  const destacados = usarDatos('/productos?tipo=vinilo&destacados=1&disponibles=1&por=12', 'destacados');
  const nuevos = usarDatos('/productos?tipo=vinilo&orden=nuevo&por=8', 'nuevos');
  const platos = usarDatos('/productos?tipo=tocadiscos&destacados=1&por=2');

  return (
    <>
      <section className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 pt-10 lg:pt-14 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center" aria-labelledby="titulo-inicio">
        <div>
          <h1 id="titulo-inicio" className="rotulo text-[clamp(2.6rem,4.9vw,4.6rem)]">
            Discos de segunda mano, escuchados antes de venderse.
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg text-gris">
            Vinilos revisados uno a uno y tocadiscos puestos a punto en Las Palmas de Gran Canaria. Enviamos a las islas y a la península.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/discos" className="boton">Ver discos</Link>
            <Link to="/tocadiscos" className="boton-linea">Ver tocadiscos</Link>
          </div>
        </div>
        <div className="min-h-[420px]">
          {destacados.datos?.productos?.length ? (
            <Cubeta discos={destacados.datos.productos} />
          ) : <div className="aspect-[1/1.12] w-[min(100%,440px)] mx-auto rounded-xl bg-carton/50 animate-pulse" aria-hidden="true" />}
        </div>
      </section>

      <Seccion id="nuevos-t" titulo="Recién llegados" enlace={<Link to="/discos" className="boton-linea shrink-0">Todos los discos</Link>}>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {nuevos.datos ? nuevos.datos.productos.map((p) => <li key={p.id}><Tarjeta producto={p} /></li>) : Array.from({ length: 8 }, (_, i) => <li key={i}><TarjetaVacia /></li>)}
        </ul>
      </Seccion>

      <Seccion id="platos-t" titulo="Tocadiscos revisados" enlace={<Link to="/tocadiscos" className="boton-linea shrink-0">Todos los tocadiscos</Link>}>
        <p className="-mt-4 mb-8 max-w-[60ch] text-gris">Los desmontamos, cambiamos correa y aguja, los ajustamos y los escuchamos una semana antes de venderlos. Un año de garantía.</p>
        <ul className="grid gap-5 lg:grid-cols-2">{platos.datos?.productos.map((p) => <TocadiscoDestacado key={p.id} p={p} />)}</ul>
      </Seccion>

      <Seccion id="grados-t" titulo="Cómo graduamos un disco">
        <p className="-mt-4 mb-8 max-w-[60ch] text-gris">Usamos la escala Goldmine, la de las tiendas de discos de todo el mundo. Cada disco lleva dos notas: la del vinilo y la de la funda.</p>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-linea rounded-2xl overflow-hidden border border-linea">
          {ORDEN_GRADOS.map((g) => (
            <li key={g} className="bg-papel p-6">
              <p className="flex items-baseline gap-3"><span className="rotulo-ancho text-3xl text-cobalto">{g}</span><span className="font-semibold">{GRADOS[g].nombre}</span></p>
              <p className="mt-2 text-gris">{GRADOS[g].texto}</p>
            </li>
          ))}
        </ol>
      </Seccion>

      <section className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10 mt-24" aria-labelledby="vender-t">
        <div className="rounded-3xl bg-cobalto text-white p-8 sm:p-12 grid gap-6 md:grid-cols-[1.4fr_1fr] items-end">
          <div>
            <h2 id="vender-t" className="rotulo text-[clamp(2rem,4.6vw,3.6rem)]">¿Tienes discos en el trastero?</h2>
            <p className="mt-4 max-w-[48ch] text-white/85 text-lg">Compramos colecciones y discos sueltos. Mándanos fotos y te decimos cuánto te damos en dinero o en crédito para la tienda.</p>
          </div>
          <div className="md:justify-self-end"><Link to="/vender" className="inline-flex items-center min-h-12 px-6 rounded-full bg-white text-cobalto-hondo font-semibold hover:bg-cobalto-claro transition-colors">Vender tus discos</Link></div>
        </div>
      </section>
    </>
  );
}
