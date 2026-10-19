// src/pages/Mapa.tsx
// The parish map on a page of its own, at /map and /mapa.
//
// The homepage carries the same component as one section among many. This
// page exists because three things in the map only make sense when the map
// is the whole point:
//
//   - the view lives in the URL, so a link carries the ground someone meant
//   - "copy link to this view" has something worth copying
//   - ?present=1 strips the site away for a packet, a pitch or a projector
//
// Writing the view into the homepage's address while a visitor scrolls past
// would be rude, so the homepage keeps syncUrl off.

import { Layout } from '@/components/Layout';
import { ParishMap } from '@/components/ParishMap';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { useSearchParams } from 'react-router-dom';

const Mapa = () => {
  const { t, locale } = useLocale();
  const [searchParams] = useSearchParams();
  const presentation = searchParams.get('present') === '1';

  const title = t(uiStrings.home.chapterMap);

  // Presentation mode is the map and nothing else: no header, no footer, no
  // Chester. It fills the window so a projector or a screenshot gets the
  // whole frame.
  if (presentation) {
    return (
      <div className="h-screen w-screen bg-cal p-3">
        <ParishMap syncUrl presentation title={title} />
      </div>
    );
  }

  return (
    <Layout>
      <section className="container mx-auto max-w-wide py-16">
        <p className="display-caps text-xs tracking-[0.2em] text-ocre">
          {t(uiStrings.eyebrow.chapter)}
        </p>
        <h1 className="mt-3 font-heading text-3xl leading-tight text-mesquite md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-prose font-serif italic text-piedra">
          {locale === 'es'
            ? 'Cada sello es una parroquia, y el número son sus miembros. Mueve el mapa y el enlace de arriba se queda con la vista. Compártelo y se abre justo aquí.'
            : 'Each stamp is a parish, and the number is its members. Move the map and the address above keeps the view. Share it and it opens right here.'}
        </p>

        {/* drawTools lives here and nowhere else: annotations are read on
            every map, but a steward draws them where the map is the subject,
            not where it is one section of the homepage they also read as an
            ordinary visitor. */}
        <div className="mt-10">
          <ParishMap syncUrl drawTools />
        </div>
      </section>
    </Layout>
  );
};

export default Mapa;
