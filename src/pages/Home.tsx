// src/pages/Home.tsx
// Landing page — the trailhead, not the whole trail.
//
// Structure (per the chapter's approved copy):
//   1. Opening — the longing, who we are, what we believe
//   2. Pillars — Resettlement, Education, Fellowship, Glorification
//   3. A single recent witness, large, as evidence
//   4. The chapter map
//   5. Closing CTA — members → profile, visitors → onboarding
//
// Notes:
//   - Vision owns the deeper exposition of the four pillars; Home
//     introduces them. The "how to live this out" three-movement content
//     that used to sit at the bottom of Home now lives on Participate.
//   - The four pillar icons are bespoke line-art (homestead, sprouting
//     book, shared table, monstrance), kept separate from the craft
//     iconMap. They're inlined via ?raw so they inherit currentColor.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ParishMap } from '@/components/ParishMap';
import { Icon } from '@/components/Icon';
import { LanguageNote } from '@/components/LanguageNote';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAuth } from '@/hooks/useAuth';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import type { IconSlug, Bilingual } from '@/lib/types';

import resettlement from '@/assets/icons/resettlement.svg?raw';
import education from '@/assets/icons/education.svg?raw';
import fellowship from '@/assets/icons/fellowship.svg?raw';
import glorification from '@/assets/icons/glorification.svg?raw';

const PILLAR_ICONS = {
  resettlement, education, fellowship, glorification,
} as const;

// Prose is authored inline here rather than in uiStrings.ts because it's
// landing-page copy — long, editorial, and likely to be revised often.
const copy = {
  // ---------------------------------------------------------------------
  // 1. Opening
  // ---------------------------------------------------------------------
  eyebrow: {
    en: 'WE ARE THE CATHOLIC LAND MOVEMENT',
    es: 'CAPÍTULO DEL CENTRO DE TEJAS',
  } satisfies Bilingual,

  // The ache. Names the longing the visitor already feels.
  ache: {
    en: 'Many Catholics yearn for a life rooted in the land — work centered in the home, food raised by neighbors, parishes where real fellowship happens. They long for the simple traditions that make the family what God created it to be: the center of social order.',
    es: 'Muchos católicos anhelan una vida arraigada en la tierra — el trabajo centrado en el hogar, la comida cultivada por los vecinos, parroquias donde haya verdadera hermandad. Anhelan las tradiciones sencillas que hacen de la familia lo que Dios creó que fuera: el centro del orden social.',
  } satisfies Bilingual,

  // Who we are + what we believe. One paragraph on purpose.
  whoWeAre: {
    en: 'We are the Central Texas Chapter of the Catholic Land Movement, and we believe this is possible through the grace of Jesus Christ. It is the work of the laity to orient our families, communities, and institutions toward the beatific vision.',
    es: 'Somos el Capítulo del Centro de Tejas del Movimiento Católico de la Tierra, y creemos que esto es posible por la gracia de Jesucristo. Es obra de los laicos orientar nuestras familias, comunidades, e instituciones hacia la visión beatífica.',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 2. Pillars
  // ---------------------------------------------------------------------
  pillarsEyebrow: {
    en: 'PILLARS',
    es: 'PILARES',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 3. Recent witness
  // ---------------------------------------------------------------------
  witnessEyebrow: {
    en: 'FROM THE CHAPTER',
    es: 'DEL CAPÍTULO',
  } satisfies Bilingual,
  witnessReadMore: {
    en: 'Read the year',
    es: 'Lee el año',
  } satisfies Bilingual,

  // ---------------------------------------------------------------------
  // 4. The map
  // ---------------------------------------------------------------------
  mapEyebrow: {
    en: 'YOUR NEIGHBORS',
    es: 'TUS VECINOS',
  } satisfies Bilingual,
  mapHeading: {
    en: 'The chapter, on the land',
    es: 'El capítulo, en la tierra',
  } satisfies Bilingual,
};

// The four pillars. Each gets an icon, a name, and one paragraph. The
// deeper exposition lives on /vision; this is the introduction.
const pillars: {
  key: keyof typeof PILLAR_ICONS;
  name: Bilingual;
  body: Bilingual;
}[] = [
  {
    key: 'resettlement',
    name: { en: 'Resettlement', es: 'Reasentamiento' },
    body: {
      en: 'Restoring productive property to households, so families can re-root in land, work, and parish life.',
      es: 'Restaurar la propiedad productiva a los hogares, para que las familias puedan arraigarse de nuevo en la tierra, el trabajo, y la vida parroquial.',
    },
  },
  {
    key: 'education',
    name: { en: 'Education', es: 'Educación' },
    body: {
      en: 'Rebuilding peer-to-peer networks for the land and hand crafts — the practical knowledge that used to pass between neighbors.',
      es: 'Reconstruir las redes entre vecinos para los oficios de la tierra y de la mano — el conocimiento práctico que antes pasaba de uno a otro.',
    },
  },
  {
    key: 'fellowship',
    name: { en: 'Fellowship', es: 'Compañerismo' },
    body: {
      en: 'A network of practical, intellectual, and spiritual support among households committed to the same vision.',
      es: 'Una red de apoyo práctico, intelectual, y espiritual entre los hogares comprometidos con la misma visión.',
    },
  },
  {
    key: 'glorification',
    name: { en: 'Glorification', es: 'Glorificación' },
    body: {
      en: 'All chapter activity is rooted in the sacramental and liturgical life of the Church. Prayer, the Mass, and the rhythms of the liturgical year shape everything we do.',
      es: 'Toda la actividad del capítulo está arraigada en la vida sacramental y litúrgica de la Iglesia. La oración, la Misa, y los ritmos del año litúrgico dan forma a todo lo que hacemos.',
    },
  },
];

type RecentPost = {
  id: string;
  body: string;
  language: 'en' | 'es' | null;
  craft: IconSlug | null;
  occurred_at: string;
  author: { display_name: string | null } | null;
};

const Home = () => {
  const { t, locale } = useLocale();
  const { user } = useAuth();

  const [latest, setLatest] = useState<RecentPost | null>(null);

  useEffect(() => {
    (async () => {
      // One post — the most recent approved. A single piece of evidence
      // at reading size does more work than three stacked cards.
      const { data, error } = await supabase
        .from('witness_posts')
        .select(
          'id, body, language, craft, occurred_at, author:profiles!witness_posts_author_id_fkey(display_name)'
        )
        .eq('status', 'approved')
        .order('occurred_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Failed to load recent witness:', error);
      } else if (data && data.length > 0) {
        setLatest(data[0] as unknown as RecentPost);
      }
    })();
  }, []);

  return (
    <Layout>
      {/* ---------------------------------------------------------------- */}
      {/* 1. Opening                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose pb-16 pt-24 text-center">
        <p className="display-caps text-sm font-semibold tracking-[0.3em] text-ocre md:text-base">
          {t(copy.eyebrow)}
        </p>
        <div className="mx-auto mt-10 max-w-xl space-y-6 text-left">
          <p className="prose-body text-lg leading-relaxed text-mesquite/80">
            {t(copy.ache)}
          </p>
          <p className="prose-body text-lg leading-relaxed text-mesquite">
            {t(copy.whoWeAre)}
          </p>
        </div>
      </section>

      <div className="rule container-prose" />

      {/* ---------------------------------------------------------------- */}
      {/* 2. Pillars                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-20">
        <header className="mb-14 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(copy.pillarsEyebrow)}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.key} className="flex flex-col items-center text-center">
              <span
                className="text-mesquite"
                style={{ display: 'inline-block', width: 80, height: 80 }}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: PILLAR_ICONS[p.key] }}
              />
              <h3 className="mt-5 font-heading text-2xl leading-snug text-mesquite">
                {t(p.name)}
              </h3>
              <p className="prose-body mt-3 max-w-md text-base leading-relaxed text-mesquite/80">
                {t(p.body)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* 3. One witness, large                                            */}
      {/* ---------------------------------------------------------------- */}
      {latest && (
        <>
          <section className="container-prose py-20 text-center">
            <p className="display-caps text-xs tracking-[0.3em] text-ocre">
              {t(copy.witnessEyebrow)}
            </p>
            <div className="mt-10 flex flex-col items-center">
              {latest.craft && (
                <Icon slug={latest.craft} size={72} locale={locale} />
              )}
              <blockquote className="mt-8 max-w-xl">
                <p className="prose-body text-2xl leading-relaxed text-mesquite">
                  &ldquo;{latest.body}&rdquo;
                  <LanguageNote contentLanguage={latest.language} className="ml-2" />
                </p>
                <footer className="mt-6 text-sm italic text-piedra">
                  {latest.author?.display_name ?? '—'} ·{' '}
                  {new Date(latest.occurred_at).toLocaleDateString(
                    locale === 'es' ? 'es-MX' : 'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </footer>
              </blockquote>
              <Link
                to={buildPath('testimonio', locale)}
                className="mt-10 display-caps text-xs tracking-[0.2em] text-ocre no-underline hover:text-mesquite"
                style={{ textDecoration: 'none' }}
              >
                {t(copy.witnessReadMore)} →
              </Link>
            </div>
          </section>

          <div className="rule container-prose" />
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 4. The map                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-20">
        <header className="mb-10 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(copy.mapEyebrow)}
          </p>
          <h2 className="mt-4 font-heading text-3xl text-mesquite">
            {t(copy.mapHeading)}
          </h2>
        </header>
        <ParishMap />
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* 5. Closing CTA                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose py-24 text-center">
        <Link
          to={user ? buildPath('miPerfil', locale) : buildPath('bienvenido', locale)}
          className="inline-flex items-center gap-2 rounded-sm bg-ocre px-8 py-3 font-heading text-base text-cal no-underline transition hover:bg-mesquite"
          style={{ textDecoration: 'none' }}
        >
          {user
            ? t({ en: 'My profile', es: 'Mi perfil' })
            : t({ en: 'Join the chapter →', es: 'Únete al capítulo →' })}
        </Link>
      </section>
    </Layout>
  );
};

export default Home;