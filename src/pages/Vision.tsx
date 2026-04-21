// src/pages/Vision.tsx
// The founding vision of the chapter — four pillars, five-step cycle.
// Previously lived at /ofrendas; renamed to /vision so the nav label
// and the URL match.
import { useLocale } from '@/i18n/LocaleProvider';
import { Layout } from '@/components/Layout';

export default function Vision() {
  const { t } = useLocale();

  const pillars = [
    {
      roman: 'I',
      name: { en: 'Resettlement', es: 'Reasentamiento' },
      verse: {
        en: 'The restoration of Catholic rural property through the resettlement and practical support of agriculturally and domestically productive homesteads.',
        es: 'La restauración de la propiedad rural católica mediante el reasentamiento y el apoyo práctico a hogares productivos, agrícola y domésticamente.',
      },
      practice: {
        en: 'Owning productive land — however small — and putting it to fruitful use. A backyard garden, a parish plot, a family farm. We begin where we are, with what we have.',
        es: 'Poseer tierra productiva —por pequeña que sea— y darle uso fructífero. Un huerto en el patio, una parcela parroquial, una granja familiar. Comenzamos donde estamos, con lo que tenemos.',
      },
    },
    {
      roman: 'II',
      name: { en: 'Fellowship', es: 'Compañerismo' },
      verse: {
        en: 'Cultivating a network of practical, spiritual, and intellectual support between established Catholic homesteads and those seeking to establish one.',
        es: 'Cultivar una red de apoyo práctico, espiritual e intelectual entre los hogares católicos establecidos y aquellos que buscan establecer uno.',
      },
      practice: {
        en: 'When the call goes out to raise the barn, we go out to raise the barn. Mutual aid days, shared harvests, lending a hand and lending a tool — this is what makes a homestead survive.',
        es: 'Cuando llega el llamado para levantar el granero, vamos a levantar el granero. Días de ayuda mutua, cosechas compartidas, prestar la mano y prestar la herramienta — esto es lo que hace sobrevivir al hogar.',
      },
    },
    {
      roman: 'III',
      name: { en: 'Education', es: 'Educación' },
      verse: {
        en: 'The education and training of Catholic laity in the domestic order, agricultural skills, and craft traditions necessary to successfully cultivate Catholic homesteads.',
        es: 'La educación y formación de los laicos católicos en el orden doméstico, las habilidades agrícolas y las tradiciones artesanales necesarias para cultivar hogares católicos con éxito.',
      },
      practice: {
        en: 'These skills are slipping — canning, carpentry, animal husbandry, the care of soil. We learn them back from one another, in workshops and in kitchens, and we pass them on.',
        es: 'Estas habilidades se están perdiendo — la conserva, la carpintería, la cría de animales, el cuidado del suelo. Las reaprendemos unos de otros, en talleres y en cocinas, y las transmitimos.',
      },
    },
    {
      roman: 'IV',
      name: { en: 'Glorification', es: 'Glorificación' },
      verse: {
        en: 'Renewing the time-honored traditions of the Church surrounding agrarian life, glorifying the God who gives all good gifts.',
        es: 'Renovar las tradiciones centenarias de la Iglesia en torno a la vida agraria, glorificando al Dios que da todos los buenos dones.',
      },
      practice: {
        en: 'Christ placed a meal at the center of His Church. The seed, the soil, the harvest, the table — all of it is ordered toward worship. Our labor is an offering.',
        es: 'Cristo puso una comida en el centro de Su Iglesia. La semilla, el suelo, la cosecha, la mesa — todo está ordenado hacia la adoración. Nuestra labor es una ofrenda.',
      },
    },
  ];

  const cycle = [
    {
      num: '1',
      title: { en: 'Attend a Workshop', es: 'Asiste a un Taller' },
      body: {
        en: 'Come to a gathering. Watch someone who knows. Ask questions. Get your hands dirty.',
        es: 'Ven a una reunión. Observa a quien sabe. Haz preguntas. Ensúciate las manos.',
      },
    },
    {
      num: '2',
      title: { en: 'Learn a Craft', es: 'Aprende un Oficio' },
      body: {
        en: 'Choose one skill and stay with it — bread, beekeeping, butchery, timber framing, the rosary garden. Mastery comes by repetition, not novelty.',
        es: 'Elige un oficio y quédate con él — el pan, la apicultura, la carnicería, la carpintería, el jardín del rosario. La maestría viene por la repetición, no por la novedad.',
      },
    },
    {
      num: '3',
      title: { en: 'Grow the Craft', es: 'Cultiva el Oficio' },
      body: {
        en: 'Practice it at home, on your land, in your kitchen. Let it become part of the rhythm of your family and the liturgical year.',
        es: 'Practícalo en casa, en tu tierra, en tu cocina. Que se vuelva parte del ritmo de tu familia y del año litúrgico.',
      },
    },
    {
      num: '4',
      title: { en: 'Share the Fruit', es: 'Comparte el Fruto' },
      body: {
        en: 'Trade eggs for honey. Bring bread to the potluck. Teach the next family what you were taught. The gift returns transformed.',
        es: 'Intercambia huevos por miel. Lleva pan al convivio. Enseña a la siguiente familia lo que te enseñaron. El regalo regresa transformado.',
      },
    },
    {
      num: '5',
      title: { en: 'Give Glory to God', es: 'Da Gloria a Dios' },
      body: {
        en: 'The whole cycle — the seed, the sweat, the supper — is offered back to the One who gave it. This is what makes our distributism Catholic.',
        es: 'Todo el ciclo — la semilla, el sudor, la cena — se ofrece al Que lo dio. Esto es lo que hace católico nuestro distributismo.',
      },
    },
  ];

  return (
    <Layout>
      <section className="container-narrow flex flex-col items-center py-16 text-center md:py-24">
        <p className="display-caps mb-4 text-xs tracking-[0.2em] text-ocre">
          {t({ en: 'OUR VISION', es: 'NUESTRA VISIÓN' })}
        </p>
        <h1 className="mb-8 font-heading text-5xl text-mesquite md:text-6xl">
          {t({ en: 'We Are the Gardeners', es: 'Somos los Jardineros' })}
        </h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-mesquite/80 md:text-xl">
          {t({
            en: 'We are Catholic families in Central Texas returning to the land — not to escape the world, but to till a small corner of it for Christ. We build from where we are, with what we have, together.',
            es: 'Somos familias católicas del Centro de Texas que regresamos a la tierra — no para huir del mundo, sino para labrar un pequeño rincón de él para Cristo. Construimos desde donde estamos, con lo que tenemos, juntos.',
          })}
        </p>
        <p className="mt-8 max-w-xl font-serif italic leading-relaxed text-mesquite/60">
          {t({
            en: '"Only the stability which is rooted in one\'s own holding makes of the family the most perfect cell of society." — Pope Pius XII',
            es: '«Sólo la estabilidad que echa raíces en la propiedad hace de la familia la célula más perfecta de la sociedad.» — Papa Pío XII',
          })}
        </p>
      </section>

      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 md:py-24">
        <div className="container-narrow">
          <div className="mb-12 text-center md:mb-16">
            <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
              {t({ en: 'FOUNDATIONS', es: 'FUNDAMENTOS' })}
            </p>
            <h2 className="font-heading text-4xl text-mesquite md:text-5xl">
              {t({ en: 'The Four Pillars', es: 'Los Cuatro Pilares' })}
            </h2>
          </div>

          <div className="space-y-12 md:space-y-16">
            {pillars.map((p) => (
              <article
                key={p.roman}
                className="grid gap-6 border-t border-mesquite/15 pt-10 md:grid-cols-[auto_1fr] md:gap-12"
              >
                <div className="flex items-baseline gap-4 md:block">
                  <span className="font-heading text-5xl text-ocre md:text-6xl">
                    {p.roman}
                  </span>
                  <h3 className="font-heading text-2xl text-mesquite md:mt-2 md:text-3xl">
                    {t(p.name)}
                  </h3>
                </div>
                <div className="space-y-4">
                  <p className="font-serif text-lg leading-relaxed text-mesquite">
                    {t(p.verse)}
                  </p>
                  <p className="font-serif leading-relaxed text-mesquite/70">
                    {t(p.practice)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-narrow">
          <div className="mb-12 text-center md:mb-16">
            <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
              {t({ en: 'THE PRACTICE', es: 'LA PRÁCTICA' })}
            </p>
            <h2 className="mb-6 font-heading text-4xl text-mesquite md:text-5xl">
              {t({
                en: 'How We Live Distributism',
                es: 'Cómo Vivimos el Distributismo',
              })}
            </h2>
            <p className="mx-auto max-w-2xl font-serif leading-relaxed text-mesquite/70">
              {t({
                en: 'Distributism is not a theory to be argued. It is a cycle to be walked — one season, one craft, one neighbor at a time.',
                es: 'El distributismo no es una teoría para debatir. Es un ciclo para caminar — una temporada, un oficio, un vecino a la vez.',
              })}
            </p>
          </div>

          <ol className="space-y-8">
            {cycle.map((step) => (
              <li
                key={step.num}
                className="grid gap-4 md:grid-cols-[auto_1fr] md:gap-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ocre/40 bg-ocre/10 font-heading text-2xl text-ocre">
                  {step.num}
                </div>
                <div>
                  <h3 className="mb-2 font-heading text-2xl text-mesquite">
                    {t(step.title)}
                  </h3>
                  <p className="font-serif leading-relaxed text-mesquite/80">
                    {t(step.body)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 text-center md:py-24">
        <div className="container-narrow">
          <p className="display-caps mb-4 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'BEGIN WHERE YOU ARE', es: 'COMIENZA DONDE ESTÁS' })}
          </p>
          <h2 className="mb-6 font-heading text-3xl text-mesquite md:text-4xl">
            {t({
              en: 'First things, first.',
              es: 'Lo primero, primero.',
            })}
          </h2>
          <p className="mx-auto max-w-2xl font-serif leading-relaxed text-mesquite/80">
            {t({
              en: 'You do not need to move to the countryside tomorrow. You need a seed, a skill, and a neighbor. The rest will grow.',
              es: 'No necesitas mudarte al campo mañana. Necesitas una semilla, un oficio y un vecino. Lo demás crecerá.',
            })}
          </p>
        </div>
      </section>
    </Layout>
  );
}
