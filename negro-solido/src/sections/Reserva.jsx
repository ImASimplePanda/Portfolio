import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { WhatsappIcon, InstagramIcon, Location01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import Stepper, { Step } from '../components/rb/Stepper.jsx';
import { estudio, estilos, artistas, demo } from '../data/estudio.js';
import { B } from '../base.js';

const zonas = ['Antebrazo', 'Brazo', 'Hombro', 'Espalda', 'Pecho', 'Costillas', 'Pierna', 'Tobillo o pie', 'Mano', 'Cuello', 'Otra zona'];
const tamanos = ['Menos de 5 cm', '5 a 10 cm', '10 a 20 cm', 'Más de 20 cm', 'No lo sé'];
const vacio = { estilo: '', artista: 'Me da igual', idea: '', zona: '', tamano: '', primero: '', nombre: '', email: '', telefono: '', mayor: false, privacidad: false };

const reglas = {
  1: { estilo: 'Elige un estilo.', idea: 'Cuéntanos la idea en unas palabras.' },
  2: { zona: 'Elige la zona del cuerpo.', tamano: 'Elige un tamaño aproximado.' },
  3: { nombre: 'Escribe tu nombre.', email: 'Escribe un correo válido, por ejemplo nombre@correo.com.', mayor: 'Solo tatuamos a mayores de 18 años.', privacidad: 'Necesitamos tu consentimiento para responderte.' },
};
const validar = (paso, d) => {
  const e = {};
  for (const [k, msg] of Object.entries(reglas[paso] || {})) {
    const v = d[k];
    if (k === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) : typeof v === 'boolean' ? !v : !String(v).trim()) e[k] = msg;
  }
  return e;
};

function Campo({ id, label, error, children, ancho }) {
  return (
    <div className={`campo${ancho ? ' campo--ancho' : ''}`}>
      <label htmlFor={`r-${id}`}>{label}</label>
      {children}
      {error && <p className="campo__error" id={`r-${id}-error`}>{error}</p>}
    </div>
  );
}

export default function Reserva({ flashElegido }) {
  const [paso, setPaso] = useState(1);
  const [d, setD] = useState(vacio);
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState('');
  const raiz = useRef(null);

  useEffect(() => {
    if (!flashElegido) return;
    setD((x) => ({ ...x, estilo: 'flash', idea: `Quiero el flash "${flashElegido.nombre}" (${flashElegido.tamano}, ${flashElegido.precio} €).` }));
    setPaso(1);
  }, [flashElegido]);

  const set = (k) => (ev) => {
    const v = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    setD((x) => ({ ...x, [k]: v }));
    if (errores[k]) setErrores((e) => { const n = { ...e }; delete n[k]; return n; });
  };
  const aria = (k) => ({ id: `r-${k}`, 'aria-invalid': errores[k] ? 'true' : undefined, 'aria-describedby': errores[k] ? `r-${k}-error` : undefined });

  const enfocarError = (e) => {
    const primero = Object.keys(e)[0];
    requestAnimationFrame(() => document.getElementById(`r-${primero}`)?.focus());
  };

  const cambiarPaso = (siguiente) => {
    if (siguiente > paso) {
      const e = validar(paso, d);
      if (Object.keys(e).length) { setErrores(e); enfocarError(e); return; }
    }
    setErrores({});
    setPaso(siguiente);
  };

  const enviar = async () => {
    const e = validar(3, d);
    if (Object.keys(e).length) { setErrores(e); enfocarError(e); return; }
    setEstado('enviando');
    // En la demo no se envía nada: se muestra la confirmación tal cual la vería el cliente
    if (demo) {
      await new Promise((r) => setTimeout(r, 700));
      setEstado('ok');
      setPaso(4);
      return;
    }
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${estudio.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Cita web · ${d.nombre}`,
          _template: 'table',
          _captcha: 'false',
          Estilo: estilos.find((s) => s.id === d.estilo)?.nombre || d.estilo,
          Artista: d.artista,
          Idea: d.idea,
          Zona: d.zona,
          Tamaño: d.tamano,
          'Primer tatuaje': d.primero || 'Sin indicar',
          Nombre: d.nombre,
          Email: d.email,
          Teléfono: d.telefono || 'Sin indicar',
          'Mayor de edad': 'Sí',
          Privacidad: 'Acepta',
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !(j.success === true || j.success === 'true')) throw new Error('envío');
      setEstado('ok');
      setPaso(4);
    } catch {
      setEstado('error');
    }
  };

  const terminado = (
    <div className="reserva__ok" role="status">
      <p className="reserva__ok-t">Recibido, {d.nombre.split(' ')[0] || 'gracias'}.</p>
      <p>Te escribimos a {d.email} en menos de 48 horas con el presupuesto y las fechas libres.</p>
      {demo && <p className="reserva__demo">Esto es una demo: la solicitud no se ha enviado a ningún sitio.</p>}
      <button type="button" className="boton boton--linea" onClick={() => { setD(vacio); setPaso(1); setEstado(''); }}>Enviar otra idea</button>
    </div>
  );

  return (
    <section className="seccion reserva" id="cita" aria-labelledby="cita-t" ref={raiz}>
      <div className="envoltura reserva__rejilla">
        <div className="reserva__intro">
          <p className="ceja">Pide cita</p>
          <h2 id="cita-t" className="titular">Cuéntanos qué quieres llevar</h2>
          <p className="entradilla">Tres pasos y menos de dos minutos. Sin pago hasta que aceptes el presupuesto.</p>
          <ul className="reserva__datos" role="list">
            <li><HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={1.6} /><a href={`https://wa.me/${estudio.whatsapp}?text=${encodeURIComponent('Hola, quiero pedir cita en Negro Sólido.')}`} target="_blank" rel="noopener">WhatsApp {estudio.whatsappVisible}</a></li>
            <li><HugeiconsIcon icon={InstagramIcon} size={20} strokeWidth={1.6} /><a href={estudio.instagram} target="_blank" rel="noopener">{estudio.instagramHandle}</a></li>
            <li><HugeiconsIcon icon={Location01Icon} size={20} strokeWidth={1.6} /><span>{estudio.direccion.calle}, Triana</span></li>
            <li><HugeiconsIcon icon={Clock01Icon} size={20} strokeWidth={1.6} /><span>{estudio.horario}</span></li>
          </ul>
        </div>

        <form className="reserva__form" noValidate onSubmit={(e) => e.preventDefault()} aria-label="Solicitud de cita">
          <Stepper
            step={paso}
            onStepChange={cambiarPaso}
            onFinalStepCompleted={enviar}
            linear
            theme="dark"
            accentColor="#ff4127"
            radius={2}
            width="100%"
            backButtonText="Atrás"
            nextButtonText="Siguiente"
            completeButtonText={estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
            nextButtonProps={{ disabled: estado === 'enviando' }}
            completedContent={terminado}
          >
            <Step title="La idea">
              <div className="campos">
                <Campo id="estilo" label="Estilo" error={errores.estilo}>
                  <select {...aria('estilo')} value={d.estilo} onChange={set('estilo')}>
                    <option value="">Elige un estilo</option>
                    {estilos.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    <option value="no-se">Aún no lo sé</option>
                  </select>
                </Campo>
                <Campo id="artista" label="Artista">
                  <select {...aria('artista')} value={d.artista} onChange={set('artista')}>
                    <option>Me da igual</option>
                    {artistas.map((a) => <option key={a.id}>{a.nombre}</option>)}
                  </select>
                </Campo>
                <Campo id="idea" label="Tu idea" error={errores.idea} ancho>
                  <textarea {...aria('idea')} rows={4} maxLength={1200} value={d.idea} onChange={set('idea')} placeholder="Qué quieres, qué significa, referencias que te gustan…" />
                </Campo>
              </div>
            </Step>
            <Step title="Zona y tamaño">
              <div className="campos">
                <Campo id="zona" label="Zona del cuerpo" error={errores.zona}>
                  <select {...aria('zona')} value={d.zona} onChange={set('zona')}>
                    <option value="">Elige una zona</option>
                    {zonas.map((z) => <option key={z}>{z}</option>)}
                  </select>
                </Campo>
                <Campo id="tamano" label="Tamaño aproximado" error={errores.tamano}>
                  <select {...aria('tamano')} value={d.tamano} onChange={set('tamano')}>
                    <option value="">Elige un tamaño</option>
                    {tamanos.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Campo>
                <fieldset className="campo campo--ancho opciones">
                  <legend>¿Es tu primer tatuaje? (opcional)</legend>
                  {['Sí', 'No'].map((o) => (
                    <label key={o} className="opcion">
                      <input type="radio" name="primero" value={o} checked={d.primero === o} onChange={set('primero')} />
                      <span>{o}</span>
                    </label>
                  ))}
                </fieldset>
              </div>
            </Step>
            <Step title="Tus datos">
              <div className="campos">
                <Campo id="nombre" label="Nombre" error={errores.nombre}>
                  <input {...aria('nombre')} type="text" autoComplete="name" maxLength={120} value={d.nombre} onChange={set('nombre')} />
                </Campo>
                <Campo id="email" label="Correo electrónico" error={errores.email}>
                  <input {...aria('email')} type="email" autoComplete="email" spellCheck="false" maxLength={160} value={d.email} onChange={set('email')} />
                </Campo>
                <Campo id="telefono" label="Teléfono (opcional)" ancho>
                  <input {...aria('telefono')} type="tel" autoComplete="tel" maxLength={30} value={d.telefono} onChange={set('telefono')} />
                </Campo>
                <div className="campo campo--ancho campo--check">
                  <input {...aria('mayor')} type="checkbox" checked={d.mayor} onChange={set('mayor')} />
                  <label htmlFor="r-mayor">Tengo 18 años o más.</label>
                  {errores.mayor && <p className="campo__error" id="r-mayor-error">{errores.mayor}</p>}
                </div>
                <div className="campo campo--ancho campo--check">
                  <input {...aria('privacidad')} type="checkbox" checked={d.privacidad} onChange={set('privacidad')} />
                  <label htmlFor="r-privacidad">He leído la <a href={B + 'privacidad/'}>política de privacidad</a> y acepto que uséis mis datos para responder a esta solicitud.</label>
                  {errores.privacidad && <p className="campo__error" id="r-privacidad-error">{errores.privacidad}</p>}
                </div>
                {estado === 'error' && <p className="campo__error campo--ancho" role="alert">No hemos podido enviar la solicitud. Prueba otra vez o escríbenos por WhatsApp.</p>}
              </div>
            </Step>
          </Stepper>
        </form>
      </div>
    </section>
  );
}
