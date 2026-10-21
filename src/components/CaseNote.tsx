// src/components/CaseNote.tsx
// "The case, in numbers" on the homepage, folded away until asked for.
//
// Same reasoning and same mechanics as RootsNote: the campaign section above
// is written to be read, and three statistics with citations underneath it
// would turn a plea into a report. Collapsed it costs one line; opened it
// gives a reader who wants evidence the evidence, with the body that
// published each figure named and linked.
//
// Each figure is checked against its own source rather than taken from the
// national deck, which is why two of them differ from the deck's version.
// See the note above `caseFigures` in content/home.ts.

import { useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { caseFigures, homeCopy } from '@/content/home';

export const CaseNote = () => {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="case-in-numbers"
        className="inline-flex items-center gap-2 display-caps text-xs tracking-[0.2em] text-ocre transition-colors hover:text-mesquite"
      >
        {t(homeCopy.caseEyebrow)}
        <svg
          width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4.5L6 8.5L10 4.5" />
        </svg>
      </button>

      <div
        id="case-in-numbers"
        className={`grid transition-all duration-500 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="prose-body mt-5 font-serif italic leading-relaxed text-mesquite/70">
            {t(homeCopy.caseLede)}
          </p>

          <dl className="mt-6 space-y-6">
            {caseFigures.map((f) => (
              <div key={f.figure}>
                <dt className="font-heading text-3xl leading-none text-mesquite tabular-nums">
                  {f.figure}
                </dt>
                <dd className="prose-body mt-2 text-base leading-relaxed text-mesquite/80">
                  {t(f.body)}{' '}
                  <a
                    href={f.source.href}
                    rel="noreferrer noopener"
                    target="_blank"
                    tabIndex={open ? 0 : -1}
                    className="whitespace-nowrap display-caps text-[10px] tracking-[0.15em] text-ocre underline decoration-ocre/40 underline-offset-4 hover:text-mesquite"
                  >
                    {f.source.label}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
