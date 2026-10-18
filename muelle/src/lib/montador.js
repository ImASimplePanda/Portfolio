// Reglas del montador. El servidor (public/api/_lib/montador.php) hace exactamente las mismas cuentas
// con el mismo JSON, y es el precio del servidor el que vale.
import M from '../../public/api/_lib/montador.json';

export const MONTADOR = M;
export const porId = (lista, id) => lista.find((x) => x.id === id);

export const BUILD_INICIAL = {
  formato: '65',
  carcasa: 'aluminio',
  color: 'ciruela',
  placa: 'aluminio',
  interruptor: null, // id de producto (tipo interruptores)
  teclas: null, // id de producto (tipo teclas)
  extras: ['estabilizadores'],
};

export function normalizarBuild(b, interruptores = [], juegos = []) {
  const c = { ...BUILD_INICIAL, ...b };
  if (!porId(M.formatos, c.formato)) c.formato = BUILD_INICIAL.formato;
  const carcasa = porId(M.carcasas, c.carcasa) || M.carcasas[0];
  c.carcasa = carcasa.id;
  if (!porId(carcasa.colores, c.color)) c.color = carcasa.colores[0].id;
  if (!porId(M.placas, c.placa)) c.placa = 'aluminio';
  if (interruptores.length && !interruptores.some((x) => x.id === c.interruptor)) c.interruptor = interruptores[0].id;
  if (juegos.length && !juegos.some((x) => x.id === c.teclas)) c.teclas = juegos[0].id;
  c.extras = [...new Set((c.extras || []).filter((e) => porId(M.extras, e)))].sort();
  return c;
}

export const packsNecesarios = (formato) => Math.ceil(porId(M.formatos, formato).teclas / M.packInterruptores);

// Desglose del precio; `interruptor` y `juego` son los productos elegidos (con su precio actual)
export function precioBuild(c, interruptor, juego) {
  const f = porId(M.formatos, c.formato);
  const carcasa = porId(M.carcasas, c.carcasa);
  const placa = porId(M.placas, c.placa);
  const packs = packsNecesarios(c.formato);
  const lineas = [
    [`Kit ${f.nombre} (PCB, estabilizadores y montaje base)`, f.precio],
    [`Carcasa: ${carcasa.nombre.toLowerCase()}, ${porId(carcasa.colores, c.color).nombre.toLowerCase()}`, carcasa.precio],
    [`Placa de ${placa.nombre.toLowerCase()}`, placa.precio],
  ];
  if (interruptor) lineas.push([`${packs * M.packInterruptores} interruptores ${interruptor.titulo}`, packs * interruptor.precio]);
  if (juego) lineas.push([`Juego de teclas ${juego.titulo}`, juego.precio]);
  for (const id of c.extras) {
    const e = porId(M.extras, id);
    lineas.push([e.nombre, e.precioPorTecla ? e.precioPorTecla * f.teclas : e.precio]);
  }
  lineas.push(['Montaje y prueba tecla a tecla', M.montaje.precio]);
  return { lineas, total: lineas.reduce((s, [, p]) => s + p, 0) };
}
