// src/pages/Santo.tsx
// The patron page. Structure:
//   1. Typographic seal (chapter-level formal naming)
//   2. Heading + feast day
//   3. Story paragraph (who he was)
//   4. The retablo — the emotional pivot from biography to devotion
//   5. Transition line ("The chapter asks his prayers")
//   6. Prayer
//
// The retablo is a real piece of 19th-c. Mexican folk art. It is sized
// moderately (not hero-huge) and framed with only a thin mesquite border
// so the painting itself carries the visual weight. No sepia, no drop
// shadow, no circle crop — retablos were rectangular and we respect that.

import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
// Drop the image file into src/assets and adjust the filename if needed.
import retabloUrl from '@/assets/santos.jpg';

const Santo = () => {
  const { t } = useLocale();
  const s = uiStrings.patron;

  return (
    <Layout>
      <article className="container-prose py-20">
        {/* Typographic seal — chapter's formal naming of the patron.
            Kept even though we now have the painting, because the seal
            does a different job: it says "this chapter claims him" in
            the same Marcellus SC register as the footer. */}
        <header className="text-center">
          <div className="seal mx-auto flex h-32 w-32 items-center justify-center bg-cal/60">
            <span className="display-caps text-[0.55rem] leading-tight text-mesquite">
              SAN ISIDRO<br />LABRADOR
            </span>
          </div>
          <h1 className="mt-10 font-heading text-4xl leading-tight text-mesquite">
            {t(s.heading)}
          </h1>
          <p className="mt-3 display-caps text-xs tracking-[0.2em] text-ocre">
            {t(s.feastDay)}
          </p>
        </header>

        <div className="rule mt-12" />

        {/* The biographical story — who he was. */}
        <p className="prose-body mt-12 text-xl text-mesquite">{t(s.story)}</p>

        {/* The retablo. The page pivots here: before it we were reading
            history, after it we are praying. The painting is the seam. */}
        <figure className="mt-16 flex flex-col items-center">
          <img
            src={retabloUrl}
            alt={t({
              en: 'San Isidro Labrador — a 19th-century Mexican retablo. The saint stands in prayer with a rosary and staff; behind him, an angel plows a field with an ox team while a small parish church rises to the right.',
              es: 'San Isidro Labrador — un retablo mexicano del siglo XIX. El santo está de pie en oración con un rosario y un bastón; detrás de él, un ángel ara el campo con una yunta de bueyes mientras una pequeña parroquia se alza a la derecha.',
            })}
            className="block w-full max-w-md border border-mesquite/30"
          />
          <figcaption className="mt-4 max-w-md text-center font-serif text-sm italic text-piedra">
            {t({
              en: 'San Isidro Labrador. Mexican retablo, 19th century.',
              es: 'San Isidro Labrador. Retablo mexicano, siglo XIX.',
            })}
          </figcaption>
        </figure>

        {/* Transition — moves the reader from seeing to praying. Kept in
            the eyebrow register (display-caps, small, ocre) so it reads
            as a liturgical hinge rather than a paragraph. */}
        <p className="mt-16 text-center display-caps text-xs tracking-[0.25em] text-ocre">
          {t({
            en: 'THE CHAPTER ASKS HIS PRAYERS',
            es: 'EL CAPÍTULO PIDE SU INTERCESIÓN',
          })}
        </p>

        <blockquote className="mt-8 border-l-2 border-rojo pl-6">
          <p className="prose-body italic text-mesquite/90">{t(s.prayer)}</p>
        </blockquote>
      </article>
    </Layout>
  );
};

export default Santo;