// src/components/RecognitionNote.tsx
// "Recognized and blessed by Pope Leo XIV, November 2025." — and, when asked,
// the ninety years of continuity behind that sentence.
//
// The line reads as a seal: hairlines either side, quiet italic, no louder
// than the prose above it. Pressed, it opens a timeline in place. The point
// of the timeline is the argument the chapter actually wants to make — that
// this is not a new movement with a new blessing, but the same work under the
// same blessing, given in 1933 and renewed in 2025. The 1946 entry is
// deliberately NOT presented as a blessing on the movement: it was addressed
// to an Italian farmers' confederation, and it earns its place as the
// teaching the work rests on, not as an endorsement of it.
//
// Chronological on purpose. Ordering by weight would put 2025 first and lose
// the whole narrative; read in order, it is: given, affirmed, taught, renewed.
//
// Quotes stay in the language they were published in, the same way witness
// posts do. The narrative around each one carries the meaning in both.

import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { VATICAN_LETTER } from '@/lib/links';
import type { Bilingual } from '@/lib/types';

type Moment = {
  key: string;
  year: string;
  /** What happened, in four or five words. */
  title: Bilingual;
  /** The citation: who said it, where it is printed. */
  source: Bilingual;
  /** As published. Not translated — see the note above. */
  quote: string;
  /** Why it belongs in this chapter's story. */
  why: Bilingual;
  href: string;
  linkLabel: Bilingual;
  /** Only the 2025 letter: we hold the scan, so we can show it. */
  image?: { src: string; alt: Bilingual };
};

const CROSS_AND_PLOUGH = 'https://collected.jcu.edu/the_cross_and_the_plough/1/';
const BLACKFRIARS =
  'https://www.cambridge.org/core/journals/blackfriars/article/editorial/0138EA20F62FE2A774DE6132472C1021';
const PIUS_XII_RURAL =
  'https://www.ewtn.com/catholicism/library/pope-speaks-on-rural-life-9050';

const timeline: Moment[] = [
  {
    key: 'pacelli-1933',
    year: '1933',
    title: { en: 'The blessing given', es: 'La bendición concedida' },
    source: {
      en: 'Cardinal Pacelli, Secretary of State, 1 July 1933 — printed in The Cross and the Plough, Vol. 2 No. 4 (1936)',
      es: 'El cardenal Pacelli, Secretario de Estado, 1 de julio de 1933 — publicado en The Cross and the Plough, vol. 2 núm. 4 (1936)',
    },
    quote: 'imparts his Apostolic Blessing to all who are engaged in helping',
    why: {
      en: 'Writing for Pius XI, the future Pius XII blessed the five Catholic Land Associations of Great Britain and prayed that their work of restoring country life be blessed by God. The same issue lists the Archbishops of Westminster, Liverpool and Birmingham as presidents and patron of those associations: the bishops were not bystanders to this work.',
      es: 'Escribiendo en nombre de Pío XI, el futuro Pío XII bendijo a las cinco Asociaciones Católicas de la Tierra de Gran Bretaña y pidió a Dios que bendijera su labor de restaurar la vida del campo. El mismo número nombra a los arzobispos de Westminster, Liverpool y Birmingham como presidentes y patrono de esas asociaciones: los obispos no fueron espectadores de esta obra.',
    },
    href: CROSS_AND_PLOUGH,
    linkLabel: {
      en: 'The Cross and the Plough, 1936',
      es: 'The Cross and the Plough, 1936',
    },
  },
  {
    key: 'blackfriars-1936',
    year: '1936',
    title: { en: 'The approval affirmed', es: 'La aprobación confirmada' },
    source: {
      en: 'Editorial, Blackfriars, Vol. 17 No. 194, May 1936',
      es: 'Editorial, Blackfriars, vol. 17 núm. 194, mayo de 1936',
    },
    quote: 'the Holy Father’s approval of the work of the Land Movement',
    why: {
      en: 'A Dominican journal records that approval independently. It also notes the Archbishop of Westminster’s clarification that the bishops’ decision that year implied no disapproval of the movement — only that an appeal for money was inexpedient.',
      es: 'Una revista dominica registra esa aprobación de forma independiente. También recoge la aclaración del arzobispo de Westminster: la decisión de los obispos aquel año no implicaba desaprobación del movimiento, sino sólo que una colecta de fondos era inoportuna.',
    },
    href: BLACKFRIARS,
    linkLabel: { en: 'Blackfriars, May 1936', es: 'Blackfriars, mayo de 1936' },
  },
  {
    key: 'pius-xii-1946',
    year: '1946',
    title: { en: 'The teaching beneath it', es: 'La enseñanza que lo sostiene' },
    source: {
      en: 'Pius XII, to the National Confederation of Farm Owner-Operators, 15 November 1946',
      es: 'Pío XII, a la Confederación Nacional de Cultivadores Directos, 15 de noviembre de 1946',
    },
    quote: 'a class of farmers socially sound and religiously firm',
    why: {
      en: 'Not a blessing on the Land Movement — this was addressed to an Italian farmers’ confederation — but the teaching the movement rests on: that the moral recovery of a whole people depends on a farming class sound in society and firm in faith.',
      es: 'No es una bendición al Movimiento de la Tierra — fue dirigida a una confederación de agricultores italianos — sino la enseñanza en que el movimiento se apoya: que la recuperación moral de todo un pueblo depende de una clase campesina sana en lo social y firme en la fe.',
    },
    href: PIUS_XII_RURAL,
    linkLabel: { en: 'The Pope Speaks on Rural Life', es: 'El Papa habla de la vida rural' },
  },
  {
    key: 'leo-xiv-2025',
    year: '2025',
    title: { en: 'The same blessing, renewed', es: 'La misma bendición, renovada' },
    source: {
      en: 'The Holy See, Secretariat of State, 18 November 2025',
      es: 'La Santa Sede, Secretaría de Estado, 18 de noviembre de 2025',
    },
    quote: 'Pope Leo XIV extends that same blessing to the members of the Catholic Land Movement',
    why: {
      en: 'Recalling the Apostolic Blessing granted by Pius XI in 1933, Pope Leo XIV extends it to those who carry the same apostolic work forward in our time. That is the line this chapter stands in.',
      es: 'Recordando la Bendición Apostólica concedida por Pío XI en 1933, el Papa León XIV la extiende a quienes llevan adelante la misma obra apostólica en nuestro tiempo. Esa es la línea en la que está este capítulo.',
    },
    href: VATICAN_LETTER,
    linkLabel: { en: 'Open the letter', es: 'Abre la carta' },
    image: {
      src: VATICAN_LETTER,
      alt: {
        en: 'Letter from the Secretariat of State of the Holy See, dated 18 November 2025, conveying Pope Leo XIV’s Apostolic Blessing to the Catholic Land Movement.',
        es: 'Carta de la Secretaría de Estado de la Santa Sede, fechada el 18 de noviembre de 2025, que transmite la Bendición Apostólica del Papa León XIV al Movimiento Católico de la Tierra.',
      },
    },
  },
];

/** Opened from elsewhere by linking to /vision#recognition. */
export const RECOGNITION_ANCHOR = 'recognition';

const intro: Bilingual = {
  en: 'The blessing this work carries is not new. It was given to the Catholic Land Associations of Great Britain in 1933, and renewed for the Catholic Land Movement in 2025.',
  es: 'La bendición que lleva esta labor no es nueva. Fue concedida a las Asociaciones Católicas de la Tierra de Gran Bretaña en 1933, y renovada para el Movimiento Católico de la Tierra en 2025.',
};

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
          <p className="prose-body mx-auto mt-10 max-w-xl text-left text-base leading-relaxed text-mesquite/80">
            {t(intro)}
          </p>

          {/* The rail. Diamonds rather than dots — the same mark the
              liturgical dateline uses for the season. */}
          <ol className="mx-auto mt-10 max-w-xl space-y-12 border-l border-mesquite/20 pl-7 text-left">
            {timeline.map((m) => (
              <li key={m.key} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.97rem] top-[0.45rem] h-2 w-2 rotate-45 bg-ocre"
                />

                <p className="display-caps text-xs tracking-[0.2em] text-ocre">{m.year}</p>
                <h3 className="mt-1 font-heading text-xl leading-snug text-mesquite">
                  {t(m.title)}
                </h3>

                <blockquote className="mt-4 border-l-2 border-ocre/30 pl-4 font-serif italic leading-relaxed text-mesquite">
                  &ldquo;{m.quote}&rdquo;
                </blockquote>
                <p className="mt-2 pl-4 font-serif text-xs italic leading-snug text-piedra/80">
                  {t(m.source)}
                </p>

                <p className="prose-body mt-4 text-[0.95rem] leading-relaxed text-mesquite/80">
                  {t(m.why)}
                </p>

                {m.image &&
                  link(
                    m.image.src,
                    <img
                      src={m.image.src}
                      alt={t(m.image.alt)}
                      loading="lazy"
                      className="mx-auto block h-auto w-full max-w-sm"
                    />,
                    'mt-5 block rounded border border-mesquite/20 bg-cal/60 p-3 transition hover:border-ocre',
                  )}

                {link(
                  m.href,
                  <>{t(m.linkLabel)} →</>,
                  'mt-4 inline-block font-caps text-[11px] tracking-[0.15em] text-ocre no-underline hover:text-mesquite',
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
