// src/pages/RestoreTheWay.tsx
// A working page for a long idea: CLM villages planted a day's walk apart
// along El Camino Real de los Tejas.
//
// NOT LINKED ANYWHERE. It is deliberately absent from the nav, from the
// footer, and from robots.txt, because this is a plan being argued with
// rather than a thing the chapter is announcing. Anyone with the URL can
// read it, which is what makes it shareable with two or three people — if
// it needs to be properly private, gate it on `isAdmin` and it disappears
// for everyone else.
//
// The data lives in src/content/camino.ts, including the warning that every
// coordinate is town-centre accurate and nothing here is survey grade.
//
// What this page is for: holding the idea still long enough to be argued
// with. The map is the part that earns its place — the gaps in the walking
// route and the towns worth planting in are the SAME list, and that only
// becomes obvious when you see them drawn on top of each other.

import { createElement, lazy, Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import {
  GAPS, GROUND, IMPACT, LAND_MODEL, MEASURES, PHASES, PRECEDENTS, PRINCIPLES,
  STAGES, STOPS, THESIS,
  TOTAL_MILES, WALK_DAYS_AT_15, WALK_DAYS_AT_20,
} from '@/content/camino';

const CaminoMap = lazy(() =>
  import('@/components/camino/CaminoMap').then((m) => ({ default: m.CaminoMap })),
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="display-caps text-xs tracking-[0.25em] text-ocre">{children}</p>
);

export default function RestoreTheWay() {
  const { t, locale } = useLocale();
  const es = locale === 'es';

  return (
    <Layout>
      {/* ---------------------------------------------------------------- */}
      {/* Opening                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow pt-14 text-center md:pt-20">
        <p className="mb-4 inline-block border border-rojo/30 bg-rojo/5 px-3 py-1 font-caps text-[10px] tracking-[0.2em] text-rojo">
          {es ? 'BORRADOR · NO ENLAZADO' : 'WORKING DRAFT · NOT LINKED'}
        </p>
        <Eyebrow>{es ? 'EL CAMINO REAL DE LOS TEJAS' : 'EL CAMINO REAL DE LOS TEJAS'}</Eyebrow>
        <h1 className="mt-4 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
          {es ? 'Restaurar el Camino' : 'Restore The Way'}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-mesquite/85">
          {es
            ? 'Una cadena de aldeas del Movimiento Católico de la Tierra, a un día de camino unas de otras, a lo largo del camino histórico de los Tejas. Veinte paradas, de Natchitoches a la Misión Espada.'
            : 'A string of Catholic Land Movement villages, a day’s walk apart, along the historic road of the Tejas. Twenty stops, from Natchitoches to Mission Espada.'}
        </p>

        {/* The three numbers that make the case in one line: this is the
            length of a Camino people already walk. */}
        <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 border-y border-mesquite/15">
          {[
            { n: `~${TOTAL_MILES}`, l: es ? 'millas' : 'miles' },
            { n: `${WALK_DAYS_AT_20}–${WALK_DAYS_AT_15}`, l: es ? 'días a pie' : 'days on foot' },
            { n: String(STOPS.length), l: es ? 'paradas' : 'stops' },
          ].map((x, i) => (
            <div key={x.l} className={`px-3 py-5 ${i ? 'border-l border-mesquite/12' : ''}`}>
              <dd className="font-heading text-[28px] leading-none text-mesquite tabular-nums md:text-[34px]">
                {x.n}
              </dd>
              <dt className="mt-2 font-caps text-[9px] tracking-[0.18em] text-ocre">
                {x.l.toUpperCase()}
              </dt>
            </div>
          ))}
        </dl>
        <p className="mx-auto mt-4 max-w-xl font-serif text-xs italic text-piedra">
          {es
            ? 'Casi lo mismo que el Camino Francés, que suele caminarse en cinco semanas.'
            : 'Almost exactly the Camino Francés, which people walk in about five weeks.'}
        </p>

        {/* The thesis, and the reason for the name. */}
        <blockquote className="mx-auto mt-12 max-w-2xl border-t border-b border-mesquite/15 py-7">
          <p className="font-heading text-xl leading-relaxed text-mesquite md:text-2xl">
            {t(THESIS)}
          </p>
        </blockquote>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The map                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-12 md:py-16">
        <Suspense
          fallback={
            <div
              className="rounded border border-mesquite/20 bg-cal/50"
              style={{ height: 560 }}
              aria-hidden="true"
            />
          }
        >
          <CaminoMap />
        </Suspense>

        {/* Legend. The stages are the colours; the soft red spans are the
            gaps, which are also the plan. */}
        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {STAGES.map((s) => (
            <span key={s.key} className="flex items-center gap-2 font-serif text-xs text-mesquite/80">
              <span
                aria-hidden="true"
                className="inline-block h-[3px] w-6"
                style={{ background: `hsl(var(--${s.token}))` }}
              />
              {t(s.name)} · {s.miles} mi
            </span>
          ))}
          <span className="flex items-center gap-2 font-serif text-xs italic text-rojo">
            <span aria-hidden="true" className="inline-block h-3 w-6 rounded-sm bg-rojo/20" />
            {es ? 'hueco para caminantes' : 'gap for walkers'}
          </span>
          <span className="flex items-center gap-2 font-serif text-xs italic text-piedra">
            <span
              aria-hidden="true"
              className="inline-block h-3.5 w-3.5 rounded-full border-[3px] border-rojo bg-cal"
            />
            {es ? 'candidata a aldea ancla' : 'anchor village candidate'}
          </span>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-center font-serif text-xs italic text-piedra/80">
          {es
            ? 'Coordenadas a nivel de pueblo, para planear y discutir. Antes de que alguien camine esto, hay que tomar puntos GPS en la puerta de cada iglesia.'
            : 'Town-centre coordinates, good for planning and arguing. Before anyone walks this, every stop needs a GPS point taken at the church door.'}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Where the road breaks — and where the villages go                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'DONDE SE ROMPE EL CAMINO' : 'WHERE THE ROAD BREAKS'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es ? 'El hueco y el plan son la misma lista' : 'The gap and the plan are the same list'}
        </h2>
        <p className="prose-body mt-4 max-w-2xl text-base leading-relaxed text-mesquite/85">
          {es
            ? 'Un hueco es un tramo sin parroquia, sin alojamiento y sin razón para que un peregrino se detenga. Eso es exactamente un pueblo con tierra barata, una calle principal vaciándose y sitio para una aldea. El problema y la oportunidad son el mismo lugar.'
            : 'A gap is a stretch with no parish, no lodging and no reason for a pilgrim to stop. That is exactly a town with cheap land, an emptying main street and room for a village. The problem and the opportunity are the same place.'}
        </p>

        <ul className="mt-8 divide-y divide-mesquite/10 border-y border-mesquite/15">
          {GAPS.map((g) => (
            <li key={g.from} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-heading text-xl text-mesquite">
                  {g.from} → {g.to}
                </h3>
                <p className="font-serif text-sm tabular-nums text-piedra">
                  {g.miles} mi · {g.hostsNeeded} {es ? 'anfitriones' : 'hosts needed'}
                </p>
              </div>
              <p className="prose-body mt-2 text-sm leading-relaxed text-mesquite/80">{t(g.why)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The stages, and every stop                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'LAS ETAPAS' : 'THE STAGES'}</Eyebrow>
        <div className="mt-8 space-y-10">
          {STAGES.map((stage) => {
            const stops = STOPS.filter((s) => s.stage === stage.key);
            return (
              <article key={stage.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-mesquite/15 pb-2">
                  <h3 className="flex items-center gap-3 font-heading text-2xl text-mesquite">
                    <span
                      aria-hidden="true"
                      className="inline-block h-[3px] w-7"
                      style={{ background: `hsl(var(--${stage.token}))` }}
                    />
                    {t(stage.name)}
                  </h3>
                  <p className="font-serif text-sm tabular-nums text-piedra">{stage.miles} mi</p>
                </div>
                <ol className="mt-4 space-y-3">
                  {stops.map((s) => (
                    <li key={s.n} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-mesquite/25 font-heading text-xs text-mesquite">
                        {s.n}
                      </span>
                      <div className="min-w-0">
                        <p className="font-heading text-base leading-snug text-mesquite">
                          {s.name}
                          {s.anchorCandidate && (
                            <span className="ml-2 font-caps text-[9px] tracking-[0.15em] text-rojo">
                              {es ? 'ANCLA' : 'ANCHOR'}
                            </span>
                          )}
                        </p>
                        {/* The address is here so it can be pasted straight
                            into a maps search while planning a leg. */}
                        <p className="font-serif text-xs text-piedra/80">{s.address}</p>
                        {s.note && (
                          <p className="prose-body mt-1 text-sm leading-snug text-mesquite/80">
                            {t(s.note)}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* What is already on the ground                                     */}
      {/*                                                                   */}
      {/* Researched, not assumed, and it moves the plan: the road is       */}
      {/* already a National Historic Trail, the southern end already has a */}
      {/* working credential, and certification already offers the exact    */}
      {/* trade a village wants to make. Phase 0 is joining three things    */}
      {/* that exist, not inventing one.                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'LO QUE YA EXISTE' : 'WHAT ALREADY EXISTS'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es ? 'No hay que inventar el camino' : 'The road does not need inventing'}
        </h2>

        <ul className="mt-8 space-y-8">
          {GROUND.map((g) => (
            <li key={g.href} className="border-t border-mesquite/15 pt-6">
              <h3 className="font-heading text-xl leading-snug text-mesquite">{t(g.title)}</h3>
              <p className="prose-body mt-3 text-sm leading-relaxed text-mesquite/80">
                {t(g.body)}
              </p>
              <p className="mt-3 border-l-2 border-ocre/40 pl-4 font-serif text-sm italic leading-relaxed text-mesquite">
                {t(g.soWhat)}
              </p>
              {createElement(
                'a',
                {
                  href: g.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className:
                    'mt-3 inline-block font-caps text-[11px] tracking-[0.15em] text-ocre no-underline hover:text-mesquite',
                },
                <>{g.label} →</>,
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The charter                                                       */}
      {/*                                                                   */}
      {/* Requirements, not an essay. Each is a thing a village either does */}
      {/* or does not do, numbered so it can be argued with by number and   */}
      {/* checked against a real town.                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'LA CARTA DE LA ALDEA' : 'THE VILLAGE CHARTER'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es ? 'Lo que hace que una aldea sea una' : 'What makes a village one'}
        </h2>
        <p className="prose-body mt-4 max-w-2xl text-base leading-relaxed text-mesquite/85">
          {es
            ? 'Requisitos, no ideas. Cada uno es algo que una aldea hace o no hace, y casi todos llevan una prueba que lo zanja. Están numerados para poder discutirlos por número.'
            : 'Requirements, not ideas. Each is a thing a village either does or does not do, and most carry a test that settles it. They are numbered so they can be argued with by number.'}
        </p>

        <div className="mt-10 space-y-10">
          {PRINCIPLES.map((pr) => (
            <article key={pr.key}>
              <div className="flex gap-4 border-b border-mesquite/15 pb-3">
                <span className="font-heading text-3xl leading-none text-ocre tabular-nums">
                  {pr.n}
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading text-2xl leading-snug text-mesquite">
                    {t(pr.name)}
                  </h3>
                  <p className="prose-body mt-2 text-sm italic leading-relaxed text-piedra">
                    {t(pr.claim)}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-4">
                {pr.requirements.map((r) => (
                  <li key={r.id} className="flex gap-4">
                    <span className="mt-0.5 w-7 flex-shrink-0 font-caps text-[11px] tracking-[0.1em] text-ocre">
                      {r.id}
                    </span>
                    <div className="min-w-0">
                      <p className="prose-body text-base leading-relaxed text-mesquite/90">
                        {t(r.text)}
                      </p>
                      {r.test && (
                        <p className="mt-1 font-serif text-sm italic leading-snug text-piedra">
                          {es ? 'Prueba: ' : 'Test: '}
                          {t(r.test)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* What it adds up to                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'A CU\u00c1NTO LLEGA' : 'WHAT IT ADDS UP TO'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es
            ? 'Una granja ayuda a una familia. Veinte aldeas son una cultura.'
            : 'One homestead helps one family. Twenty villages are a culture.'}
        </h2>
        <p className="prose-body mt-4 max-w-2xl text-base leading-relaxed text-mesquite/85">
          {es
            ? 'Cada cifra lleva al lado el supuesto del que depende, para que se pueda mover en vez de creerse.'
            : 'Each figure carries the assumption it rests on, so it can be moved rather than believed.'}
        </p>

        <ul className="mt-9 space-y-9">
          {IMPACT.map((f) => (
            <li key={f.id} className="border-t border-mesquite/15 pt-6">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-heading text-3xl text-mesquite tabular-nums">{f.figure}</span>
                <span className="font-heading text-lg text-mesquite/85">{t(f.label)}</span>
              </p>
              <p className="prose-body mt-3 text-sm leading-relaxed text-mesquite/80">{t(f.body)}</p>
              <p className="mt-3 border-l-2 border-ocre/40 pl-4 font-serif text-sm italic leading-relaxed text-mesquite">
                {t(f.basis)}
              </p>
              {f.source &&
                createElement(
                  'a',
                  {
                    href: f.source.href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className:
                      'mt-3 inline-block font-caps text-[11px] tracking-[0.15em] text-ocre no-underline hover:text-mesquite',
                  },
                  <>{f.source.label} →</>,
                )}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How the land is held                                              */}
      {/*                                                                   */}
      {/* The page used to end by admitting it did not know this. It does   */}
      {/* now, and it is the piece that makes the acreage reachable: the    */}
      {/* trust holds the land, the family holds the lease and owns every   */}
      {/* thing it builds.                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'C\u00d3MO SE TIENE LA TIERRA' : 'HOW THE LAND IS HELD'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es
            ? 'La aldea tiene la tierra. La familia tiene la casa.'
            : 'The village holds the land. The family holds the house.'}
        </h2>

        <ul className="mt-8 space-y-7">
          {LAND_MODEL.map((m) => (
            <li key={m.title.en} className="border-t border-mesquite/15 pt-5">
              <h3 className="font-heading text-xl leading-snug text-mesquite">{t(m.title)}</h3>
              <p className="prose-body mt-2 text-sm leading-relaxed text-mesquite/80">{t(m.body)}</p>
              {m.source &&
                createElement(
                  'a',
                  {
                    href: m.source.href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className:
                      'mt-3 inline-block font-caps text-[11px] tracking-[0.15em] text-ocre no-underline hover:text-mesquite',
                  },
                  <>{m.source.label} →</>,
                )}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Precedents                                                        */}
      {/*                                                                   */}
      {/* Each read for what it proves AND for how it fails. A precedent    */}
      {/* used only for its good half is an advertisement.                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'PRECEDENTES' : 'PRECEDENTS'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es ? 'Esto ya se ha intentado' : 'This has been tried before'}
        </h2>
        <p className="prose-body mt-4 max-w-2xl text-base leading-relaxed text-mesquite/85">
          {es
            ? 'Cada uno le\u00eddo por lo que demuestra y por c\u00f3mo falla. Un precedente usado s\u00f3lo por su mitad buena es un anuncio.'
            : 'Each read for what it proves and for how it fails. A precedent used only for its good half is an advertisement.'}
        </p>

        <div className="mt-9 space-y-9">
          {PRECEDENTS.map((pc) => (
            <article key={pc.name} className="border-t border-mesquite/15 pt-6">
              <h3 className="font-heading text-2xl leading-snug text-mesquite">{pc.name}</h3>
              <p className="font-serif text-xs italic text-piedra">{t(pc.where)}</p>

              <p className="mt-4 font-caps text-[9px] tracking-[0.18em] text-ocre">
                {es ? 'LO QUE DEMUESTRA' : 'WHAT IT PROVES'}
              </p>
              <p className="prose-body mt-1 text-sm leading-relaxed text-mesquite/80">
                {t(pc.proves)}
              </p>

              <p className="mt-4 font-caps text-[9px] tracking-[0.18em] text-rojo">
                {es ? 'DE QU\u00c9 ADVIERTE' : 'WHAT IT WARNS'}
              </p>
              <p className="prose-body mt-1 text-sm leading-relaxed text-mesquite/80">
                {t(pc.warns)}
              </p>

              {createElement(
                'a',
                {
                  href: pc.source.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className:
                    'mt-3 inline-block font-caps text-[11px] tracking-[0.15em] text-ocre no-underline hover:text-mesquite',
                },
                <>{pc.source.label} →</>,
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Phasing + what to measure                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12 pb-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>{es ? 'POR ETAPAS' : 'PHASING'}</Eyebrow>
            <ol className="mt-6 space-y-6 border-l border-mesquite/20 pl-6">
              {PHASES.map((p) => (
                <li key={p.years} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.72rem] top-[0.4rem] h-2 w-2 rotate-45 bg-ocre"
                  />
                  <p className="display-caps text-xs tracking-[0.2em] text-ocre">
                    {es ? 'AÑOS' : 'YEARS'} {p.years}
                  </p>
                  <h3 className="mt-1 font-heading text-xl text-mesquite">{t(p.title)}</h3>
                  <p className="prose-body mt-2 text-sm leading-relaxed text-mesquite/80">
                    {t(p.body)}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <Eyebrow>{es ? 'QUÉ MEDIR' : 'WHAT TO MEASURE'}</Eyebrow>
            <p className="prose-body mt-6 text-sm leading-relaxed text-mesquite/80">
              {es
                ? 'Concreto para poner delante de un obispo, un donante o un ayuntamiento.'
                : 'Concrete enough to put in front of a bishop, a donor or a town council.'}
            </p>
            <ul className="mt-5 space-y-3">
              {MEASURES.map((m) => (
                <li key={m.en} className="flex gap-3 border-b border-mesquite/10 pb-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rotate-45 bg-ocre"
                  />
                  <span className="prose-body text-base text-mesquite/85">{t(m)}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 font-serif text-sm italic leading-relaxed text-piedra">
              {es
                ? 'Lo que falta: los números de peregrinos del Centro Padre Margil, el padrón de hogares de las veinte parroquias, y un precio por acre por condado. Tres llamadas.'
                : 'Still missing: the pilgrim numbers from the Padre Margil centre, the registered-household count for each of the twenty parishes, and a price per acre by county. Three phone calls.'}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
