// Reglas de la configuración: qué opción vale para cada modelo, precio, plazo, peso y talla.
// El servidor (public/api/_lib/opciones.php) repite exactamente estas cuentas y es quien manda.
import O from '../../public/api/_lib/opciones.json';

export const OPCIONES = O;
export const porId = (lista, id) => lista.find((x) => x.id === id);

export const vale = (o, c) =>
  (!o.modelos || o.modelos.includes(c.modelo)) && (!o.materiales || o.materiales.includes(c.material));

export const LIMITES = { altura: [145, 210], entrepierna: [60, 105] };

export const INICIAL = {
  modelo: 'alisio',
  material: 'acero',
  acabado: 'tabaiba',
  transmision: '105',
  ruedas: 'aluminio',
  cinta: 'miel',
  extras: [],
  altura: 176,
  entrepierna: 83,
};

const acotar = (v, [a, b]) => Math.min(b, Math.max(a, Math.round(Number(v) || 0)));

// Deja la configuración en un estado válido: lo que no sirve para el modelo o el material se cambia
// por la primera opción que sí sirve.
export function normalizar(entrada) {
  const c = { ...INICIAL, ...entrada };
  if (!porId(O.modelos, c.modelo)) c.modelo = INICIAL.modelo;
  if (!porId(O.materiales, c.material)) c.material = INICIAL.material;
  for (const [campo, lista] of [['acabado', O.acabados], ['transmision', O.transmisiones], ['ruedas', O.ruedas], ['cinta', O.cintas]]) {
    const o = porId(lista, c[campo]);
    if (!o || !vale(o, c)) c[campo] = (lista.find((x) => vale(x, c)) || lista[0]).id;
  }
  // El titanio no se pinta: si venía un color, pasa a cepillado. Y al revés.
  if (c.material === 'titanio' && porId(O.acabados, c.acabado).tipo !== 'titanio') c.acabado = 'cepillado';
  c.extras = [...new Set(Array.isArray(c.extras) ? c.extras : [])].filter((id) => {
    const e = porId(O.extras, id);
    return e && vale(e, c);
  }).sort();
  c.altura = acotar(c.altura, LIMITES.altura);
  c.entrepierna = acotar(c.entrepierna, LIMITES.entrepierna);
  return c;
}

// Medidas del cuadro (en mm) a partir de la altura y la entrepierna del ciclista
export function talla(c) {
  const g = porId(O.modelos, c.modelo).geometria;
  const rad = (d) => (d * Math.PI) / 180;
  const ha = rad(g.anguloDireccion);
  const tuboSillin = Math.round(c.entrepierna * 6.5);
  const reach = Math.round(383 + (c.altura - 178) * 1.9 + g.reachExtra);
  // Altura de la parte baja del tubo de dirección: la marca la horquilla (+15 mm de juego de dirección)
  const bajoDireccion = g.caidaPedalier + g.horquilla * Math.sin(ha) - g.avance * Math.cos(ha) + 15;
  const stack = Math.max(
    Math.round(565 + (c.altura - 178) * 2.2 + (c.entrepierna - 84) * 1.6 + g.stackExtra),
    Math.round(bajoDireccion + 95 * Math.sin(ha)),
  );
  const tuboDireccion = Math.round((stack - bajoDireccion) / Math.sin(ha));
  const alturaSillin = Math.round(c.entrepierna * 8.83);
  const potencia = Math.min(130, Math.max(70, Math.round((100 + (c.altura - 178) * 0.8) / 10) * 10));
  return { tuboSillin, reach, stack, tuboDireccion, alturaSillin, potencia, nombre: String(Math.round(tuboSillin / 10)) };
}

export function precio(c) {
  const m = porId(O.modelos, c.modelo);
  const lineas = [
    [`Cuadro ${m.nombre} de ${c.material} a tu medida`, m.cuadro[c.material]],
    [porId(O.acabados, c.acabado).nombre, porId(O.acabados, c.acabado).precio],
    [porId(O.transmisiones, c.transmision).nombre, porId(O.transmisiones, c.transmision).precio],
    [porId(O.ruedas, c.ruedas).nombre, porId(O.ruedas, c.ruedas).precio],
    ...c.extras.map((id) => [porId(O.extras, id).nombre, porId(O.extras, id).precio]),
  ];
  return { lineas, total: lineas.reduce((s, [, p]) => s + p, 0) };
}

export function plazo(c) {
  const a = porId(O.acabados, c.acabado);
  return porId(O.materiales, c.material).plazo + (a.tipo === 'metal' || a.id === 'anodizado' ? 1 : 0);
}

export function peso(c) {
  const kg = porId(O.modelos, c.modelo).peso[c.material]
    + (c.material === 'acero' ? 0.6 : 0.5)
    + porId(O.transmisiones, c.transmision).peso
    + porId(O.ruedas, c.ruedas).peso
    + c.extras.reduce((s, id) => s + porId(O.extras, id).peso, 0)
    + 1.6;
  return Math.round(kg * 10) / 10;
}

export const senal = (total) => Math.round((total * O.senal) / 100) * 100;
