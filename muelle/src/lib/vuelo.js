// Al añadir a la cesta, una vía de cobre sale del botón y cae en la cesta de la cabecera trazando
// un arco; al llegar, la cesta da un pequeño salto. Solo transform y opacity (WAAPI, sin librería).
const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function volarACesta(origen) {
  const destino = document.querySelector('[data-cesta]');
  if (!origen || !destino || reducido()) return;
  const a = origen.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height / 2;
  const dx = b.left + b.width / 2 - x0;
  const dy = b.top + b.height / 2 - y0;
  const punto = document.createElement('span');
  punto.className = 'via-volando';
  punto.style.left = `${x0 - 9}px`;
  punto.style.top = `${y0 - 9}px`;
  document.body.appendChild(punto);
  // Arco: sube primero (más cuanto más lejos) y baja hacia la cesta
  const alto = Math.min(-80, dy - 120);
  const vuelo = punto.animate([
    { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
    { transform: `translate(${dx * 0.12}px, ${alto * 0.55}px) scale(1.15)`, opacity: 1, offset: 0.18 },
    { transform: `translate(${dx * 0.55}px, ${alto}px) scale(1)`, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.45)`, opacity: 0.9 },
  ], { duration: 620, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
  vuelo.onfinish = () => {
    punto.remove();
    destino.animate([
      { transform: 'scale(1)' }, { transform: 'scale(1.14) translateY(-2px)' }, { transform: 'scale(0.97)' }, { transform: 'scale(1)' },
    ], { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
  };
  vuelo.oncancel = () => punto.remove();
}
