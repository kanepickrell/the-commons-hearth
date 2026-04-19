import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ParishMap } from '@/components/ParishMap';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { witnessPosts } from '@/lib/fixtures/witness';
import { members } from '@/lib/fixtures/members';
import { buildPath } from '@/i18n/routes';

const Home = () => {
  const { t, locale } = useLocale();
  const s = uiStrings.home;
  const recent = [...witnessPosts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  const charisms = [
    {
      label: s.sowerCharism,
      slug: 'las-yerbas' as const,
      blurb: {
        en: 'We teach what we know — in fields, kitchens, and workshops.',
        es: 'Enseñamos lo que sabemos — en el campo, la cocina, y el taller.',
      },
    },
    {
      label: s.communityCharism,
      slug: 'el-pan' as const,
      blurb: {
        en: 'We gather at the table and under the live oak.',
        es: 'Nos reunimos a la mesa y bajo el encino.',
      },
    },
    {
      label: s.stewardCharism,
      slug: 'la-cisterna' as const,
      blurb: {
        en: 'We care for the land our families will inherit.',
        es: 'Cuidamos la tierra que heredarán nuestras familias.',
      },
    },
    {
      label: s.monstranceCharism,
      slug: 'las-abejas' as const,
      blurb: {
        en: 'We offer the work back to the God who gave it.',
        es: 'Ofrecemos el trabajo al Dios que nos lo ha dado.',
      },
    },
  ];

  return (
    <Layout>
      {/* Tagline */}
      <section className="container-prose pt-24 pb-20 text-center">
        <p className="display-caps text-xs tracking-[0.3em] text-ocre">
          {t(uiStrings.eyebrow.chapter)}
        </p>
        <h1 className="mt-8 font-heading text-4xl leading-[1.15] text-mesquite md:text-5xl">
          {t(s.tagline)}
        </h1>
      </section>

      <div className="rule container-prose" />

      {/* Four charisms — each with blurb for weight */}
      <section className="container-wide py-24">
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {charisms.map((c) => (
            <div key={c.slug} className="flex flex-col items-center text-center">
              <Icon slug={c.slug} size={112} locale={locale} />
              <p className="mt-6 font-heading text-lg leading-snug text-mesquite">
                {t(c.label)}
              </p>
              <p className="prose-body mt-3 text-sm italic leading-relaxed text-piedra">
                {t(c.blurb)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="rule container-wide" />

      {/* Map */}
      <section className="container-wide py-20">
        <header className="mb-10 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {locale === 'es' ? 'DÓNDE ESTAMOS' : 'WHERE WE ARE'}
          </p>
          <h2 className="mt-4 font-heading text-3xl text-mesquite">
            {t(s.chapterMap)}
          </h2>
        </header>
        <ParishMap />
      </section>

      <div className="rule container-wide" />

      {/* Latest witness */}
      <section className="container-prose py-24">
        <header className="mb-12 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {locale === 'es' ? 'RECIENTE' : 'RECENT'}
          </p>
          <h2 className="mt-4 font-heading text-3xl text-mesquite">
            {t(s.latestWitness)}
          </h2>
        </header>
        <ul className="space-y-12">
          {recent.map((post) => {
            const host = members.find((m) => m.id === post.hostId);
            return (
              <li key={post.id} className="flex gap-6">
                <div className="flex-shrink-0 pt-1">
                  <Icon slug={post.iconSlug} size={56} locale={locale} />
                </div>
                <div className="flex-1">
                  <p className="prose-body text-lg leading-relaxed text-mesquite">
                    {t(post.body)}
                  </p>
                  <p className="mt-3 text-sm italic text-piedra">
                    {host?.name} ·{' '}
                    {new Date(post.date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-12 text-center">
          <Link to={buildPath('testimonio', locale)} className="display-caps text-xs tracking-[0.2em] text-ocre">
            {t(s.seeAll)} →
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
