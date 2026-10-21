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
    // No article and no full stop: "in soil" and "in Christ" become the same
    // shape, which is what makes the line land. Spanish keeps its article —
    // "arraigados en tierra" reads as broken Spanish, not as a tighter echo.
    en: 'Rooted in soil, rooted in Christ',
    es: 'Arraigados en la tierra, arraigados en Cristo',
  } satisfies Bilingual,

  // What the movement is for, and what this chapter actually offers toward
  // it. The second sentence names the three things a visitor gets — network,
  // vision, support — rather than restating that the door is wide; the
  // rural-resettlement/first-loaf pairing in `approach` below already does
  // that job, and the page shouldn't make the same move twice.
  //
  // "Here in Central Texas" came out with it. The geography isn't lost: the
  // approach paragraph still ends "across every parish from Austin to San
  // Antonio", which places the chapter more concretely than the region name.
  lede: {
    en: 'The Catholic Land Movement exists to help families resettle onto productive land they own. We offer the network, vision, and support to help make it a reality.',
    es: 'El Movimiento Católico de la Tierra existe para ayudar a las familias a reasentarse en tierra productiva que sea suya. Ofrecemos la red, la visión, y el apoyo para hacerlo realidad.',
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
  // 2. Why this matters — the ache, named before anything is asked
  // ---------------------------------------------------------------------
  whyEyebrow: {
    en: 'WHY THIS MATTERS',
    es: 'POR QUÉ IMPORTA ESTO',
  } satisfies Bilingual,

  why: {
    en: 'Many of us long for work centered in the home, food raised by our community, and parish life where members depend on each other. We miss the simple traditions that make the family what God created it to be: the soul of society.',
    es: 'Muchos de nosotros anhelamos el trabajo centrado en el hogar, la comida cultivada por nuestra comunidad, y una vida parroquial donde los miembros dependan unos de otros. Extrañamos las tradiciones sencillas que hacen de la familia lo que Dios creó que fuera: el alma de la sociedad.',
  } satisfies Bilingual,

  // The second half of "Why this matters": what we take the answer to be.
  // It used to carry its own heading ("Grown, Not Built"); folded in here
  // it reads as the turn from the ache to the response, and the page
  // carries one section where it carried two.
  // The closing sentence names both ends of the range — a rural resettlement,
  // a first loaf — and the ground the chapter actually covers. Since the lede
  // stopped saying "Central Texas", this is now the only place the page tells
  // a visitor where we are, and Austin to San Antonio is the more concrete
  // way to say it anyway.
  approach: {
    en: 'We believe family, faith, and place are gifts we receive, not things we build from nothing. A good culture grows slowly, from tending what we’ve been given. We help households become places that make, grow, and give, not just consume. Whether you’re planning a rural resettlement or simply learning to bake sourdough, we’re here to connect, teach, and build alongside you, across every parish from Austin to San Antonio.',
    es: 'Creemos que la familia, la fe, y el lugar son dones que recibimos, no cosas que hacemos de la nada. Una buena cultura crece despacio, de cuidar lo que nos ha sido dado. Ayudamos a que los hogares se vuelvan lugares que hacen, cultivan, y dan, no sólo que consumen. Ya sea que estés planeando un reasentamiento rural o simplemente aprendiendo a hacer pan de masa madre, estamos aquí para conectar, enseñar, y construir a tu lado, en cada parroquia desde Austin hasta San Antonio.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // Our Roots — folded away under "Why this matters", see RootsNote
  //
  // Answers "where did this come from?" and nothing more: the Church's
  // response to industrialization, the association we descend from, and the
  // blessing. The rest of the line (McNabb, Pius XII, Mater et Magistra,
  // Laudato Si') is on /history, which the link at the end goes to.
  // ---------------------------------------------------------------------
  rootsEyebrow: {
    en: 'OUR ROOTS',
    es: 'NUESTRAS RAÍCES',
  } satisfies Bilingual,

  // Framed as one arc rather than a list of dates: the Industrial Revolution
  // pulls families off the land, Leo XIII answers, Glasgow acts, Pius XI
  // blesses — and we are in another technological revolution now, which is
  // what makes the 2025 blessing more than a formality. The four dated lines
  // that used to sit under this were dropped because the paragraph already
  // names 1891, 1929, 1933 and today.
  roots: {
    en: 'Our movement has a rich and significant role in the Church’s long response to industrialization, carrying forward Pope Leo XIII’s vision of families who own the land they work. When the Industrial Revolution drew families off the land and into factories, Leo answered in Rerum Novarum (1891), urging widespread ownership of productive property. In 1929, Catholics in Glasgow took up that call and formed the first Catholic Land Association. Associations soon spread across Scotland and England, with bishops as their presidents and patrons, and in 1933 Pope Pius XI sent his Apostolic Blessing to their work. Today, as a new technological revolution reshapes work and home once again, Pope Leo XIV has extended that same blessing to the Catholic Land Movement, recognizing us as carrying this work forward.',
    es: 'Nuestro movimiento tiene un papel rico y significativo en la larga respuesta de la Iglesia a la industrialización, y lleva adelante la visión del Papa León XIII de familias que poseen la tierra que trabajan. Cuando la Revolución Industrial sacó a las familias del campo y las llevó a las fábricas, León respondió en Rerum Novarum (1891), instando a una propiedad generalizada de los bienes productivos. En 1929, unos católicos en Glasgow tomaron ese llamado y formaron la primera Asociación Católica de la Tierra. Pronto surgieron asociaciones por toda Escocia e Inglaterra, con obispos como sus presidentes y patronos, y en 1933 el Papa Pío XI envió su Bendición Apostólica a su labor. Hoy, mientras una nueva revolución tecnológica vuelve a transformar el trabajo y el hogar, el Papa León XIV ha extendido esa misma bendición al Movimiento Católico de la Tierra, reconociéndonos como quienes llevan adelante esta obra.',
  } satisfies Bilingual,

  rootsMore: {
    en: 'Read the history and source documents',
    es: 'Lee la historia y los documentos',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 4. Restore the Real — the campaign
  //
  // The national office's framing, put into this chapter's voice. Their deck
  // says "This is not just about moving to the countryside. It's about
  // recovering what was lost", which is the isn't-X-it's-Y shape we cut from
  // the rest of the site, so the same idea is carried by the closing pair of
  // sentences instead.
  //
  // It sits after "Why this matters" and before the pillars on purpose: the
  // ache is named, then the one thing we actually ask for, and only then the
  // four pillars that organise the work.
  // ---------------------------------------------------------------------
  realEyebrow: {
    en: 'THE CAMPAIGN',
    es: 'LA CAMPAÑA',
  } satisfies Bilingual,

  realHeading: {
    en: 'Restore the Real',
    es: 'Restaurar lo Real',
  } satisfies Bilingual,

  realBody: {
    en: 'Most of us already know what we want. A garden that feeds somebody. Neighbors who show up when the work is hard. Children who know where food comes from. The hard part is the first step.',
    es: 'La mayoría ya sabemos lo que queremos. Una huerta que alimente a alguien. Vecinos que llegan cuando el trabajo es duro. Hijos que saben de dónde viene la comida. Lo difícil es el primer paso.',
  } satisfies Bilingual,

  realStep: {
    en: 'So we ask for one real step, taken from where you are, with what you already have. Plant a tree with a neighbor. Share a meal around a fire. Learn to put up what you grow. Land, community, and God come back together this way, slowly, in small things done with great love.',
    es: 'Así que pedimos un paso real, dado desde donde estás, con lo que ya tienes. Planta un árbol con un vecino. Comparte una comida junto al fuego. Aprende a conservar lo que cultivas. La tierra, la comunidad, y Dios se vuelven a unir así, despacio, en cosas pequeñas hechas con gran amor.',
  } satisfies Bilingual,

  realClose: {
    en: 'You do not have to move to the country to begin. You have to begin.',
    es: 'No hace falta mudarse al campo para empezar. Hace falta empezar.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // The case, in numbers — folded away under the campaign, see CaseNote
  // ---------------------------------------------------------------------
  caseEyebrow: {
    en: 'THE CASE, IN NUMBERS',
    es: 'EL CASO, EN CIFRAS',
  } satisfies Bilingual,

  caseLede: {
    en: 'The land consolidated, the household thinned, and the move back has already started.',
    es: 'La tierra se concentró, el hogar se adelgazó, y el regreso ya empezó.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 5. Our Mission
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

  // The way out to /map. It earns its place on phones especially: the
  // homepage map doesn't drag on touch (see ParishMap), so this is how a
  // reader on a phone gets to a map they can actually move around.
  openMap: {
    en: 'Open the full map',
    es: 'Abre el mapa completo',
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
    en: 'No gathering scheduled yet. ',
    es: 'Todavía no hay reunión programada. ',
  } satisfies Bilingual,
  emptyLink: {
    en: 'Join the chapter',
    es: 'Únete al capítulo',
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

/**
 * Three numbers, and only three.
 *
 * The national deck carries more of them. These are the ones that survived
 * being checked against the body that published them, and two came back
 * sharper than the deck had them: the 41% belongs specifically to farms of
 * 2,000 acres or more, and Carsey's own brief says 59% of rural counties
 * rather than 61%. The others in the deck (domestic skills, parental
 * isolation, young adults wanting to move) could not be traced to a source,
 * so they are not on this page.
 */
export const caseFigures: {
  figure: string;
  body: Bilingual;
  source: { href: string; label: string };
}[] = [
  {
    figure: '41%',
    body: {
      en: 'of American cropland is worked by farms of 2,000 acres or more, up from 36% five years earlier. Food has moved off the farm next door and onto operations that no household could start.',
      es: 'de la tierra de cultivo estadounidense la trabajan granjas de 2,000 acres o más, frente al 36% cinco años antes. La comida se fue de la granja del vecino a operaciones que ningún hogar podría empezar.',
    },
    source: {
      href: 'https://ers.usda.gov/amber-waves/2020/february/consolidation-in-u-s-agriculture-continues',
      label: 'USDA Economic Research Service',
    },
  },
  {
    figure: '47%',
    body: {
      en: 'of American households are a married couple, down from 71% in 1970. The household that the Church calls the first cell of society is now a minority of households.',
      es: 'de los hogares estadounidenses son un matrimonio, frente al 71% en 1970. El hogar que la Iglesia llama la primera célula de la sociedad es hoy una minoría de los hogares.',
    },
    source: {
      href: 'https://www.census.gov/newsroom/press-releases/2024/families-living-arrangements.html',
      label: 'U.S. Census Bureau',
    },
  },
  {
    figure: '59%',
    body: {
      en: 'of rural counties gained people through migration from 2020 to 2022. In the decade before, 33% did. Whatever is pulling families back to the country, it is already happening, and it is bigger than this movement.',
      es: 'de los condados rurales ganaron población por migración entre 2020 y 2022. En la década anterior, lo hizo el 33%. Sea lo que sea que está llevando a las familias de vuelta al campo, ya está pasando, y es más grande que este movimiento.',
    },
    source: {
      href: 'https://carsey.unh.edu/publication/migration-continues-sustain-population-gains-rural-america',
      label: 'Carsey School, University of New Hampshire',
    },
  },
];
