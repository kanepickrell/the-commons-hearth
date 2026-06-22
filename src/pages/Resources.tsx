// src/pages/Resources.tsx
// The chapter's reading list. Chapter-original where it counts (our own
// writers, our curated shelf), with a pointer out to the national library
// for the fuller set of books, podcasts, and primary sources.
//
// NOTE: external links are built with createElement('a', …) rather than JSX
// <a> tags on purpose — pasting this file through certain editors was
// silently stripping the opening anchor tag and breaking the build.

import { createElement, type ReactNode } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { Layout } from '@/components/Layout';
import type { Bilingual } from '@/lib/types';

type Writer = { name: Bilingual; href: string; tagline: Bilingual };
type SourceDoc = { name: string; author: Bilingual; note: Bilingual; href?: string };
type Book = { title: string; author: string; note: Bilingual };

// Small helper so every external link gets the same treatment and dodges the
// paste-time <a>-stripping issue.
const extLink = (href: string, label: ReactNode, className: string): ReactNode =>
  createElement('a', { href, target: '_blank', rel: 'noopener noreferrer', className }, label);

const writers: Writer[] = [
  {
    name: { en: 'Homestead of Saint Joseph', es: 'Homestead of Saint Joseph' },
    href: 'https://sidarias.substack.com/',
    tagline: {
      en: 'chapter member Sid Arias on piety, natural law, and rediscovering reality through faith and reason.',
      es: 'el miembro del capítulo Sid Arias sobre la piedad, la ley natural, y el redescubrimiento de la realidad por la fe y la razón.',
    },
  },
  // Add more writers / Substacks here.
];

// Our chapter's core shelf — the six we reach for first. The fuller list
// lives on the national resources page (linked at the bottom).
const books: Book[] = [
  {
    title: 'Flee to the Fields',
    author: 'Hilaire Belloc, Fr. Vincent McNabb, et al.',
    note: {
      en: 'The founding anthology — the essays of the English land associations that started it all.',
      es: 'La antología fundacional — los ensayos de las asociaciones agrarias inglesas que lo iniciaron todo.',
    },
  },
  {
    title: 'The Church and the Land',
    author: 'Fr. Vincent McNabb',
    note: {
      en: 'The Dominican friar at the heart of the original movement, on why the land is the Church’s natural home.',
      es: 'El fraile dominico en el corazón del movimiento original, sobre por qué la tierra es el hogar natural de la Iglesia.',
    },
  },
  {
    title: 'An Essay on the Restoration of Property',
    author: 'Hilaire Belloc',
    note: {
      en: 'The property argument in full: why widely distributed ownership — not the state, not the trust — secures the family.',
      es: 'El argumento de la propiedad por completo: por qué la propiedad ampliamente distribuida — ni el estado, ni el monopolio — asegura a la familia.',
    },
  },
  {
    title: 'The Outline of Sanity',
    author: 'G.K. Chesterton',
    note: {
      en: 'The most readable door into distributism — Chesterton on scale, ownership, and the common life.',
      es: 'La puerta más accesible al distributismo — Chesterton sobre la escala, la propiedad, y la vida común.',
    },
  },
  {
    title: 'The Liturgy of the Land',
    author: 'Jason Craig & Thomas Van Horn',
    note: {
      en: 'Contemporary and Catholic: how the rhythm of the liturgical year and the rhythm of the land are meant to be one.',
      es: 'Contemporáneo y católico: cómo el ritmo del año litúrgico y el ritmo de la tierra están hechos para ser uno solo.',
    },
  },
  {
    title: 'The Independent Farmstead',
    author: 'Sean & Beth Dougherty',
    note: {
      en: 'The practical how-to — pasture, water, and livestock for a real family homestead.',
      es: 'El manual práctico — pasto, agua, y ganado para un rancho familiar de verdad.',
    },
  },
  // Add more books here.
];

const sourceDocuments: SourceDoc[] = [
  {
    name: 'Rerum Novarum',
    author: { en: 'Leo XIII, 1891', es: 'León XIII, 1891' },
    href: 'https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html',
    note: {
      en: 'The source code. About forty pages. Workers, wages, property, family — the foundation everything else is built on.',
      es: 'El código fuente. Unas cuarenta páginas. El obrero, el salario, la propiedad, la familia — el fundamento sobre el que se construye todo lo demás.',
    },
  },
  {
    name: 'Quadragesimo Anno',
    author: { en: 'Pius XI, 1931', es: 'Pío XI, 1931' },
    href: 'https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19310515_quadragesimo-anno.html',
    note: {
      en: 'Forty years later, written into the Depression. Names subsidiarity, deepens the property argument, calls for the reconstruction of the social order.',
      es: 'Cuarenta años después, escrita en plena Depresión. Nombra la subsidiariedad, profundiza el argumento de la propiedad, llama a reconstruir el orden social.',
    },
  },
  {
    name: 'On Rural Life',
    author: { en: 'Pius XII', es: 'Pío XII' },
    href: 'https://www.papalencyclicals.net/pius12/poprural.htm',
    note: {
      en: 'Pius XII to farmers — the dignity of rural life and of the family on the land, in the movement’s own century.',
      es: 'Pío XII a los labradores — la dignidad de la vida rural y de la familia en la tierra, en el propio siglo del movimiento.',
    },
  },
  {
    name: 'Laudato Si',
    author: { en: 'Francis, 2015', es: 'Francisco, 2015' },
    href: 'https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html',
    note: {
      en: 'On care for creation — the stewardship of the earth as a moral and spiritual duty.',
      es: 'Sobre el cuidado de la creación — la custodia de la tierra como deber moral y espiritual.',
    },
  },
];

export default function Resources() {
  const { t } = useLocale();

  return (
    <Layout>
      {/* Opening */}
      <section className="container-narrow flex flex-col items-center py-16 text-center md:py-24">
        <p className="display-caps mb-4 text-xs tracking-[0.2em] text-ocre">
          {t({ en: 'TO READ AND RETURN TO', es: 'PARA LEER Y VOLVER' })}
        </p>
        <h1 className="mb-8 font-heading text-5xl text-mesquite md:text-6xl">
          {t({ en: 'Resources', es: 'Recursos' })}
        </h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-mesquite/80 md:text-xl">
          {t({
            en: 'Writers, books, and source documents the chapter reads together. Start anywhere — the practice and the principles deepen each other.',
            es: 'Escritores, libros, y documentos fuente que el capítulo lee en común. Empieza donde quieras — la práctica y los principios se profundizan mutuamente.',
          })}
        </p>
      </section>

      {/* Writers */}
      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 md:py-20">
        <div className="container-narrow flex flex-col items-center text-center">
          <p className="display-caps mb-8 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'WRITERS WORTH FOLLOWING', es: 'ESCRITORES QUE VALE LA PENA SEGUIR' })}
          </p>
          <ul className="mx-auto max-w-xl space-y-8">
            {writers.map((w) => (
              <li key={w.href}>
                <p className="font-serif leading-relaxed text-mesquite/80">
                  {extLink(w.href, t(w.name), 'font-heading italic text-ocre hover:text-mesquite')}{' '}
                  — {t(w.tagline)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The core shelf — books */}
      <section className="border-t border-mesquite/10 py-16 md:py-20">
        <div className="container-narrow flex flex-col items-center text-center">
          <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'THE CORE SHELF', es: 'EL ESTANTE ESENCIAL' })}
          </p>
          <p className="mx-auto mb-10 max-w-2xl font-serif leading-relaxed text-mesquite/70">
            {t({
              en: 'A few books that keep coming up at our gatherings — from the founders of the movement to a working family’s homestead.',
              es: 'Unos libros que siguen surgiendo en nuestras reuniones — desde los fundadores del movimiento hasta el rancho de una familia trabajadora.',
            })}
          </p>
          <ul className="mx-auto max-w-2xl space-y-8">
            {books.map((b) => (
              <li key={b.title}>
                <p className="font-heading text-mesquite">
                  <em>{b.title}</em>
                  <span className="ml-2 text-sm italic text-mesquite/60">— {b.author}</span>
                </p>
                <p className="mx-auto mt-2 max-w-xl font-serif text-sm leading-relaxed text-mesquite/70">
                  {t(b.note)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Source documents — encyclicals */}
      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 md:py-20">
        <div className="container-narrow flex flex-col items-center text-center">
          <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'THE SOURCE DOCUMENTS', es: 'LOS DOCUMENTOS FUENTE' })}
          </p>
          <p className="mx-auto mb-10 max-w-2xl font-serif leading-relaxed text-mesquite/70">
            {t({
              en: 'When you’re ready for the source documents, these are the encyclicals the whole movement grew out of:',
              es: 'Cuando estés listo para los documentos fuente, estas son las encíclicas de donde creció todo el movimiento:',
            })}
          </p>
          <ul className="mx-auto max-w-2xl space-y-10">
            {sourceDocuments.map((d) => (
              <li key={d.name}>
                <p className="font-heading text-mesquite">
                  <em>
                    {d.href
                      ? extLink(d.href, d.name, 'text-ocre hover:text-mesquite')
                      : d.name}
                  </em>
                  <span className="ml-2 text-sm italic text-mesquite/60">— {t(d.author)}</span>
                </p>
                <p className="mx-auto mt-2 max-w-xl font-serif text-sm leading-relaxed text-mesquite/70">
                  {t(d.note)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* From the wider movement */}
      <section className="border-t border-mesquite/10 py-16 md:py-20">
        <div className="container-narrow flex flex-col items-center text-center">
          <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'FROM THE WIDER MOVEMENT', es: 'DEL MOVIMIENTO EN GENERAL' })}
          </p>
          <p className="mx-auto mb-8 max-w-2xl font-serif leading-relaxed text-mesquite/70">
            {t({
              en: 'These are the ones our chapter reaches for first. The national movement keeps a fuller library — more books, podcast conversations, and the historical record.',
              es: 'Estos son los que nuestro capítulo busca primero. El movimiento nacional mantiene una biblioteca más amplia — más libros, conversaciones en pódcast, y el registro histórico.',
            })}
          </p>
          <ul className="mx-auto max-w-2xl space-y-6">
            <li>
              <p className="font-serif leading-relaxed text-mesquite/80">
                {extLink(
                  'https://catholiclandmovement.info/resources',
                  t({ en: 'The national resources library', es: 'La biblioteca nacional de recursos' }),
                  'font-heading italic text-ocre hover:text-mesquite'
                )}{' '}
                — {t({
                  en: 'the full book list, podcast appearances, and more from the Catholic Land Movement.',
                  es: 'la lista completa de libros, apariciones en pódcast, y más del Movimiento Católico de la Tierra.',
                })}
              </p>
            </li>
            <li>
              <p className="font-serif leading-relaxed text-mesquite/80">
                {extLink(
                  'https://collected.jcu.edu/the_cross_and_the_plough/',
                  t({ en: 'The Cross and the Plough', es: 'The Cross and the Plough' }),
                  'font-heading italic text-ocre hover:text-mesquite'
                )}{' '}
                — {t({
                  en: 'the original journal of the English land associations, digitized by the John Carroll University Library.',
                  es: 'la revista original de las asociaciones agrarias inglesas, digitalizada por la biblioteca de John Carroll University.',
                })}
              </p>
            </li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}