// Textos legales (LSSI-CE, RGPD/LOPDGDD y Ley General de Consumidores).
// DEMO: titular y datos ficticios. Revisar con un asesor antes de publicar.
import { Link, useParams } from 'react-router';
import { usarTitulo } from '../lib/usarDatos.js';
import NoEncontrada from './NoEncontrada.jsx';

const T = {
  nombre: 'Surco Discos S.L.',
  cif: 'B00000000',
  domicilio: 'Calle Perdomo, 00, 35002 Las Palmas de Gran Canaria',
  registro: 'Registro Mercantil de Las Palmas, tomo 0000, folio 00, hoja GC-00000',
  email: 'hola@surco.test',
  telefono: '+34 928 000 000',
};

const Datos = () => (
  <dl className="my-6 grid gap-px rounded-2xl overflow-hidden border border-linea bg-linea">
    {[['Titular', T.nombre], ['CIF', T.cif], ['Domicilio', T.domicilio], ['Registro', T.registro], ['Correo', T.email], ['Teléfono', T.telefono]].map(([k, v]) => (
      <div key={k} className="bg-papel grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 p-3"><dt className="text-sm text-gris">{k}</dt><dd>{v}</dd></div>
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
        <h2>Productos de segunda mano</h2>
        <p>Casi todo lo que vendemos es usado. Cada ficha indica el estado del disco y de la funda según la escala Goldmine; la foto o la portada es orientativa del diseño, no del desgaste.</p>
        <h2>Precios y pago</h2>
        <p>Los precios incluyen IGIC. El envío se muestra antes de pagar. Se paga con tarjeta a través de Stripe; el pedido queda confirmado cuando recibimos el pago.</p>
        <h2>Envío</h2>
        <p>Preparamos los pedidos en 24-48 horas laborables. Canarias: 4,90 €, gratis desde 60 €. Península y Baleares: 9,90 €, gratis desde 120 €. Los trámites aduaneros de los envíos desde Canarias corren de nuestra cuenta.</p>
        <h2>Derecho de desistimiento</h2>
        <p>Tienes 14 días naturales desde que recibes el pedido para devolverlo sin dar explicaciones. Escríbenos a {T.email}; te devolvemos el importe, incluido el envío estándar, en un máximo de 14 días desde que recibimos el producto. El coste de devolverlo corre de tu cuenta salvo que llegue dañado o no coincida con la ficha.</p>
        <h2>Garantía</h2>
        <p>Los productos de segunda mano tienen una garantía legal de un año desde la entrega. Si un disco no coincide con el estado indicado o un tocadiscos falla, lo reparamos, lo cambiamos o te devolvemos el dinero.</p>
        <h2>Reclamaciones</h2>
        <p>Puedes escribirnos a {T.email} o pedir hojas de reclamación en la tienda. También puedes acudir a la Junta Arbitral de Consumo de Canarias.</p>
      </>
    ),
  },
  envios: {
    titulo: 'Envíos y devoluciones',
    cuerpo: (
      <>
        <h2>Cómo enviamos</h2>
        <p>Los discos viajan entre cartones rígidos, fuera de la funda para que no se raje, y los tocadiscos con el plato y el brazo desmontados y bien protegidos.</p>
        <ul>
          <li><strong>Canarias:</strong> 24-48 h. 4,90 €, gratis desde 60 €.</li>
          <li><strong>Península y Baleares:</strong> 3-5 días laborables. 9,90 €, gratis desde 120 €.</li>
          <li>De momento no enviamos a Ceuta, Melilla ni fuera de España.</li>
        </ul>
        <h2>Devoluciones</h2>
        <p>Tienes 14 días desde que lo recibes. Escríbenos a {T.email} con tu número de pedido y te decimos cómo mandarlo. Consulta las <Link to="/legal/condiciones">condiciones de venta</Link>.</p>
      </>
    ),
  },
  cookies: {
    titulo: 'Cookies',
    cuerpo: (
      <>
        <p>Esta tienda solo usa lo imprescindible para funcionar, así que no necesita pedirte permiso:</p>
        <ul>
          <li><strong>Cookie «surco»</strong> (sesión): mantiene tu sesión abierta y protege los formularios. Se borra al cerrar el navegador.</li>
          <li><strong>Almacenamiento local «surco:cesta»</strong>: recuerda lo que has metido en la cesta en este navegador.</li>
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
    <article className="mx-auto max-w-[760px] px-4 sm:px-6 pt-12 [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-gris [&_p]:mb-4 [&_li]:text-gris [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:grid [&_ul]:gap-2 [&_ul]:mb-4 [&_strong]:text-tinta [&_a]:underline [&_a]:underline-offset-4">
      <h1 className="rotulo text-[clamp(2.6rem,6vw,4.4rem)] mb-4">{p.titulo}</h1>
      <p className="rounded-xl bg-[#ffd23f] !text-[#1d1600] font-semibold p-3 text-sm">Texto de demostración con datos ficticios. Que lo revise un asesor antes de publicar la tienda.</p>
      {p.cuerpo}
    </article>
  );
}
