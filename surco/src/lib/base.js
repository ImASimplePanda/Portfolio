// Ruta base: '/' en su dominio o '/demos/surco/' dentro del portfolio
export const BASE = import.meta.env.BASE_URL;
export const subida = (id, ancho) => `${BASE}subidas/${id}-${ancho}.webp`;
