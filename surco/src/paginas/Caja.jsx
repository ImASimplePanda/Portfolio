import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useTienda } from '../contexto/Tienda.jsx';
import { api } from '../lib/api.js';
import { costeEnvio, euros, zonaDeCp } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarDatos.js';
import { Miniatura } from './Cesta.jsx';

function Campo({ id, etiqueta, error, ayuda, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="etiqueta">{etiqueta}</label>
      <input id={id} name={id} className="campo" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined} {...props} />
      {ayuda && !error ? <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-gris">{ayuda}</p> : null}
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
      const r = await api('/pedidos', { metodo: 'POST', datos: { ...d, lineas: cesta.map((x) => ({ id: x.id, cantidad: x.cantidad })) } });
      if (r.url) { window.location.assign(r.url); return; }
      vaciar();
      navegar(`/pedido/${r.codigo}?t=${r.token}`, { replace: true });
    } catch (err) {
      setEnviando(false);
      setErrores(err.campos || {});
      setMensaje(err.message);
      if (err.estado === 409) {
        api('/cesta', { metodo: 'POST', datos: { lineas: cesta.map((x) => ({ id: x.id })) } }).then((r) => sincronizar(r.lineas)).catch(() => {});
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
      <h1 className="rotulo text-[clamp(2.6rem,6vw,4.4rem)]">Caja</h1>
      {!u ? <p className="mt-4 text-gris">¿Tienes cuenta? <Link to="/cuenta?volver=/caja" className="underline underline-offset-4 text-tinta">Entra</Link> para ver luego tus pedidos. También puedes comprar sin cuenta.</p> : null}

      <form onSubmit={pagar} noValidate className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
        <div className="grid gap-8">
          {mensaje ? <div ref={resumenError} tabIndex={-1} role="alert" className="rounded-2xl bg-alerta-claro text-alerta p-4 font-medium">{mensaje}</div> : null}
          <fieldset className="grid sm:grid-cols-2 gap-5">
            <legend className="font-semibold text-xl mb-4">Tus datos</legend>
            <Campo id="email" etiqueta="Correo electrónico" type="email" autoComplete="email" required value={d.email} onChange={set('email')} error={errores.email} ayuda="Te mandamos aquí la confirmación." className="sm:col-span-2" />
            <Campo id="nombre" etiqueta="Nombre y apellidos" autoComplete="name" required value={d.nombre} onChange={set('nombre')} error={errores.nombre} />
            <Campo id="telefono" etiqueta="Teléfono (opcional)" type="tel" autoComplete="tel" value={d.telefono} onChange={set('telefono')} ayuda="Solo para la empresa de reparto." />
          </fieldset>
          <fieldset className="grid sm:grid-cols-2 gap-5">
            <legend className="font-semibold text-xl mb-4">Dirección de entrega</legend>
            <Campo id="direccion" etiqueta="Dirección" autoComplete="street-address" required value={d.direccion} onChange={set('direccion')} error={errores.direccion} className="sm:col-span-2" />
            <Campo id="cp" etiqueta="Código postal" inputMode="numeric" autoComplete="postal-code" maxLength={5} required value={d.cp} onChange={set('cp')} error={errores.cp} ayuda={zona === 'canarias' ? 'Canarias: envío en 24-48 h.' : zona === 'peninsula' ? 'Península y Baleares: 3-5 días. Puede requerir trámite aduanero desde Canarias, que corre de nuestra cuenta.' : 'Enviamos a Canarias, península y Baleares.'} />
            <Campo id="ciudad" etiqueta="Ciudad" autoComplete="address-level2" required value={d.ciudad} onChange={set('ciudad')} error={errores.ciudad} />
            <Campo id="provincia" etiqueta="Provincia" autoComplete="address-level1" required value={d.provincia} onChange={set('provincia')} error={errores.provincia} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label htmlFor="notas" className="etiqueta">Notas para el envío (opcional)</label>
              <textarea id="notas" className="campo min-h-24" maxLength={500} value={d.notas} onChange={set('notas')} />
            </div>
          </fieldset>
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input id="acepta" type="checkbox" className="mt-1 size-5 accent-cobalto shrink-0" checked={d.acepta} onChange={set('acepta')} aria-invalid={errores.acepta ? 'true' : undefined} aria-describedby={errores.acepta ? 'acepta-error' : undefined} />
              <span>He leído y acepto las <Link to="/legal/condiciones" className="underline underline-offset-4" target="_blank">condiciones de venta</Link> y la <Link to="/legal/privacidad" className="underline underline-offset-4" target="_blank">política de privacidad</Link>.</span>
            </label>
            {errores.acepta ? <p id="acepta-error" className="error-campo">{errores.acepta}</p> : null}
          </div>
        </div>

        <aside className="rounded-2xl bg-papel border border-linea p-6 lg:sticky lg:top-24" aria-label="Tu pedido">
          <h2 className="font-semibold text-xl">Tu pedido</h2>
          <ul className="mt-4 grid gap-4">
            {cesta.map(({ id, cantidad, producto: p, agotado }) => (
              <li key={id} className={`flex gap-3 items-center ${agotado ? 'opacity-50' : ''}`}>
                <div className="scale-75 origin-left -mr-5"><Miniatura p={p} /></div>
                <div className="min-w-0 grow text-sm"><p className="font-semibold truncate">{p.artista || p.titulo}</p>{p.artista ? <p className="text-gris truncate">{p.titulo}</p> : null}{cantidad > 1 ? <p className="text-gris">{cantidad} uds.</p> : null}</div>
                <p className="text-sm font-semibold tabular-nums">{agotado ? 'Vendido' : euros(p.precio * cantidad)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 pt-4 border-t border-linea grid gap-2">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{euros(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Envío</dt><dd className="tabular-nums">{envio === null ? 'Escribe tu código postal' : envio === 0 ? 'Gratis' : euros(envio)}</dd></div>
            <div className="flex justify-between text-lg font-semibold pt-2"><dt>Total</dt><dd className="tabular-nums">{euros(total)}</dd></div>
          </dl>
          <p className="mt-1 text-sm text-gris">IGIC incluido.</p>
          <button type="submit" className="boton w-full mt-6" disabled={enviando}>{enviando ? 'Procesando…' : sesion.stripe ? `Pagar ${euros(total)}` : `Confirmar pedido de prueba`}</button>
          <p className="mt-3 text-sm text-gris text-center">{sesion.stripe ? 'Pago seguro con tarjeta a través de Stripe.' : 'Modo demo: no se cobra nada.'}</p>
        </aside>
      </form>
    </div>
  );
}
