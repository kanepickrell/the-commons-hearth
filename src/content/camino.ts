// src/content/camino.ts
// The corridor: El Camino Real de los Tejas, read as a string of stages, and
// the village plan hung on it.
//
// ⚠️ PLANNING DATA, NOT SURVEY DATA. Every coordinate below is the centre of
// the town or the published location of the site, good to a few hundred
// metres — enough to draw a corridor and argue about which towns to target,
// nowhere near enough to plan a walking route. Before anyone walks this,
// replace each `at` with a GPS point taken at the door of the church or the
// gate of the site, and replace `milesToNext` with measured road miles in
// walking mode rather than the segment estimates these came from.
//
// The distances here are the chapter's own first pass: road miles by
// segment, not leg by leg, so `milesToNext` on an individual stop is an
// apportioned estimate and the SEGMENT totals are the figure to trust.

import type { Bilingual } from '../lib/types';

export type Stage = 'louisiana' | 'missions' | 'middle' | 'milam' | 'missions-sa';

export type Stop = {
  n: number;
  name: string;
  /** Town, for the list and the popup. */
  town: string;
  /** As given, so it can be pasted straight into a maps search. */
  address: string;
  /** [lat, lng] — approximate, see the warning above. */
  at: [number, number];
  stage: Stage;
  /** Why this stop is on the road at all. */
  note?: Bilingual;
  /** A place the chapter would want to plant, not just pass through. */
  anchorCandidate?: boolean;
};

export const STAGES: {
  key: Stage;
  name: Bilingual;
  /** Road miles across the whole stage, from the first pass. */
  miles: number;
  token: 'rojo' | 'ocre' | 'azul' | 'mesquite' | 'piedra';
  summary: Bilingual;
}[] = [
  {
    key: 'louisiana',
    name: { en: 'Louisiana', es: 'Luisiana' },
    miles: 90,
    token: 'rojo',
    summary: {
      en: 'Basilica to the Sabine River country. The old Spanish capital sits in the middle of it.',
      es: 'De la basílica al país del río Sabina. La antigua capital española está en medio.',
    },
  },
  {
    key: 'missions',
    name: { en: 'The East Texas missions', es: 'Las misiones del este de Tejas' },
    miles: 77,
    token: 'ocre',
    summary: {
      en: 'Four stops within a day of each other, and the only stretch already walkable as it stands.',
      es: 'Cuatro paradas a menos de un día entre sí, y el único tramo ya transitable tal como está.',
    },
  },
  {
    key: 'middle',
    name: { en: 'The empty middle', es: 'El medio vacío' },
    miles: 132,
    token: 'mesquite',
    summary: {
      en: 'Crockett to Bryan is 85 miles with no parish stop. This is the gap, and the best case for the first anchor village.',
      es: 'De Crockett a Bryan hay 85 millas sin parroquia. Este es el hueco, y el mejor caso para la primera aldea ancla.',
    },
  },
  {
    key: 'milam',
    name: { en: 'Milam County to the Hill Country', es: 'Del condado de Milam a las colinas' },
    miles: 152,
    token: 'azul',
    summary: {
      en: 'Rancheria Grande and the San Xavier sites, then the fast-growing edge of the Hill Country.',
      es: 'La Ranchería Grande y los sitios de San Xavier, y luego el borde de las colinas, que crece rápido.',
    },
  },
  {
    key: 'missions-sa',
    name: { en: 'San Antonio', es: 'San Antonio' },
    miles: 41,
    token: 'piedra',
    summary: {
      en: 'The cathedral and the four missions, ending at Espada, where this joins the official Camino.',
      es: 'La catedral y las cuatro misiones, terminando en Espada, donde esto se une al Camino oficial.',
    },
  },
];

export const STOPS: Stop[] = [
  {
    n: 1, stage: 'louisiana', at: [31.7607, -93.0863],
    name: 'Minor Basilica of the Immaculate Conception', town: 'Natchitoches, LA',
    address: '145 Church St, Natchitoches, LA 71457',
    note: { en: 'Start and blessing.', es: 'Inicio y bendición.' },
  },
  {
    n: 2, stage: 'louisiana', at: [31.7633, -93.4254],
    name: 'Los Adaes State Historic Site', town: 'Robeline, LA',
    address: '6354 LA-485, Robeline, LA 71469',
    note: { en: 'The old capital of Spanish Texas.', es: 'La antigua capital de la Tejas española.' },
  },
  {
    n: 3, stage: 'louisiana', at: [31.6315, -93.6438],
    name: 'St. Joseph Catholic Church', town: 'Zwolle, LA',
    address: '307 Hammond St, Zwolle, LA 71486',
    note: {
      en: 'Spanish-Catholic roots running back to the Los Adaes settlers. Six generations baptized here.',
      es: 'Raíces hispano-católicas que llegan hasta los pobladores de Los Adaes. Seis generaciones bautizadas aquí.',
    },
  },
  {
    n: 4, stage: 'missions', at: [31.5207, -94.1130],
    name: 'Mission Dolores State Historic Site', town: 'San Augustine, TX',
    address: '701 S Broadway St, San Augustine, TX 75972',
    note: { en: 'First Texas stop.', es: 'Primera parada en Tejas.' },
  },
  {
    n: 5, stage: 'missions', at: [31.4966, -94.3516],
    name: 'Chireno', town: 'Chireno, TX', address: 'Chireno, TX 75937',
  },
  {
    n: 6, stage: 'missions', at: [31.6035, -94.6555],
    name: 'Sacred Heart Catholic Church', town: 'Nacogdoches, TX',
    address: '2508 Appleby Sand Rd, Nacogdoches, TX 75965',
  },
  {
    n: 7, stage: 'missions', at: [31.6516, -95.0683],
    name: 'Venerable Antonio Margil Catholic Mission', town: 'Alto, TX',
    address: '498 The Kings Hwy, Alto, TX 75925',
    note: {
      en: 'The address is literally The Kings Hwy, and the mission is named for the Franciscan behind the East Texas missions. The old road is still in the street names.',
      es: 'La dirección es literalmente The Kings Hwy, y la misión lleva el nombre del franciscano detrás de las misiones del este de Tejas. El camino viejo sigue en los nombres de las calles.',
    },
  },
  {
    n: 8, stage: 'missions', at: [31.5466, -95.2225],
    name: 'Mission Tejas State Park', town: 'Grapeland, TX',
    address: '19343 State Hwy 21 E, Grapeland, TX 75844',
    note: { en: 'A walkable trail segment.', es: 'Un tramo de sendero transitable a pie.' },
  },
  {
    n: 9, stage: 'middle', at: [31.3185, -95.4569],
    name: 'St. Francis of the Tejas', town: 'Crockett, TX',
    address: '609 N 4th St, Crockett, TX 75835',
    anchorCandidate: true,
    note: {
      en: 'Where the empty middle starts. 85 miles to the next parish.',
      es: 'Donde empieza el medio vacío. 85 millas hasta la próxima parroquia.',
    },
  },
  {
    n: 10, stage: 'middle', at: [30.6744, -96.3699],
    name: 'St. Joseph Catholic Church', town: 'Bryan, TX',
    address: '507 E 26th St, Bryan, TX 77803',
    note: {
      en: 'Czech Catholic farm country begins: kolaches, polkas, old parish culture.',
      es: 'Empieza el campo católico checo: kolaches, polkas, cultura parroquial antigua.',
    },
  },
  {
    n: 11, stage: 'middle', at: [30.5299, -96.6939],
    name: 'St. Mary Our Lady of Lourdes', town: 'Caldwell, TX',
    address: '500 W Old San Antonio Rd, Caldwell, TX 77836',
    anchorCandidate: true,
    note: {
      en: 'The church address is Old San Antonio Rd. The road named itself.',
      es: 'La dirección de la iglesia es Old San Antonio Rd. El camino se nombró solo.',
    },
  },
  {
    n: 12, stage: 'milam', at: [30.7549, -96.8305],
    name: 'Walk the Rancheria Grande', town: 'Gause, TX',
    address: '12374 FM 2095, Gause, TX 77857',
  },
  {
    n: 13, stage: 'milam', at: [30.6549, -97.0014],
    name: "St. Joseph's Catholic Church", town: 'Rockdale, TX',
    address: '234 San Gabriel St, Rockdale, TX 76567',
    anchorCandidate: true,
    note: {
      en: 'Milam County: the Rancheria Grande trail and the San Xavier mission sites.',
      es: 'Condado de Milam: el sendero de la Ranchería Grande y los sitios de la misión de San Xavier.',
    },
  },
  {
    n: 14, stage: 'milam', at: [30.1105, -97.3153],
    name: 'Ascension Catholic Church', town: 'Bastrop, TX',
    address: '804 Pine St, Bastrop, TX 78602',
  },
  {
    n: 15, stage: 'milam', at: [29.8833, -97.9414],
    name: 'St. John the Evangelist', town: 'San Marcos, TX',
    address: '624 E Hopkins St, San Marcos, TX 78666',
  },
  {
    n: 16, stage: 'milam', at: [29.7030, -98.1245],
    name: 'Sts. Peter and Paul', town: 'New Braunfels, TX',
    address: '386 N Castell Ave, New Braunfels, TX 78130',
  },
  {
    n: 17, stage: 'missions-sa', at: [29.4252, -98.4946],
    name: 'San Fernando Cathedral', town: 'San Antonio, TX',
    address: '115 Main Plaza, San Antonio, TX 78205',
  },
  {
    n: 18, stage: 'missions-sa', at: [29.3906, -98.4820],
    name: 'Mission Concepción', town: 'San Antonio, TX',
    address: '807 Mission Rd, San Antonio, TX 78210',
  },
  {
    n: 19, stage: 'missions-sa', at: [29.3625, -98.4807],
    name: 'Mission San José', town: 'San Antonio, TX',
    address: '6701 San Jose Dr, San Antonio, TX 78214',
  },
  {
    n: 20, stage: 'missions-sa', at: [29.3203, -98.4553],
    name: 'Mission Espada', town: 'San Antonio, TX',
    address: '10040 Espada Rd, San Antonio, TX 78214',
    note: {
      en: 'The end, and where this road joins the official Camino de San Antonio.',
      es: 'El final, y donde este camino se une al Camino oficial de San Antonio.',
    },
  },
];

/**
 * Where the road stops working for someone on foot.
 *
 * These are the gaps, and they are the point: a gap is exactly a place with
 * no parish, no lodging and no reason for a pilgrim to stop — which is the
 * same thing as a town with cheap land, an emptying main street and room for
 * a village. The plan and the problem are the same list.
 */
export const GAPS: {
  from: string;
  to: string;
  miles: number;
  hostsNeeded: string;
  why: Bilingual;
}[] = [
  {
    from: 'Crockett', to: 'Bryan', miles: 85, hostsNeeded: '3–4',
    why: {
      en: 'Four to five days on TX-21 with no parish stop. The longest gap on the road, and the strongest case for the first anchor village.',
      es: 'Cuatro o cinco días por la TX-21 sin parroquia. El hueco más largo del camino, y el mejor argumento para la primera aldea ancla.',
    },
  },
  {
    from: 'Rockdale', to: 'Bastrop', miles: 50, hostsNeeded: '1–2',
    why: {
      en: 'Two to three days, and the approach to the Hill Country edge where land is still within reach.',
      es: 'Dos o tres días, y la entrada al borde de las colinas donde la tierra aún está al alcance.',
    },
  },
  {
    from: 'Zwolle', to: 'San Augustine', miles: 50, hostsNeeded: '1',
    why: {
      en: 'Includes the Sabine crossing. Needs a host and a bridge route a walker can actually use.',
      es: 'Incluye el cruce del Sabina. Necesita un anfitrión y un puente que un caminante pueda usar de verdad.',
    },
  },
];

/** What an anchor village has to have before it is one. */
export const VILLAGE_CORE: Bilingual[] = [
  { en: 'A parish', es: 'Una parroquia' },
  { en: 'A small school or homeschool co-op', es: 'Una escuela pequeña o cooperativa de educación en casa' },
  { en: 'A pilgrim house', es: 'Una casa de peregrinos' },
  { en: 'A farm market and co-op', es: 'Un mercado agrícola y una cooperativa' },
  { en: 'A trades shop and apprenticeships', es: 'Un taller de oficios y aprendices' },
  { en: 'Land held in trust or shared financing', es: 'Tierra en fideicomiso o con financiamiento compartido' },
];

/** The arithmetic, stated as arithmetic so it can be argued with. */
export const SCALE: { figure: string; label: Bilingual; working: Bilingual }[] = [
  {
    figure: '~3,000',
    label: { en: 'people', es: 'personas' },
    working: { en: '20 villages × 30 families × 5', es: '20 aldeas × 30 familias × 5' },
  },
  {
    figure: '20–40k',
    label: { en: 'acres', es: 'acres' },
    working: { en: '1,000–2,000 acres a village', es: '1,000–2,000 acres por aldea' },
  },
  {
    figure: '1,000+',
    label: { en: 'children', es: 'niños' },
    working: { en: 'raised on farms, in parish schools', es: 'criados en granjas y escuelas parroquiales' },
  },
  {
    figure: '20',
    label: { en: 'parishes', es: 'parroquias' },
    working: { en: 'shrinking today, growing instead', es: 'hoy encogiéndose, creciendo en cambio' },
  },
  {
    figure: '$7.5M',
    label: { en: 'pilgrim spending a year', es: 'gasto de peregrinos al año' },
    working: { en: '5,000 pilgrims × 30 days × $50', es: '5,000 peregrinos × 30 días × $50' },
  },
];

export const PHASES: { years: string; title: Bilingual; body: Bilingual }[] = [
  {
    years: '0–2',
    title: { en: 'Walk it', es: 'Caminarlo' },
    body: {
      en: 'Credential the route, organise the first walk, find a parish host at each stage, and start the conversations with town leaders.',
      es: 'Acreditar la ruta, organizar la primera caminata, encontrar una parroquia anfitriona en cada etapa, y empezar las conversaciones con los líderes de los pueblos.',
    },
  },
  {
    years: '2–5',
    title: { en: 'The first village', es: 'La primera aldea' },
    body: {
      en: 'One anchor village, most likely in the empty middle nearest this chapter, with a pilot pilgrim house.',
      es: 'Una aldea ancla, probablemente en el medio vacío más cercano a este capítulo, con una casa de peregrinos piloto.',
    },
  },
  {
    years: '5–15',
    title: { en: 'A corridor', es: 'Un corredor' },
    body: {
      en: 'Three to five anchor villages, a full stage network, and formal recognition alongside the Camino de San Antonio.',
      es: 'De tres a cinco aldeas ancla, una red completa de etapas, y reconocimiento formal junto al Camino de San Antonio.',
    },
  },
];

/** Concrete enough to put in front of a bishop, a donor or a town council. */
export const MEASURES: Bilingual[] = [
  { en: 'Families resettled', es: 'Familias reasentadas' },
  { en: 'Acres under good management', es: 'Acres bien manejados' },
  { en: 'Local businesses formed', es: 'Negocios locales formados' },
  { en: 'Parish attendance and baptisms', es: 'Asistencia a Misa y bautizos' },
  { en: 'School enrollment', es: 'Matrícula escolar' },
  { en: 'Pilgrims a year', es: 'Peregrinos al año' },
];

/** Totals, kept here so the page and the map can't disagree about them. */
export const TOTAL_MILES = STAGES.reduce((s, x) => s + x.miles, 0);
export const WALK_DAYS_AT_15 = Math.round(TOTAL_MILES / 15);
export const WALK_DAYS_AT_20 = Math.round(TOTAL_MILES / 20);

// ---------------------------------------------------------------------------
// The thesis. Almanzo's father, in Farmer Boy, tells his son on Independence
// Day that it was not warriors and frontiersmen who built the country but the
// farmers who stayed put and took care of their own.
// ---------------------------------------------------------------------------
export const THESIS: Bilingual = {
  en: 'El Camino Real was opened by soldiers and friars passing through. The Way is restored by farmers who stay.',
  es: 'El Camino Real lo abrieron soldados y frailes de paso. El Camino lo restauran los labradores que se quedan.',
};

// ---------------------------------------------------------------------------
// The charter.
//
// Written as REQUIREMENTS rather than as an essay, because the point of this
// list is to be checked against a real town. Each one is a thing a village
// either does or does not do, and most carry a test that settles it. They are
// numbered so they can be argued with by number.
//
// Provenance: principles 1-7 come from Craig's talk on localism and
// stability, by way of the chapter's notes on it; principle 0 is the
// chapter's own, and comes first because every other requirement assumes it.
// ---------------------------------------------------------------------------

export type Requirement = {
  /** Stable handle, so a requirement can be referred to by number. */
  id: string;
  text: Bilingual;
  /** How you would settle whether a village actually meets it. */
  test?: Bilingual;
};

export type Principle = {
  key: string;
  n: number;
  name: Bilingual;
  claim: Bilingual;
  requirements: Requirement[];
};

export const PRINCIPLES: Principle[] = [
  {
    key: 'parish',
    n: 0,
    name: { en: 'The parish is the heart', es: 'La parroquia es el corazón' },
    claim: {
      en: 'Every body needs a heart. A village is not a settlement with a church in it; it is a parish with a village grown around it.',
      es: 'Todo cuerpo necesita un corazón. Una aldea no es un asentamiento con una iglesia dentro; es una parroquia con una aldea crecida a su alrededor.',
    },
    requirements: [
      {
        id: 'P1',
        text: {
          en: 'Form around a parish that already exists. Found no village where there is no church to join.',
          es: 'Formarse en torno a una parroquia que ya existe. No fundar ninguna aldea donde no haya iglesia a la cual unirse.',
        },
        test: {
          en: 'Name the parish and its pastor before buying an acre.',
          es: 'Nombrar la parroquia y a su párroco antes de comprar un acre.',
        },
      },
      {
        id: 'P2',
        text: {
          en: 'Put the village core inside a walk of the church door.',
          es: 'Poner el centro de la aldea a una caminata de la puerta de la iglesia.',
        },
        test: {
          en: 'The furthest house in the core is a walk to Mass, not a drive.',
          es: 'La casa más lejana del centro llega a Misa a pie, no en coche.',
        },
      },
      {
        id: 'P3',
        text: {
          en: 'Keep the parish calendar, not a second one beside it.',
          es: 'Guardar el calendario de la parroquia, y no un segundo calendario al lado.',
        },
      },
    ],
  },
  {
    key: 'hospitality',
    n: 1,
    name: { en: 'Hospitality is the mission', es: 'La hospitalidad es la misión' },
    claim: {
      en: 'The layman\u2019s job is not bridges but walls, so that there are thresholds to welcome people through.',
      es: 'El trabajo del laico no son los puentes sino los muros, para que haya umbrales por donde dar la bienvenida.',
    },
    requirements: [
      {
        id: 'H1',
        text: {
          en: 'Give the village a clear edge and a front door: a pilgrim house near the church, and a gate or marker a walker can see.',
          es: 'Dar a la aldea un borde claro y una puerta: una casa de peregrinos junto a la iglesia, y una entrada o señal que un caminante pueda ver.',
        },
      },
      {
        id: 'H2',
        text: {
          en: 'Meet every pilgrim with the same rite: a stamp, a blessing, and a meal.',
          es: 'Recibir a cada peregrino con el mismo rito: un sello, una bendición, y una comida.',
        },
      },
      {
        id: 'H3',
        text: {
          en: 'Feed pilgrims at family tables, not in a hall. Rotate the host families so the welcome comes from households rather than from staff.',
          es: 'Dar de comer a los peregrinos en mesas de familia, no en un salón. Rotar las familias anfitrionas para que la bienvenida venga de los hogares y no del personal.',
        },
        test: {
          en: 'No household hosts twice before every household has hosted once.',
          es: 'Ningún hogar recibe dos veces antes de que todos hayan recibido una.',
        },
      },
      {
        id: 'H4',
        text: {
          en: 'Keep the welcome itself a gift. Sell bread, beds and crafts around it; never sell the welcome.',
          es: 'Mantener la bienvenida como un don. Vender pan, camas y artesanía alrededor; nunca vender la bienvenida.',
        },
        test: {
          en: 'A pilgrim with no money is fed and housed the same as one with money.',
          es: 'Un peregrino sin dinero come y duerme igual que uno con dinero.',
        },
      },
    ],
  },
  {
    key: 'witness',
    n: 2,
    name: { en: 'Witness, not programs', es: 'Testimonio, no programas' },
    claim: {
      en: 'People do not convert to an argument. They convert to a community they want to belong to.',
      es: 'La gente no se convierte a un argumento. Se convierte a una comunidad a la que quiere pertenecer.',
    },
    requirements: [
      {
        id: 'W1',
        text: {
          en: 'Run no evangelisation programme. Vespers, a family dinner, a milking and a feast day are the witness.',
          es: 'No montar ningún programa de evangelización. Las vísperas, una cena familiar, un ordeño y una fiesta son el testimonio.',
        },
        test: {
          en: 'Nothing on the village calendar exists only because visitors are coming.',
          es: 'Nada en el calendario de la aldea existe sólo porque vienen visitantes.',
        },
      },
      {
        id: 'W2',
        text: {
          en: 'Time the road\u2019s calendar so pilgrims arrive at the good moments: harvest, saints\u2019 days, weddings.',
          es: 'Ajustar el calendario del camino para que los peregrinos lleguen en los buenos momentos: la cosecha, las fiestas de los santos, las bodas.',
        },
      },
    ],
  },
  {
    key: 'stability',
    n: 3,
    name: { en: 'Design for the kids who stay', es: 'Diseñar para los hijos que se quedan' },
    claim: {
      en: 'Stability is the missing link. The test of a culture is whether the next generation stays.',
      es: 'La estabilidad es el eslabón que falta. La prueba de una cultura es si se queda la siguiente generación.',
    },
    requirements: [
      {
        id: 'S1',
        text: {
          en: 'Hold land for inheritance, not resale. Use trusts or covenants that make flipping hard.',
          es: 'Tener la tierra para heredarla, no para revenderla. Usar fideicomisos o convenios que dificulten la reventa.',
        },
      },
      {
        id: 'S2',
        text: {
          en: 'Build work a grown child can step into: trades, apprenticeships, family businesses with room to add a son or daughter.',
          es: 'Crear trabajo donde un hijo ya crecido pueda entrar: oficios, aprendizajes, negocios familiares con sitio para un hijo o una hija.',
        },
      },
      {
        id: 'S3',
        text: {
          en: 'Keep starter housing available for young couples in the village.',
          es: 'Mantener vivienda inicial disponible para parejas jóvenes en la aldea.',
        },
      },
      {
        id: 'S4',
        text: {
          en: 'Measure the share of village children who settle in the corridor as adults. This is the number that decides whether any of the rest worked.',
          es: 'Medir cuántos hijos de la aldea se establecen en el corredor de adultos. Este es el número que decide si lo demás sirvió.',
        },
      },
    ],
  },
  {
    key: 'reclaim',
    n: 4,
    name: { en: 'Take back what was industrialised', es: 'Recuperar lo que se industrializó' },
    claim: {
      en: 'The test of localism: take a human need that has been turned into an industry, and do it yourselves.',
      es: 'La prueba del localismo: toma una necesidad humana que se volvió industria, y háganla ustedes mismos.',
    },
    requirements: [
      {
        id: 'R1',
        text: {
          en: 'Marry your own: a potluck, a pig, local music, the whole village.',
          es: 'Casar a los suyos: una comida compartida, un cerdo, música local, la aldea entera.',
        },
      },
      {
        id: 'R2',
        text: {
          en: 'Bury your own: a village cemetery, coffins from the woodshop, the vigil kept by the community.',
          es: 'Enterrar a los suyos: un cementerio de la aldea, ataúdes del taller, el velorio guardado por la comunidad.',
        },
      },
      {
        id: 'R3',
        text: {
          en: 'Keep the old at home and in the village, not sent away.',
          es: 'Cuidar a los ancianos en casa y en la aldea, sin mandarlos lejos.',
        },
      },
      {
        id: 'R4',
        text: {
          en: 'Name three needs the village has taken back from an industry, and add one each year.',
          es: 'Nombrar tres necesidades que la aldea le haya quitado a una industria, y añadir una cada año.',
        },
      },
    ],
  },
  {
    key: 'reinhabit',
    n: 5,
    name: { en: 'Reinhabit, don\u2019t build new', es: 'Rehabitar, no construir de nuevo' },
    claim: {
      en: 'The corridor towns already have the bones. Moving into them and fixing them together is cheaper, and it is the opposite of a development arriving.',
      es: 'Los pueblos del corredor ya tienen los huesos. Mudarse a ellos y arreglarlos juntos es más barato, y es lo contrario de un desarrollo que llega.',
    },
    requirements: [
      {
        id: 'B1',
        text: {
          en: 'Buy and restore buildings that are already standing on the existing main street. Build nothing new beside the town.',
          es: 'Comprar y restaurar edificios que ya están en pie en la calle principal. No construir nada nuevo al lado del pueblo.',
        },
        test: {
          en: 'Count the village buildings that stood before the chapter arrived. It should be most of them.',
          es: 'Contar los edificios de la aldea que ya estaban antes de que llegara el capítulo. Deberían ser la mayoría.',
        },
      },
      {
        id: 'B2',
        text: {
          en: 'Restore them together. The shared work is what binds the men, more than shared piety does.',
          es: 'Restaurarlos juntos. El trabajo compartido es lo que une a los hombres, más que la piedad compartida.',
        },
      },
    ],
  },
  {
    key: 'walkable',
    n: 6,
    name: { en: 'Walkable by design', es: 'Caminable por diseño' },
    claim: {
      en: 'Wherever work, neighbour and worship are within walking distance, you have already arrived at the village.',
      es: 'Donde el trabajo, el vecino y el culto están a distancia de caminata, ya se ha llegado a la aldea.',
    },
    requirements: [
      {
        id: 'K1',
        text: {
          en: 'Keep church, school, shops, pilgrim house and homes close together, with the farms around the edge.',
          es: 'Mantener juntos la iglesia, la escuela, las tiendas, la casa de peregrinos y las casas, con las granjas alrededor.',
        },
      },
      {
        id: 'K2',
        text: {
          en: 'Lay the village out so a child standing in the middle of it can see everything they love.',
          es: 'Trazar la aldea para que un niño parado en medio pueda ver todo lo que ama.',
        },
        test: {
          en: 'From the centre: the church, their house, and where their parents work.',
          es: 'Desde el centro: la iglesia, su casa, y donde trabajan sus padres.',
        },
      },
    ],
  },
  {
    key: 'mass',
    n: 7,
    name: { en: 'Critical mass protects the place', es: 'La masa crítica protege el lugar' },
    claim: {
      en: 'Enough rooted families gain economic and civic weight, and a place with weight can refuse what is done to places without it.',
      es: 'Suficientes familias arraigadas ganan peso económico y civil, y un lugar con peso puede rechazar lo que se le hace a los lugares sin él.',
    },
    requirements: [
      {
        id: 'M1',
        text: {
          en: 'Stand up one anchor employer paying a family wage: a dairy, a meat processor, a woodshop.',
          es: 'Levantar un empleador ancla que pague un salario familiar: una lechería, un rastro, un taller de madera.',
        },
        test: {
          en: 'A family can live on one wage earned inside the village.',
          es: 'Una familia puede vivir de un solo salario ganado dentro de la aldea.',
        },
      },
      {
        id: 'M2',
        text: {
          en: 'Put men on the town council and the county board, so that outside capital cannot extract from the place under the name of development.',
          es: 'Poner hombres en el ayuntamiento y en la comisión del condado, para que el capital de fuera no pueda extraer del lugar bajo el nombre de desarrollo.',
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// What is already on the ground.
//
// Researched rather than assumed, and it changes the plan: the road is
// already a National Historic Trail, the southern end already has a working
// pilgrim credential, and the certification programme already offers the
// exact trade a village would want to make. Phase 0 is therefore not
// "invent a route" but "join three things that exist".
// ---------------------------------------------------------------------------
export const GROUND: {
  title: Bilingual;
  body: Bilingual;
  soWhat: Bilingual;
  href: string;
  label: string;
}[] = [
  {
    title: {
      en: 'The road is already a National Historic Trail',
      es: 'El camino ya es un Sendero Histórico Nacional',
    },
    body: {
      en: 'The National Park Service designated El Camino Real de los Tejas a National Historic Trail in 2004. It runs from the Rio Grande to Natchitoches, and its northern branch passes through San Marcos, New Braunfels and San Antonio.',
      es: 'El Servicio de Parques Nacionales designó El Camino Real de los Tejas como Sendero Histórico Nacional en 2004. Va del río Grande a Natchitoches, y su ramal norte pasa por San Marcos, New Braunfels y San Antonio.',
    },
    soWhat: {
      en: 'The corridor does not have to be invented or argued for. It already has a federal designation, a map, and an administering office.',
      es: 'El corredor no hay que inventarlo ni defenderlo. Ya tiene designación federal, mapa, y una oficina que lo administra.',
    },
    href: 'https://www.nps.gov/elte/index.htm',
    label: 'nps.gov/elte',
  },
  {
    title: {
      en: 'Certification trades public access for help',
      es: 'La certificación cambia acceso público por ayuda',
    },
    body: {
      en: 'A landowner whose property carries a piece of the historic trail can become a certified trail partner: the Park Service evaluates the site, and in exchange for at least occasional public access the partner gets technical assistance and access to project funding. More than ninety high-potential segments, over a hundred miles in all, have been identified across Texas and Louisiana.',
      es: 'Un propietario cuyo terreno lleva un tramo del sendero histórico puede volverse socio certificado: el Servicio de Parques evalúa el sitio, y a cambio de al menos acceso público ocasional el socio recibe asistencia técnica y acceso a fondos. Se han identificado más de noventa tramos de alto potencial, más de cien millas en total, en Tejas y Luisiana.',
    },
    soWhat: {
      en: 'This is the trade a village already wants to make. Hospitality to strangers is the mission, so "at least occasional public access" costs the village nothing it was not going to give away. Land with a certified segment on it is worth more to this project than land without.',
      es: 'Es exactamente el trato que una aldea ya quiere hacer. La hospitalidad al forastero es la misión, así que "acceso público ocasional" no le cuesta a la aldea nada que no fuera a dar igual. Tierra con un tramo certificado vale más para este proyecto que tierra sin él.',
    },
    href: 'https://www.nps.gov/orgs/1453/certification.htm',
    label: 'Trail certification, NPS',
  },
  {
    title: {
      en: 'The southern end already has a credential',
      es: 'El extremo sur ya tiene credencial',
    },
    body: {
      en: 'El Camino de San Antonio Missions is a working pilgrimage: a passport, stamps at each mission and the cathedral, and a certificate at the end. Walking it earns thirty kilometres of credit toward the Camino Inglés to Santiago. The pilgrim centre carries the name of Padre Margil.',
      es: 'El Camino de San Antonio Missions ya funciona: un pasaporte, sellos en cada misión y en la catedral, y un certificado al final. Caminarlo da treinta kilómetros de crédito para el Camino Inglés a Santiago. El centro de peregrinos lleva el nombre del padre Margil.',
    },
    soWhat: {
      en: 'Do not build a second credential. Extend this one north, stamp by stamp. And note the thread: the Franciscan the San Antonio pilgrim centre is named for is the same Margil the mission at Alto, stop 7, is named for. The two ends of this road are already named after the same man.',
      es: 'No construir una segunda credencial. Extender esta hacia el norte, sello por sello. Y nótese el hilo: el franciscano que da nombre al centro de peregrinos de San Antonio es el mismo Margil de la misión de Alto, la parada 7. Los dos extremos de este camino ya llevan el nombre del mismo hombre.',
    },
    href: 'https://caminosanantonio.org/',
    label: 'caminosanantonio.org',
  },
  {
    title: {
      en: 'The walking season is September to June',
      es: 'La temporada de caminar es de septiembre a junio',
    },
    body: {
      en: 'The San Antonio route is walked from late September through early June. Texas summers are too hot and much of the road has no shade.',
      es: 'La ruta de San Antonio se camina de fines de septiembre a principios de junio. Los veranos de Tejas son demasiado calurosos y buena parte del camino no tiene sombra.',
    },
    soWhat: {
      en: 'An eight-month season, which sets the pilgrim economy a village can count on and leaves the summer for the harvest. Plant shade along the road now; it takes as long to grow as the villages do.',
      es: 'Una temporada de ocho meses, que fija la economía de peregrinos con la que una aldea puede contar y deja el verano para la cosecha. Sembrar sombra ahora: tarda en crecer lo mismo que las aldeas.',
    },
    href: 'https://caminosanantonio.org/plan-your-pilgrimage/self-guided/',
    label: 'Plan your pilgrimage',
  },
];

// ---------------------------------------------------------------------------
// The impact claims, checked.
//
// Written as an AUDIT rather than as a case, because every one of these will
// be read by someone who can check it, and a figure that does not survive
// contact with a donor costs more than it earned. Each claim carries a
// verdict and the source that settles it.
//
// Two of the five did not survive. That is the point of writing it this way.
// ---------------------------------------------------------------------------

export type Verdict = 'holds' | 'revised' | 'unverified';

export type Claim = {
  id: string;
  claim: Bilingual;
  verdict: Verdict;
  finding: Bilingual;
  /** Only on a 'revised' claim: the figure that replaces it. */
  revised?: Bilingual;
  source?: { href: string; label: string };
};

export const VERDICT_LABEL: Record<Verdict, Bilingual> = {
  holds: { en: 'Holds', es: 'Se sostiene' },
  revised: { en: 'Revised', es: 'Corregido' },
  unverified: { en: 'Unverified', es: 'Sin verificar' },
};

export const CLAIMS: Claim[] = [
  {
    id: 'C1',
    claim: {
      en: 'Pilgrims spend about $50 a day.',
      es: 'Los peregrinos gastan unos $50 al día.',
    },
    verdict: 'holds',
    finding: {
      en: 'Camino de Santiago pilgrims budget €30–50 a day, and honest 2026 pricing puts it at €50–65. Pilgrims spend less per day than ordinary tourists because they sleep in hostels and parish halls, but the spending creates more local jobs per euro than any other kind of holiday. $50 is a fair figure, and slightly conservative.',
      es: 'Los peregrinos del Camino de Santiago presupuestan €30–50 al día, y con precios honestos de 2026 son €50–65. Gastan menos por día que un turista normal porque duermen en albergues y salones parroquiales, pero ese gasto crea más empleo local por euro que cualquier otro tipo de viaje. $50 es una cifra justa, incluso conservadora.',
    },
    source: { href: 'https://stingynomads.com/camino-de-santiago-cost/', label: 'Camino cost, 2026' },
  },
  {
    id: 'C2',
    claim: {
      en: '5,000 pilgrims × 30 days × $50 = $7.5M a year into small-town economies.',
      es: '5,000 peregrinos × 30 días × $50 = $7.5M al año en la economía de los pueblos.',
    },
    verdict: 'revised',
    finding: {
      en: 'Almost nobody walks a whole Camino. Only about 6% of pilgrims walk the full route from Saint-Jean, while 30.5% start at Sarria — the last 100 km, about five days — and 51% start at one of the four points that sit exactly at the 100 km minimum for a Compostela. Multiplying every pilgrim by the full 30 days overstates the spend three or four times over.',
      es: 'Casi nadie camina un Camino entero. Sólo un 6% de los peregrinos hace la ruta completa desde Saint-Jean, mientras que el 30.5% empieza en Sarria — los últimos 100 km, unos cinco días — y el 51% empieza en uno de los cuatro puntos que están justo en el mínimo de 100 km para la Compostela. Multiplicar cada peregrino por 30 días exagera el gasto tres o cuatro veces.',
    },
    revised: {
      en: 'Plan in pilgrim-days, not pilgrims. Applying the Camino’s own distribution gives about 10 days walked per pilgrim on average, so 5,000 pilgrims is roughly 50,000 pilgrim-days and about $2.5M a year, not $7.5M. $7.5M needs 150,000 pilgrim-days, which is around 15,000 pilgrims at the same mix. The village plans against beds filled per night, which is what pilgrim-days actually measures.',
      es: 'Planear en días-peregrino, no en peregrinos. Con la distribución del propio Camino salen unos 10 días caminados por peregrino, así que 5,000 peregrinos son unos 50,000 días-peregrino y unos $2.5M al año, no $7.5M. Llegar a $7.5M pide 150,000 días-peregrino, cerca de 15,000 peregrinos con la misma mezcla. La aldea planea sobre camas llenas por noche, que es lo que mide el día-peregrino.',
    },
    source: { href: 'https://americanpilgrims.org/statistics/', label: 'Camino statistics' },
  },
  {
    id: 'C3',
    claim: {
      en: '20,000–40,000 acres under regenerative management.',
      es: '20,000–40,000 acres bajo manejo regenerativo.',
    },
    verdict: 'revised',
    finding: {
      en: 'The acreage is reachable; the price of it is the thing the plan has not costed. Texas rural land averaged $4,827 an acre statewide in early 2025, and the Gulf Coast–Brazos Bottom region — which covers the Bryan and Caldwell stretch of this road — is the most expensive rural market in the state at $11,369. At those rates 20,000–40,000 acres is roughly $96M at the statewide average and $227M–$455M through the Brazos Bottom.',
      es: 'La superficie es alcanzable; lo que el plan no ha costeado es su precio. La tierra rural de Tejas promedió $4,827 por acre en todo el estado a principios de 2025, y la región Gulf Coast–Brazos Bottom — que cubre el tramo de Bryan y Caldwell — es el mercado rural más caro del estado, a $11,369. A esos precios, 20,000–40,000 acres son unos $96M al promedio estatal y $227M–$455M por el Brazos Bottom.',
    },
    revised: {
      en: 'This is not a land-buying programme at that scale, and should stop describing itself as one. The acres come mostly from families who already own land joining the corridor, from inheritance held rather than sold, and from the cheaper eastern counties — Houston County and east toward Louisiana — rather than the Brazos Bottom. Price every village against its own county before any acreage goes in a pitch.',
      es: 'A esa escala esto no es un programa de compra de tierra, y debería dejar de describirse así. Los acres vienen sobre todo de familias que ya tienen tierra y se suman al corredor, de herencias que se conservan en vez de venderse, y de los condados del este, más baratos — el condado de Houston y hacia Luisiana — antes que del Brazos Bottom. Costear cada aldea contra su propio condado antes de poner superficie en una propuesta.',
    },
    source: {
      href: 'https://trerc.tamu.edu/reports/texas-rural-land-markets-first-quarter-2025/',
      label: 'Texas Rural Land Markets, Texas A&M',
    },
  },
  {
    id: 'C4',
    claim: {
      en: 'Small towns on the road would see a real economic lift.',
      es: 'Los pueblos del camino verían una mejora económica real.',
    },
    verdict: 'holds',
    finding: {
      en: 'This is the best-evidenced claim on the page. Research from the University of Santiago found that some small municipalities on the Camino raised GDP by as much as 21% from pilgrims alone, and the effect lands hardest in rural places, where there was least to begin with. A corridor of small Texas and Louisiana towns is the same shape of place.',
      es: 'Es la afirmación mejor respaldada de la página. Un estudio de la Universidad de Santiago encontró que algunos municipios pequeños del Camino subieron su PIB hasta un 21% sólo por los peregrinos, y el efecto pega más fuerte en lo rural, donde había menos para empezar. Un corredor de pueblos pequeños de Tejas y Luisiana es la misma clase de lugar.',
    },
    source: {
      href: 'https://sightmagazine.com.au/features/pilgrim-economics-camino-travellers-help-rural-spain-s-emptying-villages-survive/',
      label: 'Pilgrim economics, rural Spain',
    },
  },
  {
    id: 'C5',
    claim: {
      en: '5,000 pilgrims a year will walk this road.',
      es: '5,000 peregrinos al año caminarán este camino.',
    },
    verdict: 'unverified',
    finding: {
      en: 'Nobody publishes how many people walk the Camino de San Antonio Missions, so the one route in Texas that could calibrate this number is a blank. Everything downstream — beds, meals, how many villages the pilgrim economy can carry — rests on a figure nobody here has.',
      es: 'Nadie publica cuánta gente camina el Camino de San Antonio Missions, así que la única ruta en Tejas que podría calibrar esta cifra está en blanco. Todo lo que sigue — camas, comidas, cuántas aldeas puede sostener la economía de peregrinos — descansa en un número que aquí nadie tiene.',
    },
    revised: {
      en: 'First call to make: ask the Padre Margil Pilgrimage Center how many passports they have issued a year since 2022, and how many completed. That single answer prices the whole pilgrim economy.',
      es: 'Primera llamada que hacer: preguntar al Centro de Peregrinos Padre Margil cuántos pasaportes han emitido por año desde 2022, y cuántos se completaron. Esa sola respuesta pone precio a toda la economía de peregrinos.',
    },
    source: { href: 'https://caminosanantonio.org/', label: 'caminosanantonio.org' },
  },
];

/**
 * The arithmetic that was never in doubt, kept separate from the claims that
 * were. These follow from the assumptions rather than from the world, and the
 * assumption is printed beside each so it can be moved.
 */
export const ARITHMETIC: { figure: string; label: Bilingual; assumption: Bilingual }[] = [
  {
    figure: '3,000',
    label: { en: 'people', es: 'personas' },
    assumption: {
      en: '20 villages × 30 families × 5. The five is the load-bearing assumption: the US average household is 2.5, so this is a bet on large families and should be called that.',
      es: '20 aldeas × 30 familias × 5. El cinco es el supuesto que carga el peso: el hogar medio en EE. UU. es de 2.5, así que esto apuesta por familias grandes y hay que decirlo así.',
    },
  },
  {
    figure: '600',
    label: { en: 'households', es: 'hogares' },
    assumption: {
      en: 'The number that actually has to be recruited, one family at a time, over fifteen years. Forty a year.',
      es: 'El número que de verdad hay que reclutar, familia por familia, en quince años. Cuarenta al año.',
    },
  },
  {
    figure: '~1,800',
    label: { en: 'children', es: 'niños' },
    assumption: {
      en: 'At three children a household. The outline said 1,000+, which is the conservative end of its own arithmetic.',
      es: 'A tres hijos por hogar. El esquema decía 1,000+, que es el extremo conservador de su propia aritmética.',
    },
  },
  {
    figure: '30',
    label: { en: 'families a parish', es: 'familias por parroquia' },
    assumption: {
      en: 'Whether that turns a parish around depends entirely on how big it is now. Get the registered-household count for each of the twenty before claiming any of them grow.',
      es: 'Si eso cambia una parroquia depende por completo de cuán grande es ahora. Conseguir el número de hogares registrados de las veinte antes de afirmar que alguna crece.',
    },
  },
];
