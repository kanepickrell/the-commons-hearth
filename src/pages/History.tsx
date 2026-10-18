// src/pages/History.tsx
// The long version of where this came from, in documents.
//
// The homepage's "Our Roots" is four dated lines and sends anyone who wants
// more here. /vision shows the 2025 letter alone. This page carries the whole
// line — 1891 to 2025 — so the short pages can stay short.
//
// The timeline itself lives in src/content/history.ts, including the rule
// about `kind`: a 'context' link goes to something ABOUT the source rather
// than to the source, and the page says so out loud rather than letting a
// reader assume every link hands over a primary document.

import { createElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { history } from '@/content/history';

const extLink = (href: string, label: ReactNode, className: string): ReactNode =>
  createElement('a', { href, target: '_blank', rel: 'noopener noreferrer', className }, label);

export default function History() {
  const { t, locale } = useLocale();

  return (
    <Layout>
      <section className="container-narrow py-16 text-center md:py-24">
        <p className="display-caps mb-4 text-xs tracking-[0.2em] text-ocre">
          {t({ en: 'WHERE THIS CAME FROM', es: 'DE DÓNDE VIENE ESTO' })}
        </p>
        <h1 className="mb-8 font-heading text-4xl text-mesquite md:text-5xl">
          {t({ en: 'History & Sources', es: 'Historia y Fuentes' })}
        </h1>
        <p className="mx-auto max-w-2xl font-serif text-lg leading-relaxed text-mesquite/80">
          {t({
            en: 'We did not start something new. What follows is the line we stand in, with the documents themselves — so none of it has to be taken on our word.',
            es: 'No empezamos algo nuevo. Lo que sigue es la línea en la que estamos, con los documentos mismos — para que nada de esto tenga que creerse sólo por nuestra palabra.',
          })}
        </p>
      </section>

      <section className="container-narrow pb-10">
        {/* Diamonds rather than dots — the same mark the liturgical dateline
            uses for the season. */}
        <ol className="mx-auto max-w-2xl space-y-14 border-l border-mesquite/20 pl-7 text-left">
          {history.map((m) => (
            <li key={m.key} id={m.key} className="relative scroll-mt-24">
              <span
                aria-hidden="true"
                className="absolute -left-[1.97rem] top-[0.45rem] h-2 w-2 rotate-45 bg-ocre"
              />

              <p className="display-caps text-xs tracking-[0.2em] text-ocre">{m.year}</p>
              <h2 className="mt-1 font-heading text-2xl leading-snug text-mesquite">
                {t(m.title)}
              </h2>

              {m.quote && (
                <blockquote className="mt-4 border-l-2 border-ocre/30 pl-4 font-serif italic leading-relaxed text-mesquite">
                  &ldquo;{m.quote}&rdquo;
                </blockquote>
              )}
              <p className={`font-serif text-xs italic leading-snug text-piedra/80 ${m.quote ? 'mt-2 pl-4' : 'mt-3'}`}>
                {t(m.source)}
              </p>

              <p className="prose-body mt-4 text-[0.95rem] leading-relaxed text-mesquite/80">
                {t(m.why)}
              </p>

              {m.image &&
                extLink(
                  m.image.src,
                  <img
                    src={m.image.src}
                    alt={t(m.image.alt)}
                    loading="lazy"
                    className="mx-auto block h-auto w-full max-w-sm"
                  />,
                  'mt-5 block rounded border border-mesquite/20 bg-cal/60 p-3 transition hover:border-ocre',
                )}

              <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {extLink(
                  m.href,
                  <>{t(m.linkLabel)} →</>,
                  'font-caps text-[11px] tracking-[0.15em] text-ocre no-underline hover:text-mesquite',
                )}
                {/* Honest about what the link actually is. */}
                {m.kind === 'context' && (
                  <span className="font-serif text-[11px] italic text-piedra/70">
                    {t({
                      en: 'about the source, not the source itself',
                      es: 'sobre la fuente, no la fuente misma',
                    })}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Two ways on from here. A reader who came for the documents is the
          likeliest person on the site to want the reading list, so Resources
          sits beside the hand-off to what the chapter believes. */}
      <section className="container-narrow py-16">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-5 text-center sm:max-w-none sm:flex-row sm:justify-center sm:gap-10">
          <Link
            to={buildPath('vision', locale)}
            className="font-heading text-lg text-ocre no-underline hover:text-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t({ en: 'What the chapter believes', es: 'Lo que cree el capítulo' })} →
          </Link>
          <Link
            to={buildPath('resources', locale)}
            className="font-heading text-lg text-ocre no-underline hover:text-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t({ en: 'Learn more', es: 'Aprende más' })} →
          </Link>
        </div>
      </section>
    </Layout>
  );
}
