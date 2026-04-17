import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath, switchLocalePath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';

export const Header = () => {
  const { locale, setLocale, t } = useLocale();
  const { pathname } = useLocation();
  const s = uiStrings.nav;

  const links = [
    { to: buildPath('ofrendas',   locale), label: t(s.offerings) },
    { to: buildPath('talleres',   locale), label: t(s.workshops) },
    { to: buildPath('testimonio', locale), label: t(s.witness) },
    { to: buildPath('santo',      locale), label: t(s.patron) },
  ];

  const onToggle = (next: 'en' | 'es') => {
    if (next === locale) return;
    setLocale(next);
    // Rewrite the path so /ofrendas <-> /offerings stay in sync.
    const nextPath = switchLocalePath(pathname, next);
    if (nextPath !== pathname) {
      window.history.replaceState(null, '', nextPath);
    }
  };

  return (
    <header className="border-b border-mesquite/15 bg-cal/80 backdrop-blur-sm">
      <div className="container-wide flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <Link to={buildPath('home', locale)} className="display-caps text-mesquite no-underline" style={{ textDecoration: 'none' }}>
          <span className="text-base md:text-lg">CLM CENTRAL TEXAS</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-heading text-[1.05rem]">
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
    </header>
  );
};
