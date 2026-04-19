import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { members } from '@/lib/fixtures/members';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';

const Ofrendas = () => {
  const { t, locale } = useLocale();

  return (
    <Layout>
      <section className="container-wide pb-24 pt-20">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(uiStrings.eyebrow.foundingMembers)}
          </p>
          <h1 className="mt-6 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
            {t(uiStrings.ofrendas.heading)}
          </h1>
          <p className="prose-body mt-6 text-lg italic text-piedra">
            {locale === 'es'
              ? 'Estos son nuestros vecinos en el capítulo — cada uno trae algo a la mesa.'
              : 'These are our neighbors in the chapter — each brings something to the table.'}
          </p>
        </header>

        <div className="rule container-prose mt-16" />

        {/* Portrait list — two per row on desktop, generous whitespace */}
        <ul className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-x-16 gap-y-20 md:grid-cols-2">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                to={buildPath('ofrendaDetail', locale, { id: m.id })}
                className="group flex gap-6 no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex-shrink-0 pt-1">
                  <Icon slug={m.iconSlug} size={96} locale={locale} />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-2xl leading-tight text-mesquite group-hover:text-ocre">
                    {m.name}
                  </h2>
                  <p className="mt-1 text-sm italic text-piedra">{m.parish}</p>
                  <p className="prose-body mt-4 text-[1.05rem] leading-relaxed text-mesquite/90">
                    {t(m.offering)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
};

export default Ofrendas;