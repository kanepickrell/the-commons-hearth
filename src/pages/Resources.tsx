// src/pages/Resources.tsx
// The chapter's reading list — moved here from the Participate page's
// "Live and share" movement so it can grow into a fuller library of
// writers, source documents, books, and links.
//
// NOTE: the Substack link is built with createElement('a', …) rather than
// a JSX <a> tag on purpose — pasting this file through certain editors was
// silently stripping the opening anchor tag and breaking the build.

import { createElement } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { Layout } from '@/components/Layout';
import type { Bilingual } from '@/lib/types';

type Writer = { name: Bilingual; href: string; tagline: Bilingual };
type SourceDoc = { name: string; author: Bilingual; note: Bilingual; href?: string };

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

const sourceDocuments: SourceDoc[] = [
  {
    name: 'Rerum Novarum',
    author: { en: 'Leo XIII, 1891', es: 'León XIII, 1891' },
    note: {
      en: 'The source code. About forty pages. Workers, wages, property, family — the foundation everything else is built on.',
      es: 'El código fuente. Unas cuarenta páginas. El obrero, el salario, la propiedad, la familia — el fundamento sobre el que se construye todo lo demás.',
    },
  },
  {
    name: 'Quadragesimo Anno',
    author: { en: 'Pius XI, 1931', es: 'Pío XI, 1931' },
    note: {
      en: 'Forty years later, written into the Depression. Names subsidiarity, deepens the property argument, calls for the reconstruction of the social order.',
      es: 'Cuarenta años después, escrita en plena Depresión. Nombra la subsidiariedad, profundiza el argumento de la propiedad, llama a reconstruir el orden social.',
    },
  },
  // Add more source documents / books here.
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
            en: 'Writers, source documents, and books the chapter reads together. Start anywhere — the practice and the principles deepen each other.',
            es: 'Escritores, documentos fuente, y libros que el capítulo lee en común. Empieza donde quieras — la práctica y los principios se profundizan mutuamente.',
          })}
        </p>
      </section>

      {/* Writers */}
      <section className="border-t border-mesquite/10 bg-mesquite/[0.02] py-16 md:py-20">
        <div className="container-narrow">
          <p className="display-caps mb-8 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'WRITERS WORTH FOLLOWING', es: 'ESCRITORES QUE VALE LA PENA SEGUIR' })}
          </p>
          <ul className="space-y-8">
            {writers.map((w) => (
              <li key={w.href} className="border-l-2 border-ocre/40 pl-5">
                <p className="font-serif leading-relaxed text-mesquite/80">
                  {createElement(
                    'a',
                    {
                      href: w.href,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'font-heading italic text-ocre hover:text-mesquite',
                    },
                    t(w.name)
                  )}{' '}
                  — {t(w.tagline)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Source documents */}
      <section className="py-16 md:py-20">
        <div className="container-narrow">
          <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
            {t({ en: 'THE SOURCE DOCUMENTS', es: 'LOS DOCUMENTOS FUENTE' })}
          </p>
          <p className="mb-8 max-w-2xl font-serif leading-relaxed text-mesquite/70">
            {t({
              en: 'When you’re ready for the source documents, start with the two encyclicals the whole movement grew out of:',
              es: 'Cuando estés listo para los documentos fuente, empieza con las dos encíclicas de donde creció todo el movimiento:',
            })}
          </p>
          <ul className="space-y-6">
            {sourceDocuments.map((d) => (
              <li key={d.name} className="border-t border-mesquite/15 pt-6">
                <p className="font-heading text-mesquite">
                  <em>{d.name}</em>
                  <span className="ml-2 text-sm italic text-mesquite/60">— {t(d.author)}</span>
                </p>
                <p className="mt-2 max-w-2xl font-serif text-sm leading-relaxed text-mesquite/70">
                  {t(d.note)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}