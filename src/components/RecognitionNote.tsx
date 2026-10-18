// src/components/RecognitionNote.tsx
// "Recognized and blessed by Pope Leo XIV, November 2025." — and, when asked,
// the letter that sentence rests on.
//
// The line reads as a seal: hairlines either side, quiet italic, no louder
// than the prose above it. Pressed, it opens the documents underneath in
// place. No separate page, so the claim and its evidence stay together and a
// reader never leaves /vision to check it.
//
// `documents` is a list for the same reason it was a page: the next letter is
// one entry plus a file in public/, nothing else. Ordered by weight rather
// than by date, so the Holy See's letter stays at the top however many
// diocesan letters join it. When a second one lands, the trigger's count
// below starts earning its keep.

import { createElement, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { VATICAN_LETTER } from '@/lib/links';
import type { Bilingual } from '@/lib/types';

type SupportDoc = {
  key: string;
  /** Who issued it — the authority, not the signatory. */
  issuer: Bilingual;
  /** As printed on the document. */
  date: Bilingual;
  /** What it says, in the chapter's own words. */
  summary: Bilingual;
  /** The scan, served from public/. */
  href: string;
  /** Alt text. Describes the document, because the image IS the document. */
  alt: Bilingual;
};

const documents: SupportDoc[] = [
  {
    key: 'holy-see-2025',
    issuer: {
      en: 'The Holy See — Secretariat of State',
      es: 'La Santa Sede — Secretaría de Estado',
    },
    date: { en: '18 November 2025', es: '18 de noviembre de 2025' },
    summary: {
      en: 'Pope Leo XIV extends to the members of the Catholic Land Movement the same Apostolic Blessing that Pius XI granted the Catholic Land Associations in 1933, with his appreciation for our witness to the Gospel in upholding human dignity and the care of creation.',
      es: 'El Papa León XIV extiende a los miembros del Movimiento Católico de la Tierra la misma Bendición Apostólica que Pío XI concedió a las Asociaciones Católicas de la Tierra en 1933, con su aprecio por nuestro testimonio del Evangelio al defender la dignidad humana y el cuidado de la creación.',
    },
    href: VATICAN_LETTER,
    alt: {
      en: 'Letter from the Secretariat of State of the Holy See, dated 18 November 2025, conveying Pope Leo XIV’s Apostolic Blessing to the Catholic Land Movement.',
      es: 'Carta de la Secretaría de Estado de la Santa Sede, fechada el 18 de noviembre de 2025, que transmite la Bendición Apostólica del Papa León XIV al Movimiento Católico de la Tierra.',
    },
  },
];

/** Opened from elsewhere by linking to /vision#recognition. */
export const RECOGNITION_ANCHOR = 'recognition';

export const RecognitionNote = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const { t } = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Arriving on /vision#recognition opens it and brings it into view. The
  // rAF matters: ScrollToTop jumps to the top of the page on every route
  // change, and without waiting a frame this would be undone by it.
  useEffect(() => {
    if (!defaultOpen) return;
    setOpen(true);
    const id = requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [defaultOpen]);

  return (
    <div ref={ref} id={RECOGNITION_ANCHOR} className="mt-12 w-full scroll-mt-24">
      {/* The seal. A button, because it does something — but styled as the
          line it was, so it reads as type and not as a control. */}
      <p className="flex items-center justify-center gap-4 text-sm leading-relaxed">
        <span aria-hidden="true" className="hidden h-px w-10 flex-shrink-0 bg-ocre/40 sm:block" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="recognition-letters"
          title={t(uiStrings.common.recognitionDoc)}
          className="group inline-flex items-center gap-2 font-serif text-sm italic text-piedra underline-offset-4 transition-colors hover:text-ocre"
        >
          <span className="underline decoration-ocre/40 group-hover:decoration-ocre">
            {t(uiStrings.common.recognition)}
          </span>
          <svg
            width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            strokeLinejoin="round"
            className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M2 4.5L6 8.5L10 4.5" />
          </svg>
        </button>
        <span aria-hidden="true" className="hidden h-px w-10 flex-shrink-0 bg-ocre/40 sm:block" />
      </p>

      {/* 0fr → 1fr animates to the content's own height, which a max-height
          guess can't do without either clipping a long letter or easing
          against empty space. The inner wrapper owns the overflow. */}
      <div
        id="recognition-letters"
        className={`grid transition-all duration-500 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="mx-auto mt-8 max-w-2xl space-y-12 text-left">
            {documents.map((d) => (
              <li key={d.key} className="border-t border-mesquite/15 pt-8">
                <p className="display-caps text-xs tracking-[0.2em] text-ocre">{t(d.date)}</p>
                <h3 className="mt-2 font-heading text-xl leading-snug text-mesquite">
                  {t(d.issuer)}
                </h3>
                <p className="prose-body mt-4 text-base leading-relaxed text-mesquite/80">
                  {t(d.summary)}
                </p>

                {/* createElement rather than a literal <a>, the same
                    convention and for the same reason as Footer.tsx and
                    Resources.tsx. Opens the full-size scan. */}
                {createElement(
                  'a',
                  {
                    href: d.href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    // Not reachable by keyboard while collapsed.
                    tabIndex: open ? 0 : -1,
                    'aria-hidden': !open,
                    className:
                      'mt-6 block rounded border border-mesquite/20 bg-cal/60 p-3 transition hover:border-ocre',
                  },
                  <img
                    src={d.href}
                    alt={t(d.alt)}
                    loading="lazy"
                    className="mx-auto block h-auto w-full max-w-md"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
