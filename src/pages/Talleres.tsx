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
      <section className="container-prose pb-24 pt-20">
        <header className="mb-16 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(uiStrings.eyebrow.theWorkshop)}
          </p>
          <h1 className="mt-6 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
            {t(uiStrings.workshop.upcoming)}
          </h1>
          <p className="prose-body mt-6 italic text-piedra">
            {locale === 'es'
              ? 'Reuniones reales, en lugares reales, con anfitriones reales.'
              : 'Real gatherings, in real places, with real hosts.'}
          </p>
        </header>

        <div className="rule" />

        <ul className="mt-16 space-y-16">
          {sorted.map((w) => {
            const host = members.find((m) => m.id === w.hostId);
            return (
              <li key={w.id}>
                <Link
                  to={buildPath('tallerDetail', locale, { id: w.id })}
                  className="group flex gap-6 no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex-shrink-0 pt-1">
                    <Icon slug={w.iconSlug} size={88} locale={locale} />
                  </div>
                  <div className="flex-1">
                    <p className="display-caps text-xs tracking-[0.2em] text-ocre">
                      {new Date(w.date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h2 className="mt-2 font-heading text-2xl leading-snug text-mesquite group-hover:text-ocre">
                      {t(w.title)}
                    </h2>
                    <p className="prose-body mt-4 text-[1.05rem] leading-relaxed text-mesquite/90">
                      {t(w.description)}
                    </p>
                    <p className="mt-4 text-sm italic text-piedra">
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