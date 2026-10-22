// src/content/camino.ts
// The corridor: El Camino Real de los Tejas, read as a string of stages, and
// the village plan hung on it.
//
// COORDINATES are geocoded against OpenStreetMap, not estimated. Nineteen
// of the twenty-one resolved to the street address or the named site. Two carry
// fix: 'town' — Chireno and the Margil mission at Alto — and those are the
// points someone still has to stand on with a phone. Two of the old
// estimates were badly wrong and are worth remembering as a caution about
// eyeballing a map: Los Adaes was out by about nine miles and the Rancheria
// Grande by nearly six.
//
// DISTANCES are still the chapter's own first pass: road miles by segment,
// not leg by leg, so the SEGMENT totals are the figures to trust and no
// single leg should be quoted on its own.
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
  /** [lat, lng], geocoded against OpenStreetMap. See `fix`. */
  at: [number, number];
  /**
   * How good the point is. 'address' resolved to the street address or the
   * named site; 'town' only resolved to the town centroid and still needs
   * someone to stand at the door with a phone.
   */
  fix: 'address' | 'town';
  /**
   * Whether a village could anchor here at all. Requirement P1 says form
   * around a parish that already exists, so a 'site' or a 'town' is a stop
   * on the road and nothing more until a parish is there.
   */
  kind: 'parish' | 'mission' | 'site' | 'town';
  county: string;
  /** Which bishop. Four of them hold this road. */
  diocese: 'Alexandria' | 'Tyler' | 'Austin' | 'San Antonio';
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
}[] = [
  {
    key: 'louisiana',
    name: { en: 'Louisiana', es: 'Luisiana' },
    miles: 90,
    token: 'rojo',
  },
  {
    key: 'missions',
    name: { en: 'The East Texas missions', es: 'Las misiones del este de Tejas' },
    miles: 77,
    token: 'ocre',
  },
  {
    key: 'middle',
    name: { en: 'The empty middle', es: 'El medio vacío' },
    miles: 132,
    token: 'mesquite',
  },
  {
    key: 'milam',
    name: { en: 'Milam County to the Hill Country', es: 'Del condado de Milam a las colinas' },
    miles: 152,
    token: 'azul',
  },
  {
    key: 'missions-sa',
    name: { en: 'The San Antonio missions', es: 'Las misiones de San Antonio' },
    // 45 road miles from New Braunfels down past downtown to Espada, then the
    // official 13-mile Camino de San Antonio Missions walked back north to the
    // cathedral. The walker passes through the city twice on purpose: the last
    // thirteen miles are a route that is already signed and already walked.
    miles: 58,
    token: 'piedra',
  },
];

export const STOPS: Stop[] = [
  {
    n: 1, stage: 'louisiana', at: [31.7611, -93.0874], fix: 'address', kind: 'parish',
    county: 'Natchitoches Parish, LA', diocese: 'Alexandria',
    name: 'Minor Basilica of the Immaculate Conception', town: 'Natchitoches, LA',
    address: '145 Church St, Natchitoches, LA 71457',
    note: { en: 'Start and blessing.', es: 'Inicio y bendición.' },
  },
  {
    n: 2, stage: 'louisiana', at: [31.7085, -93.2932], fix: 'address', kind: 'site',
    county: 'Natchitoches Parish, LA', diocese: 'Alexandria',
    name: 'Los Adaes State Historic Site', town: 'Robeline, LA',
    address: '6354 LA-485, Robeline, LA 71469',
    note: { en: 'The old capital of Spanish Texas.', es: 'La antigua capital de la Tejas española.' },
  },
  {
    n: 3, stage: 'louisiana', at: [31.6329, -93.6491], fix: 'address', kind: 'parish',
    county: 'Sabine Parish, LA', diocese: 'Alexandria',
    name: 'St. Joseph Catholic Church', town: 'Zwolle, LA',
    address: '307 Hammond St, Zwolle, LA 71486',
    note: {
      en: 'Spanish-Catholic roots running back to the Los Adaes settlers. Six generations baptized here.',
      es: 'Raíces hispano-católicas que llegan hasta los pobladores de Los Adaes. Seis generaciones bautizadas aquí.',
    },
  },
  {
    n: 4, stage: 'missions', at: [31.5233, -94.1155], fix: 'address', kind: 'site',
    county: 'San Augustine County', diocese: 'Tyler',
    name: 'Mission Dolores State Historic Site', town: 'San Augustine, TX',
    address: '701 S Broadway St, San Augustine, TX 75972',
    note: { en: 'First Texas stop.', es: 'Primera parada en Tejas.' },
  },
  {
    n: 5, stage: 'missions', at: [31.4993, -94.3519], fix: 'town', kind: 'town',
    county: 'Nacogdoches County', diocese: 'Tyler',
    name: 'Chireno', town: 'Chireno, TX', address: 'Chireno, TX 75937',
  },
  {
    n: 6, stage: 'missions', at: [31.6247, -94.6323], fix: 'address', kind: 'parish',
    county: 'Nacogdoches County', diocese: 'Tyler',
    name: 'Sacred Heart Catholic Church', town: 'Nacogdoches, TX',
    address: '2508 Appleby Sand Rd, Nacogdoches, TX 75965',
  },
  {
    n: 7, stage: 'missions', at: [31.6505, -95.0727], fix: 'town', kind: 'mission',
    county: 'Cherokee County', diocese: 'Tyler',
    name: 'Venerable Antonio Margil Catholic Mission', town: 'Alto, TX',
    address: '498 The Kings Hwy, Alto, TX 75925',
    note: {
      en: 'The address is literally The Kings Hwy, and the mission is named for the Franciscan behind the East Texas missions. The old road is still in the street names.',
      es: 'La dirección es literalmente The Kings Hwy, y la misión lleva el nombre del franciscano detrás de las misiones del este de Tejas. El camino viejo sigue en los nombres de las calles.',
    },
  },
  {
    n: 8, stage: 'missions', at: [31.5483, -95.2391], fix: 'address', kind: 'site',
    county: 'Houston County', diocese: 'Tyler',
    name: 'Mission Tejas State Park', town: 'Grapeland, TX',
    address: '19343 State Hwy 21 E, Grapeland, TX 75844',
    note: { en: 'A walkable trail segment.', es: 'Un tramo de sendero transitable a pie.' },
  },
  {
    n: 9, stage: 'middle', at: [31.3231, -95.4580], fix: 'address', kind: 'parish',
    county: 'Houston County', diocese: 'Tyler',
    name: 'St. Francis of the Tejas', town: 'Crockett, TX',
    address: '609 N 4th St, Crockett, TX 75835',
    anchorCandidate: true,
    note: {
      en: 'Where the empty middle starts. 85 miles to the next parish.',
      es: 'Donde empieza el medio vacío. 85 millas hasta la próxima parroquia.',
    },
  },
  {
    n: 10, stage: 'middle', at: [30.6732, -96.3688], fix: 'address', kind: 'parish',
    county: 'Brazos County', diocese: 'Austin',
    name: 'St. Joseph Catholic Church', town: 'Bryan, TX',
    address: '507 E 26th St, Bryan, TX 77803',
    note: {
      en: 'Czech Catholic farm country begins: kolaches, polkas, old parish culture.',
      es: 'Empieza el campo católico checo: kolaches, polkas, cultura parroquial antigua.',
    },
  },
  {
    n: 11, stage: 'middle', at: [30.5374, -96.6978], fix: 'address', kind: 'parish',
    county: 'Burleson County', diocese: 'Austin',
    name: 'St. Mary Our Lady of Lourdes', town: 'Caldwell, TX',
    address: '500 W Old San Antonio Rd, Caldwell, TX 77836',
    anchorCandidate: true,
    note: {
      en: 'The church address is Old San Antonio Rd. The road named itself.',
      es: 'La dirección de la iglesia es Old San Antonio Rd. El camino se nombró solo.',
    },
  },
  {
    n: 12, stage: 'milam', at: [30.8053, -96.7529], fix: 'address', kind: 'site',
    county: 'Milam County', diocese: 'Austin',
    name: 'Walk the Rancheria Grande', town: 'Gause, TX',
    address: '12374 FM 2095, Gause, TX 77857',
  },
  {
    n: 13, stage: 'milam', at: [30.6578, -96.9986], fix: 'address', kind: 'parish',
    county: 'Milam County', diocese: 'Austin',
    name: "St. Joseph's Catholic Church", town: 'Rockdale, TX',
    address: '234 San Gabriel St, Rockdale, TX 76567',
    anchorCandidate: true,
    note: {
      en: 'Milam County: the Rancheria Grande trail and the San Xavier mission sites.',
      es: 'Condado de Milam: el sendero de la Ranchería Grande y los sitios de la misión de San Xavier.',
    },
  },
  {
    n: 14, stage: 'milam', at: [30.1095, -97.3185], fix: 'address', kind: 'parish',
    county: 'Bastrop County', diocese: 'Austin',
    name: 'Ascension Catholic Church', town: 'Bastrop, TX',
    address: '804 Pine St, Bastrop, TX 78602',
  },
  {
    n: 15, stage: 'milam', at: [29.8842, -97.9303], fix: 'address', kind: 'parish',
    county: 'Hays County', diocese: 'Austin',
    name: 'St. John the Evangelist', town: 'San Marcos, TX',
    address: '624 E Hopkins St, San Marcos, TX 78666',
  },
  {
    n: 16, stage: 'milam', at: [29.7034, -98.1283], fix: 'address', kind: 'parish',
    county: 'Comal County', diocese: 'San Antonio',
    name: 'Sts. Peter and Paul', town: 'New Braunfels, TX',
    address: '386 N Castell Ave, New Braunfels, TX 78130',
  },
  // The last five stops are the official Camino de San Antonio Missions, in
  // its published direction: Espada, San Juan, San José, Concepción, the
  // cathedral. Thirteen miles, and walking them earns a Compostela worth 30
  // km of credit toward the Camino Inglés. Three of the four missions were
  // founded in East Texas and walked here in 1731, so the corridor is not a
  // route invented for this project. It is the route they took.
  {
    n: 17, stage: 'missions-sa', at: [29.3182, -98.4512], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'Mission Espada', town: 'San Antonio, TX',
    address: '10040 Espada Rd, San Antonio, TX 78214',
    note: {
      en: 'Founded in 1690 at Weches as San Francisco de los Tejas. Stop 8 is its birthplace, 240 miles back up the road.',
      es: 'Fundada en 1690 en Weches como San Francisco de los Tejas. La parada 8 es su cuna, 240 millas atrás en el camino.',
    },
  },
  {
    n: 18, stage: 'missions-sa', at: [29.3330, -98.4553], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'Mission San Juan Capistrano', town: 'San Antonio, TX',
    address: '9101 Graf Rd, San Antonio, TX 78214',
    note: {
      en: 'East Texas as well: founded in 1716 as San José de los Nazonis, among the Nazoni Caddo.',
      es: 'También del este de Tejas: fundada en 1716 como San José de los Nazonis, entre los caddo nazoni.',
    },
  },
  {
    n: 19, stage: 'missions-sa', at: [29.3603, -98.4789], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'Mission San José', town: 'San Antonio, TX',
    address: '6701 San Jose Dr, San Antonio, TX 78214',
    note: {
      en: 'Margil founded this one in 1720, and the missions at Los Adaes, San Augustine and Nacogdoches at the other end.',
      es: 'Margil fundó esta en 1720, y las misiones de Los Adaes, San Augustine y Nacogdoches en el otro extremo.',
    },
  },
  {
    n: 20, stage: 'missions-sa', at: [29.3898, -98.4917], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'Mission Concepción', town: 'San Antonio, TX',
    address: '807 Mission Rd, San Antonio, TX 78210',
    note: {
      en: 'Founded in East Texas in 1711 as Nuestra Señora de la Purísima Concepción de los Hainais.',
      es: 'Fundada en el este de Tejas en 1711 como Nuestra Señora de la Purísima Concepción de los Hainais.',
    },
  },
  {
    n: 21, stage: 'missions-sa', at: [29.4246, -98.4942], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'San Fernando Cathedral', town: 'San Antonio, TX',
    address: '115 Main Plaza, San Antonio, TX 78205',
    note: {
      en: 'The end. Fifteen Canary Island families founded this parish on 9 March 1731, the same year the three missions arrived. The oldest parish community in Texas, and the mother church of the archdiocese.',
      es: 'El final. Quince familias de las Islas Canarias fundaron esta parroquia el 9 de marzo de 1731, el mismo año en que llegaron las tres misiones. La comunidad parroquial más antigua de Tejas, e iglesia madre de la arquidiócesis.',
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
  /** Model year the gap is hosted end to end. Drives the timeline. */
  closesInYear: number;
  why: Bilingual;
}[] = [
  {
    from: 'Crockett', to: 'Bryan', miles: 85, hostsNeeded: '3–4', closesInYear: 8,
    why: {
      en: 'Four to five days on TX-21 with no parish stop. The longest gap on the road, and the strongest case for the first anchor village.',
      es: 'Cuatro o cinco días por la TX-21 sin parroquia. El hueco más largo del camino, y el mejor argumento para la primera aldea ancla.',
    },
  },
  {
    from: 'Rockdale', to: 'Bastrop', miles: 50, hostsNeeded: '1–2', closesInYear: 3,
    why: {
      en: 'Two to three days, and the approach to the Hill Country edge where land is still within reach.',
      es: 'Dos o tres días, y la entrada al borde de las colinas donde la tierra aún está al alcance.',
    },
  },
  {
    from: 'Zwolle', to: 'San Augustine', miles: 50, hostsNeeded: '1', closesInYear: 4,
    why: {
      en: 'Includes the Sabine crossing. Needs a host and a bridge route a walker can actually use.',
      es: 'Incluye el cruce del Sabina. Necesita un anfitrión y un puente que un caminante pueda usar de verdad.',
    },
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
/**
 * What the campaign asks for, and why this road carries its name.
 *
 * There is no name field. The page is called Restore The Real, the h1 says
 * so, and `why` holds the sentence that explains it: the
 * road is already named Real, and both senses of the word are the point.
 * Spanish keeps the pun without translation, since real IS the Spanish word.
 */
export const CAMPAIGN: { why: Bilingual; body: Bilingual } = {
  why: {
    en: 'The road already carries the name. El Camino Real is the royal road, and real is also the word for what is actually there, in front of you, able to be touched. Both readings are the work.',
    es: 'El camino ya lleva el nombre. El Camino Real es el camino del rey, y real es también lo que de veras está ahí, delante de ti, que se puede tocar. Las dos lecturas son el trabajo.',
  },
  body: {
    en: 'The movement asks for one real step, taken from where you are, with what you already have. Most steps are small: a tree planted with a neighbour, a meal around a fire, a child who learns where food comes from. This road is the same step at the scale of a region, and it is still built out of the small ones.',
    es: 'El movimiento pide un paso real, dado desde donde estás, con lo que ya tienes. Casi todos los pasos son pequeños: un árbol plantado con un vecino, una comida junto al fuego, un hijo que aprende de dónde viene la comida. Este camino es el mismo paso a escala de una región, y sigue estando hecho de los pequeños.',
  },
};

export const THESIS: Bilingual = {
  en: 'El Camino Real was opened by soldiers and friars passing through. It is restored by farmers who stay.',
  es: 'El Camino Real lo abrieron soldados y frailes de paso. Lo restauran los labradores que se quedan.',
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
      en: 'The layman’s job is not bridges but walls, so that there are thresholds to welcome people through.',
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
          en: 'Time the road’s calendar so pilgrims arrive at the good moments: harvest, saints’ days, weddings.',
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
    name: { en: 'Reinhabit, don’t build new', es: 'Rehabitar, no construir de nuevo' },
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
  {
    key: 'founding',
    n: 8,
    name: { en: 'Plant the way settlers plant', es: 'Plantar como plantan los colonos' },
    claim: {
      en: 'The Amish have founded hundreds of new settlements and the sequence is known. Follow it rather than inventing one.',
      es: 'Los amish han fundado cientos de asentamientos nuevos y la secuencia se conoce. Seguirla en vez de inventar una.',
    },
    requirements: [
      {
        id: 'F1',
        text: {
          en: 'Send every village out from a mother chapter. A settlement whose first families all come from one place survives; one assembled from strangers answering an advert does not.',
          es: 'Que cada aldea salga de un capítulo madre. Un asentamiento cuyas primeras familias vienen todas del mismo lugar sobrevive; uno armado con desconocidos que responden a un anuncio no.',
        },
      },
      {
        id: 'F2',
        text: {
          en: 'Agree the character of the village in writing before looking at any land. How strict, how shared, how much in common, what the rule is. Land first is the classic way to found a settlement that splits in five years.',
          es: 'Acordar por escrito el carácter de la aldea antes de mirar ninguna tierra. Qué tan estricta, qué tan compartida, cuánto en común, cuál es la regla. Primero la tierra es la manera clásica de fundar un asentamiento que se parte en cinco años.',
        },
      },
      {
        id: 'F3',
        text: {
          en: 'Send scouts before buyers. Have people walk the county, meet the pastor, read the tax rolls and the school enrolment, and come back and report.',
          es: 'Mandar exploradores antes que compradores. Que alguien recorra el condado, conozca al párroco, lea el padrón y la matrícula escolar, y vuelva a informar.',
        },
      },
      {
        id: 'F4',
        text: {
          en: 'Do not move until five to ten families are committed, and begin with no fewer than three households actually resident.',
          es: 'No mudarse hasta que haya de cinco a diez familias comprometidas, y empezar con no menos de tres hogares realmente residentes.',
        },
        test: {
          en: 'Three households on the ground, close enough to gather for worship without driving.',
          es: 'Tres hogares en el sitio, lo bastante cerca para reunirse a rezar sin coche.',
        },
      },
      {
        id: 'F5',
        text: {
          en: 'Expect two families a year, not forty. That is the rate the best American precedent has actually managed, and the corridor gets its speed from running many villages at once rather than from hurrying any one of them.',
          es: 'Esperar dos familias al año, no cuarenta. Es el ritmo que el mejor precedente estadounidense ha logrado de verdad, y el corredor gana velocidad por llevar muchas aldeas a la vez, no por apurar ninguna.',
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
      en: 'The road crosses four jurisdictions',
      es: 'El camino cruza cuatro jurisdicciones',
    },
    body: {
      en: 'Stops 1–3 are in the Diocese of Alexandria in Louisiana. Stops 4–9 are in the Diocese of Tyler, which holds San Augustine, Nacogdoches, Cherokee and Houston counties. Stops 10–15 are in the Diocese of Austin, which holds Brazos, Burleson, Milam, Bastrop and Hays. The last six, from New Braunfels on, are in the Archdiocese of San Antonio.',
      es: 'Las paradas 1–3 están en la Diócesis de Alexandria, en Luisiana. Las paradas 4–9 están en la Diócesis de Tyler, que abarca los condados de San Augustine, Nacogdoches, Cherokee y Houston. Las paradas 10–15 están en la Diócesis de Austin, que abarca Brazos, Burleson, Milam, Bastrop y Hays. Las últimas seis, desde New Braunfels, están en la Arquidiócesis de San Antonio.',
    },
    soWhat: {
      en: 'Four bishops, two states, two ecclesiastical provinces. No single chancery can approve this road, and no single one can stop it either. Start where the chapter already has a relationship and let the next diocese see a working village rather than a proposal.',
      es: 'Cuatro obispos, dos estados, dos provincias eclesiásticas. Ninguna cancillería sola puede aprobar este camino, y ninguna sola puede detenerlo. Empezar donde el capítulo ya tiene relación y dejar que la próxima diócesis vea una aldea funcionando, no una propuesta.',
    },
    href: 'https://www.dioceseoftyler.org/our-diocese/',
    label: 'Diocese of Tyler counties',
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
// The chapters already on the road.
//
// This is the part of the plan that was not invented for it. Four Catholic
// Land Movement chapters have formed within a day's drive of El Camino Real
// without anyone putting them there, which turns the corridor from a thing
// somebody might do into a thing four existing chapters already face.
//
// ⚠️ PLACEHOLDER NAMES AND APPROXIMATE POSITIONS. These were read off a My
// Maps screenshot and are named by the nearest town, not by the chapter's
// own name. Before any of this is shown outside the chapter, replace `name`
// with what each chapter actually calls itself and `at` with where it
// actually meets. The carries[] assignment is ours and is a proposal.
//
// `diocese` is the CHAPTER's diocese, which is not always the diocese of the
// stops it carries. Woodville sits in Beaumont while its stops are in Tyler;
// Montgomery sits in Galveston-Houston while its stops are in Tyler and
// Austin. The road crosses four dioceses, but talking to the chapters means
// talking to six chanceries, and that is worth knowing before anyone counts
// bishops in a meeting.
// ---------------------------------------------------------------------------
export type ChapterId = 'nb' | 'lee' | 'mont' | 'wood' | 'milton';

export const CHAPTERS: {
  id: ChapterId;
  /** Placeholder: the nearest town, not the chapter's own name. */
  name: Bilingual;
  at: [number, number];
  /** Stops this chapter is nearest to, and would carry. A proposal. */
  carries: number[];
  diocese: string;
  /** Why a chapter carries nothing, where that needs saying. */
  note?: Bilingual;
}[] = [
  {
    // Too far south to host a stage, and kept on the map for exactly that
    // reason: the Louisiana end of the road has no chapter near it, and the
    // nearest one being 129 miles away is the clearest way to show it.
    id: 'milton',
    name: { en: 'Milton, Louisiana', es: 'Milton, Luisiana' },
    at: [30.1038, -92.0765],
    carries: [],
    diocese: 'Lafayette',
    note: {
      en: 'About 129 miles south of the nearest stop, and in a different diocese, so it cannot host a stage. It is still the closest Catholic Land Movement body to the Louisiana end, which makes it the first call: it may know families near the road, and under rule F1 a chapter founded up there would be sent out from somewhere, most plausibly here.',
      es: 'A unas 129 millas al sur de la parada más cercana, y en otra diócesis, así que no puede recibir una etapa. Sigue siendo el cuerpo del Movimiento Católico de la Tierra más cercano al extremo de Luisiana, y por eso es la primera llamada: puede conocer familias cerca del camino, y según el requisito F1 un capítulo fundado allá tendría que salir de algún lado, lo más probable de aquí.',
    },
  },
  {
    id: 'wood',
    name: { en: 'Woodville area', es: 'Zona de Woodville' },
    at: [30.77, -94.42],
    carries: [4, 5, 6, 7, 8],
    diocese: 'Beaumont',
  },
  {
    id: 'mont',
    name: { en: 'Montgomery area', es: 'Zona de Montgomery' },
    at: [30.37, -95.69],
    carries: [9, 10],
    diocese: 'Galveston-Houston',
  },
  {
    id: 'lee',
    name: { en: 'Lee County', es: 'Condado de Lee' },
    at: [30.4, -97.01],
    carries: [11, 12, 13, 14],
    diocese: 'Austin',
  },
  {
    id: 'nb',
    name: { en: 'New Braunfels area', es: 'Zona de New Braunfels' },
    at: [29.68, -98.12],
    carries: [15, 16, 17, 18, 19, 20, 21],
    diocese: 'San Antonio',
  },
];

/** How far a chapter can reasonably carry, in miles. A day's drive and back. */
export const CHAPTER_REACH_MILES = 60;

/** The chapter that would carry a stop, or null where none does. */
export const chapterFor = (n: number): ChapterId | null =>
  CHAPTERS.find((c) => c.carries.includes(n))?.id ?? null;

/** Great-circle miles between two [lat, lng] points. */
export const milesBetween = (a: [number, number], b: [number, number]) => {
  const R = 3958.8;
  const r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r;
  const dLng = (b[1] - a[1]) * r;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * The anchor villages, and the year each begins.
 *
 * Five, not the eleven an earlier draft counted. Eleven came from asking
 * which stops have a parish outside metro San Antonio. Five comes from
 * asking which stops have a parish AND a mother chapter within reach, which
 * is charter rule F1 and the harder test. The last two are proposed rather
 * than planned: they need a chapter at that end of the road first, and there
 * is none yet.
 */
export const ANCHORS: {
  stop: number;
  startYear: number;
  name: string;
  mother: ChapterId | null;
  proposed: boolean;
}[] = [
  { stop: 13, startYear: 3, name: 'Rockdale', mother: 'lee', proposed: false },
  { stop: 11, startYear: 6, name: 'Caldwell', mother: 'lee', proposed: false },
  { stop: 9, startYear: 8, name: 'Crockett', mother: 'mont', proposed: false },
  { stop: 4, startYear: 10, name: 'San Augustine', mother: 'wood', proposed: true },
  { stop: 3, startYear: 12, name: 'Zwolle', mother: null, proposed: true },
];

/** The model's horizon, matching the longest corridor phase. */
export const HORIZON_YEARS = 15;

/**
 * The assumptions every number on the timeline rests on, in one place so
 * they can be argued with rather than reverse-engineered.
 *
 * FAMILIES_A_YEAR is the Clear Creek rate (see PRECEDENTS), VILLAGE_CAP and
 * the three-household start are charter rules F4 and F5, and the pilgrim
 * figures are the corrected ones from IMPACT I3.
 */
export const MODEL = {
  startingHouseholds: 3,
  familiesAYear: 2,
  villageCap: 30,
  peoplePerHousehold: 5,
  pilgrimsAYear: 5000,
  daysPerPilgrim: 10,
  spendPerPilgrimDay: 50,
  /** Years for pilgrim numbers to ramp to the full figure. */
  pilgrimRampYears: 12,
} as const;

/**
 * When a stop gets a parish host. Stops a chapter already carries can be
 * asked in the first year; the rest wait on a chapter forming at that end,
 * which is the Louisiana problem.
 */
export const hostedYear = (n: number) => (chapterFor(n) ? 1 : 4);

/** Households resident in an anchor village in a given year. */
export const householdsAt = (startYear: number, year: number) =>
  year < startYear
    ? 0
    : Math.min(
        MODEL.villageCap,
        MODEL.startingHouseholds + MODEL.familiesAYear * (year - startYear),
      );

/** Everything the timeline shows, for one year. */
export const stateAt = (year: number) => {
  const hosted = STOPS.filter((s) => year >= hostedYear(s.n)).length;
  const villages = ANCHORS.map((v) => ({ ...v, households: householdsAt(v.startYear, year) }));
  const households = villages.reduce((t, v) => t + v.households, 0);
  const pilgrims = Math.round(
    MODEL.pilgrimsAYear * (hosted / STOPS.length) * Math.min(1, year / MODEL.pilgrimRampYears),
  );
  const pilgrimDays = pilgrims * MODEL.daysPerPilgrim;
  return {
    hosted,
    villages,
    living: villages.filter((v) => v.households > 0).length,
    households,
    people: Math.round(households * MODEL.peoplePerHousehold),
    pilgrims,
    pilgrimDays,
    spend: pilgrimDays * MODEL.spendPerPilgrimDay,
    gapsClosed: GAPS.filter((g) => year >= g.closesInYear).length,
  };
};

// ---------------------------------------------------------------------------
// Who carries which stretch, and what to ask them for first.
//
// The ask column is the point of the table. Every row is something a named
// chapter could be asked for this year, before any land is discussed.
// ---------------------------------------------------------------------------
export const ROSTER: {
  stretch: Bilingual;
  stops: string;
  chapter: ChapterId | null;
  diocese: string;
  ask: Bilingual;
}[] = [
  {
    stretch: { en: 'Louisiana', es: 'Luisiana' },
    stops: '1–3',
    chapter: 'milton',
    diocese: 'Alexandria',
    ask: {
      en: 'Milton is the only Louisiana chapter and it is too far south to host a stage, so this stretch still needs one of its own in the Diocese of Alexandria. Call Milton first: ask whether they know families near the road, and whether they would be the mother chapter for one. Meanwhile ask the Natchitoches basilica to host the start and the blessing.',
      es: 'Milton es el único capítulo de Luisiana y queda demasiado al sur para recibir una etapa, así que este tramo todavía necesita uno propio en la Diócesis de Alexandria. Llamar primero a Milton: preguntar si conocen familias cerca del camino, y si serían el capítulo madre de uno. Mientras tanto, pedir a la basílica de Natchitoches que reciba la salida y la bendición.',
    },
  },
  {
    stretch: { en: 'The East Texas missions', es: 'Las misiones del este de Tejas' },
    stops: '4–8',
    chapter: 'wood',
    diocese: 'Tyler',
    ask: {
      en: 'Scout San Augustine, Chireno and Nacogdoches. Meet Sacred Heart, which already carries the Margil cause.',
      es: 'Explorar San Augustine, Chireno y Nacogdoches. Visitar Sacred Heart, que ya lleva la causa de Margil.',
    },
  },
  {
    stretch: { en: 'The empty middle', es: 'El medio vacío' },
    stops: '9–10',
    chapter: 'mont',
    diocese: 'Tyler / Austin',
    ask: {
      en: 'Walk TX-21 from Crockett to Bryan and come back with the three or four households that could host in the gap.',
      es: 'Caminar la TX-21 de Crockett a Bryan y volver con los tres o cuatro hogares que podrían recibir en el hueco.',
    },
  },
  {
    stretch: { en: 'Caldwell to Bastrop', es: 'De Caldwell a Bastrop' },
    stops: '11–14',
    chapter: 'lee',
    diocese: 'Austin',
    ask: {
      en: 'Mother chapter for the first village at Rockdale, about 18 miles away. Begin scouting Milam County now, which is charter rule F3.',
      es: 'Capítulo madre de la primera aldea en Rockdale, a unas 18 millas. Empezar a explorar el condado de Milam ya, que es el requisito F3.',
    },
  },
  {
    stretch: { en: 'Hill Country to the cathedral', es: 'De las colinas a la catedral' },
    stops: '15–21',
    chapter: 'nb',
    diocese: 'Austin / San Antonio',
    ask: {
      en: 'Extend the Camino de San Antonio passport north, stamp by stamp, and organise the first walk.',
      es: 'Extender el pasaporte del Camino de San Antonio hacia el norte, sello por sello, y organizar la primera caminata.',
    },
  },
];

/** The milestones the timeline marks, in years. */
export const MILESTONES: { year: number; text: Bilingual }[] = [
  { year: 0, text: {
    en: 'Four chapters already sit within a day’s drive of the road',
    es: 'Cuatro capítulos ya están a un día de camino de la ruta',
  } },
  { year: 1, text: {
    en: 'Passport extended north; a parish host asked for at every chapter stage',
    es: 'Pasaporte extendido al norte; una parroquia anfitriona pedida en cada etapa con capítulo',
  } },
  { year: 2, text: {
    en: 'The first walk, each chapter walking its own stages',
    es: 'La primera caminata, cada capítulo caminando sus propias etapas',
  } },
  { year: 3, text: {
    en: 'Rockdale: three households resident',
    es: 'Rockdale: tres hogares residentes',
  } },
  { year: 4, text: {
    en: 'A chapter forms near the road in Louisiana, sent out from Milton; stages 1 to 3 hosted',
    es: 'Se forma un capítulo junto al camino en Luisiana, enviado desde Milton; etapas 1 a 3 con anfitrión',
  } },
  { year: 6, text: { en: 'Caldwell village begins', es: 'Empieza la aldea de Caldwell' } },
  { year: 8, text: {
    en: 'Crockett village begins, and the 85-mile gap is hosted',
    es: 'Empieza la aldea de Crockett, y el hueco de 85 millas tiene anfitriones',
  } },
  { year: 10, text: {
    en: 'San Augustine begins; three villages share a meat processor',
    es: 'Empieza San Augustine; tres aldeas comparten una planta de carne',
  } },
  { year: 12, text: {
    en: 'Zwolle begins; every stage has a village or a host',
    es: 'Empieza Zwolle; cada etapa tiene aldea o anfitrión',
  } },
  { year: 15, text: {
    en: 'A generation in: five villages growing',
    es: 'Una generación después: cinco aldeas creciendo',
  } },
];

// ---------------------------------------------------------------------------
// What a village becomes.
//
// These are not the corridor's phases. PHASES above is what this PROJECT
// does over fifteen years. This is the national office's plan for the life
// of any one chapter, and the two run on the same clock: 0–2, 2–5, then the
// long stretch. A village on this road is a chapter in miniature, so the
// corridor's real job is to carry eleven of them from I to III.
//
// It is worth having here for one reason beyond tidiness. Phase III is what
// the national office calls a demonstration farm, and it has committed to
// five of them by 2030. The anchor villages on this road are candidates for
// that money, which makes this page a funding case rather than a daydream.
// ---------------------------------------------------------------------------
export const VILLAGE_PHASES: {
  roman: string;
  years: Bilingual;
  /** True for the phase this chapter is actually in. Founded 2025. */
  here: boolean;
  name: Bilingual;
  body: Bilingual;
}[] = [
  {
    roman: 'I',
    years: { en: 'YEARS 0 TO 2', es: 'AÑOS 0 A 2' },
    here: true,
    name: { en: 'An informal community', es: 'Una comunidad informal' },
    body: {
      en: 'Get started and build relationships. Gatherings, workshops, and a roster of people who know each other by name. Nothing here needs a bank account or a charter, which is why it is the phase a village can begin in a parish hall.',
      es: 'Empezar y construir relaciones. Reuniones, talleres, y una lista de personas que se conocen por su nombre. Nada de esto necesita cuenta bancaria ni estatutos, por eso es la fase que una aldea puede empezar en un salón parroquial.',
    },
  },
  {
    roman: 'II',
    years: { en: 'YEARS 2 TO 5', es: 'AÑOS 2 A 5' },
    here: false,
    name: { en: 'A formalized entity', es: 'Una entidad formal' },
    body: {
      en: 'The village becomes a civic institution: a charter, a local bank account, and the standing to own, invest, and lead. This is the phase that can hold land, which is where requirement S1 and the ground lease finally have something to attach to.',
      es: 'La aldea se vuelve una institución civil: estatutos, cuenta bancaria local, y la capacidad de poseer, invertir, y dirigir. Es la fase que puede tener tierra, y donde el requisito S1 y el arriendo por fin tienen a qué sujetarse.',
    },
  },
  {
    roman: 'III',
    years: { en: 'YEARS 5 TO 10', es: 'AÑOS 5 A 10' },
    here: false,
    name: { en: 'A localized economy', es: 'Una economía local' },
    body: {
      en: 'A regional centre of work and formation, where these principles are lived and taught rather than discussed. Jobs are created, farms are launched, and the village hosts staff, volunteers, and retreatants. The national office calls this a demonstration farm and has committed to five by 2030.',
      es: 'Un centro regional de trabajo y formación, donde estos principios se viven y se enseñan en vez de discutirse. Se crean empleos, se lanzan granjas, y la aldea recibe personal, voluntarios, y retirantes. La oficina nacional llama a esto una granja de demostración y se ha comprometido a cinco para 2030.',
    },
  },
];

/** The national aims this corridor would be serving, in their own terms. */
export const NATIONAL_AIM: Bilingual = {
  en: 'Nationally the aim is a Catholic Land Movement chapter in every diocese, and five demonstration farms, by 2030. This road crosses four dioceses and wants eleven villages.',
  es: 'A nivel nacional, la meta es un capítulo del Movimiento Católico de la Tierra en cada diócesis, y cinco granjas de demostración, para 2030. Este camino cruza cuatro diócesis y quiere once aldeas.',
};

// ---------------------------------------------------------------------------
// Why this road and not another one.
//
// Every claim here was checked against a source, and two were trimmed in the
// checking. The Franciscan colleges are a staffing fact rather than a
// founding one, and San Fernando's "oldest cathedral in America" is
// contested, so what is printed is the part nobody disputes.
//
// The order is deliberate. It opens with whose road this was and closes with
// the name of the state, because the last one is the argument: a stranger was
// welcomed here once, and the welcome became the name of the place.
// ---------------------------------------------------------------------------
export const HERITAGE: {
  id: string;
  title: Bilingual;
  body: Bilingual;
  source: { href: string; label: string };
}[] = [
  {
    id: 'H1',
    title: { en: 'It was a friars’ road first', es: 'Primero fue camino de frailes' },
    body: {
      en: 'The missions along this corridor were staffed from two Franciscan colleges of Propaganda Fide, Querétaro and Zacatecas, from 1690 onward. Restoring it as a Catholic project is not a new use for the road.',
      es: 'Las misiones de este corredor se atendieron desde dos colegios franciscanos de Propaganda Fide, Querétaro y Zacatecas, desde 1690. Restaurarlo como proyecto católico no es un uso nuevo del camino.',
    },
    source: {
      href: 'https://www.nps.gov/elte/learn/historyculture/index.htm',
      label: 'El Camino Real de los Tejas, National Park Service',
    },
  },
  {
    id: 'H2',
    title: { en: 'One friar walked the whole of it', es: 'Un fraile lo caminó entero' },
    body: {
      en: 'Venerable Antonio Margil de Jesús went barefoot. He founded the missions at Los Adaes, San Augustine and Nacogdoches at the east end and Mission San José at the west, which makes his footsteps the length of this corridor. Gregory XVI declared his virtues heroic in 1836, and the Diocese of Tyler has reopened the cause with Sacred Heart in Nacogdoches, which is stop 6.',
      es: 'El Venerable Antonio Margil de Jesús andaba descalzo. Fundó las misiones de Los Adaes, San Augustine y Nacogdoches en el extremo oriente y la Misión San José en el poniente, así que sus pasos cubren todo este corredor. Gregorio XVI declaró heroicas sus virtudes en 1836, y la Diócesis de Tyler ha reabierto la causa con Sacred Heart de Nacogdoches, que es la parada 6.',
    },
    source: {
      href: 'https://caminosanantonio.org/the-life-and-legacy-of-venerable-antonio-margil-the-patron-saint-of-texas/',
      label: 'El Camino de San Antonio Missions',
    },
  },
  {
    id: 'H3',
    title: { en: 'Three missions already walked it', es: 'Tres misiones ya lo caminaron' },
    body: {
      en: 'Espada began in 1690 at Weches as San Francisco de los Tejas, Concepción in 1711 among the Hainai, San Juan in 1716 among the Nazoni. All three moved to the San Antonio River in 1731. Stop 8 is the ground Espada was founded on and stop 17 is where it stands today, so this is not a route invented for the project. It is the one they took.',
      es: 'Espada empezó en 1690 en Weches como San Francisco de los Tejas, Concepción en 1711 entre los hainai, San Juan en 1716 entre los nazoni. Las tres se trasladaron al río San Antonio en 1731. La parada 8 es el suelo donde se fundó Espada y la 17 es donde está hoy, así que no es una ruta inventada para el proyecto. Es la que ellas tomaron.',
    },
    source: {
      href: 'https://www.nps.gov/saan/learn/historyculture/mission-espada.htm',
      label: 'Mission Espada, National Park Service',
    },
  },
  {
    id: 'H4',
    title: {
      en: 'Two Catholic cultures meet at the east end',
      es: 'Dos culturas católicas se encuentran al oriente',
    },
    body: {
      en: 'Louis Juchereau de St. Denis founded Natchitoches in 1714, the oldest permanent settlement in the whole Louisiana Purchase. Spain answered with Los Adaes. By our own geocoded points the two sit 12.7 miles apart: French and Spanish Catholic settlement within a morning’s walk of each other.',
      es: 'Louis Juchereau de St. Denis fundó Natchitoches en 1714, el asentamiento permanente más antiguo de toda la Compra de Luisiana. España respondió con Los Adaes. Según nuestros propios puntos geocodificados están a 12.7 millas: el poblamiento católico francés y el español a una mañana de camino uno del otro.',
    },
    source: {
      href: 'https://www.britannica.com/place/Natchitoches',
      label: 'Natchitoches, Britannica',
    },
  },
  {
    id: 'H5',
    title: { en: 'The ending already counts', es: 'El final ya cuenta' },
    body: {
      en: 'The last thirteen miles are that pilgrimage, walked in its published order: Espada, San Juan, San José, Concepción, the cathedral. Four of those stops are a UNESCO World Heritage site. Fifteen Canary Island families founded the cathedral parish on 9 March 1731, the same year the three missions arrived, and it is the oldest parish community in Texas. The road ends where the city began.',
      es: 'Las últimas trece millas son esa peregrinación, caminada en su orden publicado: Espada, San Juan, San José, Concepción, la catedral. Cuatro de esas paradas son Patrimonio de la Humanidad de la UNESCO. Quince familias de las Islas Canarias fundaron la parroquia de la catedral el 9 de marzo de 1731, el mismo año en que llegaron las tres misiones, y es la comunidad parroquial más antigua de Tejas. El camino termina donde empezó la ciudad.',
    },
    source: {
      href: 'https://caminosanantonio.org/plan-your-pilgrimage/self-guided/',
      label: 'El Camino de San Antonio Missions',
    },
  },
  {
    id: 'H6',
    title: {
      en: 'The state is named for a welcome',
      es: 'El estado lleva el nombre de una bienvenida',
    },
    body: {
      en: 'Fray Damián Massanet founded San Francisco de los Tejas in 1690 and wrote down the greeting the Caddo gave him: táysha, friend. Spanish spelled it Tejas and English made it Texas. The friar who gave the state its name founded the mission at stop 8, and the name itself means hospitality to a stranger.',
      es: 'Fray Damián Massanet fundó San Francisco de los Tejas en 1690 y anotó el saludo que le dieron los caddo: táysha, amigo. El español lo escribió Tejas y el inglés lo hizo Texas. El fraile que le dio nombre al estado fundó la misión de la parada 8, y el nombre mismo significa hospitalidad al forastero.',
    },
    source: {
      href: 'https://www.texasbeyondhistory.net/tejas/voices/homeland.html',
      label: 'Texas Beyond History, UT Austin',
    },
  },
];

// ---------------------------------------------------------------------------
// What it adds up to.
//
// The figures here are the corrected ones. Where an earlier draft multiplied
// every pilgrim by a full thirty days, this counts pilgrim-days; where it
// quoted acreage without a price, this prices it. The sources are kept
// against each figure so the next person does not have to re-derive them.
// ---------------------------------------------------------------------------

export type Figure = {
  id: string;
  figure: string;
  label: Bilingual;
  body: Bilingual;
  /** The assumption the figure rests on, printed so it can be moved. */
  basis: Bilingual;
  source?: { href: string; label: string };
};

export const IMPACT: Figure[] = [
  {
    id: 'I1',
    figure: '330',
    label: { en: 'households', es: 'hogares' },
    body: {
      en: 'Eleven villages of thirty families: about 1,650 people and nearly a thousand children raised on farms, in parish schools and in trades. Eleven and not twenty-one, because a village needs two things, a parish to form around and farmland it can afford. Sixteen of the twenty-one stops have a church, and five of those sixteen are inside San Antonio, where the land is a city. Those five are the destination.',
      es: 'Once aldeas de treinta familias: unas 1,650 personas y casi mil niños criados en granjas, escuelas parroquiales y oficios. Once y no veintiuna, porque una aldea necesita dos cosas, una parroquia alrededor de la cual formarse y tierra que pueda pagar. Dieciséis de las veintiuna paradas tienen iglesia, y cinco de esas dieciséis están dentro de San Antonio, donde la tierra es ciudad. Esas cinco son el destino.',
    },
    basis: {
      en: 'Five people a household, against a US average of 2.5. A bet on large families, and the figure most worth stating as a bet. Eleven is a ceiling until a parish opens at one of the five stops that has none.',
      es: 'Cinco personas por hogar, frente a un promedio de 2.5 en EE. UU. Una apuesta por familias grandes, y la cifra que más conviene declarar como apuesta. Once es un techo hasta que abra una parroquia en alguna de las cinco paradas que no tienen ninguna.',
    },
  },
  {
    id: 'I2',
    figure: '2 a year',
    label: { en: 'families a village', es: 'familias por aldea' },
    body: {
      en: 'This is the growth rate the plan should assume. Clear Creek Abbey in Oklahoma, the strongest American precedent, drew roughly thirty-five families in its first decade and dozens since — on the order of two a year, with a monastery and a Latin Mass as the draw. The corridor gets its speed from running eleven villages at once, not from hurrying one.',
      es: 'Este es el ritmo de crecimiento que el plan debe suponer. La abadía de Clear Creek, en Oklahoma, el precedente estadounidense más fuerte, atrajo unas treinta y cinco familias en su primera década y decenas desde entonces: del orden de dos al año, con un monasterio y la Misa tradicional como atractivo. El corredor gana velocidad llevando once aldeas a la vez, no apurando una.',
    },
    basis: {
      en: 'Thirty families a village at two a year is fifteen years per village. The corridor is a generation of work, and saying so is more persuasive than pretending otherwise.',
      es: 'Treinta familias por aldea a dos al año son quince años por aldea. El corredor es el trabajo de una generación, y decirlo convence más que fingir lo contrario.',
    },
    source: { href: 'https://en.wikipedia.org/wiki/Clear_Creek_Abbey', label: 'Clear Creek Abbey' },
  },
  {
    id: 'I3',
    figure: '50,000',
    label: { en: 'pilgrim-days a year', es: 'días-peregrino al año' },
    body: {
      en: 'About $2.5M a year into small-town economies, at 5,000 pilgrims and $50 a day. Pilgrim-days rather than pilgrims is the unit, because almost nobody walks a whole route: on the Camino only about 6% go the full distance, while 30% walk the last hundred kilometres. Ten days a pilgrim is the honest average, and beds filled per night is what a village actually plans against.',
      es: 'Unos $2.5M al año en la economía de los pueblos, con 5,000 peregrinos y $50 al día. La unidad son días-peregrino y no peregrinos, porque casi nadie camina una ruta entera: en el Camino sólo un 6% hace la distancia completa, mientras un 30% camina los últimos cien kilómetros. Diez días por peregrino es el promedio honesto, y lo que una aldea planea de verdad son camas llenas por noche.',
    },
    basis: {
      en: 'Nobody publishes how many walk the Camino de San Antonio Missions, so 5,000 is a guess. Ask the Padre Margil Pilgrimage Center for passports issued since 2022; that one answer prices the whole pilgrim economy.',
      es: 'Nadie publica cuántos caminan el Camino de San Antonio Missions, así que 5,000 es una suposición. Pedir al Centro de Peregrinos Padre Margil los pasaportes emitidos desde 2022; esa sola respuesta pone precio a toda la economía de peregrinos.',
    },
    source: { href: 'https://americanpilgrims.org/statistics/', label: 'Camino statistics' },
  },
  {
    id: 'I4',
    figure: '21%',
    label: { en: 'GDP lift, small towns', es: 'alza del PIB, pueblos pequeños' },
    body: {
      en: 'University of Santiago research found some small municipalities on the Camino raised GDP by as much as a fifth from pilgrims alone. Pilgrims spend less per day than ordinary tourists, because they sleep in hostels and parish halls, but each dollar creates more local work than any other kind of visitor. The effect lands hardest where there was least to begin with, which is the whole corridor.',
      es: 'Un estudio de la Universidad de Santiago encontró que algunos municipios pequeños del Camino subieron su PIB hasta una quinta parte sólo por los peregrinos. Los peregrinos gastan menos por día que un turista normal, porque duermen en albergues y salones parroquiales, pero cada dólar crea más trabajo local que cualquier otro visitante. El efecto pega más fuerte donde menos había, que es todo el corredor.',
    },
    basis: {
      en: 'The best-evidenced figure here, and it is evidence for the thing the project is actually for.',
      es: 'La cifra mejor respaldada de aquí, y respalda justo aquello para lo que existe el proyecto.',
    },
    source: {
      href: 'https://sightmagazine.com.au/features/pilgrim-economics-camino-travellers-help-rural-spain-s-emptying-villages-survive/',
      label: 'Pilgrim economics, rural Spain',
    },
  },
  {
    id: 'I5',
    figure: '5%',
    label: { en: 'of US beef processing', es: 'del sacrificio de res en EE. UU.' },
    body: {
      en: 'Four companies hold about 80% of American beef processing and only about 5% sits in small and very small plants. Ranchers drive one to two hours to reach a USDA-inspected floor, and in bad years book a year ahead. A village cannot build one alone; eleven villages can, and every one of them needs it. This is the clearest candidate for the first thing the corridor builds together, and the USDA is currently putting money toward exactly this gap.',
      es: 'Cuatro empresas tienen cerca del 80% del sacrificio de res en Estados Unidos y sólo un 5% está en plantas pequeñas. Los ganaderos manejan una o dos horas para llegar a una planta con inspección federal, y en años malos reservan con un año de anticipación. Una aldea no puede construir una sola; once sí, y todas la necesitan. Es el candidato más claro para lo primero que el corredor construya junto, y el USDA está poniendo dinero justo en ese hueco.',
    },
    basis: {
      en: 'It is also principle 4 at corridor scale: a human need turned into an industry, taken back. And it is the anchor employer requirement M1 with a specific business attached.',
      es: 'Es también el principio 4 a escala de corredor: una necesidad humana vuelta industria, recuperada. Y es el requisito M1 del empleador ancla con un negocio concreto detrás.',
    },
    source: {
      href: 'https://tscra.org/texas-ranchers-are-seeing-the-effects-of-decreased-capacity-in-meat-processing-plants/',
      label: 'Texas & Southwestern Cattle Raisers',
    },
  },
  {
    id: 'I6',
    figure: '$4,827',
    label: { en: 'an acre, Texas average', es: 'por acre, promedio de Tejas' },
    body: {
      en: 'And $11,369 through the Gulf Coast–Brazos Bottom, which is the Bryan and Caldwell stretch of this road and the most expensive rural market in the state. Eleven villages of thirty families at sixty acres apiece is about twenty thousand acres: roughly $96M at the state average and over $200M through the Bottom. Buying that outright is not the plan and never could be.',
      es: 'Y $11,369 en la región Gulf Coast–Brazos Bottom, que es el tramo de Bryan y Caldwell de este camino y el mercado rural más caro del estado. Once aldeas de treinta familias a sesenta acres cada una son unos veinte mil acres: cerca de $96M al promedio estatal y más de $200M por el Bottom. Comprarlo de golpe no es el plan y nunca podría serlo.',
    },
    basis: {
      en: 'Which is why the land is held in common and leased, not bought family by family. See below.',
      es: 'Por eso la tierra se tiene en común y se arrienda, no se compra familia por familia. Ver abajo.',
    },
    source: {
      href: 'https://trerc.tamu.edu/reports/texas-rural-land-markets-first-quarter-2025/',
      label: 'Texas Rural Land Markets, Texas A&M',
    },
  },
];

// ---------------------------------------------------------------------------
// How the land is held.
//
// The page used to end by admitting it did not know. It does now: the
// community land trust separates owning the land from working it, and the
// instrument that makes it inheritable already exists and is in use.
// ---------------------------------------------------------------------------
export const LAND_MODEL: {
  title: Bilingual;
  body: Bilingual;
  source?: { href: string; label: string };
}[] = [
  {
    title: { en: 'Separate owning from working', es: 'Separar poseer de trabajar' },
    body: {
      en: 'A community landholding entity buys and keeps the land. Families do not buy the acres; they take a lease on them. That is what breaks the link between the price of farmland and the cost of starting a farm, and it is the only honest answer to an acre costing five figures.',
      es: 'Una entidad comunitaria compra y conserva la tierra. Las familias no compran los acres; toman un arrendamiento sobre ellos. Eso rompe el vínculo entre el precio de la tierra y el costo de empezar una granja, y es la única respuesta honesta a un acre de cinco cifras.',
    },
  },
  {
    title: { en: 'A 99-year inheritable lease', es: 'Un arriendo heredable de 99 años' },
    body: {
      en: 'The Agrarian Commons model leases farmland on 99-year renewable, inheritable terms. The family owns the house, the barn and every improvement it builds, and builds real equity in them. It cannot sell the land out from under the village, because it never held it. This is requirement S1 with a legal instrument attached.',
      es: 'El modelo Agrarian Commons arrienda tierra agrícola a 99 años, renovable y heredable. La familia posee la casa, el granero y cada mejora que construye, y acumula patrimonio real en ellos. No puede vender la tierra por debajo de la aldea, porque nunca la tuvo. Es el requisito S1 con un instrumento legal detrás.',
    },
    source: { href: 'https://www.agrariantrust.org/', label: 'Agrarian Trust' },
  },
  {
    title: { en: 'Buy land that is already farmed', es: 'Comprar tierra que ya se trabaja' },
    body: {
      en: 'Texas taxes qualifying open-space land on what it produces rather than what it would sell for, and the saving is commonly 90% or more of taxable value. But the land must have been in agricultural use for five of the preceding seven years. Idle land loses the valuation and the trust pays full freight for years. So buy working ground, and make continuous agricultural use a condition of every lease.',
      es: 'Tejas grava la tierra abierta que califica por lo que produce y no por lo que valdría en venta, y el ahorro suele ser del 90% o más del valor gravable. Pero la tierra debe haber estado en uso agrícola cinco de los siete años anteriores. La tierra ociosa pierde la valuación y el fideicomiso paga completo durante años. Así que comprar tierra en trabajo, y hacer del uso agrícola continuo una condición de cada arriendo.',
    },
    source: {
      href: 'https://comptroller.texas.gov/taxes/property-tax/ag-timber/',
      label: 'Texas Comptroller, ag appraisal',
    },
  },
];

// ---------------------------------------------------------------------------
// Precedents. Each is read for what it proves AND for how it fails, because a
// precedent used only for its good half is an advertisement.
// ---------------------------------------------------------------------------
export const PRECEDENTS: {
  name: string;
  where: Bilingual;
  proves: Bilingual;
  warns: Bilingual;
  source: { href: string; label: string };
}[] = [
  {
    name: 'Clear Creek Abbey',
    where: { en: 'Hulbert, Oklahoma, since 1999', es: 'Hulbert, Oklahoma, desde 1999' },
    proves: {
      en: 'Families really will move across the country and settle around a house of prayer. An informal census found thirty-five families, 145 people and 96 children; dozens more have come since, from California, Texas and Kansas. The heart-first model is not theoretical.',
      es: 'Las familias de verdad cruzan el país y se asientan alrededor de una casa de oración. Un censo informal contó treinta y cinco familias, 145 personas y 96 niños; han llegado decenas más desde entonces, de California, Tejas y Kansas. El modelo del corazón primero no es teórico.',
    },
    warns: {
      en: 'It took a quarter of a century, with a monastery as the draw. Two families a year is the real rate. Any plan promising twenty-two families a year across the corridor is promising eleven Clear Creeks running at once.',
      es: 'Tardó un cuarto de siglo, con un monasterio como atractivo. Dos familias al año es el ritmo real. Cualquier plan que prometa veintidós familias al año en el corredor está prometiendo once Clear Creeks a la vez.',
    },
    source: { href: 'https://en.wikipedia.org/wiki/Clear_Creek_Abbey', label: 'Clear Creek Abbey' },
  },
  {
    name: 'St. Marys',
    where: { en: 'Kansas, since the 1980s', es: 'Kansas, desde los años ochenta' },
    proves: {
      en: 'A rural town can reverse its decline. St. Marys went from about 1,800 residents to roughly 2,800, a 50% rise, while the rural counties around it emptied. Critical mass is real and it is measurable.',
      es: 'Un pueblo rural puede revertir su declive. St. Marys pasó de unos 1,800 habitantes a cerca de 2,800, un alza del 50%, mientras los condados rurales alrededor se vaciaban. La masa crítica es real y es medible.',
    },
    warns: {
      en: 'It is also the clearest picture of the failure mode. The newcomers became a majority and reporting from the town records longtime residents who feel pushed to the edge of their own place. The group there is canonically irregular besides, which is not this movement’s position. Read St. Marys as the enclave warning, not as the model.',
      es: 'También es el retrato más claro del modo de fracaso. Los recién llegados se volvieron mayoría, y la prensa local recoge a vecinos de toda la vida que se sienten empujados al margen de su propio pueblo. El grupo de allí además es canónicamente irregular, que no es la posición de este movimiento. Leer St. Marys como la advertencia del enclave, no como el modelo.',
    },
    source: {
      href: 'https://kansasreflector.com/2024/07/11/in-this-kansas-town-an-insular-catholic-sect-leaves-some-residents-feeling-left-out/',
      label: 'Kansas Reflector',
    },
  },
  {
    name: 'Amish daughter settlements',
    where: { en: 'North America, three centuries', es: 'Norteamérica, tres siglos' },
    proves: {
      en: 'Planting new settlements is a solved problem with a written sequence: scouts go first, the character of the place is agreed before any land is looked at, five to ten families commit, and no fewer than three households arrive together, close enough to gather for worship. Most of the chapter’s founding requirements are lifted straight from it.',
      es: 'Plantar asentamientos nuevos es un problema resuelto, con una secuencia escrita: primero van exploradores, se acuerda el carácter del lugar antes de mirar tierra, se comprometen de cinco a diez familias, y llegan juntos no menos de tres hogares, lo bastante cerca para rezar juntos. Casi todos los requisitos de fundación del capítulo vienen de ahí.',
    },
    warns: {
      en: 'Settlements fail, and they fail on character rather than on land. Families who agree about acreage and disagree about how strict the place will be split within a few years. Agreeing the rule first is not bureaucracy; it is the thing that holds.',
      es: 'Los asentamientos fracasan, y fracasan por el carácter, no por la tierra. Las familias que coinciden en los acres y discrepan en qué tan estricto será el lugar se parten en pocos años. Acordar la regla primero no es burocracia; es lo que sostiene.',
    },
    source: { href: 'https://amishamerica.com/mother-daughter-amish-communities/', label: 'Amish America' },
  },
];
