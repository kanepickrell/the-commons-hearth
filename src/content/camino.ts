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
