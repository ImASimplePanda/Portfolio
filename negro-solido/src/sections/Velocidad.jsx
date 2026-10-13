import { useReducedMotion } from 'motion/react';
import ScrollVelocity from '../components/rb/ScrollVelocity.jsx';

const lineas = ['Blackwork / Dotwork / Geometría /', 'Ornamental / Flash / Cover-ups /'];

export default function Velocidad() {
  const reduce = useReducedMotion();
  return (
    <div className="velocidad" aria-hidden="true">
      {reduce ? (
        lineas.map((l) => <p key={l} className="velocidad__texto">{l}</p>)
      ) : (
        <ScrollVelocity texts={lineas} velocity={40} numCopies={4} className="velocidad__texto" />
      )}
    </div>
  );
}
