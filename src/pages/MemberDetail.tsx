// src/pages/MemberDetail.tsx
// One member's public profile — structured around the three questions:
//   Sharing (crafts) · Building (working_on) · Learning (wants_to_learn) · Bio
// Plus upcoming + past gatherings they host.
//
// PRIVACY-SPLIT NOTE: the hosted-gathering lists now read the redacting
// `gatherings_public` view, NOT the `workshops` base table. After the lock
// (drop policy workshops_select), a visitor can no longer SELECT another
// member's approved workshops directly — only their own rows or, for admins,
// all rows. The view is approved-only and bypasses RLS, so it's the correct
// source for "gatherings this member hosts." We split on `event_date`
// (always present) rather than `held_at` (null when details are gated).

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { LanguageNote } from '@/components/LanguageNote';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAuth } from '@/hooks/useAuth';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import type { IconSlug } from '@/lib/types';
import { craftLabel as craftName } from '@/lib/crafts';
import { formatDate, fromDateOnly, todayLocalISO } from '@/lib/dates';

type DetailRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  working_on: string | null;
  wants_to_learn: string | null;
  bio_language: 'en' | 'es' | null;
  icon_slug: IconSlug | null;
  custom_skills?: string[] | null; // absent for signed-out viewers
  parish: { name: string; city: string | null } | null;
};

type Expertise = { id: string; craft: string };

type HostedGathering = {
  id: string;
  title: string;
  event_date: string;            // 'YYYY-MM-DD', always present on the view
  location_text: string | null;  // null when details are gated for the viewer
};

const MemberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const s = uiStrings.profile;

  const [member, setMember] = useState<DetailRow | null>(null);
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [upcoming, setUpcoming] = useState<HostedGathering[]>([]);
  const [past, setPast] = useState<HostedGathering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || authLoading) return;
    const today = todayLocalISO();
    // Column-level grants: anon can't read `custom_skills`, and PostgREST
    // rejects the whole SELECT if any requested column is denied (same issue
    // ParishMap has with contact_email). Ask for it only when signed in.
    const profileSelect = isAuthenticated
      ? 'id, display_name, bio, working_on, wants_to_learn, bio_language, icon_slug, custom_skills, parish:parishes(name, city)'
      : 'id, display_name, bio, working_on, wants_to_learn, bio_language, icon_slug, parish:parishes(name, city)';
    (async () => {
      const [profileResult, expertiseResult, upcomingResult, pastResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(profileSelect)
          .eq('id', id)
          .eq('status', 'approved')
          .maybeSingle(),
        supabase
          .from('expertise')
          .select('id, craft')
          .eq('profile_id', id)
          .order('created_at'),
        // Upcoming — read the view (approved-only, so no status filter).
        supabase
          .from('gatherings_public')
          .select('id, title, event_date, location_text')
          .eq('host_id', id)
          .gte('event_date', today)
          .order('event_date', { ascending: true }),
        // Past — same view, the other side of today.
        supabase
          .from('gatherings_public')
          .select('id, title, event_date, location_text')
          .eq('host_id', id)
          .lt('event_date', today)
          .order('event_date', { ascending: false })
          .limit(10),
      ]);

      if (profileResult.error) console.error('Failed to load member:', profileResult.error);
      if (profileResult.data) setMember(profileResult.data as unknown as DetailRow);
      if (expertiseResult.data) setExpertise(expertiseResult.data);
      if (upcomingResult.data) setUpcoming(upcomingResult.data as unknown as HostedGathering[]);
      if (pastResult.data) setPast(pastResult.data as unknown as HostedGathering[]);
      setLoading(false);
    })();
  }, [id, authLoading, isAuthenticated]);

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
          <Link to={buildPath('vision', locale)} className="mt-4 inline-block">
            {t(uiStrings.common.backToVision)}
          </Link>
        </div>
      </Layout>
    );
  }

  const craftLabel = (slug: string) => craftName(slug, locale);

  return (
    <Layout>
      <article className="container-prose py-20">
        <header className="flex flex-col items-center text-center">
          <Icon slug={member.icon_slug} size={120} locale={locale} />
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
          {/* Sharing — crafts + self-described skills */}
          {(expertise.length > 0 || (member.custom_skills?.length ?? 0) > 0) && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.sharingLabel)}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {expertise.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-sm border border-mesquite/20 bg-cal/60 px-3 py-1.5 font-heading text-sm text-mesquite"
                  >
                    {craftLabel(e.craft)}
                  </li>
                ))}
                {(member.custom_skills ?? []).map((skill) => (
                  <li
                    key={`custom-${skill}`}
                    className="rounded-sm border border-mesquite/20 bg-cal/60 px-3 py-1.5 font-heading text-sm text-mesquite"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Building — working_on */}
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

          {/* Learning — wants_to_learn */}
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

          {/* Bio — the longer narrative */}
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
        </section>

        {upcoming.length > 0 && (
          <>
            <div className="rule mt-16" />
            <section className="mt-12">
              <h2 className="font-heading text-xl text-mesquite">{t(s.upcomingWorkshops)}</h2>
              <ul className="mt-6 space-y-4">
                {upcoming.map((w) => (
                  <li key={w.id}>
                    <Link
                      to={buildPath('tallerDetail', locale, { id: w.id })}
                      className="font-heading text-lg text-mesquite no-underline hover:text-ocre"
                      style={{ textDecoration: 'none' }}
                    >
                      {w.title}
                    </Link>
                    <p className="text-sm text-piedra">
                      {formatDate(fromDateOnly(w.event_date), locale)}
                      {w.location_text ? ` — ${w.location_text}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {past.length > 0 && (
          <>
            <div className="rule mt-16" />
            <section className="mt-12">
              <h2 className="font-heading text-xl text-mesquite">{t(s.pastWorkshops)}</h2>
              <ul className="mt-6 space-y-3">
                {past.map((w) => (
                  <li key={w.id} className="flex items-baseline justify-between gap-4">
                    <Link
                      to={buildPath('tallerDetail', locale, { id: w.id })}
                      className="font-heading text-base text-mesquite no-underline hover:text-ocre"
                      style={{ textDecoration: 'none' }}
                    >
                      {w.title}
                    </Link>
                    <span className="font-mono text-xs italic text-piedra/70">
                      {formatDate(fromDateOnly(w.event_date), locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
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

export default MemberDetail;