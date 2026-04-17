// CLM Central Texas Commons — member fixtures.
//
// IMPORTANT NOTES FOR DEVELOPERS AND REVIEWERS:
//
// 1. All member names, parishes, and personal details are FICTIONAL placeholders
//    based on the anonymized survey responses from the 10 founding members.
//    The chapter steward will replace these with real members before launch.
//
// 2. Spanish strings were authored (not machine-translated) in a Tejano /
//    Mexican-American register. They still require review by a native
//    Spanish-speaking chapter member before production use.
//
// 3. Lines marked with `// REVIEW:` contain phrasing that is particularly
//    worth double-checking with a native speaker — often because the Tejano
//    register differs from neutral Latin American Spanish.
//
// 4. Parish coordinates are approximate and pulled from publicly available
//    parish addresses in the Archdiocese of San Antonio.

import type { Member } from '@/lib/types';

export const members: Member[] = [
  {
    id: 'm-001',
    name: 'María Elena Vásquez',
    parish: 'St. Peter the Apostle, Boerne',
    parishLatLon: [29.7947, -98.7320],
    iconSlug: 'la-milpa',
    offering: {
      en: 'Gardening and permaculture — what actually grows in this soil.',
      es: 'La huerta y la permacultura — lo que de veras crece en esta tierra.',
      // REVIEW: "de veras" is warm Mexican-register; reviewer may prefer "realmente"
    },
    workingOn: {
      en: 'A three-sisters bed with Hill Country–adapted corn varieties.',
      es: 'Una milpa de las tres hermanas con maíz adaptado al Hill Country.',
      // REVIEW: "Hill Country" left in English intentionally — it is a proper name
      // in Texas Spanish usage. Native reviewer should confirm.
    },
    wantsToLearn: {
      en: 'How to extend the growing season into the Texas summer.',
      es: 'Cómo alargar la temporada de cultivo durante el verano texano.',
    },
  },
  {
    id: 'm-002',
    name: 'Thomas Abernathy',
    parish: 'Our Lady of the Atonement, San Antonio',
    parishLatLon: [29.5893, -98.6227],
    iconSlug: 'las-abejas',
    offering: {
      en: 'Beekeeping and honey harvesting — two hives, going on five years.',
      es: 'La apicultura y la cosecha de miel — dos colmenas, llevo casi cinco años.',
    },
    workingOn: {
      en: 'Splitting a strong hive this spring and making jelly from mesquite honey.',
      es: 'Dividir una colmena fuerte esta primavera y hacer jalea de miel de mezquite.',
    },
    wantsToLearn: {
      en: 'Sheep farming and rotational grazing on a small acreage.',
      es: 'La cría de ovejas y el pastoreo rotativo en pocas hectáreas.',
      // REVIEW: "pocas hectáreas" — reviewer should confirm whether "acres" is
      // more natural in Tejano usage ("pocos acres"). Texans use acres; the
      // Spanish convention is hectáreas; this is a real register call.
    },
  },
  {
    id: 'm-003',
    name: 'Clare Ruiz-Donnelly',
    parish: 'St. Mary Magdalen, San Antonio',
    parishLatLon: [29.5234, -98.5617],
    iconSlug: 'la-gallina',
    offering: {
      en: 'Small-producer poultry care and minimizing chicken-keeping effort.',
      es: 'El cuidado de aves para el pequeño productor y cómo simplificar el gallinero.',
    },
    workingOn: {
      en: 'A mobile coop I can move with the garden rotation.',
      es: 'Un gallinero móvil que puedo mover con la rotación de la huerta.',
    },
    wantsToLearn: {
      en: 'Basic veterinary skills for poultry — how to handle injuries.',
      es: 'Habilidades veterinarias básicas para aves — cómo atender heridas.',
    },
  },
  {
    id: 'm-004',
    name: 'Jonathan Pham',
    parish: 'Sacred Heart, New Braunfels',
    parishLatLon: [29.7030, -98.1245],
    iconSlug: 'el-pan',
    offering: {
      en: 'Sourdough, scratch-made Asian cooking, and home-schooling littles.',
      es: 'El pan de masa madre, la cocina asiática desde cero, y la enseñanza en casa para los pequeños.',
      // REVIEW: "desde cero" is the neutral phrase for "from scratch"; some Tejano
      // speakers would say "a la antigua" or "hecho en casa." Native call.
    },
    workingOn: {
      en: 'A reliable starter that survives a Texas summer kitchen.',
      es: 'Una masa madre que aguante el calor de una cocina tejana en verano.',
    },
    wantsToLearn: {
      en: 'Food preservation — canning and fermentation beyond sourdough.',
      es: 'La conservación de alimentos — el enlatado y la fermentación más allá de la masa madre.',
    },
  },
  {
    id: 'm-005',
    name: 'Rebecca Halloran',
    parish: 'St. Peter the Apostle, Boerne',
    parishLatLon: [29.7947, -98.7320],
    iconSlug: 'la-conserva',
    offering: {
      en: 'Jelly-making, farming, and beekeeping — three generations on the same land.',
      es: 'La jalea, la labranza y la apicultura — tres generaciones en la misma tierra.',
      // REVIEW: "labranza" is slightly formal; "el trabajo del campo" or just
      // "el campo" might land warmer. Native call.
    },
    workingOn: {
      en: "Putting up last summer's tomatoes before the new season comes in.",
      es: 'Enlatando los tomates del verano pasado antes de que llegue la nueva cosecha.',
    },
    wantsToLearn: {
      en: 'Carpentry and construction — I want to build my own greenhouse.',
      es: 'La carpintería y la construcción — quiero construir mi propio invernadero.',
    },
  },
  {
    id: 'm-006',
    name: "Michael O'Brien",
    parish: 'St. Anthony de Padua, San Antonio',
    parishLatLon: [29.4246, -98.4936],
    iconSlug: 'la-cisterna',
    offering: {
      en: 'Rainwater collection, watershed engineering, and contingency planning.',
      es: 'La captación de agua de lluvia, la ingeniería de cuencas, y la planificación para contingencias.',
      // REVIEW: "contingencias" is correct but bureaucratic. "planes para cuando
      // las cosas salen mal" is warmer. Your call which register fits the chapter.
    },
    workingOn: {
      en: 'A 5,000-gallon cistern and first-flush diverter for the homestead.',
      es: 'Una cisterna de 5,000 galones con desviador de primera descarga para el rancho.',
      // REVIEW: "primera descarga" for first-flush is a literal translation;
      // there may be a more established Spanish term among Texas rainwater
      // practitioners. Worth checking.
    },
    wantsToLearn: {
      en: 'Becoming more regenerative — how to schedule the work of a homestead well.',
      es: 'Ser más regenerativo — cómo organizar bien el trabajo del rancho.',
    },
  },
  {
    id: 'm-007',
    name: 'Daniel Weinreb',
    parish: 'Holy Trinity, Atascosa',
    parishLatLon: [29.2393, -98.7386],
    iconSlug: 'la-azuela',
    offering: {
      en: 'Building and woodwork — I come to a workshop with a full truck.',
      es: 'La construcción y la carpintería — llego al taller con la camioneta llena.',
      // REVIEW: "camioneta" is the right Tejano word for truck/pickup. Good.
    },
    workingOn: {
      en: 'Timber-frame chicken coops for three chapter members this spring.',
      es: 'Gallineros de madera en estructura de marco para tres miembros del capítulo esta primavera.',
    },
    wantsToLearn: {
      en: 'Scratch-cooked meals from what grows in my garden.',
      es: 'Cocinar comidas hechas en casa con lo que crece en mi huerta.',
    },
  },
  {
    id: 'm-008',
    name: 'Susana Martínez-Reilly',
    parish: 'Mission San José, San Antonio',
    parishLatLon: [29.3267, -98.4778],
    iconSlug: 'el-telar',
    offering: {
      en: 'Cooking from the garden, bone broth, and mending — slow kitchen work.',
      es: 'La cocina de la huerta, el caldo de hueso, y el remiendo — el trabajo lento de la cocina.',
      // REVIEW: "remiendo" is the right word for mending. Good.
    },
    workingOn: {
      en: 'A mending circle in my parish hall, once a month after Mass.',
      es: 'Un círculo de remiendo en el salón parroquial, una vez al mes después de la Misa.',
    },
    wantsToLearn: {
      en: 'Homemade cleaners and detergents — getting chemicals out of the house.',
      es: 'Los limpiadores y detergentes caseros — sacar los químicos de la casa.',
    },
  },
  {
    id: 'm-009',
    name: "Catherine Okonkwo",
    parish: "St. Mary's, Fredericksburg",
    parishLatLon: [30.2752, -98.8720],
    iconSlug: 'el-jabon',
    offering: {
      en: 'Hot-process soap making — real soap from tallow, lye, and herbs.',
      es: 'El jabón de proceso en caliente — jabón de verdad, con sebo, lejía, y yerbas.',
      // REVIEW: "lejía" is the correct word for lye. "sebo" for tallow. Good.
    },
    workingOn: {
      en: 'A mesquite-ash lye batch, the old way, once I source clean ash.',
      es: 'Una hornada con lejía de ceniza de mezquite, a la antigua, cuando consiga ceniza limpia.',
      // REVIEW: "hornada" is an old-school word for "batch" that fits the register
      // beautifully. Keep it if reviewer agrees.
    },
    wantsToLearn: {
      en: 'How to make a home-scale textile from fleece to finished cloth.',
      es: 'Cómo hacer una tela en casa, desde la lana hasta la prenda terminada.',
    },
  },
  {
    id: 'm-010',
    name: 'Paul Eagan',
    parish: 'St. Anthony de Padua, San Antonio',
    parishLatLon: [29.4246, -98.4936],
    iconSlug: 'las-yerbas',
    offering: {
      en: "I'm new to homesteading — coffee roasting and raw kefir are what I have.",
      es: 'Soy nuevo en esto del rancho — el tostado de café y el kéfir crudo es lo que tengo.',
      // REVIEW: "en esto del rancho" is warm and real. Native call on whether
      // "rancho" or "la vida en el campo" is the right frame for homesteading.
    },
    workingOn: {
      en: "Learning enough to be useful — showing up to everyone else's work.",
      es: 'Aprender lo suficiente para servir — presentándome al trabajo de los demás.',
    },
    wantsToLearn: {
      en: 'Natural medicine and basic herb knowledge — how to care for my family well.',
      es: 'La medicina natural y las yerbas básicas — cómo cuidar bien a mi familia.',
    },
  },
];
