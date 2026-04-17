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
      <section className="container-wide py-16">
        <header className="mb-12 text-center">
          <p className="display-caps text-xs tracking-[0.25em] text-ocre">
            {locale === 'es' ? 'MIEMBROS FUNDADORES' : 'FOUNDING MEMBERS'}
          </p>
          <h1 className="mt-4 font-heading text-4xl text-mesquite">
            {t(uiStrings.ofrendas.heading)}
          </h1>
        </header>

        <ul className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                to={buildPath('ofrendaDetail', locale, { id: m.id })}
                className="group block no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon slug={m.iconSlug} size={84} locale={locale} />
                  <h2 className="mt-5 font-heading text-xl text-mesquite group-hover:text-ocre">
                    {m.name}
                  </h2>
                  <p className="mt-1 text-sm text-piedra">{m.parish}</p>
                  <p className="prose-body mt-3 text-[0.95rem] text-mesquite/85">
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
