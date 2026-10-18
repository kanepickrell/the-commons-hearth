import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath, switchLocalePath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { AuthButton } from '@/components/AuthButton';

export const Header = () => {
  const { locale, setLocale, t } = useLocale();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const s = uiStrings.nav;

  // Phone nav. Six links and a language toggle don't fit beside the wordmark,
  // and stacked they cost ~200px of screen before any of the page showed, so
  // below `md` they live behind this.
  const [menuOpen, setMenuOpen] = useState(false);

  // Nav order is intentional: what we believe (Vision) → how to live it
  // (Participate) → where it's happening now (Workshops) → what's
  // happened so far (Witness) → who we ask to pray for it (Patron) →
  // what to read to go deeper (Resources).
  //
  // One array, both layouts: the row at md and up, the panel below it.
  const links = [
    { to: buildPath('vision',      locale), label: t(s.vision) },
    { to: buildPath('participate', locale), label: t(s.participate) },
    { to: buildPath('talleres',    locale), label: t(s.workshops) },
    { to: buildPath('testimonio',  locale), label: t(s.witness) },
    { to: buildPath('santo',       locale), label: t(s.patron) },
    { to: buildPath('resources',   locale), label: t(s.resources) },
  ];

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/');

  // Arriving somewhere new closes the panel. Covers the links below and any
  // other navigation (Chester, a redirect) that happens while it's open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes it, the way every other dismissible thing on the site does.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Swap the URL to the other locale's slug through the router (not
  // history.replaceState) so useLocation/useParams see the change and the
  // active-link highlight stays correct. `keepScroll` tells ScrollToTop this
  // isn't a real page change.
  const onToggle = (next: 'en' | 'es') => {
    if (next === locale) return;
    setLocale(next);
    const nextPath = switchLocalePath(pathname, next);
    if (nextPath !== pathname) {
      navigate({ pathname: nextPath, search, hash }, { replace: true, state: { keepScroll: true } });
    }
  };

  return (
    <header className="relative z-50 border-b border-mesquite/15 bg-cal/80 backdrop-blur-sm">
      <div className="container-wide flex items-center justify-between gap-4 py-4 md:py-5">
        <Link to={buildPath('home', locale)} className="display-caps text-mesquite no-underline" style={{ textDecoration: 'none' }}>
          <span className="text-base md:text-lg">CENTRAL TEXAS CLM</span>
        </Link>

        {/* The row. Hidden on phones, where the panel below carries it. */}
        <nav className="hidden flex-wrap items-center gap-x-6 gap-y-2 font-heading text-[1.05rem] md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`no-underline transition-colors ${isActive(l.to) ? 'text-ocre' : 'text-mesquite hover:text-ocre'}`}
              style={{ textDecoration: 'none' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Stays in the bar at every width: signed in it's just an avatar,
              and signing in shouldn't require opening a menu first. */}
          <AuthButton />

          <div className="hidden font-caps text-sm tracking-wider md:block">
            <button
              onClick={() => onToggle('en')}
              className={`transition-colors ${locale === 'en' ? 'text-ocre' : 'text-mesquite/60 hover:text-mesquite'}`}
              aria-pressed={locale === 'en'}
              aria-label="English"
            >
              EN
            </button>
            <span className="mx-2 text-mesquite/40">|</span>
            <button
              onClick={() => onToggle('es')}
              className={`transition-colors ${locale === 'es' ? 'text-ocre' : 'text-mesquite/60 hover:text-mesquite'}`}
              aria-pressed={locale === 'es'}
              aria-label="Español"
            >
              ES
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={t(menuOpen ? s.closeMenu : s.menu)}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-mesquite transition-colors hover:text-ocre md:hidden"
          >
            {/* Three rules and a cross, drawn at the weight of the site's
                hairlines rather than a heavier icon set. */}
            <svg
              width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="M5 5l12 12" />
                  <path d="M17 5L5 17" />
                </>
              ) : (
                <>
                  <path d="M3 6h16" />
                  <path d="M3 11h16" />
                  <path d="M3 16h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* The panel. In the page flow rather than floating over it: it opens at
          the very top of the document, so there's nothing underneath worth
          covering, and this way it can't trap a scroll or need the body
          locked. Solid cal, because the bar above it is translucent. */}
      {menuOpen && (
        <div id="site-menu" className="border-t border-mesquite/10 bg-cal md:hidden">
          <nav className="container-wide flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-mesquite/10 py-3 font-heading text-lg no-underline transition-colors last:border-b-0 ${
                  isActive(l.to) ? 'text-ocre' : 'text-mesquite'
                }`}
                style={{ textDecoration: 'none' }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* The language toggle gets more room here than it has in the bar,
              not less: two real buttons instead of 11px of type. Half this
              chapter's parishes are in San Antonio. */}
          <div className="container-wide flex items-center gap-3 border-t border-mesquite/10 py-4">
            <span className="font-caps text-xs tracking-wider text-mesquite/60">
              {t(s.language)}
            </span>
            <div className="flex gap-2">
              {(['en', 'es'] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => onToggle(code)}
                  aria-pressed={locale === code}
                  aria-label={code === 'en' ? 'English' : 'Español'}
                  className={`rounded-sm border px-4 py-1.5 font-caps text-sm tracking-wider transition-colors ${
                    locale === code
                      ? 'border-ocre bg-ocre/10 text-ocre'
                      : 'border-mesquite/25 text-mesquite/70'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
