import { useState } from 'react';
import { Link } from 'react-router';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { euros } from '../lib/formato.js';
import { Miniatura } from '../paginas/Cesta.jsx';

const TIPOS = { vinilo: 'Disco', tocadiscos: 'Tocadiscos', accesorio: 'Accesorio' };

export default function Productos() {
  usarTitulo('Productos');
  const [q, setQ] = useState('');
  const [busca, setBusca] = useState('');
  const { datos, error } = usarDatos(`/admin/productos${busca ? `?q=${encodeURIComponent(busca)}` : ''}`);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="rotulo text-5xl">Productos</h1>
        <Link to="/admin/productos/nuevo" className="boton">Añadir producto</Link>
      </div>
      <form className="mt-6 flex gap-2 max-w-md" onSubmit={(e) => { e.preventDefault(); setBusca(q.trim()); }} role="search">
        <label htmlFor="buscar-admin" className="sr-only">Buscar productos</label>
        <input id="buscar-admin" type="search" className="campo" placeholder="Título, artista o marca" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="boton-linea">Buscar</button>
      </form>
      {error ? <p className="mt-6 text-alerta">{error.message}</p> : null}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-linea bg-papel">
        <table className="w-full text-left min-w-[720px]">
          <caption className="sr-only">Productos de la tienda</caption>
          <thead className="text-sm text-gris border-b border-linea">
            <tr><th scope="col" className="p-3 font-medium">Producto</th><th scope="col" className="p-3 font-medium">Tipo</th><th scope="col" className="p-3 font-medium">Estado</th><th scope="col" className="p-3 font-medium text-right">Precio</th><th scope="col" className="p-3 font-medium text-right">Stock</th><th scope="col" className="p-3"><span className="sr-only">Acciones</span></th></tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {datos?.productos.map((p) => (
              <tr key={p.id} className={p.activo ? '' : 'opacity-50'}>
                <td className="p-3"><div className="flex items-center gap-3"><div className="scale-50 origin-left -mr-10 -my-6"><Miniatura p={p} /></div><div className="min-w-0"><p className="font-semibold truncate max-w-[38ch]">{p.artista || p.titulo}</p>{p.artista ? <p className="text-sm text-gris truncate max-w-[38ch]">{p.titulo}</p> : null}</div></div></td>
                <td className="p-3">{TIPOS[p.tipo]}{p.destacado ? <span className="ml-2 text-xs rounded-full bg-cobalto-claro text-cobalto-hondo px-2 py-0.5 font-semibold">Destacado</span> : null}</td>
                <td className="p-3 text-sm">{p.activo ? (p.estado_disco ? `${p.estado_disco} / ${p.estado_funda}` : 'A la venta') : 'Oculto'}</td>
                <td className="p-3 text-right tabular-nums">{euros(p.precio)}</td>
                <td className={`p-3 text-right tabular-nums font-semibold ${p.stock === 0 ? 'text-alerta' : ''}`}>{p.stock}</td>
                <td className="p-3 text-right"><Link to={`/admin/productos/${p.id}`} className="underline underline-offset-4 font-medium">Editar<span className="sr-only"> {p.titulo}</span></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {datos && !datos.productos.length ? <p className="p-6 text-gris">No hay productos que coincidan.</p> : null}
      </div>
    </>
  );
}
