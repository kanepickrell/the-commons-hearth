// UI strings — bilingual labels and navigation.
// All authored in both languages from the first commit.
// Spanish strings are in a Tejano / Mexican-American register and pending
// review by a native-speaking chapter member.

export const uiStrings = {
  nav: {
    home:         { en: 'Home',         es: 'Inicio' },
    vision:       { en: 'Vision',       es: 'Visión' },
    participate:  { en: 'Participate',  es: 'Participar' },
    workshops:    { en: 'Workshops',    es: 'Talleres' },
    witness:      { en: 'Witness',      es: 'Testimonio' },
    patron:       { en: 'Patron',       es: 'Santo Patrón' },
    resources:    { en: 'Resources',    es: 'Recursos' },
    welcome:      { en: 'Welcome',      es: 'Bienvenido' },
  },
  home: {
    tagline: {
      en: 'Ordinary Catholic households, becoming producers — together, in Central Texas.',
      es: 'Familias católicas comunes, haciéndose productoras — juntas, en el centro de Tejas.',
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
      en: 'Bio',
      es: 'Biografía',
    },
    workingOnLabel: {
      en: 'What I am building',
      es: 'Lo que estoy construyendo',
    },
    wantsToLearnLabel: {
      en: 'What I want to learn',
      es: 'Lo que quiero aprender',
    },
    sharingLabel: {
      en: 'What I am sharing',
      es: 'Lo que estoy compartiendo',
    },
    teachingLabel: {
      en: 'What I am teaching',
      es: 'Lo que estoy enseñando',
    },
    upcomingWorkshops: {
      en: "Upcoming gatherings I'm hosting",
      es: 'Reuniones que ofreceré próximamente',
    },
    pastWorkshops: {
      en: "Past gatherings I've hosted",
      es: 'Reuniones que he ofrecido',
    },
    hostRsvpSummary: {
      en: "Who's coming to your gatherings",
      es: 'Quién viene a tus reuniones',
    },
    parish: {
      en: 'Parish',
      es: 'Parroquia',
    },
  },
  onboarding: {
    heading: {
      en: 'Welcome — a few questions',
      es: 'Bienvenido — unas preguntas',
    },
    q1:     { en: 'What has God put in your hands?', es: '¿Qué ha puesto Dios en tus manos?' },
    q1Help: { en: 'Tell us a little about yourself. One paragraph is plenty.', es: 'Cuéntanos un poco de ti. Un párrafo es suficiente.' },
    qBuilding:     { en: 'What are you building right now?', es: '¿Qué estás construyendo ahora?' },
    qBuildingHelp: {
      en: 'A current project, a practice, a habit. Keep it concrete.',
      es: 'Un proyecto, una práctica, un hábito actual. Algo concreto.',
    },
    qLearning:     { en: 'What do you want to learn?', es: '¿Qué quieres aprender?' },
    qLearningHelp: {
      en: 'One thing you want a teacher for — today, not someday.',
      es: 'Una cosa para la que quieres un maestro — hoy, no algún día.',
    },
    q3:     { en: 'Where do you worship?', es: '¿Dónde adoras?' },
    q3Help: { en: 'Your parish — this is how we find your neighbors.', es: 'Tu parroquia — así es como encontramos a tus vecinos.' },
    qCraftsHeading: { en: 'Your crafts', es: 'Tus oficios' },
    qCraftsHelp: {
      en: 'Tap any skill you can teach. Leave them all unlit — you can add them later.',
      es: 'Toca cualquier oficio que puedas enseñar. Puedes dejarlos todos apagados y agregarlos después.',
    },
    continue: { en: 'Continue', es: 'Continuar' },
  },
  workshop: {
    hostedBy:  { en: 'Hosted by',      es: 'Ofrecido por' },
    location:  { en: 'Location',       es: 'Lugar' },
    rsvp:      { en: "I'll be there",  es: 'Allí estaré' },
    logInToRsvp: { en: 'Log In To RSVP', es: 'Inicia sesión para confirmar' },
    rsvpCount: { en: 'coming',         es: 'asistentes' },
    upcoming:  { en: 'Upcoming gatherings', es: 'Próximas reuniones' },
    whosComing:{ en: "Who's coming",       es: 'Quién viene' },
    memberOnlyMap: {
      en: 'Sign in as an approved member to see gathering locations on the map.',
      es: 'Inicia sesión como miembro aprobado para ver los lugares de las reuniones en el mapa.',
    },
  },
  rsvp: {
    modalTitle: {
      en: "What are you bringing?",
      es: '¿Qué vas a traer?',
    },
    modalIntro: {
      en: 'Every gathering is a chance to share. Most bring their time — that\u2019s enough. If you can bring more, tell the host.',
      es: 'Cada reunión es una oportunidad para compartir. La mayoría trae su tiempo — eso basta. Si puedes traer más, dile al anfitrión.',
    },
    noteLabel: {
      en: 'A note for the host (optional)',
      es: 'Una nota para el anfitrión (opcional)',
    },
    notePlaceholder: {
      en: 'e.g. bringing a tomato pie; can show how to graft rootstock',
      es: 'ej. llevo un pay de tomate; puedo enseñar cómo injertar',
    },
    submit: { en: 'Confirm',   es: 'Confirmar' },
    cancel: { en: 'Cancel',    es: 'Cancelar' },
    submitting: { en: 'Sending…', es: 'Enviando…' },
    confirmed: {
      en: "You're on the list. Check your email for the details.",
      es: 'Estás en la lista. Revisa tu correo para los detalles.',
    },
    alreadyRsvpd: {
      en: 'You have already RSVP\u2019d for this gathering.',
      es: 'Ya confirmaste tu asistencia a esta reunión.',
    },
    needsApproval: {
      en: 'Your profile is awaiting steward approval before you can RSVP.',
      es: 'Tu perfil espera la aprobación del mayordomo antes de confirmar.',
    },
    signInFirst: {
      en: 'Sign in to RSVP.',
      es: 'Inicia sesión para confirmar.',
    },
  },
  contribution: {
    time:      { en: 'My time',       es: 'Mi tiempo' },
    skill:     { en: 'A skill',       es: 'Una habilidad' },
    food:      { en: 'Food',          es: 'Comida' },
    tools:     { en: 'Tools',         es: 'Herramientas' },
    materials: { en: 'Materials',     es: 'Materiales' },
    other:     { en: 'Something else',es: 'Otra cosa' },
    bringing:  { en: 'bringing',      es: 'trayendo' },
  },
  vision: {
    backLink: { en: '← Vision', es: '← Visión' },
  },
  footer: {
    underPatronage: {
      en: 'Under the patronage of San Isidro Labrador',
      es: 'Bajo el patrocinio de San Isidro Labrador',
    },
    nationalLink: {
      en: 'We operate under the national Catholic Land Movement organization',
      es: 'Parte del Movimiento Católico de la Tierra',
    },
    sealLine: { en: 'CLM CENTRAL TEXAS · SAN ISIDRO LABRADOR · AD 2026', es: 'CLM CENTRO DE TEJAS · SAN ISIDRO LABRADOR · AD 2026' },
    reachUs: { en: 'Still Have Questions?', es: 'Escríbenos' },
  },
  contact: {
    modalTitle: { en: 'Reach the chapter', es: 'Escríbele al capítulo' },
    modalIntro: {
      en: 'A question, a parish that wants to partner, or a corner of Texas hoping to start its own chapter — write to us and a steward will reply.',
      es: 'Una pregunta, una parroquia que quiere colaborar, o un rincón de Tejas que quiere abrir su propio capítulo — escríbenos y un mayordomo te responderá.',
    },
    nameLabel:        { en: 'Your name', es: 'Tu nombre' },
    namePlaceholder:  { en: 'Maria Treviño', es: 'María Treviño' },
    emailLabel:       { en: 'Your email', es: 'Tu correo' },
    emailPlaceholder: { en: 'you@example.com', es: 'tu@ejemplo.com' },
    categoryLabel:    { en: 'What is this about?', es: '¿De qué se trata?' },
    categories: {
      general: { en: 'General question',   es: 'Pregunta general' },
      parish:  { en: 'Parish partnership', es: 'Colaboración parroquial' },
      chapter: { en: 'Start a chapter',    es: 'Iniciar un capítulo' },
      press:   { en: 'Press',              es: 'Prensa' },
    },
    messageLabel:       { en: 'Your message', es: 'Tu mensaje' },
    messagePlaceholder: {
      en: 'Tell us a little about what you have in mind…',
      es: 'Cuéntanos un poco sobre lo que tienes en mente…',
    },
    submit:     { en: 'Send',     es: 'Enviar' },
    submitting: { en: 'Sending…', es: 'Enviando…' },
    cancel:     { en: 'Cancel',   es: 'Cancelar' },
    closeBtn:   { en: 'Close',    es: 'Cerrar' },
    sentTitle: { en: 'Message sent', es: 'Mensaje enviado' },
    sentBody: {
      en: 'Thank you — your note is on its way to the chapter. A steward will reply to the email you gave.',
      es: 'Gracias — tu mensaje va camino al capítulo. Un mayordomo responderá al correo que diste.',
    },
    errName:    { en: 'Please add your name.',          es: 'Por favor, añade tu nombre.' },
    errEmail:   { en: 'Please enter a valid email.',    es: 'Por favor, ingresa un correo válido.' },
    errMessage: { en: 'Please add a message.',          es: 'Por favor, escribe un mensaje.' },
    errSend:    { en: 'Something went wrong sending your message. Please try again.', es: 'Algo salió mal al enviar tu mensaje. Inténtalo de nuevo.' },
  },
  patron: {
    heading: {
      en: 'Saint Isidore',
      es: 'San Isidro Labrador',
    },
    feastDay: { en: 'OUR PATRON', es: 'nuestro santo patrón' },
    story: [
      {
        en: 'Isidore was born around 1070 to a poor family near Madrid, and for nearly his whole life he worked the same fields — a hired hand on the estate of a wealthy landowner named Juan de Vergas, just outside the city at Torrelaguna. He married Maria Torribia, a farm girl as poor and as devout as himself; the Church honors her too, as Santa María de la Cabeza. Their only child, a son, died in infancy, and the two of them carried that grief together for the rest of their lives.',
        es: 'Isidro nació hacia el año 1070 en una familia pobre cerca de Madrid, y durante casi toda su vida trabajó los mismos campos: como jornalero en la hacienda de un rico terrateniente llamado Juan de Vergas, a las afueras de la ciudad, en Torrelaguna. Se casó con María Torribia, una campesina tan pobre y tan devota como él; la Iglesia también la honra a ella, como Santa María de la Cabeza. Su único hijo murió siendo niño, y ambos llevaron juntos ese dolor el resto de sus vidas.',
      },
      {
        en: 'He began each day at Mass before walking out to the fields, and so he often arrived at work later than the other laborers. They grumbled about it — until, the old story goes, some of them came to see for themselves and found two angels at the plow beside him, turning the earth so his rows were finished as soon as anyone\u2019s. Whether behind the oxen or on the road between churches, Isidore prayed as he worked; the labor and the prayer were never two separate things for him.',
        es: 'Comenzaba cada día en la Misa antes de salir a los campos, y por eso a menudo llegaba al trabajo más tarde que los demás jornaleros. Ellos se quejaban, hasta que —según cuenta la vieja historia— algunos fueron a verlo con sus propios ojos y encontraron a dos ángeles arando junto a él, volteando la tierra de modo que sus surcos quedaban terminados tan pronto como los de cualquiera. Ya fuera tras los bueyes o en el camino entre iglesias, Isidro oraba mientras trabajaba; para él, el trabajo y la oración nunca fueron dos cosas distintas.',
      },
      {
        en: 'He was known above all for his mercy to the poor and to animals. He shared his own meals with the hungry, often keeping less for himself, and Maria kept a stew always warm on the hearth because she never knew how many strangers her husband might bring home. One winter day he brought back more than the pot could hold; when she told him it was empty, he asked her to look again, and she ladled out enough to feed them all. Isidore died on May 15, 1130, and was canonized in 1622 — the patron of farmers and laborers, and the patron under whom our chapter has placed its work.',
        es: 'Se le conocía sobre todo por su misericordia con los pobres y con los animales. Compartía sus propias comidas con los hambrientos, quedándose muchas veces con menos para sí mismo, y María mantenía siempre un guiso caliente sobre el fogón, porque nunca sabía cuántos extraños traería su marido a casa. Un día de invierno trajo a más de los que la olla podía alimentar; cuando ella le dijo que estaba vacía, él le pidió que mirara de nuevo, y sacó suficiente para todos. Isidro murió el 15 de mayo de 1130 y fue canonizado en 1622: patrono de los agricultores y los trabajadores, y el patrono bajo cuya intercesión nuestro capítulo ha puesto su labor.',
      },
    ],
    prayer: {
      en: 'O God, in whom we live and move and have our being, grant us sufficient rain, so that, being supplied with what sustains us in this present life, we may seek more confidently what sustains us for eternity. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever. Amen',
      es: 'Oh Dios, por la intercesión de San Isidro labrador, concédenos vencer todo sentimiento de soberbia, y servirte siempre con esa humildad que te agrada, por sus méritos y ejemplo. Amén.',
    },
  },
  eyebrow: {
    chapter:         { en: 'CENTRAL TEXAS CHAPTER', es: 'CAPÍTULO DEL CENTRO DE TEJAS' },
    foundingMembers: { en: 'FOUNDING MEMBERS',      es: 'MIEMBROS FUNDADORES' },
    theWorkshop:     { en: 'OUR WORKSHOP',          es: 'EL TALLER' },
    theWitness:      { en: 'OUR WITNESS',           es: 'EL TESTIMONIO' },
  },
  common: {
    backToTalleres: { en: '← All workshops', es: '← Todos los talleres' },
    backToVision:   { en: '← Vision',        es: '← Visión' },
    members:        { en: 'members',         es: 'miembros' },
    member:         { en: 'member',          es: 'miembro' },
  },
  auth: {
    signIn:         { en: 'Sign in',    es: 'Entrar' },
    signOut:        { en: 'Sign out',   es: 'Salir' },
    myProfile:      { en: 'My profile', es: 'Mi perfil' },
    stewardship:    { en: 'Stewardship', es: 'Mayordomía' },
    adminBadge:     { en: 'admin',      es: 'admin' },
    memberFallback: { en: 'Member',     es: 'Miembro' },
    pendingNotice:  { en: 'Your profile is awaiting approval.',
                      es: 'Tu perfil espera aprobación.' },
  },
  witness: {
    eyebrow:   { en: 'OUR WITNESS · A.D. 2026',       es: 'EL TESTIMONIO · AÑO DEL SEÑOR 2026' },
    heading:   { en: 'Our year, in the making', es: 'El año, tal como el capítulo lo ha vivido' },
    subhead:   { en: 'click any liturguical wedge to see our past and upcoming events',
                 es: 'una rueda de meses — toca cualquier sección para ver más' },
    statGatherings:  { en: 'gatherings',  es: 'reuniones' },
    statHosts:       { en: 'hosts',       es: 'anfitriones' },
    statNeighbors:   { en: 'neighbors',   es: 'vecinos' },
    statReplicated:  { en: 'replicated',  es: 'replicadas' },
    viewingLabel:    { en: 'viewing',     es: 'mirando' },
    metricGatherings:{ en: 'GATHERINGS',  es: 'REUNIONES' },
    metricHeld:      { en: 'HELD + PLANNED', es: 'REALIZADAS + PLANEADAS' },
    metricNeighbors: { en: 'NEIGHBORS',   es: 'VECINOS' },
    metricHosts:     { en: 'HOSTS',       es: 'ANFITRIONES' },
    feastLabel:      { en: 'FEAST',       es: 'FIESTA' },
    replicatedLabel: { en: 'SKILL REPLICATED', es: 'HABILIDAD REPLICADA' },
    plannedTag:      { en: 'PLANNED',     es: 'PLANEADO' },
    emptyMonth:      { en: 'A quiet month.\nThe land has its seasons.',
                       es: 'Un mes en silencio no es un mes fallido.\nLa tierra tiene sus estaciones; también nosotros.' },
    activityNote:    { en: 'Gatherings were held this month. See the recap and photos below.',
                       es: 'Hubo reuniones este mes. Mira el resumen y las fotos abajo.' },
    hubLabel:        { en: 'YEAR OF OUR LORD', es: 'AÑO DEL SEÑOR' },
    hubYear:         { en: '2026',        es: '2026' },
    promptMetricGatherings: { en: 'Show me all the gatherings in',  es: 'Muéstrame todas las reuniones de' },
    promptMetricNeighbors:  { en: 'Who came to the gatherings in',  es: '¿Quiénes vinieron a las reuniones de' },
    promptMetricHosts:      { en: 'Which members hosted in',        es: '¿Qué miembros ofrecieron reuniones en' },
    promptGathering:        { en: 'Tell me more about the gathering on', es: 'Cuéntame más sobre la reunión del' },
  },
  months: {
    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    esShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    enShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  },
};

export type UiStrings = typeof uiStrings;