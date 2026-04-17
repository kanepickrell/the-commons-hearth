import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';

export const Footer = () => {
  const { t } = useLocale();
  const s = uiStrings.footer;

  return (
    <footer className="mt-24 border-t border-mesquite/15 py-14">
      <div className="container-wide flex flex-col items-center gap-6 text-center">
        {/* Chapter seal placeholder */}
        <div className="seal flex h-32 w-32 items-center justify-center p-3">
          <span className="display-caps text-[0.55rem] leading-tight text-mesquite">
            {t(s.sealLine)}
          </span>
        </div>

        <p className="font-heading italic text-mesquite/80">{t(s.underPatronage)}</p>

        <a
          href="https://catholiclandmovement.info"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-piedra"
        >
          {t(s.nationalLink)} — catholiclandmovement.info
        </a>
      </div>
    </footer>
  );
};
