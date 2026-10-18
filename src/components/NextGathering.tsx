// src/components/NextGathering.tsx
// The homepage's one dated thing: the next gathering on the calendar.
//
// Reads `gatherings_public` with the same filter and ordering as the
// /workshops page (`event_date >= today`, soonest first) and takes the first
// row, so the two can never disagree — post a gathering and the homepage
// updates itself. The view does the redacting: an upcoming gathering's exact
// time and street address are withheld from anyone who isn't an approved
// member, which is why `place` falls back to the parish city rather than
// explaining an absence.
//
// Signed-in members get their own RSVP state instead of the generic prompt:
// already coming reads as a line, not a button they'd press twice. The
// courtesy gates (sign in / await approval / already RSVP'd) all live in
// useRsvp, shared with the gathering page and the map popup — this component
// never decides who may RSVP, it only asks.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { LanguageNote } from '@/components/LanguageNote';
import { RsvpModal, type ContributionType } from '@/components/RsvpModal';
import { SignInModal } from '@/components/SignInModal';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAuth } from '@/hooks/useAuth';
import { useRsvp } from '@/hooks/useRsvp';
import { buildPath } from '@/i18n/routes';
import { homeCopy } from '@/content/home';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { supabase } from '@/lib/supabase';
import type { IconSlug } from '@/lib/types';
import {
  chapterTzLabel, dateOnlyInZone, formatDate, formatTime, fromDateOnly, todayLocalISO,
} from '@/lib/dates';

type NextRow = {
  id: string;
  title: string;
  description: string | null;
  language: 'en' | 'es' | null;
  craft: IconSlug | null;
  event_date: string;            // 'YYYY-MM-DD', always present
  held_at: string | null;        // exact time — null when gated
  location_text: string | null;  // address — null when gated
  parish_city: string | null;
  details_visible: boolean;
};

export const NextGathering = () => {
  const { t, locale } = useLocale();
  const { user } = useAuth();

  const [next, setNext] = useState<NextRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [myContribution, setMyContribution] = useState<ContributionType | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('gatherings_public')
        .select(
          'id, title, description, language, craft, event_date, held_at, location_text, parish_city, details_visible'
        )
        .gte('event_date', todayLocalISO())
        .order('event_date', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Failed to load the next gathering:', error);
      } else if (data && data.length > 0) {
        setNext(data[0] as unknown as NextRow);
      }
      setLoading(false);
    })();
  }, []);

  // Have they already said they're coming? RLS lets an attendee read their
  // own row, so this answers for a member without reading the guest list.
  const loadMyRsvp = useCallback(async () => {
    if (!user || !next) {
      setMyContribution(null);
      return;
    }
    const { data } = await supabase
      .from('rsvps')
      .select('contribution_type')
      .eq('workshop_id', next.id)
      .eq('profile_id', user.id)
      .maybeSingle();

    setMyContribution((data?.contribution_type as ContributionType) ?? null);
  }, [user, next]);

  useEffect(() => {
    loadMyRsvp();
  }, [loadMyRsvp]);

  const rsvp = useRsvp({
    workshopId: next?.id ?? null,
    alreadyRsvpd: !!myContribution,
    onSuccess: loadMyRsvp,
  });

  const eyebrow = (
    <p className="display-caps text-sm font-semibold tracking-[0.3em] text-ocre md:text-base">
      {t(homeCopy.gatheringEyebrow)}
    </p>
  );

  if (loading) {
    return (
      <section className="container-prose py-20 text-center">
        {eyebrow}
        <p className="mt-10 font-serif italic text-piedra/60">…</p>
      </section>
    );
  }

  // Nothing on the calendar. Say so plainly and offer the one thing that
  // helps — being told when there is.
  if (!next) {
    return (
      <section className="container-prose py-20 text-center">
        {eyebrow}
        <p className="prose-body mx-auto mt-8 max-w-md text-base italic leading-relaxed text-piedra">
          {t(homeCopy.emptyBefore)}
          <Link to={buildPath('participate', locale)} className="text-mesquite">
            {t(homeCopy.emptyLink)}
          </Link>
          {t(homeCopy.emptyAfter)}
        </p>
      </section>
    );
  }

  // When the exact instant is visible, derive the calendar day from it in
  // Central Time — the view's event_date can land an evening gathering on the
  // next day. Same reasoning as TallerDetail.
  const day = next.held_at ? dateOnlyInZone(next.held_at) : next.event_date;
  const dateLine = formatDate(fromDateOnly(day), locale, {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const timeLine = next.held_at
    ? `${formatTime(next.held_at, locale)} ${chapterTzLabel(locale, new Date(next.held_at))}`
    : null;

  // Members see the address; everyone else sees the town, which is all
  // gatherings_public will give up before the day arrives.
  const place = next.details_visible
    ? next.location_text ?? next.parish_city
    : next.parish_city
      ? `${locale === 'es' ? 'cerca de' : 'near'} ${next.parish_city}`
      : null;

  const detailPath = buildPath('tallerDetail', locale, { id: next.id });

  return (
    <section className="container-prose py-20 text-center">
      {eyebrow}

      <div className="mt-10 flex flex-col items-center">
        <Icon slug={next.craft} size={72} locale={locale} />

        <p className="mt-6 display-caps text-xs tracking-[0.2em] text-ocre">
          {dateLine}
          {timeLine ? `, ${timeLine}` : ''}
          {place ? ` · ${place}` : ''}
        </p>

        <h2 className="mt-3 font-heading text-3xl leading-snug text-mesquite">
          <Link to={detailPath} className="no-underline hover:text-ocre" style={{ textDecoration: 'none' }}>
            {next.title}
          </Link>
        </h2>

        {/* Two lines, not the whole description. Hosts write these at any
            length — the current one runs 250 words — and the homepage is a
            trailhead: the rest is one click away on the gathering's page.
            The language note sits OUTSIDE the clamp; inline, it's the first
            thing the clamp eats, and a Spanish reader would lose the one
            marker saying this gathering was written up in English. */}
        {next.description && (
          <>
            <p className="prose-body mt-5 line-clamp-2 max-w-xl text-base leading-relaxed text-mesquite/80">
              {next.description}
            </p>
            <LanguageNote contentLanguage={next.language} className="mt-2 block" />
          </>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          {myContribution ? (
            // Already coming. A line, not a button — there's nothing to press.
            <p className="font-heading text-base text-mesquite">
              {t(homeCopy.coming)}
              <span className="font-serif text-sm italic text-piedra">
                {' · '}
                {t(uiStrings.contribution.bringing)}{' '}
                {t(uiStrings.contribution[myContribution]).toLowerCase()}
              </span>
            </p>
          ) : user ? (
            <button
              type="button"
              onClick={rsvp.openModal}
              className="rounded-sm bg-ocre px-8 py-3 font-heading text-base text-cal transition hover:bg-mesquite"
            >
              {t(uiStrings.workshop.rsvp)}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="rounded-sm bg-ocre px-8 py-3 font-heading text-base text-cal transition hover:bg-mesquite"
            >
              {t(uiStrings.workshop.logInToRsvp)}
            </button>
          )}

          <Link
            to={buildPath('talleres', locale)}
            className="display-caps text-xs tracking-[0.2em] text-ocre no-underline hover:text-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t(homeCopy.allGatherings)} →
          </Link>
        </div>
      </div>

      <RsvpModal open={rsvp.modalOpen} onClose={rsvp.closeModal} onSubmit={rsvp.submit} />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </section>
  );
};
