// src/components/ContactModal.tsx
// Public contact form, opened from the footer "Reach us" link.
// For non-members (and members alike): a way to reach the chapter without
// going through Discord. Invokes the contact-notify Edge Function, which
// emails the chapter inbox with reply_to set to the sender.
//
// Mirrors RsvpModal's structure and palette. A hidden honeypot ("website")
// catches bots; the Edge Function silently drops anything that fills it.

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { supabase } from '@/lib/supabase';

type Category = 'general' | 'parish' | 'chapter' | 'press';
const CATEGORIES: Category[] = ['general', 'parish', 'chapter', 'press'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  open: boolean;
  onClose: () => void;
};

export const ContactModal = ({ open, onClose }: Props) => {
  const { t, locale } = useLocale();
  const s = uiStrings.contact;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Lock page scroll while open so the centered modal stays in view.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const reset = () => {
    setName(''); setEmail(''); setCategory('general');
    setMessage(''); setWebsite(''); setError(null); setDone(false);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    const n = name.trim();
    const e = email.trim();
    const m = message.trim();

    if (n.length < 1) { setError(t(s.errName)); return; }
    if (!EMAIL_RE.test(e)) { setError(t(s.errEmail)); return; }
    if (m.length < 1) { setError(t(s.errMessage)); return; }

    setSubmitting(true);
    try {
      const { error: invokeErr } = await supabase.functions.invoke('contact-notify', {
        body: { name: n, email: e, category, message: m, website, lang: locale },
      });
      if (invokeErr) throw invokeErr;
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('contact-notify failed:', msg);
      setError(t(s.errSend));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-mesquite/50 backdrop-blur-sm">
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={(ev) => { if (ev.target === ev.currentTarget) close(); }}
      >
        <div className="my-8 w-full max-w-lg rounded-sm border border-mesquite/20 bg-cal p-8 shadow-lg">
        {done ? (
          <>
            <h2 className="mb-3 font-heading text-2xl text-mesquite">{t(s.sentTitle)}</h2>
            <p className="mb-6 font-serif text-base leading-relaxed text-mesquite/80">
              {t(s.sentBody)}
            </p>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={close}
                className="rounded-sm bg-ocre px-6 py-2 font-heading text-sm text-cal transition hover:bg-mesquite"
              >
                {t(s.closeBtn)}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-3 font-heading text-2xl text-mesquite">{t(s.modalTitle)}</h2>
            <p className="mb-6 font-serif text-base italic leading-relaxed text-mesquite/70">
              {t(s.modalIntro)}
            </p>

            {/* Honeypot — visually hidden, off-tab, off-autocomplete. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(ev) => setWebsite(ev.target.value)}
                />
              </label>
            </div>

            <label className="mb-2 block font-heading text-sm text-mesquite/70">{t(s.nameLabel)}</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value.slice(0, 100))}
              placeholder={t(s.namePlaceholder)}
              className="mb-4 w-full rounded-sm border border-mesquite/20 bg-cal/50 p-3 font-serif text-sm text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
            />

            <label className="mb-2 block font-heading text-sm text-mesquite/70">{t(s.emailLabel)}</label>
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value.slice(0, 200))}
              placeholder={t(s.emailPlaceholder)}
              className="mb-4 w-full rounded-sm border border-mesquite/20 bg-cal/50 p-3 font-serif text-sm text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
            />

            <label className="mb-2 block font-heading text-sm text-mesquite/70">{t(s.categoryLabel)}</label>
            <select
              value={category}
              onChange={(ev) => setCategory(ev.target.value as Category)}
              className="mb-4 w-full rounded-sm border border-mesquite/20 bg-cal/50 p-3 font-serif text-sm text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(s.categories[c])}</option>
              ))}
            </select>

            <label className="mb-2 block font-heading text-sm text-mesquite/70">{t(s.messageLabel)}</label>
            <textarea
              rows={4}
              value={message}
              onChange={(ev) => setMessage(ev.target.value.slice(0, 5000))}
              placeholder={t(s.messagePlaceholder)}
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
                onClick={close}
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
          </>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
};