// src/pages/Vision.tsx
// The founding vision of the chapter — four pillars, in field-manual language.
//
// Changes from the prior version:
//   - Pillar prose rewritten to track the CLM Field Manual phrasing.
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

import { Link } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { Layout } from '@/components/Layout';
import { buildPath } from '@/i18n/routes';

export default function Vision() {
  const { t, locale } = useLocale();

  const pillars = [
    {
      roman: 'I',
      name: { en: 'Resettlement', es: 'Reasentamiento' },
      // Field-manual reframe: the goal isn't land ownership in the
      // abstract — it's productive property as the substrate that lets
      // the family function as a real social unit again.
      verse: {
        en: 'To restore productive property into the hands of households, which roots families as real social units fully integrated in land, work, parish, and community.',
        es: 'La restauración de la propiedad productiva en manos de los hogares, lo cual arraiga de nuevo a las familias como unidades sociales reales, plenamente integradas en la tierra, el trabajo, la parroquia, y la comunidad.',
      },
      practice: {
        en: 'You do not need many acres to begin. A backyard garden, a parish plot, a flock of hens in the side yard will do. A productive property is whatever land you can put to fruitful use. We start where we are and with what we already have.',
        es: 'No necesitas muchos acres para comenzar. Un huerto en el patio, una parcela parroquial, unas gallinas al lado de la casa — la propiedad productiva es cualquier tierra que puedas hacer fructífera. Comenzamos donde estamos, con lo que tenemos.',
      },
    },
    {
      roman: 'II',
      name: { en: 'Education', es: 'Educación' },
      verse: {
        en: 'The Catholic Land Movement exists to grow peer-to-peer networks of education in production land and hand crafts.',
        es: 'El Movimiento Católico de la Tierra existe para restaurar redes de educación entre vecinos en los oficios cotidianos de la tierra y de la mano.',
      },
      practice: {
        en: 'These skills used to pass between neighbors — canning, carpentry, animal husbandry, the care of soil. We learn them back from one another, in workshops and in kitchens, and we pass them on before they are lost.',
        es: 'Estos oficios antes pasaban de vecino a vecino — la conserva, la carpintería, la cría de animales, el cuidado del suelo. Los reaprendemos unos de otros, en talleres y en cocinas, y los transmitimos antes de que se pierdan.',
      },
    },
    {
      roman: 'III',
      name: { en: 'Fellowship', es: 'Compañerismo' },
      // NOTE: the source feedback truncated this line at "support within".
      // Completed as "within the chapter" to match the field-manual cadence
      // of the other three pillars. Verify against the field manual before
      // publishing.
      verse: {
        en: 'Cultivating a network of practical, intellectual, and spiritual support within the chapter.',
        es: 'Cultivar una red de apoyo práctico, intelectual, y espiritual dentro del capítulo.',
      },
      practice: {
        en: 'When the call goes out to raise the barn, we go out to raise the barn. Mutual aid days, shared harvests, lending a hand and lending a tool — this is what makes a homestead, and a chapter, survive.',
        es: 'Cuando llega el llamado para levantar el granero, vamos a levantar el granero. Días de ayuda mutua, cosechas compartidas, prestar la mano y prestar la herramienta — esto es lo que hace sobrevivir a un hogar, y a un capítulo.',
      },
    },
    {
      roman: 'IV',
      name: { en: 'Glorification', es: 'Glorificación' },
      verse: {
        en: 'All Catholic Land Movement activity happens within Catholic ontology — true reality as revealed by God. Prayer, spiritual life, sacramental life, and liturgical life are integrated into every facet of chapter activity.',
        es: 'Toda la actividad del Movimiento Católico de la Tierra sucede dentro de la ontología católica — la verdadera realidad revelada por Dios. La oración, la vida espiritual, la vida sacramental, y la vida litúrgica están integradas en cada faceta de la actividad del capítulo.',
      },
      practice: {
        en: 'Christ placed a meal at the center of His Church. The seed, the soil, the harvest, the table — all of it is ordered toward worship. Our labor is an offering.',
        es: 'Cristo puso una comida en el centro de Su Iglesia. La semilla, el suelo, la cosecha, la mesa — todo está ordenado hacia la adoración. Nuestra labor es una ofrenda.',
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
          {t({ en: 'We Are His Gardeners', es: 'Somos los Jardineros' })}
        </h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-mesquite/80 md:text-xl">
          {t({
            en: 'We are families in Central Texas taking up the first vocation given to man — to till the earth and keep it. Not to flee the world, but to sanctify a small corner of it for Christ.',
            es: 'Somos familias católicas del Centro de Texas que asumimos la primera vocación dada al hombre — labrar la tierra y guardarla. No para huir del mundo, sino para santificar un pequeño rincón de él para Cristo.',
          })}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The Four Pillars                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 md:py-24">
        <div className="container-narrow">
          {/* <div className="mb-12 text-center md:mb-16">
            <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
              {t({ en: 'FOUNDATIONS', es: 'FUNDAMENTOS' })}
            </p>
            <h2 className="mb-6 font-heading text-4xl text-mesquite md:text-5xl">
              {t({ en: 'The Four Pillars', es: 'Los Cuatro Pilares' })}
            </h2>
            <p className="mx-auto max-w-2xl font-serif italic leading-relaxed text-mesquite/70">
              {t({
                en: '',
                es: 'Si somos jardineros, esta es la tierra que labramos.',
              })}
            </p>
          </div> */}

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
                      {t({
                        en: '"Only the stability which is rooted in one\'s own holding makes of the family the most perfect cell of society."',
                        es: '«Sólo la estabilidad que echa raíces en la propiedad hace de la familia la célula más perfecta de la sociedad.»',
                      })}
                      <footer className="mt-2 text-sm not-italic text-mesquite/50">
                        — {t({ en: 'Pope Pius XII', es: 'Papa Pío XII' })}
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