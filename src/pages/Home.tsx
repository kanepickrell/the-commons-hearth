// src/pages/Home.tsx
// Landing page — the trailhead, not the whole trail.
//
// Structure:
//   1. Hero — who we are, what the movement is for, and the two next steps
//   2. Why it matters — the longing, named before anything is asked
//   3. Approach — "Grown, Not Built"
//   4. Our Mission — Resettlement, Education, Fellowship, Glorification
//   5. Meet your neighbors — the chapter map and parish list
//   6. Next Gathering — the one dated thing, read from the /workshops data
//   7. The patron — the closing note
//
// Notes:
//   - The words live in src/content/home.ts, not inline here, because
//     vite/prerender-home.ts reads the same module to write a static copy of
//     the page's opening into index.html at build time. Editing copy in one
//     place keeps the prerender from drifting out of date.
//   - Vision owns the deeper exposition of the four pillars; Home introduces
//     them. The "how to live this out" content lives on Participate, which
//     is where the hero's "Join the chapter" points.
//   - The witness quote that used to sit between the pillars and the map now
//     lives only on /witness — the Year Wheel is the better home for it, and
//     the section rendered as nothing whenever no post was approved.
//   - The four pillar icons are bespoke line-art (homestead, sprouting book,
//     shared table, monstrance), kept separate from the craft iconMap.
//     They're inlined via ?raw so they inherit currentColor.

import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { NextGathering } from '@/components/NextGathering';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { homeCopy, pillars } from '@/content/home';

import resettlement from '@/assets/icons/resettlement.svg?raw';
import education from '@/assets/icons/education.svg?raw';
import fellowship from '@/assets/icons/fellowship.svg?raw';
import glorification from '@/assets/icons/glorification.svg?raw';

// Leaflet is the single heaviest dependency on the site; loading it after the
// first paint keeps the landing page's initial bundle small.
const ParishMap = lazy(() =>
  import('@/components/ParishMap').then((m) => ({ default: m.ParishMap }))
);

const PILLAR_ICONS = {
  resettlement, education, fellowship, glorification,
} as const;

const Home = () => {
  const { t, locale } = useLocale();

  return (
    <Layout>
      {/* ---------------------------------------------------------------- */}
      {/* 1. Hero                                                          */}
      {/*                                                                  */}
      {/* Two buttons, two destinations, in the order a visitor should      */}
      {/* consider them: see it for yourself, then throw in with us.       */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose pb-16 pt-24 text-center">
        <h1 className="font-heading text-ocre text-3xl md:text-4xl">
          {t(homeCopy.heading)}
        </h1>
        <p className="prose-body mx-auto mt-5 max-w-xl text-lg italic leading-relaxed text-piedra">
          {t(homeCopy.tagline)}
        </p>
        <p className="prose-body mx-auto mt-8 max-w-xl text-left text-lg leading-relaxed text-mesquite">
          {t(homeCopy.lede)}
        </p>
        {/* Phones get two full-width buttons, stacked and equal: left to wrap
            they came out ragged, at different widths, and small to thumb.
            From sm up they sit side by side as before. */}
        <div className="mx-auto mt-10 flex max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          <Link
            to={buildPath('talleres', locale)}
            className="rounded-sm bg-ocre px-8 py-3 text-center font-heading text-base text-cal no-underline transition hover:bg-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t(homeCopy.ctaGathering)}
          </Link>
          <Link
            to={buildPath('participate', locale)}
            className="rounded-sm border border-mesquite/30 px-8 py-3 text-center font-heading text-base text-mesquite no-underline transition hover:border-ocre hover:text-ocre"
            style={{ textDecoration: 'none' }}
          >
            {t(homeCopy.ctaJoin)}
          </Link>
        </div>
      </section>

      <div className="rule container-prose" />

      {/* ---------------------------------------------------------------- */}
      {/* 2. Why it matters                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose py-20 text-center">
        <p className="display-caps text-sm font-semibold tracking-[0.3em] text-ocre md:text-base">
          {t(homeCopy.whyEyebrow)}
        </p>
        <p className="prose-body mx-auto mt-9 max-w-xl text-left text-lg leading-relaxed text-mesquite/90">
          {t(homeCopy.why)}
        </p>
      </section>

      <div className="rule container-prose" />

      {/* ---------------------------------------------------------------- */}
      {/* 3. Approach                                                      */}
      {/*                                                                  */}
      {/* The movable one. If the page ever runs long, this section is the  */}
      {/* one to lift onto /vision — it's exposition, not an invitation.   */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose py-20 text-center">
        <h2 className="font-heading text-3xl text-mesquite">
          {t(homeCopy.approachHeading)}
        </h2>
        <p className="prose-body mx-auto mt-6 max-w-xl text-left text-lg leading-relaxed text-mesquite/90">
          {t(homeCopy.approach)}
        </p>
      </section>

      <div className="rule container-prose" />

      {/* ---------------------------------------------------------------- */}
      {/* 4. Our Mission                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-20">
        <header className="mb-14 text-center">
          <p className="display-caps text-sm font-semibold tracking-[0.3em] text-ocre md:text-base">
            {t(homeCopy.pillarsEyebrow)}
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
      {/* 5. Meet your neighbors                                           */}
      {/*                                                                  */}
      {/* The blessing sits here rather than in the hero on purpose: it's   */}
      {/* the sentence that tells a visitor the thing they're looking at    */}
      {/* on this map is recognised by the Church, not a private project.   */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-20">
        <header className="mb-10 text-center">
          <p className="display-caps text-sm font-semibold tracking-[0.3em] text-ocre md:text-base">
            {t(homeCopy.mapEyebrow)}
          </p>
          <p className="prose-body mx-auto mt-4 max-w-md text-sm italic leading-relaxed text-piedra">
            {t(homeCopy.blessing)}
          </p>
        </header>
        <Suspense
          fallback={
            <div
              className="rounded border border-mesquite/20 bg-cal/50"
              style={{ height: 460 }}
              aria-hidden="true"
            />
          }
        >
          <ParishMap />
        </Suspense>
        <p className="mt-6 text-center">
          <Link
            to={buildPath('mapa', locale)}
            className="display-caps text-xs tracking-[0.2em] text-ocre no-underline hover:text-mesquite"
            style={{ textDecoration: 'none' }}
          >
            {t(homeCopy.openMap)} →
          </Link>
        </p>
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* 6. Next gathering                                                */}
      {/* ---------------------------------------------------------------- */}
      <NextGathering />

      <div className="rule container-prose" />

      {/* ---------------------------------------------------------------- */}
      {/* 7. The patron — the closing note                                 */}
      {/*                                                                   */}
      {/* Nothing else on the site says "this is a CATHOLIC land movement"  */}
      {/* as immediately as Isidore does, and the page that carries him —   */}
      {/* the retablo, the prayer — sat fifth in the nav with nothing       */}
      {/* pointing at it. One line here; the dateline already counts down   */}
      {/* to his feast.                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose py-20 text-center">
        <p className="display-caps text-xs tracking-[0.3em] text-ocre">
          {t(uiStrings.patron.feastDay).toUpperCase()}
        </p>
        <h2 className="mt-4 font-heading text-3xl text-mesquite">
          {t(uiStrings.patron.heading)}
        </h2>
        <p className="prose-body mx-auto mt-4 max-w-md text-base italic leading-relaxed text-piedra">
          {t(homeCopy.patronLine)}
        </p>
        <Link
          to={buildPath('santo', locale)}
          className="mt-6 inline-block display-caps text-xs tracking-[0.2em] text-ocre no-underline hover:text-mesquite"
          style={{ textDecoration: 'none' }}
        >
          {t(homeCopy.patronMore)} →
        </Link>
      </section>
    </Layout>
  );
};

export default Home;
