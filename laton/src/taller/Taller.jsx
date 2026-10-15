import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router';
import { usarSesion } from '../contexto/Sesion.jsx';
import { api, fijarCsrf } from '../lib/api.js';
import { OPCIONES as O, porId } from '../lib/configuracion.js';
import { euros, fechaLarga } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarTitulo.js';
import { Chapa } from '../componentes/Marco.jsx';

// Panel del taller: citas de medición y avance de cada encargo
export default function Taller() {
  const { cargada, usuario, demo, recargar, setSesion } = usarSesion();
  usarTitulo('Taller');
  if (!cargada) return <div className="min-h-dvh" aria-busy="true" />;
  if (!usuario) return <Entrar alEntrar={recargar} />;

  async function salir() {
    const r = await api('/taller/salir', { metodo: 'POST' });
    fijarCsrf(r.csrf);
    setSesion((s) => ({ ...s, usuario: null }));
  }

  const pestana = ({ isActive }) => `px-3 py-2 rounded-[2px] font-semibold ${isActive ? 'bg-tinta text-papel' : 'hover:bg-tinta/8'}`;
  return (
    <div className="min-h-dvh bg-acero-claro">
      {demo ? <p className="bg-tinta text-acero-claro text-center text-sm px-4 py-1.5">Panel de demostración: los encargos y las citas son de ejemplo.</p> : null}
      <header className="bg-acero border-b border-tinta/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4">
          <Link to="/" className="flex items-center gap-2"><Chapa className="h-8 w-auto" /><span className="rotulo text-2xl">Latón</span></Link>
          <nav aria-label="Panel" className="flex gap-1">
            <NavLink end to="/taller" className={pestana}>Resumen</NavLink>
            <NavLink to="/taller/citas" className={pestana}>Citas</NavLink>
            <NavLink to="/taller/encargos" className={pestana}>Encargos</NavLink>
          </nav>
          <button type="button" className="ml-auto boton boton-linea !min-h-9 !py-1.5" onClick={salir}>Cerrar sesión</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Routes>
          <Route index element={<Resumen />} />
          <Route path="citas" element={<Citas />} />
          <Route path="encargos" element={<Encargos />} />
        </Routes>
      </main>
    </div>
  );
}

function Entrar({ alEntrar }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  async function enviar(e) {
    e.preventDefault();
    setEnviando(true); setError('');
    try { await api('/taller/entrar', { metodo: 'POST', datos: { email, clave } }); await alEntrar(); }
    catch (err) { setError(err.message); setEnviando(false); }
  }
  return (
    <main className="min-h-dvh grid place-items-center px-4 bg-acero">
      <form onSubmit={enviar} className="w-full max-w-sm grid gap-4 bg-papel p-6 rounded-[4px]">
        <Chapa className="h-12 w-auto justify-self-start" />
        <h1 className="rotulo text-5xl">Acceso del taller</h1>
        <div>
          <label htmlFor="t-email" className="etiqueta">Correo</label>
          <input id="t-email" className="campo" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="t-clave" className="etiqueta">Contraseña</label>
          <input id="t-clave" className="campo" type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        </div>
        {error ? <p className="error-campo" role="alert">{error}</p> : null}
        <button className="boton" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="text-sm text-grafito underline justify-self-start">Volver a la web</Link>
      </form>
    </main>
  );
}

function usarCarga(ruta) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [vuelta, setVuelta] = useState(0);
  useEffect(() => { api(ruta).then(setDatos).catch((e) => setError(e.message)); }, [ruta, vuelta]);
  return { datos, error, recargar: () => setVuelta((v) => v + 1) };
}

function Resumen() {
  const { datos: d, error } = usarCarga('/taller/resumen');
  if (error) return <p className="error-campo">{error}</p>;
  if (!d) return <p aria-busy="true">Cargando…</p>;
  const cifras = [
    ['Citas por delante', d.citasProximas, '/taller/citas'],
    ['Bicis en el taller', d.enTaller, '/taller/encargos'],
    ['Señales cobradas', euros(d.senales), null],
    ['Por cobrar en la entrega', euros(d.pendienteCobro), null],
  ];
  return (
    <>
      <h1 className="rotulo text-5xl">Resumen</h1>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cifras.map(([k, v, a]) => (
          <div key={k} className="bg-papel rounded-[4px] p-4">
            <dt className="text-grafito">{k}</dt>
            <dd className="rotulo text-5xl mt-1 numeros">{a ? <Link to={a} className="hover:text-laton">{v}</Link> : v}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-10 text-lg font-semibold">Configuraciones guardadas: {d.configuraciones}</h2>
      <ul className="mt-3 grid gap-2 max-w-md">
        {d.modelos.map((x) => {
          const pct = d.configuraciones ? Math.round((x.n / d.configuraciones) * 100) : 0;
          return (
            <li key={x.modelo} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3">
              <span>{porId(O.modelos, x.modelo)?.nombre ?? x.modelo}</span>
              <span className="h-3 rounded-full bg-tinta/10 overflow-hidden" aria-hidden="true"><span className="block h-full bg-laton-vivo" style={{ width: `${pct}%` }} /></span>
              <span className="numeros text-right">{x.n}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

const ESTADOS_CITA = { reservada: 'Reservada', hecha: 'Hecha', no_vino: 'No vino', cancelada: 'Cancelada' };

function Citas() {
  const { datos, error, recargar } = usarCarga('/taller/citas');
  const [aviso, setAviso] = useState('');
  async function cambiar(codigo, estado) {
    setAviso('');
    try { await api(`/taller/citas/${codigo}`, { metodo: 'PATCH', datos: { estado } }); setAviso(`Cita ${codigo}: ${ESTADOS_CITA[estado].toLowerCase()}.`); recargar(); }
    catch (e) { setAviso(e.message); recargar(); }
  }
  if (error) return <p className="error-campo">{error}</p>;
  if (!datos) return <p aria-busy="true">Cargando…</p>;
  const porDia = Object.groupBy ? Object.groupBy(datos.citas, (c) => c.fecha) : datos.citas.reduce((a, c) => ((a[c.fecha] ||= []).push(c), a), {});
  return (
    <>
      <h1 className="rotulo text-5xl">Citas</h1>
      <p className="mt-1 text-grafito">Desde hace una semana hasta las cuatro próximas.</p>
      <p role="status" className="mt-2 min-h-6 text-sm">{aviso}</p>
      {datos.citas.length === 0 ? <p className="mt-6">No hay citas. Cuando alguien reserve desde la web, aparecerá aquí.</p> : null}
      <div className="mt-4 grid gap-8">
        {Object.entries(porDia).map(([fecha, citas]) => (
          <section key={fecha}>
            <h2 className="font-semibold first-letter:uppercase">{fechaLarga(fecha)}</h2>
            <ul className="mt-2 grid gap-2">
              {citas.map((c) => (
                <li key={c.codigo} className={`bg-papel rounded-[4px] p-4 grid gap-3 sm:grid-cols-[4rem_1fr_auto] sm:items-center ${c.estado === 'cancelada' ? 'opacity-60' : ''}`}>
                  <span className="rotulo text-3xl numeros">{c.hora}</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{c.nombre}</p>
                    <p className="text-sm text-grafito break-words"><a href={`tel:${c.telefono.replace(/\s/g, '')}`} className="underline">{c.telefono}</a>, <a href={`mailto:${c.email}`} className="underline">{c.email}</a></p>
                    {c.configuracion ? <p className="text-sm mt-1">Trae la bici <Link to={`/configurador/${c.configuracion}`} className="underline font-semibold">{c.configuracion}</Link></p> : null}
                    {c.notas ? <p className="text-sm mt-1 text-grafito">«{c.notas}»</p> : null}
                  </div>
                  <label className="text-sm">
                    <span className="sr-only">Estado de la cita de {c.nombre}</span>
                    <select className="campo !min-h-10 !py-1.5" value={c.estado} onChange={(e) => cambiar(c.codigo, e.target.value)}>
                      {Object.entries(ESTADOS_CITA).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function Encargos() {
  const { datos, error, recargar } = usarCarga('/taller/pedidos');
  if (error) return <p className="error-campo">{error}</p>;
  if (!datos) return <p aria-busy="true">Cargando…</p>;
  return (
    <>
      <h1 className="rotulo text-5xl">Encargos</h1>
      {datos.pedidos.length === 0 ? <p className="mt-6">Todavía no hay encargos.</p> : null}
      <ul className="mt-6 grid gap-3">
        {datos.pedidos.map((p) => <Encargo key={p.codigo} p={p} recargar={recargar} />)}
      </ul>
    </>
  );
}

function Encargo({ p, recargar }) {
  const [etapa, setEtapa] = useState(p.etapa);
  const [nota, setNota] = useState(p.nota || '');
  const [aviso, setAviso] = useState('');
  const [guardando, setGuardando] = useState(false);
  const c = p.ficha.configuracion;
  const m = porId(O.modelos, c.modelo);
  const cambiado = etapa !== p.etapa || nota !== (p.nota || '');

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true); setAviso('');
    try {
      await api(`/taller/pedidos/${p.codigo}`, { metodo: 'PATCH', datos: { etapa, nota } });
      setAviso(etapa !== p.etapa ? `Guardado. Le hemos escrito a ${p.nombre.split(' ')[0]} para contárselo.` : 'Nota guardada.');
      recargar();
    } catch (err) { setAviso(err.message); }
    setGuardando(false);
  }

  return (
    <li className="bg-papel rounded-[4px] p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="rotulo text-3xl">{m.nombre} de {c.material}</h2>
        <span className="font-semibold">{p.nombre}</span>
        <span className="text-sm text-grafito numeros">{p.codigo}</span>
        <span className="ml-auto numeros">{euros(p.total)} <span className="text-sm text-grafito">({euros(p.senal)} de señal)</span></span>
      </div>
      <p className="text-sm text-grafito mt-1">
        Talla {p.ficha.talla.nombre}, {porId(O.acabados, c.acabado)?.nombre.toLowerCase()}, {porId(O.transmisiones, c.transmision)?.nombre}. <a href={`tel:${p.telefono.replace(/\s/g, '')}`} className="underline">{p.telefono}</a>
      </p>
      {p.estado !== 'confirmado' ? (
        <p className="mt-3 text-sm font-semibold text-alerta">{p.estado === 'pendiente' ? 'Señal sin pagar todavía.' : 'Pago caducado: no se cobró.'}</p>
      ) : (
        <form onSubmit={guardar} className="mt-4 grid gap-3 md:grid-cols-[14rem_1fr_auto] md:items-end">
          <div>
            <label htmlFor={`e-${p.codigo}`} className="etiqueta">Etapa</label>
            <select id={`e-${p.codigo}`} className="campo" value={etapa} onChange={(e) => setEtapa(Number(e.target.value))}>
              {p.etapas.map((t, i) => <option key={t} value={i}>{i + 1}. {t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`n-${p.codigo}`} className="etiqueta">Nota para el cliente <span className="font-normal text-grafito">(opcional)</span></label>
            <input id={`n-${p.codigo}`} className="campo" maxLength={600} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej.: ya está soldada, el lunes va a pintura" />
          </div>
          <button className="boton" disabled={!cambiado || guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </form>
      )}
      <p role="status" className="text-sm mt-2 min-h-5">{aviso}</p>
    </li>
  );
}
