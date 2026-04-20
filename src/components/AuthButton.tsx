// src/components/AuthButton.tsx
// Sign-in / sign-out button for the site header. Bilingual — uses the
// same useLocale() / uiStrings pattern as the rest of the header chrome.

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';

export function AuthButton() {
  const { user, profile, loading, isAdmin, signInWithGoogle, signOut } = useAuth();
  const { locale, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const s = uiStrings.auth;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle().catch(() => {/* error already logged */})}
        className="inline-flex items-center gap-2 rounded-full border border-mesquite/30 bg-cal px-4 py-1.5 font-serif text-sm text-mesquite transition hover:bg-mesquite hover:text-cal"
      >
        {t(s.signIn)}
      </button>
    );
  }

  // Signed in — use display_name if we have it, else email prefix as fallback
  const label =
    profile?.display_name?.trim() ||
    user.email?.split('@')[0] ||
    t(s.memberFallback);

  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

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

          <Link
            to={buildPath('miPerfil', locale)}
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 font-serif text-sm text-mesquite transition hover:bg-mesquite/5"
          >
            {t(s.myProfile)}
          </Link>

          {isAdmin && (
            <Link
              to={buildPath('mayordomo', locale)}
              onClick={() => setMenuOpen(false)}
              className="block border-t border-mesquite/10 px-4 py-2 font-serif text-sm text-mesquite transition hover:bg-mesquite/5"
            >
              {t(s.stewardship)}
              <span className="ml-2 rounded-full bg-ocre/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ocre">
                {t(s.adminBadge)}
              </span>
            </Link>
          )}

          <button
            onClick={() => {
              setMenuOpen(false);
              signOut().catch(() => {/* error already logged */});
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