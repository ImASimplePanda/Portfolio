import { Suspense, lazy, useState, Fragment } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { usarDatos, usarTitulo } from '../lib/usarDatos.js';
import { Probador, BotonSonido, HuellasInterruptores } from '../componentes/Probador.jsx';
import { Taladro } from '../componentes/Placa.jsx';
import ClickSpark from '../componentes/rb/ClickSpark.jsx';

const InicioResto = lazy(() => import('./InicioResto.jsx'));
const CARCASA_PORTADA = { hex: '#4a2d52', material: 'aluminio' };

export default function Inicio() {
  usarTitulo(null);
  const piezas = usarDatos('/montador/piezas', 'piezas');
  const montados = usarDatos('/productos?tipo=teclado&por=4', 'montados');
  const interruptores = piezas.datos?.interruptores ?? [];
  const juegos = piezas.datos?.teclas ?? [];
  const [elegido, setElegido] = useState(null);
  const sw = interruptores.find((x) => x.id === elegido) ?? interruptores.find((x) => x.titulo === 'Crema') ?? interruptores[0];
  const juego = juegos.find((x) => x.titulo === 'Ciruela') ?? juegos[0];

  return (
    <>
      <Portada sw={sw} juego={juego} interruptores={interruptores} onElegir={(x) => setElegido(x.id)} />
      <Suspense fallback={<div className="min-h-[100vh]" aria-busy="true" />}>
        <InicioResto interruptores={interruptores} juegos={juegos} juego={juego} sw={sw} montados={montados} />
      </Suspense>
    </>
  );
}

function Portada({ sw, juego, interruptores, onElegir }) {
  const [pulso, setPulso] = useState(0);
  return (
    <section aria-labelledby="portada-t" className="px-2 sm:px-4 pt-3 sm:pt-4">
      {/* La portada es una placa: canto de fibra de vidrio (FR4), máscara morada y cuatro taladros */}
      <div className="relative mx-auto max-w-[1420px] rounded-[22px] bg-fr4 p-[5px] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)]">
        <div className="textura-placa relative rounded-[18px] overflow-hidden">
          <Taladro className="absolute left-4 top-4 !size-5" />
          <Taladro className="absolute right-4 top-4 !size-5" />
          <Taladro className="absolute left-4 bottom-4 !size-5" />
          <Taladro className="absolute right-4 bottom-4 !size-5" />
          <span className="designador absolute right-12 bottom-4 hidden sm:block">MUELLE 65 REV 2.6</span>
          <div className="px-4 sm:px-10 lg:px-14 pt-12 sm:pt-14 pb-14 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
            <div>
              <h1 id="portada-t" className="serigrafia text-[clamp(2.9rem,6vw,5.4rem)]" aria-label="Escúchalo antes de comprarlo">
                {/* cada palabra sube desde debajo de su línea, una tras otra */}
                {'Escúchalo antes de comprarlo'.split(' ').map((p, i) => <Fragment key={i}><span aria-hidden="true" className="palabra"><span style={{ '--d': 40 + i * 70 }}>{p}</span></span>{' '}</Fragment>)}
              </h1>
              <p className="entra mt-6 max-w-[46ch] text-lg text-serigrafia-tenue" style={{ '--d': 260 }}>
                Escribe en tu teclado y oirás cómo suena cada interruptor de la tienda, con la placa y la carcasa que elijas. Después lo montamos a mano en Valencia y te lo enviamos probado.
              </p>
              <div className="entra mt-8 flex flex-wrap gap-3" style={{ '--d': 340 }}>
                <Link viewTransition to="/montador" className="pad text-lg !px-6 !min-h-13">Monta el tuyo <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link viewTransition to="/tienda" className="pad-linea text-lg !px-6 !min-h-13">Ver la tienda</Link>
              </div>
              <div className="entra mt-8 flex flex-wrap items-center gap-3 text-sm text-serigrafia-tenue" style={{ '--d': 420 }}>
                <BotonSonido />
                <p className="max-w-[36ch]">{sw ? <>Suena con interruptores <strong className="text-serigrafia">{sw.titulo}</strong>. Escribe o toca las teclas.</> : 'Cargando los interruptores…'}</p>
              </div>
            </div>
            <div className="min-w-0">
              {/* El teclado se apoya en su propia huella serigrafiada (U1) y de ella bajan las pistas a los interruptores */}
              <div className="entra-placa relative rounded-[10px] border border-dashed border-mascara-borde bg-mascara-honda/40 px-2 pt-6" style={{ '--d': 120 }}>
                <span className="designador absolute left-3 top-2">U1</span>
                <Probador ola formato="65" colores={juego?.specs?.colores} carcasa={CARCASA_PORTADA} interruptor={sw?.color} sonido={sw?.specs?.sonido} distancia={0.3} alPulsar={() => setPulso((n) => n + 1)}
                  className="aspect-[16/9] w-full" etiqueta={`Teclado 65 % con interruptores ${sw?.titulo ?? ''}. Escribe para oírlo.`} />
              </div>
              <ClickSpark sparkColor="#f0c36a" sparkRadius={22} sparkCount={9}>
                {interruptores.length
                  ? <HuellasInterruptores encender interruptores={interruptores} elegido={sw?.id} onElegir={onElegir} pulso={pulso} />
                  : <div className="mt-10 h-28 rounded bg-mascara-alta animate-pulse" aria-hidden="true" />}
              </ClickSpark>
              <p className="mt-3 text-sm text-serigrafia-tenue"><strong className="text-serigrafia">Prueba los siete interruptores:</strong> pulsa uno para oírlo y se queda puesto en el teclado.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

