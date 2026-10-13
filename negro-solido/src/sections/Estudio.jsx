// El estudio a sangre: una sola imagen grande entre el manifiesto y los diseños.
import { B } from '../base.js';
export default function Estudio() {
  return (
    <figure className="estudio">
      <img
        src={B + 'fotos/estudio-1600.webp'}
        srcSet={`${B}fotos/estudio-960.webp 960w, ${B}fotos/estudio-1600.webp 1600w`}
        sizes="100vw"
        width="1600"
        height="900"
        alt="Sala de tatuaje con paredes negras, camilla de cuero, carro de acero con cartuchos precintados y una lámpara roja encendida"
        loading="lazy"
        decoding="async"
      />
      <figcaption className="envoltura">Una camilla, una persona cada vez. Triana, Las Palmas.</figcaption>
    </figure>
  );
}
