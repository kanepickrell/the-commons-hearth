// src/pages/Participate.tsx
// "How to Live Out the CLM Vision" — the action-oriented counterpart to Vision.
//
// Vision tells you what the chapter believes (four pillars). Participate
// tells you how a household begins. Home introduces these three movements
// briefly with one paragraph each; Participate is where they unfold:
// each movement gets a fuller paragraph, practical specifics, and a
// "what a gathering actually looks like" passage to lower the threshold
// for a visitor considering showing up.
//
// Source: the May 2026 site-copy revision that established "How to Live
// Out the CLM Vision" as its own tab — collapsing an earlier seven-step
// formation pathway into three movements that a newcomer can hold at
// once: Come and see → Learn and offer → Live and share. Step 3 carries
// the reading-list link: Sid Arias's "Homestead of Saint Joseph" Substack
// as the warm entry point, and Rerum Novarum / Quadragesimo Anno as the
// canonical CST texts behind it.

import { Link } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { Layout } from '@/components/Layout';
import { buildPath } from '@/i18n/routes';

export default function Participate() {
  const { t, locale } = useLocale();

  // The three movements. Each has:
  //   - a Roman numeral (visual rhyme with Vision's four pillars)
  //   - a short title ("Come and see.")
  //   - a one-line summary (same as Home, for continuity)
  //   - a fuller paragraph that Home doesn't have room for
  //   - optional practical specifics
  const movements = [
    {
      roman: 'I',
      title: { en: 'Come and see.', es: 'Ven y mira.' },
      summary: {
        en: 'Start with a gathering. Meet the chapter, share a meal, see what we’re about.',
        es: 'Comienza con una reunión. Conoce al capítulo, comparte una comida, ve de qué se trata.',
      },
      // The threshold-lowerer. The biggest barrier for a curious visitor
      // is not knowing what they're walking into. This paragraph answers
      // the unspoken question.
      body: {
        en: 'You don’t need to know anything about homesteading or Catholic Social Teaching to join. Just come with an open mind, share a meal, a conversation, and prayer.',
        es: 'No necesitas saber nada sobre el distributismo, ni sobre la vida en el campo, ni sobre la Doctrina Social de la Iglesia para venir. No necesitas tierra, ni necesitas estar listo para vivir del campo. Sólo necesitas venir. Una reunión es una comida, una conversación, y oración — esa es toda la forma.',
      },
      practical: {
        en: 'We meet roughly once a month at a member’s home or parish hall in Central Texas. Families come. Kids run around. We open with prayer, share food, and spend an hour or two on a topic — sometimes a reading, sometimes a skill demonstration, sometimes a conversation about something a member is working through. Just come as you are and leave as neighbors.',
        es: 'Nos reunimos más o menos una vez al mes en casa de un miembro o en un salón parroquial en el centro de Texas. Vienen las familias. Los niños corren por todos lados. Abrimos con oración, compartimos la comida, y pasamos una hora o dos sobre un tema — a veces una lectura, a veces una demostración de un oficio, a veces una conversación sobre algo que un miembro está trabajando. No necesitas traer nada la primera vez. No necesitas conocer a nadie. Ven como estás; vete conociendo a unos vecinos.',
      },
    },
    {
      roman: 'II',
      title: { en: 'Learn and offer.', es: 'Aprende y ofrece.' },
      summary: {
        en: 'Bring the skills you already have. Tell us about the ones you want to learn.',
        es: 'Trae los oficios que ya tienes. Nombra los que quieres aprender.',
      },
      body: {
        en: 'We exist to connect and help each other learn. Bring the skills you already have — carpentry, gardening, baking, fixing things — or maybe use this community to try something new. The point isn’t self-sufficiency; it’s a neighborhood where households can lean on each other. Most members started as beginners in something. That’s the normal state. The chapter exists so beginners can find teachers, and teachers can find someone to pass the work on to.',
        es: 'Somos una comunidad que se ayuda a aprender. Trae los oficios que ya tienes — carpintería, jardinería, panadería, arreglar cosas, criar bien a los hijos — y nombra los que quieres aprender. La idea no es la autosuficiencia; es un vecindario donde las casas pueden apoyarse unas en otras. La mayoría de los miembros empezamos como principiantes en algo. Eso es lo normal. El capítulo existe para que los principiantes encuentren maestros, y los maestros encuentren a quién pasarle la obra.',
      },
      practical: {
        en: 'Practically: members keep a profile on our chapter website to connect our Central Texas community and build a skills network. Workshops are hosted by members in their own homes and gardens — small, free, and open to other approved members. If you have a skill you’d teach, we’ll help you host. If you have one you want to learn, we’ll help you find a host.',
        es: 'En la práctica: cada miembro guarda un perfil en el Commons que describe lo que está construyendo, lo que quiere aprender, y los oficios que puede enseñar. Los talleres los ofrecen los miembros en sus propias casas y huertas — pequeños, gratis, y abiertos a otros miembros aprobados. Si tienes un oficio que enseñar, te ayudamos a ofrecerlo. Si hay uno que quieres aprender, te ayudamos a encontrar al anfitrión.',
      },
    },
    {
      roman: 'III',
      title: { en: 'Live and share.', es: 'Vive y comparte.' },
      summary: {
        en: 'Take what you’ve learned home to your family and parish.',
        es: 'Lleva a casa lo que aprendiste, a tu familia y a tu parroquia.',
      },
      body: {
        en: 'A chapter is not the goal. The household is the goal, and the parish is the goal. What you learn here is meant to leave with you — into your kitchen, your yard, your block, your pew. Bring a friend to the next gathering. Pray for the chapter. Pray for each member by name when you remember. And as the practice grows, the principles deepen — Catholic Social Teaching is the soil this whole movement grew in, and reading it makes everything else make more sense.',
        es: 'El capítulo no es la meta. El hogar es la meta, y la parroquia es la meta. Lo que aprendes aquí es para llevártelo — a tu cocina, a tu patio, a tu cuadra, a tu banca en la Misa. Invita a un amigo a la próxima reunión. Reza por el capítulo. Reza por cada miembro por su nombre cuando te acuerdes. Y mientras crece la práctica, los principios se profundizan — la Doctrina Social de la Iglesia es la tierra de donde creció todo este movimiento, y leerla hace que todo lo demás tenga más sentido.',
      },

      reading: {
        leadIn: {
          en: 'A starting place to read:',
          es: 'Un lugar para empezar a leer:',
        },
        substackName: { en: 'Homestead of Saint Joseph', es: 'Homestead of Saint Joseph' },
        substackHref: 'https://sidarias.substack.com/',
        substackTagline: {
          en: 'chapter member Sid Arias on piety, natural law, and rediscovering reality through faith and reason.',
          es: 'el miembro del capítulo Sid Arias sobre la piedad, la ley natural, y el redescubrimiento de la realidad por la fe y la razón.',
        },
        encyclicalsLeadIn: {
          en: 'When you’re ready for the source documents, start with the two encyclicals the whole movement grew out of:',
          es: 'Cuando estés listo para los documentos fuente, empieza con las dos encíclicas de donde creció todo el movimiento:',
        },
        encyclicals: [
          {
            name: 'Rerum Novarum',
            author: { en: 'Leo XIII, 1891', es: 'León XIII, 1891' },
            note: {
              en: 'The source code. About forty pages. Workers, wages, property, family — the foundation everything else is built on.',
              es: 'El código fuente. Unas cuarenta páginas. El obrero, el salario, la propiedad, la familia — el fundamento sobre el que se construye todo lo demás.',
            },
          },
          {
            name: 'Quadragesimo Anno',
            author: { en: 'Pius XI, 1931', es: 'Pío XI, 1931' },
            note: {
              en: 'Forty years later, written into the Depression. Names subsidiarity, deepens the property argument, calls for the reconstruction of the social order.',
              es: 'Cuarenta años después, escrita en plena Depresión. Nombra la subsidiariedad, profundiza el argumento de la propiedad, llama a reconstruir el orden social.',
            },
          },
        ],
      },
    },
  ];

  return (
    <Layout>
      {/* ---------------------------------------------------------------- */}
      {/* Opening                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow flex flex-col items-center py-16 text-center md:py-24">
        <p className="display-caps mb-4 text-xs tracking-[0.2em] text-ocre">
          {t({ en: 'HOW TO LIVE OUT THE CLM VISION', es: 'CÓMO VIVIR LA VISIÓN DEL MCT' })}
        </p>
        <h1 className="mb-8 font-heading text-5xl text-mesquite md:text-6xl">
          {t({ en: 'How a household begins', es: 'Cómo comienza un hogar' })}
        </h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-mesquite/80 md:text-xl">
          {t({
            en: 'Our chapter promotes three stages to getting started in the CLM',
            es: 'Tres movimientos. No necesitas estar listo para los tres. Sólo necesitas el primero.',
          })}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The Three Movements                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 md:py-24">
        <div className="container-narrow">
          <div className="space-y-16 md:space-y-24">
            {movements.map((m) => (
              <article
                key={m.roman}
                className="border-t border-mesquite/15 pt-12 text-center md:pt-16"
              >
                <div
                  aria-hidden="true"
                  className="font-heading text-7xl leading-none text-ocre md:text-8xl"
                >
                  {m.roman}
                </div>
                <h2 className="mt-4 font-heading text-3xl text-mesquite md:mt-6 md:text-4xl">
                  {t(m.title)}
                </h2>
                <p className="mx-auto mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-mesquite/70">
                  {t(m.summary)}
                </p>

                <div className="mx-auto mt-8 max-w-2xl space-y-5 text-left md:mt-10">
                  <p className="font-serif text-lg leading-relaxed text-mesquite">
                    {t(m.body)}
                  </p>
                  {m.practical && (
                    <p className="font-serif leading-relaxed text-mesquite/70">
                      {t(m.practical)}
                    </p>
                  )}

                  {/* Reading list — only on movement III */}
                  {m.reading && (
                    <div className="mt-8 border-l-2 border-ocre/40 pl-5">
                      <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-ocre">
                        {t({ en: 'A READING LIST', es: 'UNA LISTA DE LECTURA' })}
                      </p>
                      <p className="font-serif leading-relaxed text-mesquite/80">
                        {t(m.reading.leadIn)}{' '}
                        <a
                          href={m.reading.substackHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-heading italic text-ocre hover:text-mesquite"
                        >
                          {t(m.reading.substackName)}
                        </a>{' '}
                        — {t(m.reading.substackTagline)}
                      </p>

                      <p className="mt-5 font-serif leading-relaxed text-mesquite/80">
                        {t(m.reading.encyclicalsLeadIn)}
                      </p>
                      <ul className="mt-4 space-y-4">
                        {m.reading.encyclicals.map((e) => (
                          <li key={e.name}>
                            <p className="font-heading text-mesquite">
                              <em>{e.name}</em>
                              <span className="ml-2 text-sm italic text-mesquite/60">
                                — {t(e.author)}
                              </span>
                            </p>
                            <p className="mt-1 font-serif text-sm leading-relaxed text-mesquite/70">
                              {t(e.note)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing — point to the gatherings page                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-16 text-center md:py-20">
        <div className="container-narrow">
          <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'WHAT COMES NEXT', es: 'LO QUE SIGUE' })}
          </p>
          <p className="mx-auto max-w-xl font-serif text-lg italic leading-relaxed text-mesquite/80">
            {t({
              en: 'The first movement is the only one that asks anything of you today. Find a gathering and come.',
              es: 'El primer movimiento es el único que te pide algo hoy. Encuentra una reunión y ven.',
            })}
          </p>
          <Link
            to={buildPath('talleres', locale)}
            className="mt-8 inline-flex items-center gap-2 font-heading text-lg text-ocre no-underline hover:text-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t({ en: 'See upcoming gatherings', es: 'Ver próximas reuniones' })} →
          </Link>
        </div>
      </section>
    </Layout>
  );
}