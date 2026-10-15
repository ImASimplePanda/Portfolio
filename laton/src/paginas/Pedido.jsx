import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { api } from '../lib/api.js';
import { normalizar, OPCIONES as O, porId } from '../lib/configuracion.js';
import { euros, fechaHora, kg } from '../lib/formato.js';
import { usarTitulo } from '../lib/usarTitulo.js';
import Plano from '../componentes/Plano.jsx';
import { SinTres } from '../componentes/Util.jsx';
import { Aviso } from './VerCita.jsx';

const Escena = lazy(() => import('../tres/Escena.jsx'));

// Seguimiento privado del encargo: en qué punto está la bici y qué queda por pagar
export default function Pedido() {
  const { codigo } = useParams();
  const [busqueda] = useSearchParams();
  const token = busqueda.get('t') || '';
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');
  usarTitulo(`Encargo ${codigo}`);

  useEffect(() => {
    api(`/pedidos/${codigo}?t=${encodeURIComponent(token)}`).then((r) => setPedido(r.pedido)).catch((e) => setError(e.message));
  }, [codigo, token]);

  if (error) return <Aviso titulo="No encontramos ese encargo" texto={error} />;
  if (!pedido) return <div className="min-h-[60vh]" aria-busy="true" />;

  const config = normalizar(pedido.ficha.configuracion);
  const m = porId(O.modelos, config.modelo);
  const t = pedido.ficha.talla;
  const confirmado = pedido.estado === 'confirmado';
  const plano = <Plano config={config} cotas={false} className="w-full h-full" />;

  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6 py-12">
      <p className="text-grafito">Encargo {pedido.codigo}, a nombre de {pedido.nombre}</p>
      <h1 className="rotulo text-6xl sm:text-8xl mt-2 max-w-5xl">
        {confirmado
          ? pedido.etapa >= 6 ? `Tu ${m.nombre} ya rueda contigo` : `Tu ${m.nombre}: ${pedido.etapas[pedido.etapa].toLowerCase()}`
          : pedido.estado === 'pendiente' ? 'Falta pagar la señal' : 'El pago no se completó'}
      </h1>
      {!confirmado ? (
        <p className="mt-5 text-lg max-w-xl">
          {pedido.estado === 'pendiente'
            ? 'Si acabas de pagar, el banco tarda unos segundos en avisarnos: recarga la página en un momento.'
            : 'No se ha cobrado nada. Puedes volver a la configuración y encargarla de nuevo.'}
          {' '}<Link to={`/configurador/${pedido.configuracion}`} className="underline">Volver a tu bici</Link>
        </p>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="relative h-[46svh] lg:h-[34rem] rounded-[4px] bg-[radial-gradient(ellipse_at_50%_40%,#eef0ec_0%,#d3d6d1_75%)]">
          <SinTres alternativa={<div className="h-full p-6">{plano}</div>}>
            <Suspense fallback={<div className="h-full p-6 opacity-60">{plano}</div>}>
              <Escena config={config} distancia={2.8} className="h-full" etiqueta={`Tu ${m.nombre} en 3D`} />
            </Suspense>
          </SinTres>
        </div>

        {confirmado ? (
          <section aria-labelledby="etapas-t">
            <h2 id="etapas-t" className="text-lg font-semibold">En qué punto está</h2>
            <ol className="mt-4">
              {pedido.etapas.map((e, i) => {
                const estado = i < pedido.etapa ? 'hecha' : i === pedido.etapa ? 'ahora' : 'falta';
                return (
                  <li key={e} className="grid grid-cols-[1.75rem_1fr] gap-x-3" aria-current={estado === 'ahora' ? 'step' : undefined}>
                    <span className="flex flex-col items-center">
                      <span aria-hidden="true" className={`mt-1.5 size-3.5 rounded-full ${estado === 'falta' ? 'ring-2 ring-tinta/25 bg-transparent' : estado === 'ahora' ? 'bg-laton-vivo ring-4 ring-laton-claro' : 'bg-tinta'}`} />
                      {i < pedido.etapas.length - 1 ? <span aria-hidden="true" className={`w-0.5 flex-1 my-1 ${estado === 'hecha' ? 'bg-tinta' : 'bg-tinta/15'}`} /> : null}
                    </span>
                    <div className="pb-5">
                      <p className={`${estado === 'falta' ? 'text-grafito' : 'font-semibold'}`}>
                        {e}<span className="sr-only">{estado === 'hecha' ? ', hecho' : estado === 'ahora' ? ', ahora' : ', pendiente'}</span>
                      </p>
                      {estado === 'ahora' && pedido.nota ? <p className="mt-1.5 bg-papel rounded-[var(--radius-pieza)] p-3 text-[0.95rem]">{pedido.nota}</p> : null}
                      {estado === 'ahora' ? <p className="text-sm text-grafito mt-1">Actualizado el {fechaHora(pedido.actualizado)}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}
      </div>

      <section aria-labelledby="ficha-t" className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 id="ficha-t" className="text-lg font-semibold">Tu bici</h2>
          <table className="mt-3 w-full text-[0.95rem]">
            <tbody>
              {pedido.ficha.lineas.map(([n, c], i) => (
                <tr key={i} className="border-b border-tinta/10">
                  <th scope="row" className="py-2 pr-3 text-left font-normal">{n}</th>
                  <td className="py-2 text-right numeros whitespace-nowrap">{c ? euros(c) : 'Incluido'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><th scope="row" className="pt-3 text-left">Total</th><td className="pt-3 text-right font-semibold numeros">{euros(pedido.total)}</td></tr>
              <tr><th scope="row" className="pt-1 text-left font-normal text-grafito">Señal {confirmado ? 'pagada' : 'pendiente'}</th><td className="pt-1 text-right numeros text-grafito">{euros(pedido.senal)}</td></tr>
              <tr><th scope="row" className="pt-1 text-left font-normal">Al recogerla</th><td className="pt-1 text-right numeros">{euros(pedido.total - pedido.senal)}</td></tr>
            </tfoot>
          </table>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Medidas de partida</h2>
          <p className="text-grafito text-[0.95rem]">Las afinamos en la cita de medición antes de cortar ningún tubo.</p>
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[['Talla', t.nombre], ['Stack', `${t.stack} mm`], ['Reach', `${t.reach} mm`], ['Tubo de sillín', `${t.tuboSillin} mm`], ['Altura de sillín', `${t.alturaSillin} mm`], ['Peso aproximado', kg(pedido.ficha.peso)]].map(([k, v]) => (
              <div key={k} className="bg-papel rounded-[var(--radius-pieza)] px-3 py-2">
                <dt className="text-xs text-grafito">{k}</dt>
                <dd className="font-semibold numeros">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
