// src/pages/Recognition.tsx
// The chapter's letters of ecclesiastical support.
//
// The footer and /vision both say "Recognized and blessed by Pope Leo XIV" and
// both point here. This page is what that sentence rests on: the documents
// themselves, so the claim can be checked rather than taken on trust.
//
// It is a list on purpose. There is one letter today; the next one is a new
// entry in `documents` below and nothing else — drop the image in public/,
// add a `VATICAN_LETTER`-style path to lib/links.ts, and write the row. Order
// is most significant first, not newest first: the Holy See's letter should
// stay at the top however many diocesan letters join it.

import { createElement } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { VATICAN_LETTER } from '@/lib/links';
import type { Bilingual } from '@/lib/types';

type SupportDoc = {
  /** Stable key, and the anchor a future "jump to this letter" link would use. */
  key: string;
  /** Who issued it — the authority, not the signatory. */
  issuer: Bilingual;
  /** As printed on the document. */
  date: Bilingual;
  /** What it says, in the chapter's own words. */
  summary: Bilingual;
  /** The scan or screenshot, served from public/. */
  href: string;
  /** Alt text. Describes the document, since the image is the document. */
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

export default function Recognition() {
  const { t, locale } = useLocale();

  return (
    <Layout>
      <section className="container-narrow py-16 text-center md:py-24">
        <p className="display-caps mb-4 text-xs tracking-[0.2em] text-ocre">
          {t({ en: 'ECCLESIASTICAL SUPPORT', es: 'RESPALDO ECLESIÁSTICO' })}
        </p>
        <h1 className="mb-8 font-heading text-4xl text-mesquite md:text-5xl">
          {t({ en: 'Letters of Support', es: 'Cartas de Respaldo' })}
        </h1>
        <p className="mx-auto max-w-2xl font-serif text-lg leading-relaxed text-mesquite/80">
          {t({
            en: 'The work of the Catholic Land Movement is carried out under the blessing of the Church. The letters below are reproduced as we received them.',
            es: 'La labor del Movimiento Católico de la Tierra se realiza bajo la bendición de la Iglesia. Las cartas siguientes se reproducen tal como las recibimos.',
          })}
        </p>
      </section>

      <section className="container-narrow pb-20 md:pb-28">
        <ul className="space-y-20">
          {documents.map((d) => (
            <li key={d.key} id={d.key} className="border-t border-mesquite/15 pt-12">
              <p className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(d.date)}
              </p>
              <h2 className="mt-3 font-heading text-2xl leading-snug text-mesquite md:text-3xl">
                {t(d.issuer)}
              </h2>
              <p className="prose-body mt-5 max-w-2xl text-base leading-relaxed text-mesquite/80">
                {t(d.summary)}
              </p>

              {/* The document itself. The image is the evidence, so it reads
                  at full width and opens full size — and createElement
                  rather than a literal <a>, the same convention and for the
                  same reason as Footer.tsx and Resources.tsx. */}
              {createElement(
                'a',
                {
                  href: d.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'mt-8 block rounded border border-mesquite/20 bg-cal/60 p-3 transition hover:border-ocre',
                },
                <img
                  src={d.href}
                  alt={t(d.alt)}
                  loading="lazy"
                  className="mx-auto block h-auto w-full"
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="container-narrow pb-20 text-center">
        <Link
          to={buildPath('vision', locale)}
          className="font-heading text-lg text-ocre no-underline hover:text-mesquite"
          style={{ textDecoration: 'none' }}
        >
          {t({ en: 'What the chapter believes', es: 'Lo que cree el capítulo' })} →
        </Link>
      </section>
    </Layout>
  );
}
