// src/content/home.ts
// The homepage's words, in one place.
//
// This sits outside pages/ for a reason: `vite/prerender-home.ts` imports it
// to write a static copy of the page's opening into index.html at build time,
// so a crawler, a link preview, or an agent fetching the site sees real
// sentences instead of an empty <div id="root">. That plugin runs inside
// Vite's own esbuild bundle, outside the app's module graph, where a React
// component can't be imported and the `@/` alias doesn't resolve — hence a
// plain data module, imported relatively, read by both sides.
//
// Keep this file free of JSX, of `@/`, and of anything that touches the DOM.

import type { Bilingual } from '../lib/types';

export const homeCopy = {
  // ---------------------------------------------------------------------
  // 1. Hero
  // ---------------------------------------------------------------------
  heading: {
    en: 'We Are the Catholic Land Movement',
    es: 'Somos el Movimiento Católico de la Tierra',
  } satisfies Bilingual,

  tagline: {
    en: 'Ordinary Catholic households, becoming producers — together.',
    es: 'Familias católicas comunes, haciéndose productoras — juntas.',
  } satisfies Bilingual,

  // What the movement is for, and how wide the door is. "Wherever you are"
  // is left unexplained on purpose: the rural-resettlement/first-loaf pairing
  // that used to finish this sentence now closes `approach` below, and the
  // page shouldn't make the same move twice.
  lede: {
    en: 'The Catholic Land Movement exists to help Catholics resettle onto productive land they own. Here in Central Texas, that work starts wherever you are.',
    es: 'El Movimiento Católico de la Tierra existe para ayudar a los católicos a reasentarse en tierra productiva que sea suya. Aquí en el centro de Tejas, ese trabajo empieza donde estés.',
  } satisfies Bilingual,

  ctaGathering: {
    en: 'Come to a gathering',
    es: 'Ven a una reunión',
  } satisfies Bilingual,

  ctaJoin: {
    en: 'Join the chapter',
    es: 'Únete al capítulo',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 2. Why it matters — the ache, named before anything is asked
  // ---------------------------------------------------------------------
  whyEyebrow: {
    en: 'WHY IT MATTERS',
    es: 'POR QUÉ IMPORTA',
  } satisfies Bilingual,

  why: {
    en: 'Many of us long for work centered in the home, food raised by neighbors, and parishes where people actually need each other. We miss the simple traditions that make the family what God created it to be: the heart of society.',
    es: 'Muchos de nosotros anhelamos el trabajo centrado en el hogar, la comida cultivada por los vecinos, y parroquias donde la gente de veras se necesita. Extrañamos las tradiciones sencillas que hacen de la familia lo que Dios creó que fuera: el corazón de la sociedad.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 3. Approach
  //
  // The one section that can leave: if the page ever runs long, this moves
  // to /vision, which already carries the deeper exposition of the pillars.
  // ---------------------------------------------------------------------
  approachHeading: {
    en: 'Grown, Not Built',
    es: 'Crecido, no construido',
  } satisfies Bilingual,

  // The closing sentence is the chapter's older one, restored: it names both
  // ends of the range (a rural resettlement, a first loaf) and the ground the
  // chapter actually covers. "Central Texas" in the lede is the shorthand;
  // Austin to San Antonio is the thing a visitor can place themselves inside.
  approach: {
    en: 'Family, faith, and place are gifts we receive, not things we build from a plan. A good culture grows slowly, from tending what we’ve been given. We help households become places that make, grow, and give, not just consume. Whether you’re planning a rural resettlement or simply learning to bake sourdough, we’re here to connect, teach, and build alongside you — across every parish from Austin to San Antonio.',
    es: 'La familia, la fe, y el lugar son dones que recibimos, no cosas que construimos según un plan. Una buena cultura crece despacio, de cuidar lo que nos ha sido dado. Ayudamos a que los hogares se vuelvan lugares que hacen, cultivan, y dan, no sólo que consumen. Ya sea que estés planeando un reasentamiento rural o simplemente aprendiendo a hacer pan de masa madre, estamos aquí para conectar, enseñar, y construir a tu lado — en cada parroquia desde Austin hasta San Antonio.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 4. Our Mission
  // ---------------------------------------------------------------------
  pillarsEyebrow: {
    en: 'OUR MISSION',
    es: 'NUESTRA MISIÓN',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 5. Meet your neighbors
  // ---------------------------------------------------------------------
  mapEyebrow: {
    en: 'MEET YOUR NEIGHBORS',
    es: 'TUS VECINOS',
  } satisfies Bilingual,

  blessing: {
    en: 'Recognized and blessed by Pope Leo XIV, November 2025.',
    es: 'Reconocido y bendecido por el Papa León XIV, noviembre de 2025.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 6. Next gathering
  // ---------------------------------------------------------------------
  gatheringEyebrow: {
    en: 'NEXT GATHERING',
    es: 'PRÓXIMA REUNIÓN',
  } satisfies Bilingual,

  allGatherings: {
    en: 'All workshops',
    es: 'Todos los talleres',
  } satisfies Bilingual,

  // Already said they're coming. Shown instead of the RSVP button, so a
  // member who scrolls past knows they're already on the list.
  coming: {
    en: 'You’re on the list',
    es: 'Estás en la lista',
  } satisfies Bilingual,

  // The empty state, split so "join the chapter" can be the link it wants to
  // be rather than a second button repeating the sentence underneath it.
  emptyBefore: {
    en: 'No gathering scheduled yet — ',
    es: 'Todavía no hay reunión programada — ',
  } satisfies Bilingual,
  emptyLink: {
    en: 'join the chapter',
    es: 'únete al capítulo',
  } satisfies Bilingual,
  emptyAfter: {
    en: ' to hear first.',
    es: ' para ser el primero en saberlo.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 7. The patron
  // ---------------------------------------------------------------------
  patronLine: {
    en: 'A hired hand outside Madrid who went to Mass before the fields and prayed behind the plough. The chapter has placed its work under his care.',
    es: 'Un jornalero de las afueras de Madrid que iba a Misa antes de los campos y rezaba tras el arado. El capítulo ha puesto su labor bajo su cuidado.',
  } satisfies Bilingual,

  patronMore: {
    en: 'His life, and the prayer',
    es: 'Su vida, y la oración',
  } satisfies Bilingual,
};

// The four pillars — one icon, one name, one sentence each. /vision owns the
// field-manual exposition; this is the introduction, and each line has to
// survive being read on its own.
//
// `key` indexes the bespoke pillar artwork in Home.tsx. The icons can't live
// here: they're `?raw` SVG imports through the `@/` alias, neither of which
// the prerender bundle can resolve.
export const pillars: {
  key: 'resettlement' | 'education' | 'fellowship' | 'glorification';
  name: Bilingual;
  body: Bilingual;
}[] = [
  {
    key: 'resettlement',
    name: { en: 'Resettlement', es: 'Reasentamiento' },
    body: {
      en: 'Putting working land back in the hands of Catholic families, whether a rural homestead or a productive home in town.',
      es: 'Poner tierra de trabajo de nuevo en manos de familias católicas, sea una granja en el campo o un hogar productivo en la ciudad.',
    },
  },
  {
    key: 'education',
    name: { en: 'Education', es: 'Educación' },
    body: {
      en: 'Teaching the domestic order, farm skills, and craft traditions a Catholic homestead needs.',
      es: 'Enseñar el orden doméstico, los oficios del campo, y las tradiciones artesanales que un hogar católico necesita.',
    },
  },
  {
    key: 'fellowship',
    name: { en: 'Fellowship', es: 'Compañerismo' },
    body: {
      en: 'Connecting established homesteads with families just starting, through shared skills, work, and prayer.',
      es: 'Conectar los hogares ya establecidos con las familias que empiezan, por medio de oficios, trabajo, y oración compartidos.',
    },
  },
  {
    key: 'glorification',
    name: { en: 'Glorification', es: 'Glorificación' },
    body: {
      en: 'Bringing the Mass, prayer, and the Church’s seasons back into agrarian life, and receiving the fruits of our labor as gifts from God.',
      es: 'Devolver la Misa, la oración, y las estaciones de la Iglesia a la vida agraria, y recibir los frutos de nuestro trabajo como dones de Dios.',
    },
  },
];
