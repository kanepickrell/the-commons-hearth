// src/pages/Vision.tsx
// The founding vision of the chapter — four pillars, in field-manual language.
//
// Changes from the prior version:
//   - Pillar prose rewritten to track the CLM Field Manual phrasing, then
//     put back into the first person: the manual writes "The Catholic Land
//     Movement exists to...", which on our own Vision page reads like a
//     third party describing us. The page has already said whose vision it
//     is, so the organisation is not named again here.
//   - All four verses now open the same way, with a bare verb: Restore,
//     Grow, Cultivate, Align. They had been four different shapes — an
//     infinitive, a first-person clause, a gerund and a declarative — which
//     read as four separate thoughts rather than one list of aims.
//   - Resettlement re-framed: it's not about owning land per se, it's
//     about productive property as the substrate that re-roots families
//     as integrated social units (in land, work, parish, community).
//   - Glorification rewritten to lead with "Catholic ontology" — true
//     reality as revealed by God — rather than "renewing traditions."
//   - Dropped the "How We Live Distributism" five-step cycle. That
//     content now lives on /participate ("How to Live Out the CLM
//     Vision") which has its own tab — see Participate.tsx.
//   - Dropped the "Begin where you are" closing CTA; the Participate
//     page is the natural next click and is now linked from this page.

import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { Layout } from '@/components/Layout';
import { buildPath } from '@/i18n/routes';
import { RecognitionNote, RECOGNITION_ANCHOR } from '@/components/RecognitionNote';

export default function Vision() {
  const { t, locale } = useLocale();
  const { hash } = useLocation();

  const pillars = [
    {
      roman: 'I',
      name: { en: 'Resettlement', es: 'Reasentamiento' },
      // Field-manual reframe: the goal isn't land ownership in the
      // abstract — it's productive property as the substrate that lets
      // the family function as a real social unit again.
      verse: {
        en: 'Restore productive property into the hands of households, which roots families as real social units fully integrated in land, work, parish, and community.',
        es: 'Restaurar la propiedad productiva en manos de los hogares, lo cual arraiga de nuevo a las familias como unidades sociales reales, plenamente integradas en la tierra, el trabajo, la parroquia, y la comunidad.',
      },
      practice: {
        en: 'You do not need many acres to begin. A backyard garden, a parish plot, a flock of hens in the side yard will do. A productive property is whatever land you can put to fruitful use. We start where we are and with what we already have.',
        es: 'No necesitas muchos acres para comenzar. Un huerto en el patio, una parcela parroquial, unas gallinas al lado de la casa. La propiedad productiva es cualquier tierra que puedas hacer fructífera. Comenzamos donde estamos, con lo que ya tenemos.',
      },
    },
    {
      roman: 'II',
      name: { en: 'Education', es: 'Educación' },
      verse: {
        en: 'Grow peer-to-peer networks of education in production land and hand crafts.',
        es: 'Hacer crecer redes de educación entre vecinos en los oficios de la tierra y de la mano.',
      },
      practice: {
        en: 'These skills used to pass between neighbors: canning, carpentry, animal husbandry, the care of soil. We learn them back from one another, in workshops and in kitchens, and we pass them on before they are lost.',
        es: 'Estos oficios antes pasaban de vecino a vecino: la conserva, la carpintería, la cría de animales, el cuidado del suelo. Los reaprendemos unos de otros, en talleres y en cocinas, y los transmitimos antes de que se pierdan.',
      },
    },
    {
      roman: 'III',
      name: { en: 'Fellowship', es: 'Compañerismo' },
      // This line used to end "within the chapter", a guess made when the
      // source feedback truncated at "support within". The national strategy
      // gives the real ending, and it is a different claim: the network runs
      // between homesteads that exist and households that want one, which is
      // the direction the help actually travels.
      verse: {
        en: 'Cultivate a network of practical, spiritual, and intellectual support between established Catholic homesteads and those seeking to establish one.',
        es: 'Cultivar una red de apoyo práctico, espiritual, e intelectual entre los hogares católicos ya establecidos y quienes buscan establecer el suyo.',
      },
      practice: {
        en: 'When the call goes out to raise the barn, we go out to raise the barn. Mutual aid days, shared harvests, lending a hand and lending a tool. This is what makes a homestead, and a chapter, survive.',
        es: 'Cuando llega el llamado para levantar el granero, vamos a levantar el granero. Días de ayuda mutua, cosechas compartidas, prestar la mano y prestar la herramienta. Esto es lo que hace sobrevivir a un hogar, y a un capítulo.',
      },
    },
    {
      roman: 'IV',
      name: { en: 'Glorification', es: 'Glorificación' },
      verse: {
        en: 'Align our events with Gospel teaching: true reality as revealed by God. Prayer, spiritual life, sacramental life, and liturgical life are integrated into our chapter activity.',
        es: 'Alinear nuestros encuentros con la enseñanza del Evangelio: la verdadera realidad revelada por Dios. La oración, la vida espiritual, la vida sacramental, y la vida litúrgica están integradas en la actividad de nuestro capítulo.',
      },
      practice: {
        en: 'Christ placed a meal at the center of His Church. The seed, the soil, the harvest, the table: all of it is ordered toward worship. Our labor is an offering.',
        es: 'Cristo puso una comida en el centro de Su Iglesia. La semilla, el suelo, la cosecha, la mesa: todo está ordenado hacia la adoración. Nuestra labor es una ofrenda.',
      },
    },
  ];

  // The national chapter-growth plan. `here` marks the phase this chapter is
  // actually in: founded 2025, so the first one.
  const phases = [
    {
      roman: 'I',
      here: true,
      years: { en: 'YEARS 0 TO 2', es: 'AÑOS 0 A 2' },
      name: { en: 'An informal community', es: 'Una comunidad informal' },
      body: {
        en: 'Get started and build relationships. Gatherings, workshops, and a roster of people who know each other by name. Nothing here needs a bank account or a charter, which is why it is the phase a chapter can begin in a living room.',
        es: 'Empezar y construir relaciones. Reuniones, talleres, y una lista de personas que se conocen por su nombre. Nada de esto necesita cuenta bancaria ni estatutos, por eso es la fase que un capítulo puede empezar en una sala.',
      },
    },
    {
      roman: 'II',
      here: false,
      years: { en: 'YEARS 2 TO 5', es: 'AÑOS 2 A 5' },
      name: { en: 'A formalized entity', es: 'Una entidad formal' },
      body: {
        en: 'The chapter becomes a civic institution: a charter, a local bank account, and the standing to own, invest, and lead. Members can run buying co-ops and raise money for local projects rather than only gathering.',
        es: 'El capítulo se vuelve una institución civil: estatutos, cuenta bancaria local, y la capacidad de poseer, invertir, y dirigir. Los miembros pueden formar cooperativas de compra y recaudar para proyectos locales, no sólo reunirse.',
      },
    },
    {
      roman: 'III',
      here: false,
      years: { en: 'YEARS 5 TO 10', es: 'AÑOS 5 A 10' },
      name: { en: 'A localized economy', es: 'Una economía local' },
      body: {
        en: 'A regional center of work and formation, where these principles are lived and taught rather than discussed. Jobs are created, farms are launched, and the chapter hosts staff, volunteers, and retreatants in hands-on agrarian training.',
        es: 'Un centro regional de trabajo y formación, donde estos principios se viven y se enseñan en vez de discutirse. Se crean empleos, se lanzan granjas, y el capítulo recibe personal, voluntarios, y retirantes en formación agraria práctica.',
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
          {t({ en: 'HE IS OUR CREATOR', es: 'ÉL ES NUESTRO CREADOR' })}
        </p>
        <h1 className="mb-8 font-heading text-5xl text-mesquite md:text-6xl">
          {t({ en: 'We Are His Gardeners', es: 'Somos Sus Jardineros' })}
        </h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-mesquite/80 md:text-xl">
          {t({
            en: 'We are families in Central Texas taking up the first vocation given to man — to till the earth and keep it. Not to flee the world, but to sanctify a small corner of it for Christ.',
            es: 'Somos familias del Centro de Texas que asumimos la primera vocación dada al hombre — labrar la tierra y guardarla. No para huir del mundo, sino para santificar un pequeño rincón de él para Cristo.',
          })}
        </p>

        {/* The chapter's ecclesiastical recognition, and the letter behind
            it. It reads here, under the opening and above the pillars,
            because this is the page that says what the movement believes —
            and the recognition stands behind exactly that. */}
        <RecognitionNote defaultOpen={hash === `#${RECOGNITION_ANCHOR}`} />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The Four Pillars                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 md:py-24">
        <div className="container-narrow">
          <div className="mb-12 text-center md:mb-16">
            <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
              {t({ en: 'FOUNDATIONS', es: 'FUNDAMENTOS' })}
            </p>
            <h2 className="mb-6 font-heading text-4xl text-mesquite md:text-5xl">
              {t({ en: 'The Four Pillars', es: 'Los Cuatro Pilares' })}
            </h2>
            <p className="mx-auto max-w-2xl font-serif italic leading-relaxed text-mesquite/70">
              {t({
                en: 'The aim of our movement in four pillars',
                es: 'El propósito de nuestro movimiento, en cuatro pilares.',
              })}
            </p>
          </div>

          <div className="space-y-16 md:space-y-24">
            {pillars.map((p) => (
              <article
                key={p.roman}
                className="border-t border-mesquite/15 pt-12 text-center md:pt-16"
              >
                <div
                  aria-hidden="true"
                  className="font-heading text-7xl leading-none text-ocre md:text-8xl"
                >
                  {p.roman}
                </div>
                <h3 className="mt-4 font-heading text-3xl text-mesquite md:mt-6 md:text-4xl">
                  {t(p.name)}
                </h3>
                <div className="mx-auto mt-8 max-w-2xl space-y-5 text-left md:mt-10">
                  <p className="font-serif text-lg leading-relaxed text-mesquite">
                    {t(p.verse)}
                  </p>
                  <p className="font-serif leading-relaxed text-mesquite/70">
                    {t(p.practice)}
                  </p>
                  {p.roman === 'I' && (
                    <blockquote className="mt-6 border-l-2 border-ocre/40 pl-5 font-serif italic leading-relaxed text-mesquite/70">
                      {/* The widely quoted short form drops three words that
                          are in the original, so this is the Vatican text as
                          delivered, and dated. Pentecost 1941 was the fiftieth
                          anniversary of Rerum Novarum, which is why the Pope
                          was talking about holdings at all. */}
                      {t({
                        en: '"Only that stability which is rooted in one\'s own holding makes of the family the most vital and most perfect and fecund cell of society."',
                        es: '«Sólo aquella estabilidad que echa raíces en la propiedad hace de la familia la célula más vital, más perfecta y fecunda de la sociedad.»',
                      })}
                      <footer className="mt-2 text-sm not-italic text-mesquite/50">
                        — {t({
                          en: 'Pope Pius XII, Pentecost radio message, 1 June 1941',
                          es: 'Papa Pío XII, radiomensaje de Pentecostés, 1 de junio de 1941',
                        })}
                      </footer>
                    </blockquote>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Where this goes                                                  */}
      {/*                                                                  */}
      {/* The national office plans a chapter's life in three phases. It   */}
      {/* is worth having on our own page for one reason: it lets us say   */}
      {/* out loud which phase we are in. A visitor deciding whether to     */}
      {/* come to a gathering is better served by "we are a year old and   */}
      {/* building relationships" than by a page that implies more.        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-mesquite/10 py-16 md:py-20">
        <div className="container-narrow">
          <div className="mb-12 text-center">
            <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
              {t({ en: 'WHERE THIS GOES', es: 'A DÓNDE VA ESTO' })}
            </p>
            <h2 className="mb-6 font-heading text-4xl text-mesquite md:text-5xl">
              {t({ en: 'A chapter in three phases', es: 'Un capítulo en tres fases' })}
            </h2>
            <p className="mx-auto max-w-2xl font-serif italic leading-relaxed text-mesquite/70">
              {t({
                en: 'This is how the movement plans the life of a chapter. We are in the first phase, and saying so is more useful than implying otherwise.',
                es: 'Así planea el movimiento la vida de un capítulo. Estamos en la primera fase, y decirlo sirve más que insinuar otra cosa.',
              })}
            </p>
          </div>

          <ol className="space-y-8">
            {phases.map((p) => (
              <li
                key={p.roman}
                className={`border-l-2 pl-5 ${p.here ? 'border-ocre' : 'border-mesquite/15'}`}
              >
                <p className="display-caps text-[10px] tracking-[0.2em] text-ocre">
                  {p.roman} · {t(p.years)}
                  {p.here && (
                    <span className="ml-2 text-rojo">
                      {t({ en: 'WE ARE HERE', es: 'AQUÍ ESTAMOS' })}
                    </span>
                  )}
                </p>
                <h3 className="mt-2 font-heading text-2xl text-mesquite">{t(p.name)}</h3>
                <p className="mt-2 font-serif leading-relaxed text-mesquite/80">{t(p.body)}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 border-t border-mesquite/15 pt-6 text-center font-serif italic leading-relaxed text-mesquite/70">
            {t({
              en: 'Nationally the aim is a Catholic Land Movement chapter in every diocese, and five demonstration farms, by 2030.',
              es: 'A nivel nacional, la meta es un capítulo del Movimiento Católico de la Tierra en cada diócesis, y cinco granjas de demostración, para 2030.',
            })}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Pointer to Participate                                           */}
      {/* The cycle / "how to live this out" content has moved to its own  */}
      {/* page, so Vision ends with a quiet hand-off rather than a CTA     */}
      {/* button that duplicates what's now in the nav.                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-16 text-center md:py-20">
        <div className="container-narrow">
          <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'WHAT COMES NEXT', es: 'LO QUE SIGUE' })}
          </p>
          <p className="mx-auto max-w-xl font-serif text-lg italic leading-relaxed text-mesquite/80">
            {t({
              en: 'Principles become real only when they are walked. Here is how a household begins.',
              es: 'Los principios sólo se hacen reales cuando se caminan. Así comienza un hogar.',
            })}
          </p>
          <Link
            to={buildPath('participate', locale)}
            className="mt-8 inline-flex items-center gap-2 font-heading text-lg text-ocre no-underline hover:text-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t({ en: 'How to live this out', es: 'Cómo vivirlo' })} →
          </Link>
        </div>
      </section>
    </Layout>
  );
}