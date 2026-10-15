// Formatos en español: euros, fechas y medidas
export const euros = (c, decimales = false) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimales ? 2 : 0, maximumFractionDigits: decimales ? 2 : 0, useGrouping: 'always' }).format(c / 100);

const zona = 'Atlantic/Canary';
export const fechaLarga = (iso) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
export const diaSemana = (iso) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace('.', '');
export const diaMes = (iso) => Number(iso.slice(8, 10));
export const mes = (iso) => new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
export const fechaHora = (s) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: zona }).format(new Date(s.replace(' ', 'T') + 'Z'));
export const kg = (n) => `${String(n).replace('.', ',')} kg`;
export const cm = (n) => `${n} cm`;
