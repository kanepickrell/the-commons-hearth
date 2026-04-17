import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { members } from '@/lib/fixtures/members';
import { workshops } from '@/lib/fixtures/workshops';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';

const OfrendaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const member = members.find((m) => m.id === id);

  if (!member) {
    return (
      <Layout>
        <div className="container-prose py-32 text-center">
          <p className="font-heading italic text-piedra">
            {locale === 'es' ? 'Miembro no encontrado.' : 'Member not found.'}
          </p>
          <Link to={buildPath('ofrendas', locale)} className="mt-4 inline-block">
            {t(uiStrings.common.backToOfrendas)}
          </Link>
        </div>
      </Layout>
    );
  }

  const hosting = workshops.filter((w) => w.hostId === member.id);
  const s = uiStrings.profile;

  return (
    <Layout>
      <article className="container-prose py-20">
        <Link to={buildPath('ofrendas', locale)} className="text-sm">
          {t(uiStrings.common.backToOfrendas)}
        </Link>

        <header className="mt-10 flex flex-col items-center text-center">
          <Icon slug={member.iconSlug} size={120} locale={locale} />
          <h1 className="mt-8 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
            {member.name}
          </h1>
          <p className="mt-3 text-base text-piedra">{member.parish}</p>
        </header>

        <div className="rule mt-12" />

        <section className="mt-12 space-y-12">
          <div>
            <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
              {t(s.offeringLabel)}
            </h2>
            <p className="prose-body mt-4 text-xl text-mesquite">{t(member.offering)}</p>
          </div>

          <div>
            <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
              {t(s.workingOnLabel)}
            </h2>
            <p className="prose-body mt-4 text-xl text-mesquite">{t(member.workingOn)}</p>
          </div>

          <div>
            <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
              {t(s.wantsToLearnLabel)}
            </h2>
            <p className="prose-body mt-4 text-xl text-mesquite">{t(member.wantsToLearn)}</p>
          </div>
        </section>

        {hosting.length > 0 && (
          <>
            <div className="rule mt-16" />
            <section className="mt-12">
              <h2 className="font-heading text-xl text-mesquite">{t(s.upcomingWorkshops)}</h2>
              <ul className="mt-6 space-y-4">
                {hosting.map((w) => (
                  <li key={w.id}>
                    <Link
                      to={buildPath('tallerDetail', locale, { id: w.id })}
                      className="font-heading text-lg text-mesquite no-underline hover:text-ocre"
                      style={{ textDecoration: 'none' }}
                    >
                      {t(w.title)}
                    </Link>
                    <p className="text-sm text-piedra">
                      {new Date(w.date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      — {w.locationName}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </article>
    </Layout>
  );
};

export default OfrendaDetail;
