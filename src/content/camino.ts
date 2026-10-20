// src/content/camino.ts
// The corridor: El Camino Real de los Tejas, read as a string of stages, and
// the village plan hung on it.
//
// COORDINATES are geocoded against OpenStreetMap, not estimated. Eighteen
// of the twenty resolved to the street address or the named site. Two carry
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
    name: { en: 'San Antonio', es: 'San Antonio' },
    miles: 41,
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
  {
    n: 17, stage: 'missions-sa', at: [29.4243, -98.4942], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'San Fernando Cathedral', town: 'San Antonio, TX',
    address: '115 Main Plaza, San Antonio, TX 78205',
  },
  {
    n: 18, stage: 'missions-sa', at: [29.3898, -98.4917], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'Mission Concepción', town: 'San Antonio, TX',
    address: '807 Mission Rd, San Antonio, TX 78210',
  },
  {
    n: 19, stage: 'missions-sa', at: [29.3603, -98.4789], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
    name: 'Mission San José', town: 'San Antonio, TX',
    address: '6701 San Jose Dr, San Antonio, TX 78214',
  },
  {
    n: 20, stage: 'missions-sa', at: [29.3182, -98.4512], fix: 'address', kind: 'parish',
    county: 'Bexar County', diocese: 'San Antonio',
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
      en: 'Stops 1\u20133 are in the Diocese of Alexandria in Louisiana. Stops 4\u20139 are in the Diocese of Tyler, which holds San Augustine, Nacogdoches, Cherokee and Houston counties. Stops 10\u201316 are in the Diocese of Austin, which holds Brazos, Burleson, Milam, Bastrop and Hays. The last stops are in the Archdiocese of San Antonio.',
      es: 'Las paradas 1\u20133 est\u00e1n en la Di\u00f3cesis de Alexandria, en Luisiana. Las paradas 4\u20139 est\u00e1n en la Di\u00f3cesis de Tyler, que abarca los condados de San Augustine, Nacogdoches, Cherokee y Houston. Las paradas 10\u201316 est\u00e1n en la Di\u00f3cesis de Austin, que abarca Brazos, Burleson, Milam, Bastrop y Hays. Las \u00faltimas est\u00e1n en la Arquidi\u00f3cesis de San Antonio.',
    },
    soWhat: {
      en: 'Four bishops, two states, two ecclesiastical provinces. No single chancery can approve this road, and no single one can stop it either. Start where the chapter already has a relationship and let the next diocese see a working village rather than a proposal.',
      es: 'Cuatro obispos, dos estados, dos provincias eclesi\u00e1sticas. Ninguna canciller\u00eda sola puede aprobar este camino, y ninguna sola puede detenerlo. Empezar donde el cap\u00edtulo ya tiene relaci\u00f3n y dejar que la pr\u00f3xima di\u00f3cesis vea una aldea funcionando, no una propuesta.',
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
    figure: '450',
    label: { en: 'households', es: 'hogares' },
    body: {
      en: 'Fifteen villages of thirty families: about 2,250 people and some 1,350 children raised on farms, in parish schools, and in trades. Fifteen, not twenty, because only fifteen of the twenty stops have a church. The other five are state historic sites and a crossroads, and requirement P1 will not let a village start where there is no parish to join.',
      es: 'Quince aldeas de treinta familias: unas 2,250 personas y unos 1,350 niños criados en granjas, escuelas parroquiales y oficios. Quince, no veinte, porque sólo quince de las veinte paradas tienen iglesia. Las otras cinco son sitios históricos estatales y un cruce de caminos, y el requisito P1 no deja empezar una aldea donde no hay parroquia a la cual unirse.',
    },
    basis: {
      en: 'Five people a household, against a US average of 2.5. A bet on large families, and the figure most worth stating as a bet. The village count is a hard ceiling until a new parish or mission opens somewhere along the five stops that have none.',
      es: 'Cinco personas por hogar, frente a un promedio de 2.5 en EE. UU. Una apuesta por familias grandes, y la cifra que más conviene declarar como apuesta. El número de aldeas es un techo duro hasta que abra una parroquia o misión en alguna de las cinco paradas que no tienen ninguna.',
    },
  },
  {
    id: 'I2',
    figure: '2 a year',
    label: { en: 'families a village', es: 'familias por aldea' },
    body: {
      en: 'This is the growth rate the plan should assume. Clear Creek Abbey in Oklahoma, the strongest American precedent, drew roughly thirty-five families in its first decade and dozens since — on the order of two a year, with a monastery and a Latin Mass as the draw. The corridor gets its speed from running twenty villages at once, not from hurrying one.',
      es: 'Este es el ritmo de crecimiento que el plan debe suponer. La abadía de Clear Creek, en Oklahoma, el precedente estadounidense más fuerte, atrajo unas treinta y cinco familias en su primera década y decenas desde entonces: del orden de dos al año, con un monasterio y la Misa tradicional como atractivo. El corredor gana velocidad llevando veinte aldeas a la vez, no apurando una.',
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
      en: 'Four companies hold about 80% of American beef processing and only about 5% sits in small and very small plants. Ranchers drive one to two hours to reach a USDA-inspected floor, and in bad years book a year ahead. A village cannot build one alone; twenty villages can, and every one of them needs it. This is the clearest candidate for the first thing the corridor builds together, and the USDA is currently putting money toward exactly this gap.',
      es: 'Cuatro empresas tienen cerca del 80% del sacrificio de res en Estados Unidos y s\u00f3lo un 5% est\u00e1 en plantas peque\u00f1as. Los ganaderos manejan una o dos horas para llegar a una planta con inspecci\u00f3n federal, y en a\u00f1os malos reservan con un a\u00f1o de anticipaci\u00f3n. Una aldea no puede construir una sola; veinte s\u00ed, y todas la necesitan. Es el candidato m\u00e1s claro para lo primero que el corredor construya junto, y el USDA est\u00e1 poniendo dinero justo en ese hueco.',
    },
    basis: {
      en: 'It is also principle 4 at corridor scale: a human need turned into an industry, taken back. And it is the anchor employer requirement M1 with a specific business attached.',
      es: 'Es tambi\u00e9n el principio 4 a escala de corredor: una necesidad humana vuelta industria, recuperada. Y es el requisito M1 del empleador ancla con un negocio concreto detr\u00e1s.',
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
      en: 'And $11,369 through the Gulf Coast–Brazos Bottom, which is the Bryan and Caldwell stretch of this road and the most expensive rural market in the state. Twenty thousand acres is therefore roughly $96M at the state average and over $200M through the Bottom. Buying that outright is not the plan and never could be.',
      es: 'Y $11,369 en la región Gulf Coast–Brazos Bottom, que es el tramo de Bryan y Caldwell de este camino y el mercado rural más caro del estado. Veinte mil acres son entonces unos $96M al promedio estatal y más de $200M por el Bottom. Comprarlo de golpe no es el plan y nunca podría serlo.',
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
      es: 'Tejas grava la tierra abierta que califica por lo que produce y no por lo que valdr\u00eda en venta, y el ahorro suele ser del 90% o m\u00e1s del valor gravable. Pero la tierra debe haber estado en uso agr\u00edcola cinco de los siete a\u00f1os anteriores. La tierra ociosa pierde la valuaci\u00f3n y el fideicomiso paga completo durante a\u00f1os. As\u00ed que comprar tierra en trabajo, y hacer del uso agr\u00edcola continuo una condici\u00f3n de cada arriendo.',
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
      en: 'It took a quarter of a century, with a monastery as the draw. Two families a year is the real rate. Any plan promising forty a year across a corridor is promising twenty Clear Creeks running at once.',
      es: 'Tardó un cuarto de siglo, con un monasterio como atractivo. Dos familias al año es el ritmo real. Cualquier plan que prometa cuarenta al año en un corredor está prometiendo veinte Clear Creeks a la vez.',
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
      en: 'It is also the clearest picture of the failure mode. The newcomers became a majority and reporting from the town records longtime residents who feel pushed to the edge of their own place. The group there is canonically irregular besides, which is not this movement\u2019s position. Read St. Marys as the enclave warning, not as the model.',
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
      en: 'Planting new settlements is a solved problem with a written sequence: scouts go first, the character of the place is agreed before any land is looked at, five to ten families commit, and no fewer than three households arrive together, close enough to gather for worship. Most of the chapter\u2019s founding requirements are lifted straight from it.',
      es: 'Plantar asentamientos nuevos es un problema resuelto, con una secuencia escrita: primero van exploradores, se acuerda el carácter del lugar antes de mirar tierra, se comprometen de cinco a diez familias, y llegan juntos no menos de tres hogares, lo bastante cerca para rezar juntos. Casi todos los requisitos de fundación del capítulo vienen de ahí.',
    },
    warns: {
      en: 'Settlements fail, and they fail on character rather than on land. Families who agree about acreage and disagree about how strict the place will be split within a few years. Agreeing the rule first is not bureaucracy; it is the thing that holds.',
      es: 'Los asentamientos fracasan, y fracasan por el carácter, no por la tierra. Las familias que coinciden en los acres y discrepan en qué tan estricto será el lugar se parten en pocos años. Acordar la regla primero no es burocracia; es lo que sostiene.',
    },
    source: { href: 'https://amishamerica.com/mother-daughter-amish-communities/', label: 'Amish America' },
  },
];
