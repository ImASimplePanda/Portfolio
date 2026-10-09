// Textos legales (LSSI-CE y RGPD/LOPDGDD). Se rellenan con data/site.json.
// Plantilla orientativa: que la revise un asesor antes de publicar.
export function legal(lang, site, rutas, esc, L, hoy) {
  const t = site.titular, c = site.contacto;
  const demo = site.demo
    ? (lang === "es"
      ? `<p class="doc__demo">Texto de demostración con datos ficticios. Sustituye los datos del titular y revisa este texto con un asesor antes de publicar.</p>`
      : `<p class="doc__demo">Demo text with fictitious data. Replace the owner's details and have this text reviewed by an adviser before publishing.</p>`)
    : "";
  const fecha = new Date(hoy).toLocaleDateString(lang === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const actual = `<p class="doc__fecha">${lang === "es" ? "Última actualización" : "Last updated"}: ${fecha}</p>`;
  const datos = `<dl class="doc__datos">
    <div><dt>${lang === "es" ? "Titular" : "Owner"}</dt><dd>${esc(t.razonSocial)}</dd></div>
    <div><dt>${lang === "es" ? "Nombre comercial" : "Trading name"}</dt><dd>${esc(site.nombreCompleto)}</dd></div>
    <div><dt>CIF</dt><dd>${esc(t.cif)}</dd></div>
    <div><dt>${lang === "es" ? "Domicilio" : "Registered address"}</dt><dd>${esc(t.domicilio)}</dd></div>
    <div><dt>${lang === "es" ? "Registro" : "Registration"}</dt><dd>${esc(t.registro)}</dd></div>
    <div><dt>Email</dt><dd><a href="mailto:${t.emailLegal}">${esc(t.emailLegal)}</a></dd></div>
    <div><dt>${lang === "es" ? "Teléfono" : "Phone"}</dt><dd>${esc(c.telefono)}</dd></div>
  </dl>`;

  if (lang === "es") return {
    aviso: `${demo}${actual}
  <h2>1. Datos identificativos</h2>
  <p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:</p>
  ${datos}
  <h2>2. Objeto</h2>
  <p>Este sitio web informa sobre las actividades de buceo y snorkel de ${esc(site.nombreCompleto)} y permite enviar solicitudes de reserva. Enviar una solicitud no supone una contratación: la reserva solo queda confirmada cuando el centro responde por escrito.</p>
  <h2>3. Condiciones de uso</h2>
  <p>El acceso es gratuito y no requiere registro. Quien navega se compromete a hacer un uso lícito del sitio y a no introducir datos falsos o de terceros sin su consentimiento.</p>
  <h2>4. Propiedad intelectual e industrial</h2>
  <p>Los textos, fotografías, diseño, logotipos y código de este sitio pertenecen al titular o se usan con licencia. No está permitida su reproducción, distribución o transformación sin autorización expresa.</p>
  <h2>5. Responsabilidad</h2>
  <p>La información sobre precios, horarios y condiciones del mar es orientativa y puede cambiar. El titular no se hace responsable del mal uso del sitio ni de los contenidos de webs de terceros enlazadas, como redes sociales o WhatsApp.</p>
  <h2>6. Seguridad en las actividades</h2>
  <p>El buceo es una actividad con riesgo. La participación está sujeta al cuestionario médico, a las instrucciones del personal y a las condiciones de seguridad que se firman en el centro antes de cada actividad.</p>
  <h2>7. Legislación y jurisdicción</h2>
  <p>Este aviso se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Las Palmas de Gran Canaria, sin perjuicio del fuero que corresponda a las personas consumidoras según la normativa vigente. También puedes recurrir a la plataforma europea de resolución de litigios en línea: <a href="https://ec.europa.eu/consumers/odr" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>`,

    privacidad: `${demo}${actual}
  <h2>1. Responsable del tratamiento</h2>
  ${datos}
  <h2>2. Qué datos tratamos</h2>
  <p>Solo los que nos das en el formulario de reserva o al escribirnos: nombre, correo electrónico, teléfono (si lo indicas), experiencia, fecha, número de personas, nivel de buceo y el mensaje que quieras añadir. No pedimos datos de salud por la web: el cuestionario médico se rellena en el centro, en papel, el día de la actividad.</p>
  <h2>3. Para qué los usamos</h2>
  <ul>
    <li>Responder a tu solicitud y gestionar tu reserva.</li>
    <li>Contratar el seguro de accidentes de buceo de cada participante, cuando la reserva se confirma.</li>
    <li>Cumplir nuestras obligaciones legales, fiscales y contables.</li>
  </ul>
  <p>No enviamos publicidad ni elaboramos perfiles. No tomamos decisiones automatizadas.</p>
  <h2>4. Base legal</h2>
  <p>Tu consentimiento al enviar el formulario (art. 6.1.a RGPD), la aplicación de medidas precontractuales y la ejecución del contrato cuando reservas (art. 6.1.b), y el cumplimiento de obligaciones legales (art. 6.1.c). Puedes retirar tu consentimiento cuando quieras, sin que eso afecte a lo tratado antes.</p>
  <h2>5. Cuánto tiempo los guardamos</h2>
  <p>Si no llegas a reservar, borramos tu solicitud como máximo a los 12 meses. Si reservas, conservamos los datos mientras dure la relación y, después, durante los plazos legales (por ejemplo, 6 años para la documentación contable según el Código de Comercio).</p>
  <h2>6. A quién se comunican</h2>
  <ul>
    <li><strong>FormSubmit</strong> (formsubmit.co), el servicio que nos hace llegar el formulario por correo electrónico. Actúa como encargado del tratamiento y puede suponer una transferencia internacional de datos amparada en las garantías previstas por el RGPD.</li>
    <li><strong>Hostinger International Ltd.</strong>, proveedor del alojamiento web, con servidores en la Unión Europea.</li>
    <li><strong>Meta Platforms (WhatsApp)</strong>, solo si decides escribirnos por WhatsApp. En ese caso se aplica también su propia política de privacidad.</li>
    <li>La <strong>compañía aseguradora</strong> de la actividad, con los datos imprescindibles para el seguro de accidentes.</li>
    <li>Las administraciones públicas, cuando una ley lo exija.</li>
  </ul>
  <h2>7. Tus derechos</h2>
  <p>Puedes pedir el acceso, la rectificación o la supresión de tus datos, la limitación del tratamiento, la portabilidad y oponerte al tratamiento escribiendo a <a href="mailto:${t.emailLegal}">${esc(t.emailLegal)}</a>. Te responderemos en un mes como máximo. Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>
  <h2>8. Menores de edad</h2>
  <p>Si eres menor de 14 años, la solicitud la tiene que enviar tu madre, tu padre o tu tutor legal (art. 7 de la LOPDGDD).</p>
  <h2>9. Cookies</h2>
  <p>Esta web no usa cookies, ni analítica, ni píxeles de seguimiento. Las fuentes y las librerías se sirven desde nuestro propio servidor, así que tu navegador no contacta con terceros al visitarla. La única excepción es el envío del formulario a FormSubmit, que solo ocurre si lo envías tú.</p>`,
  };

  return {
    aviso: `${demo}${actual}
  <h2>1. Owner details</h2>
  <p>In accordance with article 10 of Spanish Law 34/2002 on information society services and e-commerce (LSSI-CE), the owner of this website is:</p>
  ${datos}
  <h2>2. Purpose</h2>
  <p>This website provides information about the diving and snorkelling activities of ${esc(site.nombreCompleto)} and lets you send booking requests. Sending a request is not a contract: a booking is only confirmed once the centre replies in writing.</p>
  <h2>3. Terms of use</h2>
  <p>Access is free and requires no registration. Users agree to use the site lawfully and not to submit false data or data belonging to others without their consent.</p>
  <h2>4. Intellectual property</h2>
  <p>The texts, photographs, design, logos and code on this site belong to the owner or are used under licence. They may not be reproduced, distributed or modified without express permission.</p>
  <h2>5. Liability</h2>
  <p>Information on prices, schedules and sea conditions is for guidance only and may change. The owner is not responsible for misuse of the site or for the content of linked third-party sites such as social networks or WhatsApp.</p>
  <h2>6. Safety</h2>
  <p>Diving involves risk. Participation is subject to the medical questionnaire, the staff's instructions and the safety terms signed at the centre before each activity.</p>
  <h2>7. Governing law</h2>
  <p>This notice is governed by Spanish law. Any dispute shall be submitted to the courts of Las Palmas de Gran Canaria, without prejudice to the jurisdiction that applies to consumers under current legislation. You may also use the EU online dispute resolution platform: <a href="https://ec.europa.eu/consumers/odr" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>`,

    privacidad: `${demo}${actual}
  <h2>1. Data controller</h2>
  ${datos}
  <h2>2. What data we process</h2>
  <p>Only what you give us in the booking form or when you contact us: name, email, phone (if provided), experience, date, number of people, diving level and any message you add. We do not ask for health data online: the medical questionnaire is filled in on paper at the centre on the day of the activity.</p>
  <h2>3. Why we use it</h2>
  <ul>
    <li>To reply to your request and manage your booking.</li>
    <li>To take out diving accident insurance for each participant once the booking is confirmed.</li>
    <li>To meet our legal, tax and accounting obligations.</li>
  </ul>
  <p>We do not send advertising or build profiles. We make no automated decisions.</p>
  <h2>4. Legal basis</h2>
  <p>Your consent when you submit the form (art. 6.1.a GDPR), pre-contractual steps and performance of the contract when you book (art. 6.1.b), and compliance with legal obligations (art. 6.1.c). You can withdraw your consent at any time without affecting prior processing.</p>
  <h2>5. How long we keep it</h2>
  <p>If you don't book, we delete your request within 12 months at most. If you book, we keep your data for the duration of the relationship and then for the legally required periods (for example, 6 years for accounting records under the Spanish Commercial Code).</p>
  <h2>6. Who receives it</h2>
  <ul>
    <li><strong>FormSubmit</strong> (formsubmit.co), the service that delivers the form to us by email. It acts as a data processor and may involve an international data transfer covered by the safeguards set out in the GDPR.</li>
    <li><strong>Hostinger International Ltd.</strong>, our web host, with servers in the European Union.</li>
    <li><strong>Meta Platforms (WhatsApp)</strong>, only if you choose to message us on WhatsApp, in which case its own privacy policy also applies.</li>
    <li>The activity's <strong>insurance company</strong>, with the minimum data needed for accident cover.</li>
    <li>Public authorities, when required by law.</li>
  </ul>
  <h2>7. Your rights</h2>
  <p>You can request access, rectification or erasure of your data, restriction of processing, portability, and object to processing by writing to <a href="mailto:${t.emailLegal}">${esc(t.emailLegal)}</a>. We will reply within one month. If you feel your request was not handled properly, you can complain to the Spanish Data Protection Agency (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>
  <h2>8. Minors</h2>
  <p>If you are under 14, the request must be sent by your parent or legal guardian (art. 7 of the Spanish LOPDGDD).</p>
  <h2>9. Cookies</h2>
  <p>This website uses no cookies, analytics or tracking pixels. Fonts and libraries are served from our own server, so your browser does not contact third parties when you visit. The only exception is submitting the form to FormSubmit, which only happens if you send it.</p>`,
  };
}
