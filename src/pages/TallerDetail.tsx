import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { workshops } from '@/lib/fixtures/workshops';
import { members } from '@/lib/fixtures/members';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';

const TallerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const w = workshops.find((x) => x.id === id);

  if (!w) {
    return (
      <Layout>
        <div className="container-prose py-32 text-center">
          <p className="font-heading italic text-piedra">
            {locale === 'es' ? 'Taller no encontrado.' : 'Workshop not found.'}
          </p>
          <Link to={buildPath('talleres', locale)} className="mt-4 inline-block">
            {t(uiStrings.common.backToTalleres)}
          </Link>
        </div>
      </Layout>
    );
  }

  const host = members.find((m) => m.id === w.hostId);

  return (
    <Layout>
      <article className="container-prose py-20">
        <Link to={buildPath('talleres', locale)} className="text-sm">
          {t(uiStrings.common.backToTalleres)}
        </Link>

        <header className="mt-10 flex flex-col items-center text-center">
          <Icon slug={w.iconSlug} size={96} locale={locale} />
          <p className="mt-6 display-caps text-xs tracking-[0.2em] text-ocre">
            {new Date(w.date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight text-mesquite">
            {t(w.title)}
          </h1>
        </header>

        <div className="rule mt-12" />

        <p className="prose-body mt-10 text-xl text-mesquite">{t(w.description)}</p>

        <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <dt className="display-caps text-xs tracking-[0.2em] text-ocre">
              {t(uiStrings.workshop.hostedBy)}
            </dt>
            <dd className="mt-2 font-heading text-lg text-mesquite">
              {host && (
                <Link
                  to={buildPath('ofrendaDetail', locale, { id: host.id })}
                  className="no-underline hover:text-ocre"
                  style={{ textDecoration: 'none' }}
                >
                  {host.name}
                </Link>
              )}
            </dd>
          </div>
          <div>
            <dt className="display-caps text-xs tracking-[0.2em] text-ocre">
              {t(uiStrings.workshop.location)}
            </dt>
            <dd className="mt-2 font-heading text-lg text-mesquite">{w.locationName}</dd>
          </div>
        </dl>

        <div className="mt-14 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="border border-ocre bg-ocre px-8 py-3 font-heading text-lg text-cal transition-colors hover:bg-mesquite hover:border-mesquite"
          >
            {t(uiStrings.workshop.rsvp)}
          </button>
          <p className="text-sm italic text-piedra">
            {w.rsvpCount} {t(uiStrings.workshop.rsvpCount)}
          </p>
        </div>
      </article>
    </Layout>
  );
};

export default TallerDetail;
