// UI strings — bilingual labels and navigation.
// All authored in both languages from the first commit.
// Spanish strings are in a Tejano / Mexican-American register and pending
// review by a native-speaking chapter member.

export const uiStrings = {
  nav: {
    home:         { en: 'Home',         es: 'Inicio' },
    offerings:    { en: 'Offerings',    es: 'Ofrendas' },
    workshops:    { en: 'Workshops',    es: 'Talleres' },
    witness:      { en: 'Witness',      es: 'Testimonio' },
    patron:       { en: 'Patron',       es: 'Santo Patrón' },
    welcome:      { en: 'Welcome',      es: 'Bienvenido' },
  },
  home: {
    tagline: {
      en: 'Ordinary Catholic households, becoming producers — together, in Central Texas.',
      es: 'Familias católicas comunes, haciéndose productoras — juntas, en el centro de Tejas.',
      // REVIEW: "Tejas" vs "Texas" — Tejano Spanish uses both. "Tejas" is the
      // older Spanish-colonial form and fits this chapter's register. Reviewer
      // should confirm.
    },
    sowerCharism:     { en: 'The Sower — Education',         es: 'El Sembrador — La Educación' },
    communityCharism: { en: 'The Community — Fellowship',    es: 'La Comunidad — La Hermandad' },
    stewardCharism:   { en: 'The Steward — Resettlement',    es: 'El Mayordomo — El Asentamiento' },
    monstranceCharism:{ en: 'The Monstrance — Glorification',es: 'La Custodia — La Glorificación' },
    chapterMap:       { en: 'The chapter, on the land',       es: 'El capítulo, en la tierra' },
    latestWitness:    { en: 'Latest witness',                 es: 'Último testimonio' },
    seeAll:           { en: 'See all',                        es: 'Ver todo' },
  },
  profile: {
    offeringLabel: {
      en: 'What God has put in my hands',
      es: 'Lo que Dios ha puesto en mis manos',
    },
    workingOnLabel: {
      en: "What I'm working on",
      es: 'En lo que estoy trabajando',
    },
    wantsToLearnLabel: {
      en: 'What I want to learn',
      es: 'Lo que quiero aprender',
    },
    upcomingWorkshops: {
      en: "Upcoming workshops I'm hosting",
      es: 'Talleres que ofreceré próximamente',
    },
  },
  onboarding: {
    heading: {
      en: 'Welcome — three questions',
      es: 'Bienvenido — tres preguntas',
    },
    q1:     { en: 'What has God put in your hands?', es: '¿Qué ha puesto Dios en tus manos?' },
    q1Help: { en: 'One skill or resource you could share with another family.', es: 'Una habilidad o un recurso que podrías compartir con otra familia.' },
    q2:     { en: 'What are you ready to learn?', es: '¿Qué estás listo para aprender?' },
    q2Help: { en: 'One thing you want a teacher for — today, not someday.', es: 'Una cosa para la que quieres un maestro — hoy, no algún día.' },
    q3:     { en: 'Where do you worship?', es: '¿Dónde adoras?' },
    q3Help: { en: 'Your parish — this is how we find your neighbors.', es: 'Tu parroquia — así es como encontramos a tus vecinos.' },
    continue: { en: 'Continue', es: 'Continuar' },
  },
  workshop: {
    hostedBy:  { en: 'Hosted by',      es: 'Ofrecido por' },
    location:  { en: 'Location',       es: 'Lugar' },
    rsvp:      { en: "I'll be there",  es: 'Allí estaré' },
    rsvpCount: { en: 'coming',         es: 'asistentes' },
    upcoming:  { en: 'Upcoming gatherings', es: 'Próximas reuniones' },
  },
  witness: {
    heading: { en: 'The Witness — what we have done together', es: 'El Testimonio — lo que hemos hecho juntos' },
  },
  ofrendas: {
    heading:    { en: 'The Offering — our founding members', es: 'La Ofrenda — nuestros miembros fundadores' },
    parishLabel:{ en: 'Parish', es: 'Parroquia' },
  },
  footer: {
    underPatronage: {
      en: 'Under the patronage of San Isidro Labrador',
      es: 'Bajo el patrocinio de San Isidro Labrador',
    },
    nationalLink: {
      en: 'Part of the Catholic Land Movement',
      es: 'Parte del Movimiento Católico de la Tierra',
    },
    sealLine: { en: 'CLM CENTRAL TEXAS · SAN ISIDRO LABRADOR · AD 2026', es: 'CLM CENTRO DE TEJAS · SAN ISIDRO LABRADOR · AD 2026' },
  },
  patron: {
    heading: {
      en: 'San Isidro Labrador — our patron',
      es: 'San Isidro Labrador — nuestro santo patrón',
    },
    feastDay: { en: 'Feast day: May 15', es: 'Fiesta: el 15 de mayo' },
    story: {
      en: 'San Isidro was a 12th-century Spanish farmer who prayed constantly while he worked. He is the patron of farmers, of rural communities, and of the quiet sanctification of ordinary labor. The chapter gathers every May 15 for the blessing of fields, seeds, and tools.',
      es: 'San Isidro fue un labrador español del siglo XII que oraba sin cesar mientras trabajaba. Es el santo patrón de los labradores, de las comunidades rurales, y de la santificación silenciosa del trabajo ordinario. El capítulo se reúne cada 15 de mayo para la bendición del campo, de las semillas, y de las herramientas.',
    },
    prayer: {
      en: 'O God, through the intercession of San Isidro the farmer, grant that we may overcome all feelings of pride, and always serve you with that humility which pleases you, through his merits and example. Amen.',
      es: 'Oh Dios, por la intercesión de San Isidro labrador, concédenos vencer todo sentimiento de soberbia, y servirte siempre con esa humildad que te agrada, por sus méritos y ejemplo. Amén.',
    },
  },
  common: {
    backToOfrendas: { en: '← All offerings', es: '← Todas las ofrendas' },
    backToTalleres: { en: '← All workshops', es: '← Todos los talleres' },
    members:        { en: 'members',         es: 'miembros' },
    member:         { en: 'member',          es: 'miembro' },
  },
};

export type UiStrings = typeof uiStrings;
