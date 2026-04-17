import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { workshops } from '@/lib/fixtures/workshops';
import { members } from '@/lib/fixtures/members';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';

const Talleres = () => {
  const { t, locale } = useLocale();
  const sorted = [...workshops].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Layout>
      <section className="container-prose py-20">
        <header className="mb-12 text-center">
          <p className="display-caps text-xs tracking-[0.25em] text-ocre">
            {locale === 'es' ? 'EL TALLER' : 'THE WORKSHOP'}
          </p>
          <h1 className="mt-4 font-heading text-4xl text-mesquite">
            {t(uiStrings.workshop.upcoming)}
          </h1>
        </header>

        <ul className="space-y-12">
          {sorted.map((w) => {
            const host = members.find((m) => m.id === w.hostId);
            return (
              <li key={w.id}>
                <Link
                  to={buildPath('tallerDetail', locale, { id: w.id })}
                  className="flex gap-6 no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex-shrink-0 pt-2">
                    <Icon slug={w.iconSlug} size={72} locale={locale} />
                  </div>
                  <div className="flex-1">
                    <p className="display-caps text-xs tracking-[0.18em] text-ocre">
                      {new Date(w.date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h2 className="mt-2 font-heading text-2xl leading-snug text-mesquite hover:text-ocre">
                      {t(w.title)}
                    </h2>
                    <p className="prose-body mt-3 text-mesquite/85">{t(w.description)}</p>
                    <p className="mt-3 text-sm italic text-piedra">
                      {t(uiStrings.workshop.hostedBy)} {host?.name} · {w.locationName}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Layout>
  );
};

export default Talleres;
