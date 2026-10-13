import { useEffect } from 'react';
import Velocidad from './Velocidad.jsx';
import Estilos from './Estilos.jsx';
import Manifiesto from './Manifiesto.jsx';
import Estudio from './Estudio.jsx';
import Trabajo from './Trabajo.jsx';
import Flash from './Flash.jsx';
import Artistas from './Artistas.jsx';
import Proceso from './Proceso.jsx';
import Faq from './Faq.jsx';
import Reserva from './Reserva.jsx';

// Secciones bajo el primer pliegue. Si se llegó con un ancla (#cita…), se coloca al cargar.
export default function Resto({ filtro, setFiltro, flashElegido, onEstilo, onFlash }) {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);
  return (
    <>
      <Velocidad />
      <Estilos onSelect={onEstilo} />
      <Manifiesto />
      <Estudio />
      <Trabajo filtro={filtro} setFiltro={setFiltro} />
      <Flash onReservar={onFlash} />
      <Artistas />
      <Proceso />
      <Faq />
      <Reserva flashElegido={flashElegido} />
    </>
  );
}
