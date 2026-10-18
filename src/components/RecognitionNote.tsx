// src/components/RecognitionNote.tsx
// "Recognized and blessed by Pope Leo XIV, November 2025." — and, when asked,
// the letter that sentence rests on.
//
// The line reads as a seal: hairlines either side, quiet italic, no louder
// than the prose above it. Pressed, it opens the 2025 letter in place.
//
// Deliberately ONE document, not the timeline. /vision is short and
// mission-focused — who we are, what we believe, what we do — and a ninety
// year backstory unfolding in the middle of it would bury the pillars it
// sits above. The chapter's roots are summarised on the homepage and told in
// full on /history, which the link at the foot of this panel goes to.
//
// The quote stays in the language it was published in, the same way witness
// posts do; the narrative around it carries the meaning in both.

import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { currentBlessing } from '@/content/history';
import { buildPath } from '@/i18n/routes';
import { Link } from 'react-router-dom';

/** Opened from elsewhere by linking to /vision#recognition. */
export const RECOGNITION_ANCHOR = 'recognition';

export const RecognitionNote = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Arriving on /vision#recognition opens it and brings it into view. The
  // rAF matters: ScrollToTop jumps to the top of the page on every route
  // change, and without waiting a frame this would be undone by it.
  useEffect(() => {
    if (!defaultOpen) return;
    setOpen(true);
    const id = requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [defaultOpen]);

  // Nothing inside the collapsed panel should be reachable by keyboard.
  const link = (href: string, label: ReactNode, className: string): ReactNode =>
    createElement(
      'a',
      {
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        tabIndex: open ? 0 : -1,
        'aria-hidden': !open,
        className,
      },
      label,
    );

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
          guess can't do without either clipping the timeline or easing
          against empty space. The inner wrapper owns the overflow. */}
      <div
        id="recognition-letters"
        className={`grid transition-all duration-500 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mx-auto mt-8 max-w-xl text-left">
            <p className="display-caps text-xs tracking-[0.2em] text-ocre">
              {t(currentBlessing.source)}
            </p>

            <blockquote className="mt-4 border-l-2 border-ocre/30 pl-4 font-serif italic leading-relaxed text-mesquite">
              &ldquo;{currentBlessing.quote}&rdquo;
            </blockquote>

            <p className="prose-body mt-5 text-[0.95rem] leading-relaxed text-mesquite/80">
              {t(currentBlessing.why)}
            </p>

            {currentBlessing.image &&
              link(
                currentBlessing.image.src,
                <img
                  src={currentBlessing.image.src}
                  alt={t(currentBlessing.image.alt)}
                  loading="lazy"
                  className="mx-auto block h-auto w-full max-w-sm"
                />,
                'mt-6 block rounded border border-mesquite/20 bg-cal/60 p-3 transition hover:border-ocre',
              )}

            {/* The way through to the rest of it — 1891 to 2025, with the
                documents. Kept out of this panel so /vision stays short. */}
            <Link
              to={buildPath('history', locale)}
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              className="mt-6 inline-block font-caps text-[11px] tracking-[0.15em] text-ocre no-underline hover:text-mesquite"
              style={{ textDecoration: 'none' }}
            >
              {t({
                en: 'The whole line, 1891 to today',
                es: 'La línea completa, de 1891 a hoy',
              })} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
