import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import Cifra from '../componentes/Cifra.jsx';
import { useTienda } from '../contexto/Tienda.jsx';
import { LineaCesta } from '../componentes/CestaLateral.jsx';
import { api } from '../lib/api.js';
import { usarTitulo } from '../lib/usarDatos.js';

// Las líneas tal como las comprueba el servidor
export const lineasParaServidor = (cesta) => cesta.map((x) => (x.montaje ? { clave: x.clave, montaje: x.montaje, cantidad: x.cantidad } : { clave: x.clave, id: x.id, cantidad: x.cantidad }));

export default function Cesta() {
  usarTitulo('Tu cesta');
  const { cesta, subtotal, sincronizar, sesion } = useTienda();
  const [params] = useSearchParams();
  const [comprobando, setComprobando] = useState(false);

  // Al entrar, se comprueba la cesta con la tienda: precio actual y si sigue disponible
  useEffect(() => {
    if (sesion.cargando || !cesta.length) return;
    setComprobando(true);
    api('/cesta', { metodo: 'POST', datos: { lineas: lineasParaServidor(cesta) } })
      .then((r) => sincronizar(r.lineas))
      .catch(() => {})
      .finally(() => setComprobando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion.cargando]);

  const agotados = cesta.filter((x) => x.agotado);

  if (!cesta.length) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-24 text-center">
        <h1 className="serigrafia text-[clamp(2.6rem,6vw,4.4rem)]">Tu cesta está vacía</h1>
        <p className="mt-4 text-serigrafia-tenue text-lg">Empieza por oír los interruptores: cuando des con el tuyo, lo demás viene solo.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link viewTransition to="/montador" className="pad">Monta el tuyo</Link>
          <Link viewTransition to="/tienda" className="pad-linea">Ver la tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-10 pt-10">
      <h1 className="serigrafia text-[clamp(2.6rem,6vw,4.4rem)]">Tu cesta</h1>
      {params.get('cancelado') ? <p className="mt-6 plano p-4" role="status">Has vuelto sin pagar. Todo sigue en la cesta.</p> : null}
      {agotados.length ? <p className="mt-6 rounded bg-alerta/15 text-alerta p-4 font-medium" role="alert">{agotados.length === 1 ? 'Un producto ya no tiene stock suficiente' : `${agotados.length} productos ya no tienen stock suficiente`}. Quítalo para seguir.</p> : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <ul className="border-t border-mascara-borde/70" aria-busy={comprobando}>{cesta.map((x) => <LineaCesta key={x.clave} x={x} />)}</ul>
        <aside className="plano p-6 lg:sticky lg:top-24" aria-label="Resumen">
          <dl className="grid gap-2">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="numeros font-semibold"><Cifra valor={subtotal / 100} moneda /></dd></div>
            <div className="flex justify-between text-serigrafia-tenue"><dt>Envío</dt><dd>Se calcula en la caja</dd></div>
          </dl>
          <p className="mt-4 text-sm text-serigrafia-tenue">Gratis a la península y Baleares desde 80 € y a Canarias desde 150 €.</p>
          <Link viewTransition to={agotados.length ? '#' : '/caja'} aria-disabled={agotados.length > 0} onClick={(e) => agotados.length && e.preventDefault()} className={`pad w-full mt-6 ${agotados.length ? 'opacity-50 pointer-events-none' : ''}`}>Ir a la caja</Link>
          <Link viewTransition to="/tienda" className="block text-center mt-4 text-sm underline">Seguir mirando</Link>
        </aside>
      </div>
    </div>
  );
}
