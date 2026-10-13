import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import TearTicket from '../componentes/rb/TearTicket.jsx';
import { api } from '../lib/api.js';
import { euros, fecha, ESTADOS } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarDatos.js';
import { useTienda } from '../contexto/Tienda.jsx';

export default function Pedido() {
  const { codigo } = useParams();
  const [params] = useSearchParams();
  const { sesion, vaciar } = useTienda();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState(null);
  usarTitulo(`Pedido ${codigo}`);

  // Si vienes de Stripe, el aviso de pago puede tardar unos segundos: se consulta de nuevo
  useEffect(() => {
    if (sesion.cargando) return;
    let vivo = true, intentos = 0, t;
    const consultar = () => api(`/pedidos/${codigo}?t=${encodeURIComponent(params.get('t') || '')}`)
      .then((r) => {
        if (!vivo) return;
        setPedido(r.pedido);
        if (r.pedido.estado !== 'pendiente') vaciar();
        if (r.pedido.estado === 'pendiente' && intentos++ < 8) t = setTimeout(consultar, 2500);
      })
      .catch((e) => vivo && setError(e));
    consultar();
    return () => { vivo = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo, sesion.cargando]);

  if (error) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-24 text-center">
        <h1 className="rotulo text-5xl">No encontramos ese pedido</h1>
        <p className="mt-4 text-gris text-lg">Revisa el enlace del correo de confirmación o entra en tu cuenta.</p>
        <Link to="/cuenta" className="boton mt-8">Ir a mi cuenta</Link>
      </div>
    );
  }
  if (!pedido) return <div className="min-h-[60vh]" aria-busy="true" />;

  const confirmado = pedido.estado !== 'pendiente' && pedido.estado !== 'cancelado';
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 pt-12">
      <h1 className="rotulo text-[clamp(2.6rem,6vw,4.6rem)]">
        {pedido.estado === 'pendiente' ? 'Confirmando el pago…' : pedido.estado === 'cancelado' ? 'Pedido cancelado' : '¡Gracias! Tus discos ya están apartados.'}
      </h1>
      <p className="mt-4 text-lg text-gris max-w-[56ch]" role="status">
        {pedido.estado === 'pendiente'
          ? 'Estamos esperando la confirmación del banco. Esto tarda unos segundos.'
          : confirmado
            ? `Te hemos enviado la confirmación a ${pedido.email}. Lo preparamos en 24-48 horas laborables.`
            : 'Este pedido no se ha pagado y los productos han vuelto a la tienda.'}
      </p>
      {pedido.pago === 'demo' ? <p className="mt-4 inline-block rounded-full bg-[#ffd23f] text-[#1d1600] text-sm font-semibold px-3 py-1">Pedido de prueba: no se ha cobrado nada.</p> : null}

      <div className="mt-10">
        <TearTicket
          width={560}
          height={230}
          stubSize={150}
          background="#16181a"
          color="#f8f9f8"
          stubBackground="#2440e6"
          radius={18}
          ariaLabel="Arrancar el resguardo del pedido"
          stub={<div className="h-full grid place-items-center text-center px-3"><p className="text-xs text-white/75">Resguardo</p><p className="rotulo-ancho text-[15px] mt-1 whitespace-nowrap">{pedido.codigo}</p></div>}
        >
          <div className="h-full flex flex-col justify-between p-6">
            <div>
              <p className="text-sm text-white/65">Pedido {pedido.codigo}, {fecha(pedido.creado)}</p>
              <p className="mt-1 text-lg font-semibold">{ESTADOS[pedido.estado]}</p>
            </div>
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm text-white/65">{pedido.lineas.length} {pedido.lineas.length === 1 ? 'producto' : 'productos'}</p>
              <p className="rotulo-ancho text-3xl tabular-nums">{euros(pedido.total)}</p>
            </div>
          </div>
        </TearTicket>
      </div>

      <section className="mt-12 grid gap-10 sm:grid-cols-2" aria-label="Detalle del pedido">
        <div>
          <h2 className="font-semibold text-lg mb-3">Productos</h2>
          <ul className="grid gap-2">
            {pedido.lineas.map((l, i) => (
              <li key={i} className="flex justify-between gap-4"><span>{l.cantidad > 1 ? `${l.cantidad} × ` : ''}{l.titulo}</span><span className="tabular-nums">{euros(l.precio * l.cantidad)}</span></li>
            ))}
            <li className="flex justify-between gap-4 text-gris"><span>Envío</span><span className="tabular-nums">{pedido.envio ? euros(pedido.envio) : 'Gratis'}</span></li>
            <li className="flex justify-between gap-4 font-semibold border-t border-linea pt-2"><span>Total</span><span className="tabular-nums">{euros(pedido.total)}</span></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-3">Se envía a</h2>
          <address className="not-italic text-gris">{pedido.nombre}<br />{pedido.direccion}<br />{pedido.cp} {pedido.ciudad} ({pedido.provincia})</address>
        </div>
      </section>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/discos" className="boton">Seguir mirando discos</Link>
        {sesion.usuario ? <Link to="/cuenta" className="boton-linea">Ver mis pedidos</Link> : null}
      </div>
    </div>
  );
}
