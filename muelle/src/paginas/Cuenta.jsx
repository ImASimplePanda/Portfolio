import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTienda } from '../contexto/Tienda.jsx';
import { api, fijarCsrf } from '../lib/api.js';
import { euros, fecha, ESTADOS } from '../lib/formato.js';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';

export function CampoCuenta({ id, etiqueta, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta">{etiqueta}</label>
      <input id={id} className="campo" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error ? <p id={`${id}-error`} className="error-campo">{error}</p> : null}
    </div>
  );
}

function Acceso() {
  const { setSesion, sesion } = useTienda();
  const [modo, setModo] = useState('entrar');
  const [d, setD] = useState({ email: '', clave: '', nombre: '' });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setMensaje(''); setErrores({}); setOk('');
    setEnviando(true);
    try {
      if (modo === 'recuperar') {
        await api('/cuenta/recuperar', { metodo: 'POST', datos: { email: d.email } });
        setOk('Si hay una cuenta con ese correo, te hemos enviado un enlace para cambiar la contraseña.');
      } else {
        const r = await api(modo === 'entrar' ? '/cuenta/entrar' : '/cuenta/registro', { metodo: 'POST', datos: d });
        setSesion({ ...sesion, usuario: r.usuario });
        const volver = params.get('volver');
        navegar(volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : r.usuario.rol === 'admin' ? '/admin' : '/cuenta', { replace: true });
      }
    } catch (err) {
      setErrores(err.campos || {});
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const pestana = (m, texto) => (
    <button type="button" role="tab" aria-selected={modo === m} onClick={() => { setModo(m); setMensaje(''); setErrores({}); setOk(''); }}
      className={`min-h-11 px-5 rounded-full font-semibold ${modo === m ? 'bg-cobre text-mascara-honda' : 'hover:bg-mascara-alta/60'}`}>{texto}</button>
  );

  return (
    <div className="mx-auto max-w-[480px] px-4 pt-12">
      <h1 className="serigrafia text-[clamp(2.6rem,6vw,4rem)]">{modo === 'registro' ? 'Crea tu cuenta' : modo === 'recuperar' ? 'Recupera tu contraseña' : 'Entra en tu cuenta'}</h1>
      {modo !== 'recuperar' ? <div role="tablist" aria-label="Acceso" className="mt-6 inline-flex gap-1 rounded-full bg-mascara-alta border border-mascara-borde p-1">{pestana('entrar', 'Entrar')}{pestana('registro', 'Crear cuenta')}</div> : null}
      <form onSubmit={enviar} noValidate className="mt-8 grid gap-5">
        {mensaje ? <p role="alert" className="rounded bg-alerta/15 text-alerta p-4 font-medium">{mensaje}</p> : null}
        {ok ? <p role="status" className="rounded bg-cobre/15 text-cobre-vivo p-4 font-medium">{ok}</p> : null}
        {modo === 'registro' ? <CampoCuenta id="nombre" etiqueta="Nombre" autoComplete="name" value={d.nombre} onChange={set('nombre')} error={errores.nombre} /> : null}
        <CampoCuenta id="email" etiqueta="Correo electrónico" type="email" autoComplete="email" value={d.email} onChange={set('email')} error={errores.email} />
        {modo !== 'recuperar' ? (
          <CampoCuenta id="clave" etiqueta={modo === 'registro' ? 'Contraseña (mínimo 10 caracteres)' : 'Contraseña'} type="password" autoComplete={modo === 'registro' ? 'new-password' : 'current-password'} value={d.clave} onChange={set('clave')} error={errores.clave} />
        ) : null}
        <button type="submit" className="pad" disabled={enviando}>{enviando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : modo === 'registro' ? 'Crear cuenta' : 'Enviar enlace'}</button>
        {modo === 'entrar' ? <button type="button" className="text-sm underline underline-offset-4 justify-self-start min-h-10" onClick={() => { setModo('recuperar'); setMensaje(''); }}>He olvidado la contraseña</button> : null}
        {modo === 'recuperar' ? <button type="button" className="text-sm underline underline-offset-4 justify-self-start min-h-10" onClick={() => { setModo('entrar'); setOk(''); }}>Volver a entrar</button> : null}
      </form>
      {modo === 'registro' ? <p className="mt-6 text-sm text-serigrafia-tenue">Al crear la cuenta aceptas la <Link viewTransition to="/legal/privacidad" className="underline underline-offset-4">política de privacidad</Link>. Solo guardamos tu nombre, tu correo y tus pedidos.</p> : null}
    </div>
  );
}

function MisPedidos() {
  const { sesion, setSesion } = useTienda();
  const { datos, error } = usarDatos('/cuenta/pedidos');
  const navegar = useNavigate();
  const salir = async () => {
    const r = await api('/cuenta/salir', { metodo: 'POST' });
    fijarCsrf(r.csrf);
    setSesion({ ...sesion, usuario: null });
    navegar('/', { replace: true });
  };
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="serigrafia text-[clamp(2.6rem,6vw,4.4rem)]">Hola, {sesion.usuario.nombre.split(' ')[0]}</h1>
        <div className="flex gap-2">
          {sesion.usuario.rol === 'admin' ? <Link viewTransition to="/admin" className="pad">Panel de la tienda</Link> : null}
          <button type="button" className="pad-linea" onClick={salir}>Cerrar sesión</button>
        </div>
      </div>
      <h2 className="mt-12 font-semibold text-xl">Tus pedidos</h2>
      {error ? <p className="mt-4 text-alerta">{error.message}</p> : null}
      {datos && !datos.pedidos.length ? <p className="mt-4 text-serigrafia-tenue">Todavía no has hecho ningún pedido. <Link viewTransition to="/tienda" className="underline underline-offset-4 text-serigrafia">Mira la tienda</Link>.</p> : null}
      <ul className="mt-4 divide-y divide-mascara-borde border-y border-mascara-borde">
        {datos?.pedidos.map((p) => (
          <li key={p.codigo}>
            <Link viewTransition to={`/pedido/${p.codigo}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-mascara-alta px-2 -mx-2 rounded-lg">
              <span><span className="font-semibold">{p.codigo}</span> <span className="text-serigrafia-tenue">· {fecha(p.creado)}</span></span>
              <span className="text-serigrafia-tenue">{p.lineas.map((l) => l.titulo).join(', ').slice(0, 60)}</span>
              <span className="flex items-center gap-3"><span className="rounded-full bg-cobre/15 text-cobre-vivo text-sm font-semibold px-2.5 py-0.5">{ESTADOS[p.estado]}</span><span className="font-semibold numeros">{euros(p.total)}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Cuenta() {
  const { sesion } = useTienda();
  usarTitulo(sesion.usuario ? 'Tu cuenta' : 'Entrar');
  if (sesion.cargando) return <div className="min-h-[60vh]" aria-busy="true" />;
  return sesion.usuario ? <MisPedidos /> : <Acceso />;
}
