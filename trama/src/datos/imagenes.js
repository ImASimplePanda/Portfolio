/* Variantes generadas por activos-web/scripts/exportar.py.
   El nombre del fichero lleva el ancho de VISUALIZACIÓN; el descriptor `w`
   del srcset lleva el ancho REAL en píxeles, que es lo que el navegador
   compara. Con descriptores `w` no hacen falta reglas 1x/2x aparte: el
   navegador multiplica `sizes` por la densidad de la pantalla y elige. */
const VARIANTES = [
  { archivo: "320", px: 320 },
  { archivo: "450", px: 450 },
  { archivo: "560", px: 560 },
  { archivo: "320@2x", px: 640 },
  { archivo: "450@2x", px: 900 },
  { archivo: "560@2x", px: 1120 },
];

export const srcSet = (base) =>
  VARIANTES.map((v) => `/img/${base}_${v.archivo}.webp ${v.px}w`).join(", ");

export const src = (base, tier = "450") => `/img/${base}_${tier}.webp`;

/* `sizes` copiado de los anchos medidos en la página, no inventado.
   Medidas reales del hueco a 390 / 768 / 1280 / 1440 px de viewport. */
export const SIZES = {
  // .lam-img: min(78vw, 352px) en móvil; clamp(272px, 40vw, 544px) en escritorio
  lamina:
    "(max-width: 620px) 78vw, (max-width: 900px) 352px, (max-width: 1360px) 40vw, 544px",
  // .f-fig: sólo visible por debajo de 900px
  ficha: "(max-width: 620px) 87vw, 508px",
  // .vista-marco: hueco fijo de 430px, sólo en escritorio
  vista: "430px",
};
