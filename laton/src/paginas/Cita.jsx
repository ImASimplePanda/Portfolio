import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api } from '../lib/api.js';
import { diaMes, diaSemana, euros, fechaLarga, mes } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarTitulo.js';
import { DatosContacto, contactoVacio } from '../componentes/Util.jsx';

// Fichero .ics para guardar la cita en el calendario del móvil
export function enlaceCalendario(fecha, hora, codigo) {
  const [h, m] = hora.split(':').map(Number);
  const f = fecha.replaceAll('-', '');
  const fin = `${String(h + 1 + Math.floor((m + 30) / 60)).padStart(2, '0')}${String((m + 30) % 60).padStart(2, '0')}`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Laton//Citas//ES', 'BEGIN:VEVENT',
    `UID:${codigo}@laton`, `DTSTART;TZID=Atlantic/Canary:${f}T${hora.replace(':', '')}00`, `DTEND;TZID=Atlantic/Canary:${f}T${fin}00`,
    'SUMMARY:Medición en Latón', 'LOCATION:Carretera del Centro 00\\, Tafira Alta', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
}

export default function Cita() {
  usarTitulo('Pide cita para medirte');
  const [busqueda] = useSearchParams();
  const configuracion = /^LT-[2-9A-Z]{6}$/.test(busqueda.get('configuracion') || '') ? busqueda.get('configuracion') : '';
  const [huecos, setHuecos] = useState(null);
  const [errorHuecos, setErrorHuecos] = useState('');
  const [dia, setDia] = useState(null);
  const [hora, setHora] = useState(null);
  const [datos, setDatos] = useState({ ...contactoVacio, notas: '' });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [hecha, setHecha] = useState(null);

  const cargar = () => api('/citas/huecos').then((r) => { setHuecos(r); setErrorHuecos(''); }).catch((e) => setErrorHuecos(e.message));
  useEffect(() => { cargar(); }, []);

  // Días agrupados por semanas (martes a sábado) para pintar el calendario
  const semanas = useMemo(() => {
    if (!huecos) return [];
    const s = [];
    for (const d of huecos.dias) {
      const n = new Date(`${d.fecha}T12:00:00Z`).getUTCDay(); // 2 = martes … 6 = sábado
      if (!s.length || n === 2 || s.at(-1).length === 5) s.push([]);
      s.at(-1).push(d);
    }
    return s;
  }, [huecos]);

  const elegido = huecos?.dias.find((d) => d.fecha === dia);

  async function enviar(e) {
    e.preventDefault();
    if (!dia || !hora) { setError('Elige un día y una hora.'); return; }
    setEnviando(true); setError(''); setErrores({});
    try {
      const r = await api('/citas', { metodo: 'POST', datos: { ...datos, fecha: dia, hora, configuracion } });
      setHecha({ ...r, fecha: dia, hora });
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message); setErrores(err.campos || {});
      if (err.estado === 409) { setHora(null); cargar(); }
    } finally { setEnviando(false); }
  }

  if (hecha) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <p className="text-grafito">Cita {hecha.codigo}</p>
        <h1 className="rotulo text-6xl sm:text-7xl mt-2">Te esperamos el {fechaLarga(hecha.fecha)} a las {hecha.hora}</h1>
        <p className="mt-6 text-lg max-w-xl">Te hemos mandado un correo con la dirección y un enlace para cancelar si te surge algo. Trae la ropa y las zapatillas con las que montas, y tu bici actual si tienes.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="boton" href={enlaceCalendario(hecha.fecha, hecha.hora, hecha.codigo)} download={`cita-laton-${hecha.codigo}.ics`}>Añadir al calendario</a>
          <Link className="boton boton-linea" to={`/cita/${hecha.codigo}?t=${hecha.token}`}>Ver o cancelar la cita</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-12 grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
      <div>
        <h1 className="rotulo text-6xl sm:text-7xl">Pide cita para medirte</h1>
        <p className="mt-5 text-lg max-w-md">Hora y media en el taller de Tafira. Medimos tu cuerpo, vemos cómo pedaleas y hablamos de qué bici quieres.</p>
        <dl className="mt-8 grid gap-4 max-w-md">
          <div><dt className="font-semibold">Precio</dt><dd className="text-grafito">{euros(huecos?.precio ?? 9000)}, que te descontamos si encargas la bici.</dd></div>
          <div><dt className="font-semibold">Qué traer</dt><dd className="text-grafito">La ropa y las zapatillas con las que montas. Tu bici actual, si tienes.</dd></div>
          <div><dt className="font-semibold">Dónde</dt><dd className="text-grafito">Carretera del Centro, 00, Tafira Alta. Hay sitio para aparcar delante.</dd></div>
        </dl>
        {configuracion ? (
          <p className="mt-8 bg-laton-claro/60 rounded-[var(--radius-pieza)] p-4 max-w-md">
            Llevaremos a la cita tu bici <Link to={`/configurador/${configuracion}`} className="font-semibold underline">{configuracion}</Link> para partir de ella.
          </p>
        ) : null}
      </div>

      <form onSubmit={enviar} noValidate className="grid gap-8">
        <fieldset>
          <legend className="text-lg font-semibold">Elige el día</legend>
          {errorHuecos ? <p className="error-campo mt-2" role="alert">{errorHuecos}</p> : null}
          {!huecos && !errorHuecos ? <div className="mt-3 h-56 rounded bg-acero-claro animate-pulse" aria-hidden="true" /> : null}
          <div className="mt-3 grid gap-4">
            {semanas.map((s, i) => (
              <div key={i}>
                {i === 0 || mes(s[0].fecha) !== mes(semanas[i - 1][0].fecha) ? <p className="text-sm text-grafito mb-1.5 first-letter:uppercase">{mes(s[0].fecha)}</p> : null}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {s.map((d) => {
                    const libres = d.horas.filter((h) => h.libre).length;
                    return (
                      <label key={d.fecha} className={`relative ${libres ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                        <input type="radio" name="dia" value={d.fecha} className="peer sr-only" disabled={!libres} checked={dia === d.fecha}
                          onChange={() => { setDia(d.fecha); setHora(null); }} />
                        <span className={`grid place-items-center rounded-[var(--radius-pieza)] py-2 text-center transition-colors
                          peer-checked:bg-tinta peer-checked:text-papel peer-focus-visible:outline-2 peer-focus-visible:outline-laton peer-focus-visible:outline-offset-2
                          ${libres ? 'bg-papel hover:bg-white shadow-[inset_0_0_0_1.5px_#c2c6c3]' : 'bg-transparent text-grafito/50 line-through'}`}>
                          <span className="text-xs capitalize">{diaSemana(d.fecha)}</span>
                          <span className="rotulo text-3xl leading-none numeros">{diaMes(d.fecha)}</span>
                          <span className="sr-only">{fechaLarga(d.fecha)}{libres ? `, ${libres} horas libres` : ', completo'}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {elegido ? (
          <fieldset>
            <legend className="text-lg font-semibold first-letter:uppercase">{fechaLarga(elegido.fecha)}: elige la hora</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {elegido.horas.map((h) => (
                <label key={h.hora} className={h.libre ? 'cursor-pointer' : 'cursor-not-allowed'}>
                  <input type="radio" name="hora" value={h.hora} className="peer sr-only" disabled={!h.libre} checked={hora === h.hora} onChange={() => setHora(h.hora)} />
                  <span className={`block px-5 py-2.5 rounded-[var(--radius-pieza)] font-semibold numeros peer-checked:bg-tinta peer-checked:text-papel peer-focus-visible:outline-2 peer-focus-visible:outline-laton peer-focus-visible:outline-offset-2
                    ${h.libre ? 'bg-papel shadow-[inset_0_0_0_1.5px_#c2c6c3] hover:bg-white' : 'text-grafito/50 line-through'}`}>
                    {h.hora}<span className="sr-only">{h.libre ? '' : ', ocupada'}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {hora ? (
          <fieldset className="grid gap-4">
            <legend className="text-lg font-semibold mb-3">Tus datos</legend>
            <DatosContacto datos={datos} set={setDatos} errores={errores} />
            <div>
              <label htmlFor="c-notas" className="etiqueta">Algo que debamos saber <span className="font-normal text-grafito">(opcional)</span></label>
              <textarea id="c-notas" className="campo min-h-24" maxLength={1000} value={datos.notas} onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
                placeholder="Lesiones, qué tipo de rutas haces, qué bici tienes ahora…" />
            </div>
          </fieldset>
        ) : null}

        {error ? <p className="error-campo" role="alert">{error}</p> : null}
        <div>
          <button className="boton boton-laton text-lg !px-6" disabled={enviando || !hora}>
            {enviando ? 'Reservando…' : hora ? `Reservar el ${fechaLarga(dia)} a las ${hora}` : 'Elige día y hora'}
          </button>
        </div>
      </form>
    </div>
  );
}
