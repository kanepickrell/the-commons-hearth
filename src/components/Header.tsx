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

  // Nav order is intentional: what we believe (Vision) → how to live it
  // (Participate) → where it's happening now (Workshops) → what's
  // happened so far (Witness) → who we ask to pray for it (Patron) →
  // what to read to go deeper (Resources).
  const links = [
    { to: buildPath('vision',      locale), label: t(s.vision) },
    { to: buildPath('participate', locale), label: t(s.participate) },
    { to: buildPath('talleres',    locale), label: t(s.workshops) },
    { to: buildPath('testimonio',  locale), label: t(s.witness) },
    { to: buildPath('santo',       locale), label: t(s.patron) },
    { to: buildPath('resources',   locale), label: t(s.resources) },
  ];

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
      {/* Three items, two layouts, one source order.
          Phone: the wordmark and the account/language controls share the first
          row (the nav is `w-full`, so it wraps to its own centered row beneath
          them). Stacking all three instead cost ~200px of a phone screen
          before any of the page showed.
          md and up: the nav un-wraps and `order` restores the reading order
          the links were chosen in — wordmark, nav, controls. */}
      <div className="container-wide flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 md:py-5">
        <Link to={buildPath('home', locale)} className="order-1 display-caps text-mesquite no-underline" style={{ textDecoration: 'none' }}>
          <span className="text-base md:text-lg">CENTRAL TEXAS CLM</span>
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 font-heading text-base md:order-2 md:w-auto md:justify-start md:gap-x-6 md:text-[1.05rem]">
          {links.map((l) => {
            const active = pathname === l.to || pathname.startsWith(l.to + '/');
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`no-underline transition-colors ${active ? 'text-ocre' : 'text-mesquite hover:text-ocre'}`}
                style={{ textDecoration: 'none' }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 flex items-center gap-4 md:order-3">
          <AuthButton />

          <div className="font-caps text-sm tracking-wider">
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
        </div>
      </div>
    </header>
  );
};