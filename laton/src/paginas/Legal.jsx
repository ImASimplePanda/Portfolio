import { Link, useParams } from 'react-router';
import { usarTitulo } from '../lib/usarTitulo.js';
import { usarSesion } from '../contexto/Sesion.jsx';
import NoEncontrada from './NoEncontrada.jsx';

const TITULAR = 'Latón Bicicletas S.L., CIF B00000000, Carretera del Centro, 00, 35017 Tafira Alta, Las Palmas de Gran Canaria. Inscrita en el Registro Mercantil de Las Palmas, tomo 0000, folio 00, hoja GC-00000. Correo: taller@laton.test. Teléfono: 928 000 000.';

const PAGINAS = {
  'aviso-legal': ['Aviso legal', [
    ['Titular', TITULAR],
    ['Uso de la web', 'Esta web sirve para informar sobre nuestras bicicletas, configurar una bici, reservar citas de medición y encargar cuadros a medida. Quien la usa se compromete a hacerlo de buena fe y sin dañar su funcionamiento.'],
    ['Propiedad intelectual', 'Los textos, el diseño, los planos y el modelo 3D de las bicicletas son de Latón Bicicletas S.L. No se pueden copiar con fines comerciales sin permiso.'],
    ['Legislación', 'Se aplica la ley española. Para cualquier conflicto con consumidores, son competentes los juzgados de su domicilio.'],
  ]],
  privacidad: ['Política de privacidad', [
    ['Quién trata tus datos', TITULAR],
    ['Qué datos y para qué', 'Nombre, correo y teléfono cuando pides cita o encargas una bici, y las medidas que nos das o te tomamos. Los usamos para atender tu cita, fabricar tu bici, avisarte de cómo va y facturar. No los usamos para publicidad.'],
    ['Base legal', 'La ejecución del encargo o de las gestiones previas que nos pides (artículo 6.1.b del RGPD) y el cumplimiento de obligaciones fiscales (artículo 6.1.c).'],
    ['Cuánto tiempo', 'Las citas que no terminan en encargo se borran a los 12 meses. Los datos de los encargos se guardan los años que exige la normativa fiscal.'],
    ['Con quién se comparten', 'Con Stripe, para cobrar la señal (no vemos los datos de tu tarjeta), y con nuestro proveedor de alojamiento web, en la Unión Europea. Con nadie más.'],
    ['Tus derechos', 'Puedes pedir ver, corregir o borrar tus datos, o limitar su uso, escribiendo a taller@laton.test. Si no te atendemos bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).'],
  ]],
  condiciones: ['Condiciones de encargo', [
    ['Precio', 'Los precios del configurador incluyen el IGIC. El precio queda fijado el día que pagas la señal.'],
    ['Señal', 'Para empezar se paga el 30 % del total. El resto se paga al recoger la bici, antes de llevártela.'],
    ['Cancelación', 'Puedes cancelar y recuperar la señal entera hasta que apruebes el plano del cuadro. Después, al ser una bici fabricada a tu medida, no se aplica el derecho de desistimiento (artículo 103.c del texto refundido de la Ley General para la Defensa de los Consumidores) y la señal no se devuelve.'],
    ['Plazo', 'Los plazos son orientativos y cuentan desde la cita de medición. Si nos retrasamos más de cuatro semanas sobre lo indicado, puedes cancelar con devolución íntegra de la señal.'],
    ['Garantía', 'Cuadro y horquilla: garantía de por vida contra defectos de soldadura para el primer propietario. Componentes: la garantía legal de tres años. La revisión al mes de la entrega es gratuita.'],
  ]],
  cookies: ['Cookies', [
    ['Qué usamos', 'Solo una cookie técnica de sesión («laton»), necesaria para que los formularios funcionen de forma segura. Se borra al cerrar el navegador.'],
    ['Lo que no usamos', 'Ni analítica, ni publicidad, ni redes sociales. Por eso no te pedimos permiso con un aviso.'],
    ['Almacenamiento local', 'El configurador guarda en tu navegador la última bici que estabas diseñando, para que no la pierdas si cierras la pestaña. No sale de tu equipo.'],
  ]],
};

export default function Legal() {
  const { pagina } = useParams();
  const { demo } = usarSesion();
  const p = PAGINAS[pagina];
  usarTitulo(p?.[0] ?? 'Página no encontrada');
  if (!p) return <NoEncontrada />;
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
      <h1 className="rotulo text-6xl sm:text-7xl">{p[0]}</h1>
      {demo ? <p className="mt-5 bg-laton-claro/60 p-4 rounded-[var(--radius-pieza)]">Texto de ejemplo para una web de demostración: la empresa y sus datos son inventados.</p> : null}
      {p[1].map(([t, texto]) => (
        <section key={t} className="mt-8">
          <h2 className="text-xl font-semibold">{t}</h2>
          <p className="mt-2 text-grafito leading-relaxed">{texto}</p>
        </section>
      ))}
      <p className="mt-12 text-sm text-grafito">Última actualización: octubre de 2026. <Link to="/" className="underline">Volver al inicio</Link></p>
    </article>
  );
}
