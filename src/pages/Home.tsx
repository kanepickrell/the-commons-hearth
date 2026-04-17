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
    { label: s.sowerCharism, slug: 'la-milpa' as const },
    { label: s.communityCharism, slug: 'el-pan' as const },
    { label: s.stewardCharism, slug: 'la-cisterna' as const },
    { label: s.monstranceCharism, slug: 'las-yerbas' as const },
  ];

  return (
    <Layout>
      {/* Tagline */}
      <section className="container-prose pt-20 pb-16 text-center">
        <p className="display-caps text-xs tracking-[0.25em] text-ocre">
          {locale === 'es' ? 'CAPÍTULO DEL CENTRO DE TEJAS' : 'CENTRAL TEXAS CHAPTER'}
        </p>
        <h1 className="mt-6 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
          {t(s.tagline)}
        </h1>
      </section>

      <div className="rule container-prose" />

      {/* Four charisms */}
      <section className="container-wide py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {charisms.map((c) => (
            <div key={c.slug} className="flex flex-col items-center text-center">
              <Icon slug={c.slug} size={84} locale={locale} />
              <p className="mt-4 font-heading text-base leading-snug text-mesquite">
                {t(c.label)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="container-wide py-12">
        <h2 className="mb-6 font-heading text-2xl text-mesquite">{t(s.chapterMap)}</h2>
        <ParishMap />
      </section>

      {/* Latest witness */}
      <section className="container-prose py-20">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-heading text-2xl text-mesquite">{t(s.latestWitness)}</h2>
          <Link to={buildPath('testimonio', locale)} className="text-sm">
            {t(s.seeAll)} →
          </Link>
        </div>
        <ul className="space-y-10">
          {recent.map((post) => {
            const host = members.find((m) => m.id === post.hostId);
            return (
              <li key={post.id} className="flex gap-5">
                <div className="flex-shrink-0">
                  <Icon slug={post.iconSlug} size={48} locale={locale} />
                </div>
                <div>
                  <p className="prose-body text-mesquite">{t(post.body)}</p>
                  <p className="mt-2 text-sm italic text-piedra">
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
      </section>
    </Layout>
  );
};

export default Home;
