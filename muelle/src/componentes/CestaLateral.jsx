// La cesta como panel lateral (Sheet de shadcn/ui): se abre desde la isla de la cabecera.
import { Link } from 'react-router';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Cifra from './Cifra.jsx';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet.jsx';
import { useTienda, precioLinea } from '../contexto/Tienda.jsx';
import { Miniatura } from './Piezas.jsx';
import { euros } from '../lib/formato.js';

export function LineaCesta({ x, compacta = false }) {
  const { cambiarCantidad, quitar } = useTienda();
  const max = x.montaje ? 3 : x.producto.stock;
  const titulo = x.montaje ? x.titulo : x.producto.titulo;
  const subtitulo = x.montaje ? 'Teclado a medida, montado en 5 días' : x.producto.tipo === 'interruptores' ? 'Pack de 10 interruptores' : x.producto.resumen;
  return (
    <li className={`grid grid-cols-[4.5rem_1fr] gap-3 ${compacta ? 'py-3' : 'py-4'} border-b border-mascara-borde/70`}>
      <div className="aspect-[4/3] rounded bg-mascara-honda p-1.5"><Miniatura producto={x.producto} vista={x.vista} className="w-full h-full" /></div>
      <div className="min-w-0">
        <div className="flex justify-between gap-3">
          <p className="font-semibold leading-snug">{x.montaje ? titulo : <Link viewTransition to={`/producto/${x.producto.slug}`} className="hover:underline">{titulo}</Link>}</p>
          <p className="numeros font-semibold whitespace-nowrap">{euros(precioLinea(x) * x.cantidad)}</p>
        </div>
        <p className="text-sm text-serigrafia-tenue line-clamp-1">{subtitulo}</p>
        {x.agotado ? <p className="text-sm text-alerta mt-1">{x.error || 'Ya no queda stock suficiente. Quítalo para seguir.'}</p> : null}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center rounded shadow-[inset_0_0_0_1.5px_var(--color-mascara-borde)]">
            <button type="button" className="grid place-items-center size-9 disabled:opacity-40" aria-label={`Quitar una unidad de ${titulo}`} disabled={x.cantidad <= 1} onClick={() => cambiarCantidad(x.clave, x.cantidad - 1)}><Minus size={15} /></button>
            <span className="w-7 text-center numeros" aria-label={`${x.cantidad} unidades`}><Cifra valor={x.cantidad} /></span>
            <button type="button" className="grid place-items-center size-9 disabled:opacity-40" aria-label={`Añadir una unidad de ${titulo}`} disabled={x.cantidad >= max} onClick={() => cambiarCantidad(x.clave, x.cantidad + 1)}><Plus size={15} /></button>
          </div>
          <button type="button" className="grid place-items-center size-9 rounded text-serigrafia-tenue hover:text-alerta" aria-label={`Quitar ${titulo} de la cesta`} onClick={() => quitar(x.clave)}><Trash2 size={16} /></button>
        </div>
      </div>
    </li>
  );
}

export default function CestaLateral({ abierta, cambiar }) {
  const { cesta, subtotal, unidades } = useTienda();
  return (
    <Sheet open={abierta} onOpenChange={cambiar}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-mascara border-l border-mascara-borde text-serigrafia flex flex-col">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="serigrafia text-3xl text-serigrafia">Tu cesta</SheetTitle>
          <SheetDescription className="text-serigrafia-tenue">{unidades ? `${unidades} ${unidades === 1 ? 'producto' : 'productos'}` : 'Todavía no has añadido nada.'}</SheetDescription>
        </SheetHeader>
        {cesta.length ? (
          <>
            <ul className="flex-1 overflow-y-auto px-5">{cesta.map((x) => <LineaCesta key={x.clave} x={x} compacta />)}</ul>
            <div className="px-5 py-5 border-t border-mascara-borde grid gap-3">
              <p className="flex justify-between text-lg"><span>Subtotal</span><span className="numeros font-semibold"><Cifra valor={subtotal / 100} moneda /></span></p>
              <p className="text-sm text-serigrafia-tenue">El envío se calcula en la caja. Gratis a la península desde 80 €.</p>
              <Link viewTransition to="/caja" className="pad w-full" onClick={() => cambiar(false)}>Ir a la caja</Link>
              <Link viewTransition to="/cesta" className="pad-linea w-full" onClick={() => cambiar(false)}>Ver la cesta completa</Link>
            </div>
          </>
        ) : (
          <div className="flex-1 px-5 grid content-center gap-4 text-center">
            <p className="text-serigrafia-tenue">Empieza por oír los interruptores: elige el tuyo y lo demás viene solo.</p>
            <Link viewTransition to="/tienda/interruptores" className="pad mx-auto" onClick={() => cambiar(false)}>Ver interruptores</Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
