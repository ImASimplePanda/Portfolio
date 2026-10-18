import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Download } from 'lucide-react';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { api } from '../lib/api.js';
import { BASE } from '../lib/base.js';
import { euros, fecha, ESTADOS } from '../lib/formato.js';
import { useTienda } from '../contexto/Tienda.jsx';

const SIGUIENTES = { pagado: ['enviado', 'cancelado'], enviado: ['entregado', 'devuelto'], entregado: ['devuelto'], pendiente: ['cancelado'] };
const ACCION = { enviado: 'Marcar como enviado', entregado: 'Marcar como entregado', devuelto: 'Registrar devolución', cancelado: 'Cancelar pedido' };

export default function Pedidos() {
  usarTitulo('Pedidos');
  const [params, setParams] = useSearchParams();
  const estado = params.get('estado') || '';
  const { datos, error, recargar } = usarDatos(`/admin/pedidos${estado ? `?estado=${estado}` : ''}`);
  const [abierto, setAbierto] = useState(null);
  const [ocupado, setOcupado] = useState('');
  const { avisar } = useTienda();

  const cambiar = async (codigo, nuevo) => {
    if ((nuevo === 'cancelado' || nuevo === 'devuelto') && !window.confirm(`¿Seguro? El pedido ${codigo} pasará a «${ESTADOS[nuevo]}» y los productos volverán al stock.`)) return;
    setOcupado(codigo);
    try {
      await api(`/admin/pedidos/${codigo}`, { metodo: 'PATCH', datos: { estado: nuevo } });
      avisar(`Pedido ${codigo}`, ESTADOS[nuevo]);
      recargar();
    } catch (e) {
      avisar('No se ha podido cambiar', e.message);
    } finally {
      setOcupado('');
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="serigrafia text-5xl">Pedidos</h1>
        <a href={`${BASE}api/admin/pedidos.csv`} className="pad-linea" download><Download size={18} /> Exportar CSV</a>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {['', 'pagado', 'enviado', 'entregado', 'pendiente', 'cancelado', 'devuelto'].map((e) => (
          <button key={e} type="button" aria-pressed={estado === e} onClick={() => setParams(e ? { estado: e } : {})}
            className={`min-h-10 px-3.5 rounded-full border text-sm font-medium ${estado === e ? 'bg-mascara-honda border-tinta text-white' : 'border-mascara-borde bg-mascara-alta hover:border-tinta'}`}>{e ? ESTADOS[e] : 'Todos'}</button>
        ))}
      </div>
      {error ? <p className="mt-6 text-alerta">{error.message}</p> : null}
      {datos && !datos.pedidos.length ? <p className="mt-8 text-serigrafia-tenue">No hay pedidos {estado ? `en estado «${ESTADOS[estado]}»` : 'todavía'}.</p> : null}
      <ul className="mt-6 grid gap-3">
        {datos?.pedidos.map((p) => (
          <li key={p.codigo} className="plano">
            <button type="button" className="w-full text-left p-4 sm:p-5 flex flex-wrap items-center gap-x-6 gap-y-2" aria-expanded={abierto === p.codigo} onClick={() => setAbierto(abierto === p.codigo ? null : p.codigo)}>
              <span className="font-semibold">{p.codigo}</span>
              <span className="text-serigrafia-tenue">{fecha(p.creado)}</span>
              <span className="grow min-w-0 truncate">{p.nombre}</span>
              <span className="rounded-full bg-cobre/15 text-cobre-vivo text-sm font-semibold px-2.5 py-0.5">{ESTADOS[p.estado]}</span>
              <span className="font-semibold numeros">{euros(p.total)}</span>
            </button>
            {abierto === p.codigo ? (
              <div className="px-4 sm:px-5 pb-5 grid gap-6 md:grid-cols-[1fr_1fr_auto] border-t border-mascara-borde pt-4">
                <ul className="grid gap-1">{p.lineas.map((l, i) => <li key={i}>{l.cantidad} × {l.titulo} <span className="text-serigrafia-tenue">({euros(l.precio)})</span></li>)}<li className="text-serigrafia-tenue">Envío: {p.envio ? euros(p.envio) : 'gratis'} ({p.zona})</li></ul>
                <address className="not-italic text-serigrafia-tenue break-words">{p.nombre}<br />{p.direccion}<br />{p.cp} {p.ciudad} ({p.provincia})<br />{p.email}{p.telefono ? <><br />{p.telefono}</> : null}{p.notas ? <><br />Notas: {p.notas}</> : null}</address>
                <div className="grid gap-2 content-start">
                  {(SIGUIENTES[p.estado] || []).map((n) => (
                    <button key={n} type="button" className={n === 'cancelado' || n === 'devuelto' ? 'pad-linea' : 'boton'} disabled={ocupado === p.codigo} onClick={() => cambiar(p.codigo, n)}>{ACCION[n]}</button>
                  ))}
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
