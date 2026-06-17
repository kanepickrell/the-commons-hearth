// src/components/AuthButton.tsx
// Sign-in / sign-out button for the site header. Signed-out state offers
// Google OAuth and an email magic-link (for members without Gmail).

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function AuthButton() {
  const { user, profile, loading, isAdmin, signInWithGoogle, signInWithEmail, signOut } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Email magic-link state (signed-out panel)
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const s = uiStrings.auth;

  // Close dropdown when clicking outside.
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  // Reset the email panel whenever the menu closes.
  useEffect(() => {
    if (!menuOpen) {
      setEmail('');
      setSent(false);
      setEmailErr(null);
      setSending(false);
    }
  }, [menuOpen]);

  if (loading) return null;

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

  // ---------------------------------------------------------------------
  // Signed out — Google + email magic-link chooser
  // ---------------------------------------------------------------------
  if (!user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-mesquite/30 bg-cal px-4 py-1.5 font-serif text-sm text-mesquite transition hover:bg-mesquite hover:text-cal"
        >
          {t(s.signIn)}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-mesquite/15 bg-cal p-4 shadow-lg">
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
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Signed in — unchanged
  // ---------------------------------------------------------------------
  const label =
    profile?.display_name?.trim() ||
    user.email?.split('@')[0] ||
    t(s.memberFallback);

  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-mesquite/20 bg-cal px-3 py-1.5 font-serif text-sm text-mesquite transition hover:border-mesquite/40"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mesquite/10 text-[10px] font-bold text-mesquite">
          {initials || '·'}
        </span>
        <span className="hidden sm:inline">{label}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-mesquite/15 bg-cal shadow-lg">
          {profile?.status === 'pending' && (
            <div className="border-b border-mesquite/10 bg-ocre/10 px-4 py-2 font-serif text-xs italic text-mesquite/70">
              {t(s.pendingNotice)}
            </div>
          )}

          <button
            onClick={() => go(buildPath('miPerfil', locale))}
            className="block w-full text-left px-4 py-2 font-serif text-sm text-mesquite transition hover:bg-mesquite/5"
          >
            {t(s.myProfile)}
          </button>

          {isAdmin && (
            <button
              onClick={() => go(buildPath('mayordomo', locale))}
              className="block w-full text-left border-t border-mesquite/10 px-4 py-2 font-serif text-sm text-mesquite transition hover:bg-mesquite/5"
            >
              {t(s.stewardship)}
              <span className="ml-2 rounded-full bg-ocre/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ocre">
                {t(s.adminBadge)}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setMenuOpen(false);
              signOut().catch(() => {/* logged */});
            }}
            className="block w-full border-t border-mesquite/10 px-4 py-2 text-left font-serif text-sm text-mesquite transition hover:bg-mesquite/5"
          >
            {t(s.signOut)}
          </button>
        </div>
      )}
    </div>
  );
}