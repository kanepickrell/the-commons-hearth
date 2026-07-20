// src/components/SignInModal.tsx
// Modal sign-in surface, used by the "Log In To RSVP" button on gathering
// pages and the "Join the chapter" CTA on Home. Offers the same two paths as
// the header AuthButton: Google OAuth and an email magic-link (for members
// without Gmail). Kept self-contained so the header dropdown stays untouched.
//
// Rendered through a portal to document.body: the page's <main> carries a
// `fade-in` animation whose fill-mode holds a transform, which would otherwise
// make this modal's `position: fixed` resolve against <main> instead of the
// viewport (pinning it up-page). The portal escapes that containing block.

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Localized = { en: string; es: string };

type Props = {
  open: boolean;
  onClose: () => void;
  // Optional copy so the same modal can front different actions (RSVP, join,
  // etc.). Defaults preserve the original "Log in to RSVP" wording.
  title?: Localized;
  subtitle?: Localized;
};

export const SignInModal = ({ open, onClose, title, subtitle }: Props) => {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const { t } = useLocale();

  const heading = title ?? { en: 'Log in to RSVP', es: 'Inicia sesión para confirmar' };
  const blurb =
    subtitle ?? {
      en: 'Sign in to reserve your place and see who else is coming.',
      es: 'Inicia sesión para reservar tu lugar y ver quién más asistirá.',
    };

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  // Lock page scroll while open so the centered modal can't drift out of view.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const close = () => {
    setEmail('');
    setSent(false);
    setEmailErr(null);
    setSending(false);
    onClose();
  };

  const handleEmail = async () => {
    const addr = email.trim();
    if (!EMAIL_RE.test(addr)) {
      setEmailErr(t({ en: 'Enter a valid email address.', es: 'Escribe un correo válido.' }));
      return;
    }
    setSending(true);
    setEmailErr(null);
    try {
      await signInWithEmail(addr);
      setSent(true);
    } catch {
      setEmailErr(t({
        en: 'Could not send the link. Try again.',
        es: 'No pudimos enviar el enlace. Inténtalo de nuevo.',
      }));
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-mesquite/50 backdrop-blur-sm">
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="my-8 w-full max-w-md rounded-sm border border-mesquite/20 bg-cal p-8 shadow-lg">
        <h2 className="mb-2 font-heading text-2xl text-mesquite">
          {t(heading)}
        </h2>
        <p className="mb-6 font-serif text-base italic leading-relaxed text-mesquite/70">
          {t(blurb)}
        </p>

        {sent ? (
          <div className="text-center">
            <p className="font-heading text-sm text-mesquite">
              {t({ en: 'Check your email', es: 'Revisa tu correo' })}
            </p>
            <p className="mt-2 font-serif text-xs italic text-mesquite/70">
              {t({
                en: 'We sent a sign-in link to that address. Open it on this device.',
                es: 'Enviamos un enlace de acceso a ese correo. Ábrelo en este dispositivo.',
              })}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 rounded-sm bg-ocre px-6 py-2 font-heading text-sm text-cal transition hover:bg-mesquite"
            >
              {t({ en: 'Close', es: 'Cerrar' })}
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => signInWithGoogle().catch(() => {/* logged */})}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite transition hover:border-mesquite/40"
            >
              {t({ en: 'Continue with Google', es: 'Continuar con Google' })}
            </button>

            <div className="my-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-mesquite/15" />
              <span className="font-serif text-xs italic text-mesquite/50">
                {t({ en: 'or', es: 'o' })}
              </span>
              <span className="h-px flex-1 bg-mesquite/15" />
            </div>

            <label className="mb-1 block font-serif text-xs text-mesquite/70">
              {t({ en: 'Sign in with your email', es: 'Entra con tu correo' })}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEmail(); }}
              placeholder={t({ en: 'you@example.com', es: 'tu@ejemplo.com' })}
              className="w-full rounded-sm border border-mesquite/20 bg-cal/50 px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
            />
            {emailErr && (
              <p className="mt-1 font-serif text-xs italic text-rojo">{emailErr}</p>
            )}
            <button
              onClick={handleEmail}
              disabled={sending}
              className="mt-3 w-full rounded-sm bg-ocre px-3 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending
                ? t({ en: 'Sending…', es: 'Enviando…' })
                : t({ en: 'Send me a link', es: 'Envíame un enlace' })}
            </button>
            <p className="mt-3 font-serif text-[11px] italic leading-snug text-mesquite/50">
              {t({
                en: 'No account needed — the link signs you in and sets one up if you’re new.',
                es: 'No necesitas cuenta — el enlace te identifica y crea una si eres nuevo.',
              })}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={close}
                className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite"
              >
                {t({ en: 'Cancel', es: 'Cancelar' })}
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