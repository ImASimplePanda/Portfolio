// DATOS DE DEMOSTRACIÓN: los textos de este archivo y de contacto.json son inventados.
// Sustitúyelos por los reales antes de publicar y pon demo: false en contacto.json.
import arte from './arte.json';
import contacto from './contacto.json';
import { B } from '../base.js';

export const demo = contacto.demo;

const a = (id) => `${B}arte/${id}.svg`;
const pieza = (id) => arte.find((p) => p.id === id);

export const estudio = contacto;

export const estilos = [
  { id: 'blackwork', nombre: 'Blackwork', texto: 'Masas de negro sólido y contraste máximo.', imagen: B + 'fotos/estilo-blackwork.webp' },
  { id: 'dotwork', nombre: 'Dotwork', texto: 'Sombras hechas punto a punto.', imagen: B + 'fotos/estilo-dotwork.webp' },
  { id: 'geometria', nombre: 'Geometría', texto: 'Simetría, compás y regla.', imagen: B + 'fotos/estilo-geometria.webp' },
  { id: 'ornamental', nombre: 'Ornamental', texto: 'Mandalas y patrones que siguen la anatomía.', imagen: B + 'fotos/estilo-ornamental.webp' },
  { id: 'flash', nombre: 'Flash', texto: 'Diseños cerrados, listos para tatuar.', imagen: B + 'fotos/estilo-flash.webp' },
];

// Qué estilo tiene cada familia de diseños (para filtrar el trabajo)
const estiloDe = { mandala: 'ornamental', geometria: 'geometria', luna: 'dotwork', polilla: 'blackwork', daga: 'flash', ojo: 'dotwork' };
const nombreDe = { mandala: 'Mandala', geometria: 'Geometría sagrada', luna: 'Luna en dotwork', polilla: 'Polilla', daga: 'Daga', ojo: 'Ojo que todo lo ve' };

export const artistas = [
  { id: 'iballa', nombre: 'Iballa Rocha', estilo: 'Blackwork y ornamental', desde: 2013, pieza: 'mandala-1', foto: B + 'fotos/artista-iballa.webp', instagram: '@iballa.ink' },
  { id: 'teo', nombre: 'Teo Marrero', estilo: 'Geometría y dotwork', desde: 2016, pieza: 'geometria-2', foto: B + 'fotos/artista-teo.webp', instagram: '@teo.puntos' },
  { id: 'lucia', nombre: 'Lucía Vega', estilo: 'Línea fina y simbología', desde: 2018, pieza: 'ojo-1', foto: B + 'fotos/artista-lucia.webp', instagram: '@lucia.lineas' },
  { id: 'dani', nombre: 'Dani Suárez', estilo: 'Flash y tradicional en negro', desde: 2015, pieza: 'daga-2', foto: B + 'fotos/artista-dani.webp', instagram: '@dani.flash' },
];

const autorDe = { mandala: 'Iballa Rocha', geometria: 'Teo Marrero', luna: 'Teo Marrero', polilla: 'Iballa Rocha', daga: 'Dani Suárez', ojo: 'Lucía Vega' };

const ordenMuestra = ['mandala-1', 'daga-1', 'luna-1', 'geometria-1', 'polilla-1', 'mandala-2', 'ojo-1', 'mandala-3', 'luna-2', 'geometria-2', 'daga-2', 'mandala-4', 'polilla-2', 'luna-3', 'mandala-5', 'geometria-3', 'mandala-6'];

export const trabajos = ordenMuestra.map((id) => pieza(id)).map((p, i) => ({
  id: p.id,
  img: a(p.id),
  w: p.w,
  h: p.h,
  estilo: estiloDe[p.tipo],
  titulo: `${nombreDe[p.tipo]} ${p.id.split('-')[1]}`,
  autor: autorDe[p.tipo],
  alt: `Diseño de tatuaje: ${nombreDe[p.tipo].toLowerCase()} en tinta negra sobre papel`,
  orden: i,
}));

export const flash = [
  { id: 'daga-1', nombre: 'Daga con halo', tamano: '8 × 14 cm', precio: 120 },
  { id: 'polilla-1', nombre: 'Polilla lunar', tamano: '10 × 10 cm', precio: 140 },
  { id: 'luna-2', nombre: 'Luna en dotwork', tamano: '9 × 9 cm', precio: 130 },
  { id: 'geometria-3', nombre: 'Flor de la vida', tamano: '8 × 8 cm', precio: 110 },
  { id: 'mandala-4', nombre: 'Mandala pequeño', tamano: '7 × 7 cm', precio: 90 },
  { id: 'ojo-1', nombre: 'Ojo en triángulo', tamano: '9 × 10 cm', precio: 130 },
].map((f) => ({ ...f, img: a(f.id), pegatina: `${B}arte/${f.id}-pegatina.svg`, ...pieza(f.id) }));

export const proceso = [
  { titulo: 'Cuéntanos la idea', texto: 'Rellena el formulario con la zona, el tamaño y referencias. Te contestamos en menos de 48 horas con presupuesto cerrado.', foto: B + 'fotos/proceso-idea.webp', alt: 'Mano tatuada dibujando un mandala en puntillismo sobre papel' },
  { titulo: 'Diseño y señal', texto: `Reservas con una señal de ${estudio.senal} € que se descuenta del precio final. Ves el diseño antes de la sesión y lo ajustamos contigo.`, foto: B + 'fotos/proceso-diseno.webp', alt: 'Plantilla de un mandala transferida a la piel del brazo' },
  { titulo: 'La sesión', texto: 'Agujas y cartuchos de un solo uso, que abrimos delante de ti. Tintas veganas con certificado REACH y superficies desinfectadas entre clientes.', foto: B + 'fotos/proceso-sesion.webp', alt: 'Cartuchos de agujas precintados, guantes negros y tapones de tinta' },
  { titulo: 'Cuidados', texto: 'Te llevas la guía de curación por escrito. A las cuatro semanas revisamos la pieza y el retoque, si hace falta, no se cobra.', foto: B + 'fotos/proceso-cuidados.webp', alt: 'Film de curación y crema para el cuidado del tatuaje sobre una toalla negra' },
];

export const faq = [
  { p: '¿Cuánto cuesta un tatuaje?', r: `Depende del tamaño, la zona y el detalle. El mínimo es de ${estudio.precioMinimo} € y siempre damos un presupuesto cerrado antes de empezar, sin sorpresas al terminar.` },
  { p: '¿Por qué hay que dejar señal?', r: `Para reservar el tiempo del artista y el diseño. Son ${estudio.senal} €, se descuentan del precio final y se devuelven si cancelas con más de 72 horas.` },
  { p: '¿Tatuáis a menores?', r: 'No. Solo tatuamos a mayores de 18 años y te pediremos el DNI o el pasaporte el día de la cita.' },
  { p: '¿Puedo traer mi propio diseño?', r: 'Sí, como referencia. Lo redibujamos para tu cuerpo y nuestro estilo. No copiamos piezas de otros artistas.' },
  { p: '¿Cuándo puedo ir a la playa?', r: 'Espera al menos dos semanas sin sol directo, sin mar y sin piscina. Después, protector solar alto siempre: el negro dura mucho más.' },
  { p: '¿Hacéis cover-ups?', r: 'Sí, en blackwork es una de nuestras especialidades. Mándanos una foto con buena luz del tatuaje que quieres tapar.' },
];
