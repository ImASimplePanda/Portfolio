import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useTienda } from '../contexto/Tienda.jsx';
import { api } from '../lib/api.js';
import { costeEnvio, euros, zonaDeCp } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarDatos.js';
import { lineasParaServidor } from './Cesta.jsx';
import { Miniatura } from '../componentes/Piezas.jsx';
import { precioLinea } from '../contexto/Tienda.jsx';

function Campo({ id, etiqueta, error, ayuda, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="etiqueta">{etiqueta}</label>
      <input id={id} name={id} className="campo" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined} {...props} />
      {ayuda && !error ? <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-serigrafia-tenue">{ayuda}</p> : null}
      {error ? <p id={`${id}-error`} className="error-campo">{error}</p> : null}
    </div>
  );
}

export default function Caja() {
  usarTitulo('Caja');
  const { cesta, subtotal, sesion, vaciar, sincronizar } = useTienda();
  const navegar = useNavigate();
  const u = sesion.usuario;
  const [d, setD] = useState({ email: u?.email || '', nombre: u?.nombre || '', telefono: '', direccion: '', cp: '', ciudad: '', provincia: '', notas: '', acepta: false });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const resumenError = useRef(null);

  if (!cesta.length && !enviando) return <Navigate to="/cesta" replace />;

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setD((x) => ({ ...x, [k]: v }));
    if (errores[k]) setErrores((er) => { const n = { ...er }; delete n[k]; return n; });
  };
  const zona = zonaDeCp(d.cp);
  const envio = costeEnvio(zona, subtotal);
  const total = subtotal + (envio ?? 0);

  const pagar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEnviando(true);
    try {
      const r = await api('/pedidos', { metodo: 'POST', datos: { ...d, lineas: lineasParaServidor(cesta) } });
      if (r.url) { window.location.assign(r.url); return; }
      vaciar();
      navegar(`/pedido/${r.codigo}?t=${r.token}`, { replace: true });
    } catch (err) {
      setEnviando(false);
      setErrores(err.campos || {});
      setMensaje(err.message);
      if (err.estado === 409) {
        api('/cesta', { metodo: 'POST', datos: { lineas: lineasParaServidor(cesta) } }).then((r) => sincronizar(r.lineas)).catch(() => {});
      }
      requestAnimationFrame(() => {
        const primero = Object.keys(err.campos || {})[0];
        if (primero) document.getElementById(primero)?.focus();
        else resumenError.current?.focus();
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-10 pt-10">
      <h1 className="serigrafia text-[clamp(2.6rem,6vw,4.4rem)]">Caja</h1>
      {!u ? <p className="mt-4 text-serigrafia-tenue">¿Tienes cuenta? <Link viewTransition to="/cuenta?volver=/caja" className="underline underline-offset-4 text-serigrafia">Entra</Link> para ver luego tus pedidos. También puedes comprar sin cuenta.</p> : null}

      <form onSubmit={pagar} noValidate className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
        <div className="grid gap-8">
          {mensaje ? <div ref={resumenError} tabIndex={-1} role="alert" className="rounded bg-alerta/15 text-alerta p-4 font-medium">{mensaje}</div> : null}
          <fieldset className="grid sm:grid-cols-2 gap-5">
            <legend className="font-semibold text-xl mb-4">Tus datos</legend>
            <Campo id="email" etiqueta="Correo electrónico" type="email" autoComplete="email" required value={d.email} onChange={set('email')} error={errores.email} ayuda="Te mandamos aquí la confirmación." className="sm:col-span-2" />
            <Campo id="nombre" etiqueta="Nombre y apellidos" autoComplete="name" required value={d.nombre} onChange={set('nombre')} error={errores.nombre} />
            <Campo id="telefono" etiqueta="Teléfono (opcional)" type="tel" autoComplete="tel" value={d.telefono} onChange={set('telefono')} ayuda="Solo para la empresa de reparto." />
          </fieldset>
          <fieldset className="grid sm:grid-cols-2 gap-5">
            <legend className="font-semibold text-xl mb-4">Dirección de entrega</legend>
            <Campo id="direccion" etiqueta="Dirección" autoComplete="street-address" required value={d.direccion} onChange={set('direccion')} error={errores.direccion} className="sm:col-span-2" />
            <Campo id="cp" etiqueta="Código postal" inputMode="numeric" autoComplete="postal-code" maxLength={5} required value={d.cp} onChange={set('cp')} error={errores.cp} ayuda={zona === 'peninsula' ? 'Península: 24-48 h desde que sale del taller.' : zona === 'baleares' ? 'Baleares: 2-3 días.' : zona === 'canarias' ? 'Canarias: 4-6 días. El trámite de aduana corre de nuestra cuenta.' : 'Enviamos a la península, Baleares y Canarias.'} />
            <Campo id="ciudad" etiqueta="Ciudad" autoComplete="address-level2" required value={d.ciudad} onChange={set('ciudad')} error={errores.ciudad} />
            <Campo id="provincia" etiqueta="Provincia" autoComplete="address-level1" required value={d.provincia} onChange={set('provincia')} error={errores.provincia} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label htmlFor="notas" className="etiqueta">Notas para el envío (opcional)</label>
              <textarea id="notas" className="campo min-h-24" maxLength={500} value={d.notas} onChange={set('notas')} />
            </div>
          </fieldset>
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input id="acepta" type="checkbox" className="mt-1 size-5 accent-[var(--color-cobre)] shrink-0" checked={d.acepta} onChange={set('acepta')} aria-invalid={errores.acepta ? 'true' : undefined} aria-describedby={errores.acepta ? 'acepta-error' : undefined} />
              <span>He leído y acepto las <Link viewTransition to="/legal/condiciones" className="underline underline-offset-4" target="_blank">condiciones de venta</Link> y la <Link viewTransition to="/legal/privacidad" className="underline underline-offset-4" target="_blank">política de privacidad</Link>.</span>
            </label>
            {errores.acepta ? <p id="acepta-error" className="error-campo">{errores.acepta}</p> : null}
          </div>
        </div>

        <aside className="plano p-6 lg:sticky lg:top-24" aria-label="Tu pedido">
          <h2 className="font-semibold text-xl">Tu pedido</h2>
          <ul className="mt-4 grid gap-4">
            {cesta.map((x) => (
              <li key={x.clave} className={`flex gap-3 items-center ${x.agotado ? 'opacity-50' : ''}`}>
                <div className="w-16 aspect-[4/3] shrink-0 rounded bg-mascara-honda p-1"><Miniatura producto={x.producto} vista={x.vista} className="w-full h-full" /></div>
                <div className="min-w-0 grow text-sm"><p className="font-semibold line-clamp-2">{x.montaje ? x.titulo : x.producto.titulo}</p>{x.cantidad > 1 ? <p className="text-serigrafia-tenue">{x.cantidad} uds.</p> : null}</div>
                <p className="text-sm font-semibold numeros">{x.agotado ? 'Sin stock' : euros(precioLinea(x) * x.cantidad)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 pt-4 border-t border-mascara-borde grid gap-2">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="numeros">{euros(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Envío</dt><dd className="numeros">{envio === null ? 'Escribe tu código postal' : envio === 0 ? 'Gratis' : euros(envio)}</dd></div>
            <div className="flex justify-between text-lg font-semibold pt-2"><dt>Total</dt><dd className="numeros">{euros(total)}</dd></div>
          </dl>
          <p className="mt-1 text-sm text-serigrafia-tenue">IVA incluido.</p>
          <button type="submit" className="pad w-full mt-6" disabled={enviando}>{enviando ? 'Procesando…' : sesion.stripe ? `Pagar ${euros(total)}` : `Confirmar pedido de prueba`}</button>
          <p className="mt-3 text-sm text-serigrafia-tenue text-center">{sesion.stripe ? 'Pago seguro con tarjeta a través de Stripe.' : 'Modo demo: no se cobra nada.'}</p>
        </aside>
      </form>
    </div>
  );
}
