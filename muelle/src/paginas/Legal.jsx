// Textos legales (LSSI-CE, RGPD/LOPDGDD y Ley General de Consumidores).
// DEMO: titular y datos ficticios. Revisar con un asesor antes de publicar.
import { Link, useParams } from 'react-router';
import { usarTitulo } from '../lib/usarDatos.js';
import NoEncontrada from './NoEncontrada.jsx';

const T = {
  nombre: 'Muelle Teclados S.L.',
  cif: 'B00000000',
  domicilio: 'Calle del Doctor Sumsi, 00, 46005 Valencia',
  registro: 'Registro Mercantil de Valencia, tomo 0000, folio 00, hoja V-00000',
  email: 'hola@muelle.test',
  telefono: '+34 960 000 000',
};

const Datos = () => (
  <dl className="my-6 grid gap-px rounded overflow-hidden border border-mascara-borde bg-mascara-borde">
    {[['Titular', T.nombre], ['CIF', T.cif], ['Domicilio', T.domicilio], ['Registro', T.registro], ['Correo', T.email], ['Teléfono', T.telefono]].map(([k, v]) => (
      <div key={k} className="bg-mascara-alta grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 p-3"><dt className="text-sm text-serigrafia-tenue">{k}</dt><dd>{v}</dd></div>
    ))}
  </dl>
);

const PAGINAS = {
  'aviso-legal': {
    titulo: 'Aviso legal',
    cuerpo: (
      <>
        <p>En cumplimiento del artículo 10 de la Ley 34/2002 de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), estos son los datos del titular de la tienda:</p>
        <Datos />
        <h2>Uso de la web</h2>
        <p>Quien navega se compromete a usar la tienda de forma lícita y a dar datos verdaderos al comprar o crear una cuenta. Las fotos y textos de los productos son propiedad del titular o se usan con permiso.</p>
        <h2>Responsabilidad</h2>
        <p>Revisamos cada producto antes de publicarlo, pero puede haber errores puntuales en una ficha. Si los hay, te avisamos antes de enviar el pedido y puedes cancelarlo sin coste.</p>
        <h2>Ley aplicable</h2>
        <p>Se aplica la legislación española. En caso de conflicto, te corresponde el fuero de tu domicilio como persona consumidora.</p>
      </>
    ),
  },
  privacidad: {
    titulo: 'Política de privacidad',
    cuerpo: (
      <>
        <h2>Quién trata tus datos</h2>
        <Datos />
        <h2>Qué datos y para qué</h2>
        <ul>
          <li><strong>Pedidos:</strong> nombre, correo, teléfono (si lo das) y dirección, para preparar el envío, cobrar y atender devoluciones. Base legal: el contrato de compraventa (art. 6.1.b RGPD).</li>
          <li><strong>Cuenta:</strong> nombre, correo y contraseña cifrada, para que veas tus pedidos. Base legal: tu consentimiento al crearla (art. 6.1.a).</li>
          <li><strong>Facturación:</strong> los datos de las compras, para cumplir con Hacienda (art. 6.1.c).</li>
        </ul>
        <p>No enviamos publicidad ni hacemos perfiles. No guardamos datos de tu tarjeta: el pago lo gestiona Stripe.</p>
        <h2>Cuánto tiempo</h2>
        <p>Los datos de pedidos, 6 años por obligación contable. La cuenta, hasta que la borres. Las solicitudes de cambio de contraseña caducan en una hora.</p>
        <h2>Quién más los recibe</h2>
        <ul>
          <li><strong>Stripe Payments Europe</strong>, para el pago con tarjeta.</li>
          <li>La <strong>empresa de transporte</strong>, con los datos de entrega imprescindibles.</li>
          <li><strong>Hostinger</strong>, el alojamiento de la web, con servidores en la Unión Europea.</li>
        </ul>
        <h2>Tus derechos</h2>
        <p>Puedes acceder, rectificar, suprimir, oponerte, limitar o llevarte tus datos escribiendo a {T.email}. Si crees que no lo hemos hecho bien, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
      </>
    ),
  },
  condiciones: {
    titulo: 'Condiciones de venta',
    cuerpo: (
      <>
        <p>Estas condiciones regulan las compras en la tienda online de {T.nombre} ({T.cif}).</p>
        <h2>Productos y montajes a medida</h2>
        <p>Vendemos teclados ya montados, piezas sueltas (interruptores, juegos de teclas, accesorios) y teclados montados a medida con las piezas que eliges en el montador. El sonido que se oye en la web es una simulación orientativa, no una grabación.</p>
        <h2>Precios y pago</h2>
        <p>Los precios incluyen IVA. El envío se muestra antes de pagar. Se paga con tarjeta a través de Stripe; el pedido queda confirmado cuando recibimos el pago.</p>
        <h2>Envío</h2>
        <p>Los productos sueltos y los teclados montados salen en 24-48 horas laborables; los montajes a medida, en unos 5 días laborables. Península: 4,90 € y Baleares: 7,90 €, gratis desde 80 €. Canarias: 12,90 €, gratis desde 150 €; el trámite de aduana corre de nuestra cuenta.</p>
        <h2>Derecho de desistimiento</h2>
        <p>Tienes 14 días naturales desde que recibes el pedido para devolverlo sin dar explicaciones. Escríbenos a {T.email}; te devolvemos el importe, incluido el envío estándar, en un máximo de 14 días desde que recibimos el producto. El coste de devolverlo corre de tu cuenta salvo que llegue dañado o no coincida con la ficha. Los teclados montados a medida podrían excluirse del desistimiento por ser personalizados (art. 103.c de la Ley General para la Defensa de los Consumidores), pero aun así aceptamos su devolución durante 30 días si llegan como salieron.</p>
        <h2>Garantía</h2>
        <p>Todo lo que vendemos es nuevo y tiene la garantía legal de tres años. Si una tecla deja de responder o un interruptor falla, lo cambiamos sin coste: los teclados son hot-swap, así que muchas veces basta con mandarte el interruptor de repuesto.</p>
        <h2>Reclamaciones</h2>
        <p>Puedes escribirnos a {T.email} o pedir hojas de reclamación en la tienda. También puedes acudir a la Junta Arbitral de Consumo de la Comunitat Valenciana.</p>
      </>
    ),
  },
  envios: {
    titulo: 'Envíos y devoluciones',
    cuerpo: (
      <>
        <h2>Cómo enviamos</h2>
        <p>Los teclados viajan en su caja con espuma a medida y una funda; los interruptores y las teclas, en cajas rígidas para que no se doblen pines ni se rayen.</p>
        <ul>
          <li><strong>Península:</strong> 24-48 h desde que sale del taller. 4,90 €, gratis desde 80 €.</li>
          <li><strong>Baleares:</strong> 2-3 días. 7,90 €, gratis desde 80 €.</li>
          <li><strong>Canarias:</strong> 4-6 días. 12,90 €, gratis desde 150 €. Sin cargos de aduana para ti.</li>
          <li>De momento no enviamos a Ceuta, Melilla ni fuera de España.</li>
        </ul>
        <h2>Devoluciones</h2>
        <p>Tienes 14 días desde que lo recibes (30 en los teclados a medida). Escríbenos a {T.email} con tu número de pedido y te decimos cómo mandarlo. Consulta las <Link viewTransition to="/legal/condiciones">condiciones de venta</Link>.</p>
      </>
    ),
  },
  garantia: {
    titulo: 'Garantía',
    cuerpo: (
      <>
        <p>Todo lo que vendemos es nuevo y tiene la garantía legal de tres años desde la entrega.</p>
        <h2>Qué cubre</h2>
        <ul>
          <li>Teclas que no responden, dobles pulsaciones o interruptores que fallan.</li>
          <li>Defectos de la carcasa, la placa o el circuito.</li>
          <li>Estabilizadores que traquetean en los primeros 6 meses: los ajustamos gratis.</li>
        </ul>
        <h2>Cómo pedirla</h2>
        <p>Escríbenos a {T.email} con tu número de pedido y un vídeo corto del fallo. Si es un interruptor, te mandamos el repuesto; si es otra cosa, recogemos el teclado sin coste.</p>
      </>
    ),
  },
  cookies: {
    titulo: 'Cookies',
    cuerpo: (
      <>
        <p>Esta tienda solo usa lo imprescindible para funcionar, así que no necesita pedirte permiso:</p>
        <ul>
          <li><strong>Cookie «muelle»</strong> (sesión): mantiene tu sesión abierta y protege los formularios. Se borra al cerrar el navegador.</li>
          <li><strong>Almacenamiento local «muelle:cesta» y «muelle:montaje»</strong>: recuerdan tu cesta y el último teclado que estabas montando en este navegador.</li>
        </ul>
        <p>No usamos analítica, publicidad ni cookies de terceros. Al pagar, Stripe usa sus propias cookies técnicas en su página de pago.</p>
      </>
    ),
  },
};

export default function Legal() {
  const { pagina } = useParams();
  const p = PAGINAS[pagina];
  usarTitulo(p?.titulo);
  if (!p) return <NoEncontrada />;
  return (
    <article className="mx-auto max-w-[760px] px-4 sm:px-6 pt-12 [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-serigrafia-tenue [&_p]:mb-4 [&_li]:text-serigrafia-tenue [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:grid [&_ul]:gap-2 [&_ul]:mb-4 [&_strong]:text-serigrafia [&_a]:underline [&_a]:underline-offset-4">
      <h1 className="serigrafia text-[clamp(2.6rem,6vw,4.4rem)] mb-4">{p.titulo}</h1>
      <p className="rounded bg-fr4 !text-mascara-honda font-semibold p-3 text-sm">Texto de demostración con datos ficticios. Que lo revise un asesor antes de publicar la tienda.</p>
      {p.cuerpo}
    </article>
  );
}
