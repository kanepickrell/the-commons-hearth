// src/pages/OfrendaDetail.tsx
// One member's full offering: bio, working_on, wants_to_learn, upcoming workshops they host.
// All prose rendered in the language the member wrote in, with a LanguageNote when needed.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { LanguageNote } from '@/components/LanguageNote';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import type { IconSlug } from '@/lib/types';

type DetailRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  working_on: string | null;
  wants_to_learn: string | null;
  bio_language: 'en' | 'es' | null;
  icon_slug: IconSlug | null;
  parish: { name: string; city: string | null } | null;
};

type HostedWorkshop = {
  id: string;
  title: string;
  held_at: string;
  location_text: string | null;
};

const OfrendaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const s = uiStrings.profile;

  const [member, setMember] = useState<DetailRow | null>(null);
  const [hosting, setHosting] = useState<HostedWorkshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [profileResult, workshopResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'id, display_name, bio, working_on, wants_to_learn, bio_language, icon_slug, parish:parishes(name, city)'
          )
          .eq('id', id)
          .eq('status', 'approved')
          .maybeSingle(),
        supabase
          .from('workshops')
          .select('id, title, held_at, location_text')
          .eq('host_id', id)
          .eq('status', 'approved')
          .gte('held_at', new Date().toISOString())
          .order('held_at', { ascending: true }),
      ]);

      if (profileResult.error) {
        console.error('Failed to load profile:', profileResult.error);
      } else if (profileResult.data) {
        setMember(profileResult.data as unknown as DetailRow);
      }

      if (workshopResult.data) {
        setHosting(workshopResult.data);
      }

      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container-prose py-32 text-center font-serif italic text-piedra/60">…</div>
      </Layout>
    );
  }

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

  return (
    <Layout>
      <article className="container-prose py-20">
        <Link to={buildPath('ofrendas', locale)} className="text-sm">
          {t(uiStrings.common.backToOfrendas)}
        </Link>

        <header className="mt-10 flex flex-col items-center text-center">
          {member.icon_slug && <Icon slug={member.icon_slug} size={120} locale={locale} />}
          <h1 className="mt-8 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
            {member.display_name ?? '—'}
          </h1>
          {member.parish && (
            <p className="mt-3 text-base text-piedra">
              {member.parish.name}
              {member.parish.city ? ` · ${member.parish.city}` : ''}
            </p>
          )}
        </header>

        <div className="rule mt-12" />

        <section className="mt-12 space-y-12">
          {member.bio && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.offeringLabel)}
              </h2>
              <p className="prose-body mt-4 text-xl text-mesquite">
                {member.bio}
                <LanguageNote contentLanguage={member.bio_language} className="ml-2" />
              </p>
            </div>
          )}

          {member.working_on && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.workingOnLabel)}
              </h2>
              <p className="prose-body mt-4 text-xl text-mesquite">
                {member.working_on}
                <LanguageNote contentLanguage={member.bio_language} className="ml-2" />
              </p>
            </div>
          )}

          {member.wants_to_learn && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.wantsToLearnLabel)}
              </h2>
              <p className="prose-body mt-4 text-xl text-mesquite">
                {member.wants_to_learn}
                <LanguageNote contentLanguage={member.bio_language} className="ml-2" />
              </p>
            </div>
          )}
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
                      {w.title}
                    </Link>
                    <p className="text-sm text-piedra">
                      {new Date(w.held_at).toLocaleDateString(
                        locale === 'es' ? 'es-MX' : 'en-US',
                        { month: 'long', day: 'numeric', year: 'numeric' }
                      )}
                      {w.location_text ? ` — ${w.location_text}` : ''}
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