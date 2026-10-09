<?php
/*
 * Catálogo de DEMOSTRACIÓN. Títulos y autores reales; precios, stock y fechas de preventa son de ejemplo.
 * Sustitúyelo por el catálogo real de la tienda antes de quitar el modo demo (config 'demo' => false).
 */

function bk_seed_books(): array
{
    // slug, titulo, autor, coleccion, precio (€), formato, año, stock, salida (preventa) o null, sinopsis
    return [
        ['los-asquerosos', 'Los asquerosos', 'Santiago Lorenzo', 'narrativa', 18.90, 'Tapa blanda', 2018, 6, null,
            'Manuel se esconde en una aldea vacía después de un mal golpe y descubre que vivir con casi nada le sienta de maravilla. Hasta que llegan los vecinos de fin de semana.'],
        ['patria', 'Patria', 'Fernando Aramburu', 'narrativa', 22.90, 'Tapa blanda', 2016, 4, null,
            'Dos familias de un pueblo guipuzcoano, amigas durante décadas, separadas por un asesinato. Una novela sobre la culpa, el silencio y lo que cuesta pedir perdón.'],
        ['la-ridicula-idea-de-no-volver-a-verte', 'La ridícula idea de no volver a verte', 'Rosa Montero', 'narrativa', 19.90, 'Tapa blanda', 2013, 3, null,
            'A partir del diario de Marie Curie tras la muerte de su marido, Rosa Montero escribe sobre el duelo, la ciencia y su propia pérdida.'],
        ['lectura-facil', 'Lectura fácil', 'Cristina Morales', 'narrativa', 20.90, 'Tapa blanda', 2018, 2, null,
            'Cuatro mujeres con discapacidad intelectual comparten piso tutelado en Barcelona y se niegan a que nadie decida por ellas. Feroz, política y muy divertida.'],
        ['panza-de-burro', 'Panza de burro', 'Andrea Abreu', 'narrativa', 17.90, 'Tapa blanda', 2020, 5, null,
            'Un verano en un barrio del norte de Tenerife contado por una niña que quiere a su amiga Isora más de lo que sabe decir.'],

        ['el-silencio-de-la-ciudad-blanca', 'El silencio de la ciudad blanca', 'Eva García Sáenz de Urturi', 'negra', 19.90, 'Tapa blanda', 2016, 7, null,
            'Vitoria, veinte años después de unos crímenes rituales, vuelven a aparecer cadáveres en los lugares más emblemáticos de la ciudad. El inspector Unai López de Ayala, Kraken, tiene poco tiempo.'],
        ['reina-roja', 'Reina roja', 'Juan Gómez-Jurado', 'negra', 21.90, 'Tapa blanda', 2018, 8, null,
            'Antonia Scott es la persona más inteligente del mundo y no quiere volver a trabajar. Jon Gutiérrez tiene una semana para convencerla.'],
        ['ofrenda-a-la-tormenta', 'Ofrenda a la tormenta', 'Dolores Redondo', 'negra', 20.90, 'Tapa blanda', 2016, 0, null,
            'La muerte de un bebé en Elizondo lleva a la inspectora Amaia Salazar a cerrar la trilogía del Baztán entre leyendas, niebla y viejos secretos de familia.'],
        ['el-enigma-de-la-habitacion-622', 'El enigma de la habitación 622', 'Joël Dicker', 'negra', 22.90, 'Tapa blanda', 2020, 3, null,
            'Un asesinato sin resolver en un hotel de lujo de los Alpes suizos y un escritor que llega allí para descansar y acaba tirando del hilo.'],
        ['la-verdad-sobre-el-caso-harry-quebert', 'La verdad sobre el caso Harry Quebert', 'Joël Dicker', 'negra', 12.95, 'Bolsillo', 2012, 5, null,
            'El cuerpo de una chica desaparecida en 1975 aparece en el jardín de un escritor de culto. Su antiguo alumno decide demostrar que es inocente.'],

        ['el-infinito-en-un-junco', 'El infinito en un junco', 'Irene Vallejo', 'ensayo', 23.90, 'Tapa blanda', 2019, 6, null,
            'La historia del libro desde los papiros de Alejandría hasta hoy, contada como una aventura y con la cercanía de quien te la explica en la barra de un bar.'],
        ['sapiens', 'Sapiens. De animales a dioses', 'Yuval Noah Harari', 'ensayo', 24.90, 'Tapa blanda', 2011, 4, null,
            'Cómo una especie de simio sin nada especial acabó dominando el planeta: el fuego, el lenguaje, el dinero, los imperios y lo que viene después.'],
        ['pensar-rapido-pensar-despacio', 'Pensar rápido, pensar despacio', 'Daniel Kahneman', 'ensayo', 14.95, 'Bolsillo', 2011, 2, null,
            'El Nobel de Economía explica los dos sistemas con los que decidimos y por qué el rápido se equivoca tanto y con tanta seguridad.'],
        ['la-espana-vacia', 'La España vacía', 'Sergio del Molino', 'ensayo', 19.90, 'Tapa blanda', 2016, 3, null,
            'Un viaje por el interior despoblado del país y por la manera en que la ciudad lo ha mirado, lo ha olvidado y lo ha contado.'],
        ['una-breve-historia-de-casi-todo', 'Una breve historia de casi todo', 'Bill Bryson', 'ensayo', 13.95, 'Bolsillo', 2003, 0, null,
            'Del Big Bang a los átomos y los dinosaurios: la ciencia explicada por alguien que también tuvo que preguntarlo todo desde cero.'],

        ['cien-anos-de-soledad', 'Cien años de soledad', 'Gabriel García Márquez', 'clasicos', 12.95, 'Bolsillo', 1967, 9, null,
            'Siete generaciones de los Buendía en Macondo, el pueblo donde llueve durante años y nadie se sorprende de lo imposible.'],
        ['los-santos-inocentes', 'Los santos inocentes', 'Miguel Delibes', 'clasicos', 10.95, 'Bolsillo', 1981, 5, null,
            'Una familia de criados en un cortijo extremeño de los años sesenta, sus señores y el día en que alguien deja de agachar la cabeza.'],
        ['don-quijote-de-la-mancha', 'Don Quijote de la Mancha', 'Miguel de Cervantes', 'clasicos', 24.90, 'Tapa dura', 1605, 3, null,
            'Un hidalgo que ha leído demasiado sale a arreglar el mundo con su escudero. La primera novela moderna y todavía una de las más divertidas.'],
        ['poeta-en-nueva-york', 'Poeta en Nueva York', 'Federico García Lorca', 'clasicos', 11.95, 'Bolsillo', 1940, 4, null,
            'Los poemas que Lorca escribió durante su estancia en Nueva York en 1929 y 1930: la ciudad, la soledad y Harlem.'],
        ['veinte-poemas-de-amor', 'Veinte poemas de amor y una canción desesperada', 'Pablo Neruda', 'clasicos', 9.95, 'Bolsillo', 1924, 6, null,
            'El libro de poemas de amor más leído en español, escrito por un Neruda de veinte años.'],

        ['el-principito', 'El principito', 'Antoine de Saint-Exupéry', 'infantil', 9.95, 'Tapa blanda', 1943, 10, null,
            'Un aviador perdido en el desierto conoce a un niño que viene de un asteroide diminuto. Para leer a los ocho años y volver a leerlo a los cuarenta.'],
        ['manolito-gafotas', 'Manolito Gafotas', 'Elvira Lindo', 'infantil', 10.95, 'Tapa blanda', 1994, 6, null,
            'Manolito vive en Carabanchel Alto, tiene un hermano al que llama el Imbécil y un abuelo con el que comparte cama. Lo cuenta todo.'],
        ['harry-potter-y-la-piedra-filosofal', 'Harry Potter y la piedra filosofal', 'J. K. Rowling', 'infantil', 17.95, 'Tapa dura', 1997, 7, null,
            'Un niño que duerme bajo una escalera recibe una carta que le cambia la vida: es mago y le esperan en Hogwarts.'],
        ['matilda', 'Matilda', 'Roald Dahl', 'infantil', 9.95, 'Tapa blanda', 1988, 4, null,
            'Matilda lee a Dickens con cinco años, tiene unos padres horribles y una directora todavía peor. Pero también tiene un poder.'],
        ['el-monstruo-de-colores', 'El monstruo de colores', 'Anna Llenas', 'infantil', 15.90, 'Tapa dura', 2012, 5, null,
            'El monstruo se ha hecho un lío con sus emociones y una niña le ayuda a ordenarlas por colores. Para leer en voz alta desde los tres años.'],

        // Preventas de ejemplo
        ['los-asquerosos-bolsillo', 'Los asquerosos. Edición de bolsillo', 'Santiago Lorenzo', 'narrativa', 10.95, 'Bolsillo', 2018, 0, '2026-11-05',
            'La novela de Santiago Lorenzo en formato de bolsillo. Resérvala ahora y te la guardamos el día que llegue a la tienda.'],
        ['el-infinito-en-un-junco-ilustrado', 'El infinito en un junco. Edición ilustrada', 'Irene Vallejo', 'ensayo', 39.90, 'Tapa dura', 2019, 0, '2026-11-19',
            'Edición ilustrada del ensayo de Irene Vallejo. Resérvala ahora y te la guardamos el día que llegue a la tienda.'],
        ['reina-roja-especial', 'Reina roja. Edición especial', 'Juan Gómez-Jurado', 'negra', 24.90, 'Tapa dura', 2018, 0, '2026-12-03',
            'Edición especial de la primera novela de Antonia Scott. Resérvala ahora y te la guardamos el día que llegue a la tienda.'],
    ];
}

/* Editorial de la edición en venta (dato público). Sin entrada = no se muestra. Revísalo con tu distribuidora. */
const EDITORIALES = [
    'los-asquerosos' => 'Blackie Books', 'patria' => 'Tusquets', 'la-ridicula-idea-de-no-volver-a-verte' => 'Seix Barral',
    'lectura-facil' => 'Anagrama', 'panza-de-burro' => 'Barrett', 'el-silencio-de-la-ciudad-blanca' => 'Planeta',
    'reina-roja' => 'Ediciones B', 'ofrenda-a-la-tormenta' => 'Destino', 'el-enigma-de-la-habitacion-622' => 'Alfaguara',
    'el-infinito-en-un-junco' => 'Siruela', 'sapiens' => 'Debate', 'pensar-rapido-pensar-despacio' => 'Debolsillo',
    'la-espana-vacia' => 'Turner', 'cien-anos-de-soledad' => 'Debolsillo', 'manolito-gafotas' => 'Seix Barral',
    'harry-potter-y-la-piedra-filosofal' => 'Salamandra', 'el-monstruo-de-colores' => 'Flamboyant',
    'los-asquerosos-bolsillo' => 'Blackie Books', 'el-infinito-en-un-junco-ilustrado' => 'Siruela', 'reina-roja-especial' => 'Ediciones B',
];

function bk_seed(PDO $db): void
{
    $st = $db->prepare('INSERT INTO books (slug, titulo, autor, editorial, coleccion, precio_cent, formato, anio, sinopsis, stock, salida, orden)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    // Orden «recomendados»: intercala colecciones para que el catálogo completo no sea un bloque de un solo color
    $pos = [];
    $cols = array_keys(COLECCIONES);
    foreach (bk_seed_books() as $b) {
        [$slug, $titulo, $autor, $col, $precio, $formato, $anio, $stock, $salida, $sinopsis] = $b;
        $n = $pos[$col] = ($pos[$col] ?? -1) + 1;
        $orden = $n * 10 + array_search($col, $cols, true) + ($salida ? 1000 : 0);
        $st->execute([$slug, $titulo, $autor, EDITORIALES[$slug] ?? null, $col, (int) round($precio * 100), $formato, $anio, $sinopsis, $stock, $salida, $orden]);
    }
}
