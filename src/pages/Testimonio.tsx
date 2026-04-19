import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { witnessPosts } from '@/lib/fixtures/witness';
import { members } from '@/lib/fixtures/members';
import { uiStrings } from '@/lib/fixtures/uiStrings';

const Testimonio = () => {
  const { t, locale } = useLocale();
  const sorted = [...witnessPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Layout>
      <section className="container-prose pb-24 pt-20">
        <header className="mb-16 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(uiStrings.eyebrow.theWitness)}
          </p>
          <h1 className="mt-6 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
            {t(uiStrings.witness.heading)}
          </h1>
          <p className="prose-body mt-6 italic text-piedra">
            {locale === 'es'
              ? 'Lo que hacemos, lo guardamos aquí — una frase a la vez.'
              : 'What we do, we keep here — one sentence at a time.'}
          </p>
        </header>

        <div className="rule" />

        <ul className="mt-16 space-y-16">
          {sorted.map((post) => {
            const host = members.find((m) => m.id === post.hostId);
            return (
              <li key={post.id} className="flex gap-6">
                <div className="flex-shrink-0 pt-1">
                  <Icon slug={post.iconSlug} size={64} locale={locale} />
                </div>
                <div className="flex-1">
                  <p className="prose-body text-xl leading-relaxed text-mesquite">
                    {t(post.body)}
                  </p>
                  <p className="mt-4 text-sm italic text-piedra">
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

export default Testimonio;