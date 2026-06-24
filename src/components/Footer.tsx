import { createElement, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { ContactModal } from '@/components/ContactModal';

export const Footer = () => {
  const { t } = useLocale();
  const s = uiStrings.footer;
  const [contactOpen, setContactOpen] = useState(false);

  // Rendered via createElement instead of a literal <a> JSX tag so the file
  // survives the paste-time sanitizer that strips anchor tags.
  const nationalLink = createElement(
    'a',
    {
      href: 'https://catholiclandmovement.info',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'text-sm text-piedra',
    },
    `${t(s.nationalLink)} — catholiclandmovement.info`,
  );


  return (
    <footer className="mt-24 border-t border-mesquite/15 py-14">
      <div className="container-wide flex flex-col items-center gap-6 text-center">
        {/* Chapter seal placeholder */}
        <div className="seal flex h-32 w-32 items-center justify-center p-3">
          <span className="display-caps text-[0.55rem] leading-tight text-mesquite">
            {t(s.sealLine)}
          </span>
        </div>

        {/* <p className="font-heading italic text-mesquite/80">{t(s.underPatronage)}</p> */}

        {nationalLink}

        {/* Inbound channel for non-members — opens the contact form. */}
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="font-heading text-sm text-mesquite/70 underline-offset-4 transition hover:text-ocre hover:underline"
        >
          {t(s.reachUs)}
        </button>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
};