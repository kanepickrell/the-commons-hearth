// src/pages/TallerDetail.tsx
// Workshop detail page with the full RSVP flow:
//   - Host name links to their profile
//   - "I'll be there" button opens the contribution modal
//   - After a successful RSVP, row is inserted, email trigger fires
//   - "Who's coming" list shows names + what they're bringing (approved
//     members see this via RLS; anonymous visitors don't see it at all)
// Note: the confirmation email is fired by a Postgres trigger → Edge Function
// → Resend. The client just does the INSERT.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { LanguageNote } from '@/components/LanguageNote';
import { RsvpModal, type ContributionType } from '@/components/RsvpModal';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAuth } from '@/hooks/useAuth';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { IconSlug } from '@/lib/types';

type WorkshopDetail = {
  id: string;
  title: string;
  description: string | null;
  language: 'en' | 'es' | null;
  craft: IconSlug | null;
  held_at: string;
  location_text: string | null;
  host: { id: string; display_name: string | null } | null;
};

type RsvpRow = {
  id: string;
  profile_id: string;
  contribution_type: ContributionType;
  contribution_note: string | null;
  attendee: { display_name: string | null } | null;
};

const TallerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { user, profile } = useAuth();

  const [w, setW] = useState<WorkshopDetail | null>(null);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const isApprovedMember = !!profile && profile.status === 'approved';
  const myRsvp = rsvps.find((r) => r.profile_id === user?.id) ?? null;

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('workshops')
        .select(
          'id, title, description, language, craft, held_at, location_text, host:profiles!workshops_host_id_fkey(id, display_name)'
        )
        .eq('id', id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) {
        console.error('Failed to load workshop:', error);
      } else if (data) {
        setW(data as unknown as WorkshopDetail);
      }
      setLoading(false);
    })();
  }, [id]);

  // Load RSVPs — RLS limits this to approved members (or the host, or the
  // attendee themselves), so anonymous visitors get an empty array.
  const loadRsvps = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('rsvps')
      .select(
        'id, profile_id, contribution_type, contribution_note, attendee:profiles!rsvps_profile_id_fkey(display_name)'
      )
      .eq('workshop_id', id)
      .order('created_at', { ascending: true });

    if (data) setRsvps(data as unknown as RsvpRow[]);
  };

  useEffect(() => {
    loadRsvps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isApprovedMember]);

  const handleRsvp = async (values: { contributionType: ContributionType; note: string }) => {
    if (!user || !id) throw new Error('not signed in');

    const { error } = await supabase.from('rsvps').insert({
      workshop_id: id,
      profile_id: user.id,
      contribution_type: values.contributionType,
      contribution_note: values.note || null,
    });

    if (error) {
      // Unique-index violation (already RSVP'd)
      if (error.code === '23505') {
        throw new Error(t(uiStrings.rsvp.alreadyRsvpd));
      }
      throw new Error(error.message);
    }

    setModalOpen(false);
    toast({
      title: t(uiStrings.rsvp.confirmed),
    });
    await loadRsvps();
  };

  const openModal = () => {
    if (!user) {
      toast({ title: t(uiStrings.rsvp.signInFirst) });
      return;
    }
    if (!isApprovedMember) {
      toast({ title: t(uiStrings.rsvp.needsApproval) });
      return;
    }
    if (myRsvp) {
      toast({ title: t(uiStrings.rsvp.alreadyRsvpd) });
      return;
    }
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-prose py-32 text-center font-serif italic text-piedra/60">…</div>
      </Layout>
    );
  }

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

  const c = uiStrings.contribution;
  const contributionLabel = (k: ContributionType) => t(c[k]);

  return (
    <Layout>
      <article className="container-prose py-20">
        <Link to={buildPath('talleres', locale)} className="text-sm">
          {t(uiStrings.common.backToTalleres)}
        </Link>

        <header className="mt-10 flex flex-col items-center text-center">
          {w.craft && <Icon slug={w.craft} size={96} locale={locale} />}
          <p className="mt-6 display-caps text-xs tracking-[0.2em] text-ocre">
            {new Date(w.held_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight text-mesquite">{w.title}</h1>
        </header>

        <div className="rule mt-12" />

        {w.description && (
          <p className="prose-body mt-10 text-xl text-mesquite">
            {w.description}
            <LanguageNote contentLanguage={w.language} className="ml-2" />
          </p>
        )}

        <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {w.host && (
            <div>
              <dt className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(uiStrings.workshop.hostedBy)}
              </dt>
              <dd className="mt-2 font-heading text-lg text-mesquite">
                <Link
                  to={buildPath('memberDetail', locale, { id: w.host.id })}
                  className="no-underline hover:text-ocre"
                  style={{ textDecoration: 'none' }}
                >
                  {w.host.display_name ?? '—'}
                </Link>
              </dd>
            </div>
          )}
          {w.location_text && (
            <div>
              <dt className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(uiStrings.workshop.location)}
              </dt>
              <dd className="mt-2 font-heading text-lg text-mesquite">{w.location_text}</dd>
            </div>
          )}
        </dl>

        <div className="mt-14 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={openModal}
            disabled={!!myRsvp}
            className="border border-ocre bg-ocre px-8 py-3 font-heading text-lg text-cal transition-colors hover:bg-mesquite hover:border-mesquite disabled:cursor-not-allowed disabled:opacity-60"
          >
            {myRsvp
              ? `${t(uiStrings.contribution.bringing)}: ${contributionLabel(myRsvp.contribution_type)}`
              : t(uiStrings.workshop.rsvp)}
          </button>
          <p className="text-sm italic text-piedra">
            {rsvps.length} {t(uiStrings.workshop.rsvpCount)}
          </p>
        </div>

        {/* Who's coming — only shown if there are RSVPs and the viewer can see them */}
        {rsvps.length > 0 && (
          <section className="mt-16 border-t border-mesquite/10 pt-10">
            <h2 className="display-caps mb-6 text-xs tracking-[0.2em] text-ocre">
              {t(uiStrings.workshop.whosComing).toUpperCase()}
            </h2>
            <ul className="space-y-3">
              {rsvps.map((r) => (
                <li key={r.id} className="flex flex-col gap-1 border-b border-mesquite/10 pb-3 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <Link
                      to={buildPath('memberDetail', locale, { id: r.profile_id })}
                      className="font-heading text-base text-mesquite no-underline hover:text-ocre"
                      style={{ textDecoration: 'none' }}
                    >
                      {r.attendee?.display_name ?? '—'}
                    </Link>
                    <span className="font-serif text-xs italic text-piedra">
                      {t(uiStrings.contribution.bringing)} {contributionLabel(r.contribution_type).toLowerCase()}
                    </span>
                  </div>
                  {r.contribution_note && (
                    <p className="font-serif text-sm italic text-mesquite/70">
                      “{r.contribution_note}”
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <RsvpModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRsvp}
      />
    </Layout>
  );
};

export default TallerDetail;
