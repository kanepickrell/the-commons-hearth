// src/pages/Home.tsx
// Landing page — the trailhead, not the whole trail.
//
// Structure:
//   1. Opening beat: mission / ache / offer (three short paragraphs)
//   2. "What we do" — three practices, one line each
//   3. A single recent witness, large, as evidence
//   4. The chapter map
//   5. Three next-step tiles
//
// Notes on the rewrite:
//   - Vision page owns the four-pillar exposition; Home stays a trailhead.
//   - Dropped the four-charism grid — it duplicated Vision and asked visitors
//     to hold four abstractions before seeing anything concrete.
//   - Dropped San Isidro from Home — he lives on /santo and in the footer.
//   - Replaced "See all" dead-end with three parallel CTAs.

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

// Prose is authored inline here rather than in uiStrings.ts because it's
// landing-page copy — long, editorial, and likely to be revised often.
// If/when it stabilizes, promote to uiStrings.
const copy = {
  eyebrow: {
    en: 'CENTRAL TEXAS CHAPTER',
    es: 'CAPÍTULO DEL CENTRO DE TEJAS',
  } satisfies Bilingual,

  headline: {
    en: 'A Catholic chapter, rooted in Central Texas soil.',
    es: 'Un capítulo católico, con raíces en la tierra del centro de Tejas.',
  } satisfies Bilingual,

  // The "ache" — names the longing the visitor already feels. Without this
  // the page reads like a definition; with it, the page recognizes them.
  ache: {
    en: 'Many Catholic families want to return to land-based, Christ-centered life — to work they can see the end of, food that came from someone they know, neighbors they can call on. It can seem impossible to begin.',
    es: 'Muchas familias católicas quieren volver a una vida en la tierra, centrada en Cristo — al trabajo cuyo fin se puede ver, a la comida que vino de alguien conocido, a los vecinos a quienes se puede llamar. Puede parecer imposible empezar.',
  } satisfies Bilingual,

  // The "offer." Kept concrete on purpose — what we are (a chapter), where
  // we are (Hill Country, San Antonio), what we do (meet, teach, share
  // work). National CLM can speak of "resettlement" as a mission word; at
  // the chapter level we describe the weekly reality.
  offer: {
    en: 'We are a chapter of the Catholic Land Movement in the Hill Country and around San Antonio. We meet at each other\u2019s parishes and homesteads, teach each other the old crafts, and share the work that makes a Catholic home fruitful.',
    es: 'Somos un capítulo del Movimiento Católico de la Tierra en el Hill Country y los alrededores de San Antonio. Nos reunimos en las parroquias y ranchos de unos y otros, nos enseñamos los oficios antiguos, y compartimos el trabajo que hace fecundo un hogar católico.',
  } satisfies Bilingual,

  practicesEyebrow: {
    en: 'WHAT WE DO',
    es: 'LO QUE HACEMOS',
  } satisfies Bilingual,

  mapEyebrow: {
    en: 'YOUR NEIGHBORS',
    es: 'TUS VECINOS',
  } satisfies Bilingual,
  mapHeading: {
    en: 'The chapter, on the land',
    es: 'El capítulo, en la tierra',
  } satisfies Bilingual,

  witnessEyebrow: {
    en: 'FROM THE CHAPTER',
    es: 'DEL CAPÍTULO',
  } satisfies Bilingual,
  witnessReadMore: {
    en: 'Read the year',
    es: 'Lee el año',
  } satisfies Bilingual,

  ctaEyebrow: {
    en: 'BEGIN WHERE YOU ARE',
    es: 'COMIENZA DONDE ESTÁS',
  } satisfies Bilingual,
};

// Three practices. I picked three (not four) because three reads as
// "what we do"; four reads as doctrine and competes with Vision. Each
// practice reuses an existing icon to stay in the visual system.
const practices: {
  slug: IconSlug;
  title: Bilingual;
  blurb: Bilingual;
}[] = [
  {
    slug: 'la-azuela',
    title: { en: 'Workshops we host', es: 'Los talleres que damos' },
    blurb: {
      en: 'Hands-on days — beekeeping, bread, building, preserving. Hosted by members, on real land.',
      es: 'Días de manos — apicultura, pan, construcción, conserva. Ofrecidos por miembros, en tierra de verdad.',
    },
  },
  {
    slug: 'las-yerbas',
    title: { en: 'Skills we pass on', es: 'Los oficios que transmitimos' },
    blurb: {
      en: 'The old crafts a Catholic home needs — taught back and forth, before they are lost.',
      es: 'Los oficios antiguos que un hogar católico necesita — enseñándonos unos a otros, antes de que se pierdan.',
    },
  },
  {
    slug: 'el-pan',
    title: { en: 'Homes we build together', es: 'Hogares que levantamos juntos' },
    blurb: {
      en: 'When a neighbor needs help raising a coop, a cistern, a barn — we go.',
      es: 'Cuando un vecino necesita ayuda para levantar un gallinero, una cisterna, un granero — vamos.',
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
      // Just one post — the most recent approved. A single piece of
      // evidence at reading size does more work than three stacked cards.
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

  // Third CTA depends on auth state. Signed-out visitor → "Sign in / Join";
  // signed-in visitor → "My profile." This turns the third tile into the
  // actual conversion this page is trying to drive.
  const thirdCta = user
    ? {
        to: buildPath('miPerfil', locale),
        eyebrow: { en: 'MEMBERS', es: 'MIEMBROS' } satisfies Bilingual,
        title: { en: 'My profile', es: 'Mi perfil' } satisfies Bilingual,
        blurb: {
          en: 'Your parish, your crafts, your gatherings.',
          es: 'Tu parroquia, tus oficios, tus reuniones.',
        } satisfies Bilingual,
      }
    : {
        to: buildPath('bienvenido', locale),
        eyebrow: { en: 'JOIN US', es: 'ÚNETE' } satisfies Bilingual,
        title: { en: 'Join the chapter', es: 'Únete al capítulo' } satisfies Bilingual,
        blurb: {
          en: 'A few questions. Your neighbors find you, and you find them.',
          es: 'Unas preguntas. Tus vecinos te encuentran, y tú a ellos.',
        } satisfies Bilingual,
      };

  return (
    <Layout>
      {/* ---------------------------------------------------------------- */}
      {/* 1. Opening beat: mission / ache / offer                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose pb-16 pt-24 text-center">
        <p className="display-caps text-xs tracking-[0.3em] text-ocre">
          {t(copy.eyebrow)}
        </p>
        <h1 className="mt-8 font-heading text-4xl leading-[1.15] text-mesquite md:text-5xl">
          {t(copy.headline)}
        </h1>
        <div className="mx-auto mt-10 max-w-xl space-y-6 text-left">
          <p className="prose-body text-lg leading-relaxed text-mesquite/80">
            {t(copy.ache)}
          </p>
          <p className="prose-body text-lg leading-relaxed text-mesquite">
            {t(copy.offer)}
          </p>
        </div>
      </section>

      <div className="rule container-prose" />

      {/* ---------------------------------------------------------------- */}
      {/* 2. What we do — three practices                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-20">
        <header className="mb-14 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(copy.practicesEyebrow)}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-3">
          {practices.map((p) => (
            <div key={p.slug} className="flex flex-col items-center text-center">
              <Icon slug={p.slug} size={96} locale={locale} />
              <h3 className="mt-6 font-heading text-xl leading-snug text-mesquite">
                {t(p.title)}
              </h3>
              <p className="prose-body mt-3 text-base italic leading-relaxed text-piedra">
                {t(p.blurb)}
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
      {/* 5. Three next-step tiles                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-24">
        <header className="mb-12 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(copy.ctaEyebrow)}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <CtaTile
            to={buildPath('talleres', locale)}
            eyebrow={{ en: 'GATHER', es: 'REUNIRSE' }}
            title={{ en: 'Attend a gathering', es: 'Asiste a una reunión' }}
            blurb={{
              en: 'Real workshops, hosted by members — open to anyone willing to show up and work.',
              es: 'Talleres de verdad, ofrecidos por miembros — abiertos a cualquiera dispuesto a llegar y trabajar.',
            }}
            t={t}
          />
          <CtaTile
            to={buildPath('vision', locale)}
            eyebrow={{ en: 'LEARN', es: 'APRENDE' }}
            title={{ en: 'Read the vision', es: 'Lee la visión' }}
            blurb={{
              en: 'The four pillars and the cycle we walk — why this work, why now.',
              es: 'Los cuatro pilares y el ciclo que caminamos — por qué este trabajo, por qué ahora.',
            }}
            t={t}
          />
          <CtaTile
            to={thirdCta.to}
            eyebrow={thirdCta.eyebrow}
            title={thirdCta.title}
            blurb={thirdCta.blurb}
            t={t}
          />
        </div>
      </section>
    </Layout>
  );
};

// Small local component — not worth its own file.
const CtaTile = ({
  to,
  eyebrow,
  title,
  blurb,
  t,
}: {
  to: string;
  eyebrow: Bilingual;
  title: Bilingual;
  blurb: Bilingual;
  t: (b: Bilingual) => string;
}) => (
  <Link
    to={to}
    className="group flex flex-col border border-mesquite/15 bg-cal/40 p-6 no-underline transition-colors hover:border-ocre hover:bg-cal"
    style={{ textDecoration: 'none' }}
  >
    <p className="display-caps text-[10px] tracking-[0.25em] text-ocre">
      {t(eyebrow)}
    </p>
    <h3 className="mt-3 font-heading text-xl text-mesquite group-hover:text-ocre">
      {t(title)} →
    </h3>
    <p className="prose-body mt-3 text-sm italic leading-relaxed text-piedra">
      {t(blurb)}
    </p>
  </Link>
);

export default Home;