const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
export const euros = (centimos) => fmt.format((centimos || 0) / 100);

// Envío desde Valencia: mismas reglas que el servidor (que es quien decide)
export function zonaDeCp(cp) {
  if (!/^\d{5}$/.test(cp || '')) return null;
  const p = Number(cp.slice(0, 2));
  if (p < 1 || p > 52 || p === 51 || p === 52) return null;
  if (p === 35 || p === 38) return 'canarias';
  return p === 7 ? 'baleares' : 'peninsula';
}
export function costeEnvio(zona, subtotal) {
  if (zona === 'peninsula') return subtotal >= 8000 ? 0 : 490;
  if (zona === 'baleares') return subtotal >= 8000 ? 0 : 790;
  if (zona === 'canarias') return subtotal >= 15000 ? 0 : 1290;
  return null;
}
export const ZONAS = { peninsula: 'Península', baleares: 'Baleares', canarias: 'Canarias' };

export const FAMILIAS = {
  lineal: { nombre: 'Lineal', texto: 'Baja recto, sin bache ni clic. Suave y rápido.' },
  tactil: { nombre: 'Táctil', texto: 'Notas un pequeño bache justo cuando la tecla se activa.' },
  clicky: { nombre: 'Clicky', texto: 'Bache y además un clic que se oye, como una máquina de escribir.' },
};
export const TIPOS = { teclado: 'Teclados montados', interruptores: 'Interruptores', teclas: 'Juegos de teclas', accesorio: 'Accesorios' };

export const fecha = (iso) => new Date(iso.replace(' ', 'T') + 'Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
export const ESTADOS = { pendiente: 'Pendiente de pago', pagado: 'Pagado', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto' };
