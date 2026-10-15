import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { api } from '../lib/api.js';
import { fechaLarga } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarTitulo.js';
import { enlaceCalendario } from './Cita.jsx';

const ESTADOS = { reservada: 'Reservada', hecha: 'Hecha', no_vino: 'No viniste', cancelada: 'Cancelada' };

export default function VerCita() {
  const { codigo } = useParams();
  const [busqueda] = useSearchParams();
  const token = busqueda.get('t') || '';
  const [cita, setCita] = useState(null);
  const [error, setError] = useState('');
  const dialogo = useRef();
  usarTitulo(`Cita ${codigo}`);

  useEffect(() => {
    api(`/citas/${codigo}?t=${encodeURIComponent(token)}`).then((r) => setCita(r.cita)).catch((e) => setError(e.message));
  }, [codigo, token]);

  async function cancelar() {
    try { setCita((await api(`/citas/${codigo}/cancelar`, { metodo: 'POST', datos: { t: token } })).cita); }
    catch (e) { setError(e.message); }
    dialogo.current?.close();
  }

  if (error && !cita) {
    return <Aviso titulo="No encontramos esa cita" texto={error} />;
  }
  if (!cita) return <div className="min-h-[60vh]" aria-busy="true" />;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <p className="text-grafito">Cita {cita.codigo}: {ESTADOS[cita.estado].toLowerCase()}</p>
      <h1 className="rotulo text-6xl sm:text-7xl mt-2">
        {cita.estado === 'cancelada' ? 'Cita cancelada' : `${fechaLarga(cita.fecha)}, a las ${cita.hora}`}
      </h1>
      <p className="mt-6 text-lg max-w-xl">
        {cita.estado === 'cancelada'
          ? 'El hueco ha quedado libre. Si quieres, elige otro día.'
          : `Hola, ${cita.nombre.split(' ')[0]}. Te esperamos en la Carretera del Centro, 00, en Tafira Alta. La medición dura hora y media.`}
      </p>
      {error ? <p className="error-campo mt-4" role="alert">{error}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {cita.estado === 'reservada' ? (
          <>
            <a className="boton" href={enlaceCalendario(cita.fecha, cita.hora, cita.codigo)} download={`cita-laton-${cita.codigo}.ics`}>Añadir al calendario</a>
            <button type="button" className="boton boton-linea" onClick={() => dialogo.current?.showModal()}>Cancelar la cita</button>
          </>
        ) : (
          <Link className="boton" to="/cita">Pedir otra cita</Link>
        )}
      </div>

      <dialog ref={dialogo} aria-labelledby="cancelar-t" className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[4px] bg-acero-claro p-6 backdrop:bg-tinta/60">
        <h2 id="cancelar-t" className="rotulo text-4xl">¿Cancelar la cita?</h2>
        <p className="mt-3 text-grafito">El hueco quedará libre para otra persona. Puedes pedir otra cita cuando quieras.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="boton boton-linea" onClick={() => dialogo.current?.close()}>Mantener la cita</button>
          <button type="button" className="boton" onClick={cancelar}>Cancelar la cita</button>
        </div>
      </dialog>
    </div>
  );
}

export function Aviso({ titulo, texto }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <h1 className="rotulo text-6xl">{titulo}</h1>
      <p className="mt-4 text-lg">{texto}</p>
      <Link to="/" className="boton mt-8">Ir al inicio</Link>
    </div>
  );
}
