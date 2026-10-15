// Puntos de la bici de perfil, en milímetros (x hacia delante, y hacia arriba, origen en el pedalier).
// Los usan el plano (SVG) y el modelo 3D, así que las dos vistas cuentan siempre la misma bici.
import { OPCIONES, porId, talla } from './configuracion.js';

const rad = (d) => (d * Math.PI) / 180;
const mas = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];

export function geometria(c) {
  const m = porId(OPCIONES.modelos, c.modelo);
  const g = m.geometria;
  const t = talla(c);
  const ha = rad(g.anguloDireccion);
  const sa = rad(g.anguloSillin);
  const abajoEje = [Math.cos(ha), -Math.sin(ha)]; // a lo largo del eje de dirección, hacia el suelo
  const delante = [Math.sin(ha), Math.cos(ha)]; // perpendicular al eje, hacia delante
  const ejeSillin = [-Math.cos(sa), Math.sin(sa)];

  const pedalier = [0, 0];
  const direccionArriba = [t.reach, t.stack];
  const direccionAbajo = mas(direccionArriba, abajoEje, t.tuboDireccion);
  const coronaHorquilla = mas(direccionAbajo, abajoEje, 15);
  const ejeDelantero = mas(mas(coronaHorquilla, abajoEje, g.horquilla), delante, g.avance);
  const alturaEjes = ejeDelantero[1];
  const ejeTrasero = [-Math.sqrt(g.vainas ** 2 - alturaEjes ** 2), alturaEjes];
  const sillinArriba = mas(pedalier, ejeSillin, t.tuboSillin);
  const radioRueda = 311 + g.neumatico;

  // Puntos de unión de los tubos (un poco dentro de los extremos, como en un cuadro real)
  const horizontalAtras = mas(pedalier, ejeSillin, t.tuboSillin - 18);
  const horizontalDelante = mas(direccionArriba, abajoEje, 22);
  const diagonalDelante = mas(direccionAbajo, abajoEje, -28);
  const tiranteArriba = mas(pedalier, ejeSillin, t.tuboSillin - 40);

  // Sillín, potencia y manillar
  const sillin = mas(pedalier, ejeSillin, t.alturaSillin);
  const tuboArriba = mas(direccionArriba, abajoEje, -(g.manillar === 'recto' ? 70 : 35));
  const subida = g.manillar === 'recto' ? 0.28 : -0.1; // las urbanas llevan la potencia levantada
  const potencia = [tuboArriba[0] + t.potencia * Math.cos(subida), tuboArriba[1] + t.potencia * Math.sin(subida)];

  return {
    modelo: m, talla: t, g,
    pedalier, direccionArriba, direccionAbajo, coronaHorquilla, ejeDelantero, ejeTrasero, sillinArriba,
    horizontalAtras, horizontalDelante, diagonalDelante, tiranteArriba,
    sillin, tuboArriba, potencia, radioRueda,
    suelo: alturaEjes - radioRueda,
    distanciaEjes: Math.round(ejeDelantero[0] - ejeTrasero[0]),
    vainas: g.vainas,
  };
}
