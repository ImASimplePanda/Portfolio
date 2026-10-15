import { useEffect } from 'react';

// Título de la pestaña por página
export function usarTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Latón` : 'Latón · Bicicletas a medida soldadas a mano en Gran Canaria';
  }, [titulo]);
}
