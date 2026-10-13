import { faq, estudio } from '../data/estudio.js';

export default function Faq() {
  return (
    <section className="seccion faq" id="preguntas" aria-labelledby="faq-t">
      <div className="envoltura faq__rejilla">
        <div>
          <h2 id="faq-t" className="titular">Antes de tu primera cita</h2>
          <p className="entradilla">¿Otra duda? Escríbenos por WhatsApp al {estudio.whatsappVisible}.</p>
        </div>
        <div className="faq__lista">
          {faq.map((f) => (
            <details key={f.p} className="faq__item">
              <summary>
                <span>{f.p}</span>
                <i aria-hidden="true" />
              </summary>
              <p>{f.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
