// src/hooks/useRsvp.ts
// The RSVP flow, shared by the gathering page and the parish map popup.
//
// This lived inline in TallerDetail until the map grew an RSVP button of its
// own. Both callers need the same three things and must not disagree about
// them: who is allowed to RSVP, what the insert looks like, and what a
// duplicate means.
//
// Writes go to `rsvps`, which RLS limits to approved members. The gate here
// is the courteous version of that rule — it explains the refusal instead of
// letting the insert fail — and never the enforcement. The database is.
//
// Usage:
//   const rsvp = useRsvp({ workshopId: id, alreadyRsvpd: !!myRsvp, onSuccess: loadRsvps });
//   <button onClick={rsvp.openModal}>…</button>
//   <RsvpModal open={rsvp.modalOpen} onClose={rsvp.closeModal} onSubmit={rsvp.submit} />

import { useCallback, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAuth } from '@/hooks/useAuth';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { ContributionType } from '@/components/RsvpModal';

type Options = {
  workshopId: string | null;
  /**
   * Whether this viewer has already said they're coming. Callers that hold
   * the attendee list (the gathering page) can answer; callers that don't
   * (the map popup) leave it false and let the unique index catch it — the
   * duplicate is translated below either way.
   */
  alreadyRsvpd?: boolean;
  onSuccess?: () => void | Promise<void>;
};

export function useRsvp({ workshopId, alreadyRsvpd = false, onSuccess }: Options) {
  const { t } = useLocale();
  const { user, profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const isApprovedMember = !!profile && profile.status === 'approved';

  const openModal = useCallback(() => {
    if (!user) {
      toast({ title: t(uiStrings.rsvp.signInFirst) });
      return;
    }
    if (!isApprovedMember) {
      toast({ title: t(uiStrings.rsvp.needsApproval) });
      return;
    }
    if (alreadyRsvpd) {
      toast({ title: t(uiStrings.rsvp.alreadyRsvpd) });
      return;
    }
    setModalOpen(true);
  }, [user, isApprovedMember, alreadyRsvpd, t]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const submit = useCallback(
    async (values: { contributionType: ContributionType; note: string }) => {
      if (!user || !workshopId) throw new Error('not signed in');

      const { error } = await supabase.from('rsvps').insert({
        workshop_id: workshopId,
        profile_id: user.id,
        contribution_type: values.contributionType,
        contribution_note: values.note || null,
      });

      if (error) {
        // 23505 is the unique violation on (workshop_id, profile_id): they
        // already said they were coming, probably in another tab.
        throw new Error(error.code === '23505' ? t(uiStrings.rsvp.alreadyRsvpd) : error.message);
      }

      setModalOpen(false);
      toast({ title: t(uiStrings.rsvp.confirmed) });
      await onSuccess?.();
    },
    [user, workshopId, t, onSuccess]
  );

  return { modalOpen, openModal, closeModal, submit, isApprovedMember };
}
