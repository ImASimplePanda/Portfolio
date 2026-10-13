import ScrollReveal from '../components/rb/ScrollReveal.jsx';
import { B } from '../base.js';

export default function Manifiesto() {
  return (
    <section className="seccion manifiesto" aria-label="Cómo trabajamos">
      <div className="envoltura manifiesto__rejilla">
        <ScrollReveal baseOpacity={0.45} enableBlur baseRotation={2} blurStrength={3} textClassName="manifiesto__texto">
          Solo tatuamos en negro. Cada pieza se dibuja para un cuerpo concreto, se revisa contigo antes de la sesión y se tatúa sin prisas, una sola vez.
        </ScrollReveal>
        <img className="manifiesto__pieza" src={B + 'arte/geometria-2-claro.svg'} alt="" width="400" height="400" loading="lazy" decoding="async" />
      </div>
    </section>
  );
}
