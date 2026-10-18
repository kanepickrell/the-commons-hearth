// src/components/RootsNote.tsx
// "Our Roots" on the homepage, folded away until asked for.
//
// The paragraph answers "where did this come from?" properly — industrial
// revolution, Rerum Novarum, Glasgow, the blessing — which is the right
// answer and too much weight to put between the approach and the mission
// unasked. Collapsed, the section costs one line; opened, it reads in full
// and hands off to /history.
//
// The panel animates the same way RecognitionNote's does (0fr → 1fr, so it
// eases to the content's real height rather than to a guessed max-height).
// The two are kept separate rather than sharing a primitive: their triggers
// are different animals — a seal line there, a section eyebrow here — and
// the shared part is about eight lines of class names.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { homeCopy } from '@/content/home';

export const RootsNote = () => {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <section className="container-prose py-20 text-center">
      {/* The section's eyebrow IS the control, so the collapsed state is a
          single quiet line rather than a heading plus a button. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="our-roots"
        className="group inline-flex items-center gap-2.5 text-ocre transition-colors hover:text-mesquite"
      >
        <span className="display-caps text-sm font-semibold tracking-[0.3em] md:text-base">
          {t(homeCopy.rootsEyebrow)}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4.5L6 8.5L10 4.5" />
        </svg>
      </button>

      <div
        id="our-roots"
        className={`grid transition-all duration-500 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="prose-body mx-auto mt-9 max-w-xl text-left text-lg leading-relaxed text-mesquite/90">
            {t(homeCopy.roots)}
          </p>

          <Link
            to={buildPath('history', locale)}
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            className="mt-8 inline-block display-caps text-xs tracking-[0.2em] text-ocre no-underline hover:text-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t(homeCopy.rootsMore)} →
          </Link>
        </div>
      </div>
    </section>
  );
};
