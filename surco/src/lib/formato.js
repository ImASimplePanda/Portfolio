const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
export const euros = (centimos) => fmt.format((centimos || 0) / 100);

// Escala Goldmine, la que usan las tiendas de discos de segunda mano
export const GRADOS = {
  M: { nombre: 'Mint', texto: 'Precintado o sin escuchar. Perfecto.' },
  NM: { nombre: 'Near Mint', texto: 'Como nuevo. Sin marcas visibles ni ruidos.' },
  'VG+': { nombre: 'Very Good Plus', texto: 'Marcas leves de uso que no se oyen.' },
  VG: { nombre: 'Very Good', texto: 'Marcas visibles y algún chasquido suave entre canciones.' },
  'G+': { nombre: 'Good Plus', texto: 'Se escucha entero, con ruido de superficie.' },
  G: { nombre: 'Good', texto: 'Muy escuchado. Para completar colección.' },
};
export const ORDEN_GRADOS = ['M', 'NM', 'VG+', 'VG', 'G+', 'G'];

// Envío desde Las Palmas: mismas reglas que el servidor (que es quien decide)
export function zonaDeCp(cp) {
  if (!/^\d{5}$/.test(cp || '')) return null;
  const p = Number(cp.slice(0, 2));
  if (p < 1 || p > 52 || p === 51 || p === 52) return null;
  return p === 35 || p === 38 ? 'canarias' : 'peninsula';
}
export function costeEnvio(zona, subtotal) {
  if (zona === 'canarias') return subtotal >= 6000 ? 0 : 490;
  if (zona === 'peninsula') return subtotal >= 12000 ? 0 : 990;
  return null;
}

export const nombreProducto = (p) => (p.artista ? `${p.artista}: ${p.titulo}` : p.titulo);
export const fecha = (iso) => new Date(iso.replace(' ', 'T') + 'Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
export const ESTADOS = { pendiente: 'Pendiente de pago', pagado: 'Pagado', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto' };
