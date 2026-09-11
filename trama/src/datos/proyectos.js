/* Única fuente de verdad. El índice y las láminas se derivan de aquí:
   en la versión estática este contenido estaba duplicado en dos sitios. */
export const proyectos = [
  {
    id: 1,
    n: "01",
    nombre: "Bastida Motors",
    disciplina: "Identidad · Señalética",
    ano: "2025",
    resumen:
      "Un taller de restauración que llevaba treinta años sin el nombre escrito en ninguna parte. Marca, rotulación de nave y un sistema de fichas para cada coche que entra.",
    alcance: "Marca, señalética, impresos",
    equipo: "Dos personas, cuatro meses",
    img: "w1",
    alt: "Dos coches clásicos aparcados ante dos persianas metálicas amarillas.",
    pie: "Bastida Motors — la nave, 2025",
  },
  {
    id: 2,
    n: "02",
    nombre: "Taller Ferrán",
    disciplina: "Sistema de diseño",
    ano: "2024",
    resumen:
      "Una imprenta con ciento veinte años de matrices en cajones. Catalogamos el fondo y lo convertimos en el sistema gráfico de la casa, en vez de dibujar uno nuevo.",
    alcance: "Catálogo, retícula, tipografía",
    equipo: "Tres personas, siete meses",
    img: "w2",
    alt: "Piezas metálicas de imprenta ordenadas en retícula sobre fondo blanco.",
    pie: "Taller Ferrán — fondo de matrices, 2024",
  },
  {
    id: 3,
    n: "03",
    nombre: "Oficio Común",
    disciplina: "Marca · Editorial",
    ano: "2024",
    resumen:
      "Una asociación de doce oficios que sólo se parecían en las manos. La marca es un sistema de fichas: cada oficio pone la suya y el conjunto sigue leyéndose igual.",
    alcance: "Marca, libro, exposición",
    equipo: "Cuatro personas, nueve meses",
    img: "w3",
    alt: "Pared de un taller con herramientas y cuerdas colgadas, iluminada de lado.",
    pie: "Oficio Común — pared de taller, 2024",
  },
  {
    id: 4,
    n: "04",
    nombre: "Fundación Ribera",
    disciplina: "Programa cultural",
    ano: "2023",
    resumen:
      "Doce actividades al año en un edificio de piedra que no admitía un cartel más. Toda la señalización es temporal y se retira: el edificio vuelve a quedarse limpio.",
    alcance: "Identidad, programa, señalética",
    equipo: "Tres personas, un año",
    img: "w4",
    alt: "Escalinata de piedra junto al agua, fotografiada en blanco y negro.",
    pie: "Fundación Ribera — la escalinata, 2023",
  },
  {
    id: 5,
    n: "05",
    nombre: "Nave Sur",
    disciplina: "Dirección de arte · Campaña",
    ano: "2023",
    resumen:
      "Una sala de conciertos que quería llenar los martes. La campaña no enseña grupos: enseña la nave vacía a las seis de la tarde, que es cuando empieza todo.",
    alcance: "Dirección de arte, cartelería",
    equipo: "Dos personas, cinco meses",
    img: "w5",
    alt: "Nave abovedada en penumbra con un foco de luz al fondo y público de espaldas.",
    pie: "Nave Sur — la nave vacía, 2023",
  },
];

export const cubierta = [
  { k: "Fundado", v: "2016" },
  { k: "Disciplina", v: "Dirección de arte y diseño" },
  { k: "Índice", v: "01 — 05" },
  { k: "Sede", v: "Pendiente", pendiente: true },
];

export const cifras = [
  { k: "Años", v: 9 },
  { k: "Marcas", v: 41 },
  { k: "Al año", v: 6 },
  { k: "Personas", v: 6 },
];

export const disciplinas = [
  "Identidad visual",
  "Dirección de arte",
  "Editorial y packaging",
  "Sistemas de diseño",
  "Señalética",
];

export const contacto = [
  { k: "Correo", v: "pendiente", prefijo: "hola@", pendiente: true },
  { k: "Teléfono", v: "Pendiente", pendiente: true },
  { k: "Estudio", v: "Pendiente", pendiente: true },
  { k: "Encargos", v: "Abierto para 2026" },
];

export const notas = [
  "Somos seis personas y hacemos seis proyectos al año. No es una postura: es lo que cabe si queremos estar delante cuando la marca se imprime, se monta y se equivoca por primera vez. Lo hacemos todo dentro, y por eso podemos permitirnos decir que no a lo que no encaja.",
  "Las dos primeras semanas no dibujamos nada. Escuchamos, leemos el archivo y visitamos el sitio hasta que aparece una frase con la que todos están de acuerdo. Si esa frase no aparece, devolvemos el anticipo y lo dejamos ahí.",
  "Después viene el tono: territorio, referencias y tres caminos posibles, todavía sin maquetar. Primero se decide cómo suena y luego cómo se ve, porque al revés se acaba defendiendo una tipografía en vez de una idea.",
  "Construir es la parte larga. Marca, retícula, color y las piezas reales donde va a vivir, probadas a su tamaño final, impresas y en pantalla, antes de darlas por buenas. Entregamos un manual corto, los archivos ordenados y una sesión con quien va a usarlo. Los tres meses siguientes seguimos disponibles: es cuando aparecen las dudas de verdad.",
];

export const margenes = [
  "Un manual de ochenta páginas es un manual que nadie abre. Los nuestros tienen doce.",
  "Cobramos por proyecto cerrado, no por horas. El riesgo del cálculo es nuestro.",
];
