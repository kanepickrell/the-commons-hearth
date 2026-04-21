// src/components/RsvpModal.tsx
// The "What are you bringing?" prompt. Shown when an approved member
// clicks the RSVP button on a workshop page.
//
// Structured contribution_type so we can aggregate on the host view;
// optional free-text note so the host can plan around specifics.

import { useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';

export type ContributionType = 'time' | 'skill' | 'food' | 'tools' | 'materials' | 'other';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { contributionType: ContributionType; note: string }) => Promise<void>;
};

const TYPES: ContributionType[] = ['time', 'skill', 'food', 'tools', 'materials', 'other'];

export const RsvpModal = ({ open, onClose, onSubmit }: Props) => {
  const { t } = useLocale();
  const s = uiStrings.rsvp;
  const c = uiStrings.contribution;

  const [type, setType] = useState<ContributionType>('time');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ contributionType: type, note: note.trim() });
      // Parent handles closing + resetting state on success
      setNote('');
      setType('time');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = (k: ContributionType) => t(c[k]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-sm border border-mesquite/20 bg-cal p-8 shadow-lg">
        <h2 className="mb-3 font-heading text-2xl text-mesquite">{t(s.modalTitle)}</h2>
        <p className="mb-6 font-serif text-base italic leading-relaxed text-mesquite/70">
          {t(s.modalIntro)}
        </p>

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TYPES.map((k) => {
            const active = type === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setType(k)}
                className={`rounded-sm border px-3 py-2 text-center font-heading text-sm transition ${
                  active
                    ? 'border-ocre bg-ocre/10 text-mesquite'
                    : 'border-mesquite/15 bg-cal/50 text-mesquite/70 hover:border-mesquite/40 hover:text-mesquite'
                }`}
              >
                {typeLabel(k)}
              </button>
            );
          })}
        </div>

        <label className="mb-2 block font-heading text-sm text-mesquite/70">
          {t(s.noteLabel)}
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          placeholder={t(s.notePlaceholder)}
          className="mb-6 w-full rounded-sm border border-mesquite/20 bg-cal/50 p-3 font-serif text-sm text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
        />

        {error && (
          <p className="mb-4 rounded-sm border border-rojo/30 bg-rojo/5 p-3 font-serif text-sm text-rojo">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite disabled:opacity-40"
          >
            {t(s.cancel)}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-sm bg-ocre px-6 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? t(s.submitting) : t(s.submit)}
          </button>
        </div>
      </div>
    </div>
  );
};
