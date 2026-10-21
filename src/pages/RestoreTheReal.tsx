// src/pages/RestoreTheReal.tsx
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
// The data lives in src/content/camino.ts. Coordinates are geocoded against
// OpenStreetMap, except two that still need a field GPS point; distances are
// the chapter's own estimates by stage, not measured leg by leg.
//
// What this page is for: holding the idea still long enough to be argued
// with. The map is the part that earns its place — the gaps in the walking
// route and the towns worth planting in are the SAME list, and that only
// becomes obvious when you see them drawn on top of each other.

import { createElement, lazy, Suspense, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CAMPAIGN, CHAPTERS, CHAPTER_REACH_MILES, GAPS, GROUND, HERITAGE, HORIZON_YEARS,
  IMPACT, LAND_MODEL,
  MEASURES, MILESTONES, NATIONAL_AIM, PHASES, PRECEDENTS, PRINCIPLES, ROSTER,
  STAGES, STOPS, THESIS, VILLAGE_PHASES,
  TOTAL_MILES, WALK_DAYS_AT_15, WALK_DAYS_AT_20,
  milesBetween, stateAt,
} from '@/content/camino';

const CaminoMap = lazy(() =>
  import('@/components/camino/CaminoMap').then((m) => ({ default: m.CaminoMap })),
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="display-caps text-xs tracking-[0.25em] text-ocre">{children}</p>
);

const PHASE_JUMPS = [0, 2, 5, HORIZON_YEARS];

const phaseName = (y: number, es: boolean) =>
  y === 0
    ? es ? 'Hoy' : 'Today'
    : y <= 2
      ? es ? 'Caminarlo' : 'Walk it'
      : y <= 5
        ? es ? 'La primera aldea' : 'The first village'
        : es ? 'Un corredor' : 'A corridor';

const money = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${n}`;

export default function RestoreTheReal() {
  const { t, locale } = useLocale();
  const es = locale === 'es';

  // The model year. Everything on and beside the map reads from stateAt(),
  // so there is one source of truth for what year N looks like.
  const [year, setYear] = useState(0);
  const now = stateAt(year);
  const num = (n: number) => n.toLocaleString(es ? 'es-MX' : 'en-US');

  // The project name in the tab, chapter last, so the name survives a
  // narrow tab. index.html carries one <title> for the whole SPA.
  useDocumentTitle(
    es
      ? 'Restaurar lo Real · CLM Centro de Tejas'
      : 'Restore The Real · Central Texas CLM',
  );

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
          {es ? 'Restaurar lo Real' : 'Restore The Real'}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-mesquite/85">
          {es
            ? 'Una cadena de aldeas del Movimiento Católico de la Tierra, a un día de camino unas de otras, a lo largo del camino histórico de los Tejas. Veintiuna paradas, de Natchitoches a la Catedral de San Fernando.'
            : 'A string of Catholic Land Movement villages, a day’s walk apart, along the historic road of the Tejas. Twenty-one stops, from Natchitoches to San Fernando Cathedral.'}
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

        {/* What the campaign asks for, and why the road carries its name.
            No heading repeating the name: the h1 above already said it. */}
        <div className="mx-auto mt-10 max-w-2xl text-left">
          <Eyebrow>{es ? 'UN PASO REAL' : 'ONE REAL STEP'}</Eyebrow>
          <p className="prose-body mt-4 text-base leading-relaxed text-mesquite/85">
            {t(CAMPAIGN.body)}
          </p>
          <p className="prose-body mt-4 text-base leading-relaxed text-mesquite/85">
            {t(CAMPAIGN.why)}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The map, and the years                                            */}
      {/*                                                                   */}
      {/* The scrubber is the one interactive thing on the page and it      */}
      {/* earns its place: it turns a list of phases into something you can */}
      {/* watch happen. Dragging it fills the road in from the chapters     */}
      {/* outward, grows the villages, and puts out the gaps one at a time. */}
      {/*                                                                   */}
      {/* Everything it shows is derived from stateAt() in content/camino,  */}
      {/* so the numbers beside the map and the shapes on it cannot drift.  */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
        <Suspense
          fallback={
            <div
              className="rounded border border-mesquite/20 bg-cal/50"
              style={{ height: 560 }}
              aria-hidden="true"
            />
          }
        >
          <CaminoMap year={year} />
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

        <p className="mt-4 font-serif text-xs italic text-piedra/80">
          {es
            ? 'Coordenadas geocodificadas contra OpenStreetMap. Diecinueve de veintiuna dieron en la dirección o el sitio; faltan dos, Chireno y la misión de Alto. Las cinco paradas de San Antonio caben en trece millas: clic en 17–21 para acercar. Las distancias siguen siendo por etapa, no por tramo.'
            : 'Coordinates geocoded against OpenStreetMap. Nineteen of twenty-one resolved to the address or the site; two are still outstanding, Chireno and the Margil mission at Alto. The five San Antonio stops fit inside thirteen miles: click 17–21 to zoom in. Distances are still by stage, not by leg.'}
        </p>
          </div>

          {/* The years. */}
          <aside className="rounded border border-mesquite/20 bg-cal/40 p-5">
            <div className="grid grid-cols-4 gap-1">
              {PHASE_JUMPS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  aria-pressed={year === y}
                  className={`rounded-sm border px-1 py-2 font-caps text-[9px] leading-tight tracking-[0.1em] transition ${
                    year === y
                      ? 'border-mesquite bg-mesquite text-cal'
                      : 'border-mesquite/25 text-mesquite hover:border-ocre hover:text-ocre'
                  }`}
                >
                  {phaseName(y, es).toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="font-heading text-2xl text-mesquite">
                {es ? 'Año' : 'Year'} {year}
              </span>
              <span className="font-serif text-sm italic text-piedra">
                {phaseName(year, es)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={HORIZON_YEARS}
              step={1}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label={es ? 'Año del plan' : 'Year of the plan'}
              className="mt-2 w-full accent-ocre"
            />

            <dl className="mt-5 border-t border-mesquite/15">
              {[
                [es ? 'Paradas con anfitrión' : 'Stops with a host', `${now.hosted} / ${STOPS.length}`],
                [es ? 'Huecos cerrados' : 'Walker gaps closed', `${now.gapsClosed} / ${GAPS.length}`],
                [es ? 'Aldeas empezadas' : 'Villages begun', String(now.living)],
                [es ? 'Hogares' : 'Households', num(now.households)],
                [es ? 'Personas' : 'People', num(now.people)],
                [es ? 'Peregrinos al año' : 'Pilgrims a year', num(now.pilgrims)],
                [es ? 'A la economía local' : 'Into local economies', money(now.spend)],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between border-b border-mesquite/15 py-2"
                >
                  <dt className="font-serif text-xs text-piedra">{k}</dt>
                  <dd className="font-heading text-lg text-mesquite tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>

            <ol className="mt-5 space-y-1">
              {MILESTONES.map((m) => {
                const reached = year >= m.year;
                const current = reached && MILESTONES.filter((x) => x.year <= year).at(-1) === m;
                return (
                  <li
                    key={m.year}
                    className={`flex gap-2 font-serif text-xs leading-snug ${
                      current
                        ? 'font-semibold text-mesquite'
                        : reached
                          ? 'text-mesquite/80'
                          : 'text-piedra/50'
                    }`}
                  >
                    <span className="w-9 flex-shrink-0 tabular-nums">
                      {es ? 'Año' : 'Yr'} {m.year}
                    </span>
                    <span>{t(m.text)}</span>
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Who carries which stretch                                         */}
      {/*                                                                   */}
      {/* The strongest section on the page, because it is the only one     */}
      {/* that is not a proposal. Four chapters formed along this road      */}
      {/* without anyone planning them there. The ask column is the point:  */}
      {/* every row is something a real chapter could be asked for this     */}
      {/* year, before any land is discussed.                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'QUIÉN LLEVA QUÉ TRAMO' : 'WHO CARRIES WHICH STRETCH'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es ? 'El movimiento ya está en el camino.' : 'The movement is already on the road.'}
        </h2>
        <p className="prose-body mt-4 max-w-2xl text-base leading-relaxed text-mesquite/85">
          {es
            ? 'Cuatro capítulos del Movimiento Católico de la Tierra se formaron a lo largo del Camino Real sin que nadie los pusiera ahí. Cada aldea sale de un capítulo madre, que es el requisito F1, así que este es el capítulo más cercano a cada tramo y lo primero que habría que pedirle.'
            : 'Four Catholic Land Movement chapters formed along El Camino Real without anyone putting them there. Every village is sent out from a mother chapter, which is charter rule F1, so this is the nearest chapter to each stretch and the first thing to ask of it.'}
        </p>

        <div className="mt-8 overflow-x-auto rounded border border-mesquite/20">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-mesquite/20 bg-mesquite/[0.04]">
                {[
                  es ? 'Tramo' : 'Stretch',
                  es ? 'Paradas' : 'Stops',
                  es ? 'Lo lleva' : 'Carried by',
                  es ? 'Distancia' : 'Distance',
                  es ? 'Diócesis' : 'Diocese',
                  es ? 'Primera petición' : 'First ask',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 font-caps text-[9px] tracking-[0.15em] text-ocre"
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROSTER.map((r) => {
                const chapter = CHAPTERS.find((c) => c.id === r.chapter);
                const [lo, hi] = r.stops.split('–').map(Number);
                let distance = '—';
                if (chapter) {
                  const ds: number[] = [];
                  for (let n = lo; n <= hi; n += 1) {
                    const stop = STOPS.find((x) => x.n === n);
                    if (stop) ds.push(milesBetween(stop.at, chapter.at));
                  }
                  if (ds.length) {
                    distance = `${Math.round(Math.min(...ds))}–${Math.round(Math.max(...ds))} mi`;
                  }
                }
                // Red when the chapter is being asked to reach past its own
                // ring. Four stops do, and that is the finding below.
                const stretched = chapter
                  ? STOPS.filter((x) => x.n >= lo && x.n <= hi).some(
                      (x) => milesBetween(x.at, chapter.at) > CHAPTER_REACH_MILES,
                    )
                  : false;
                return (
                  <tr key={r.stops} className="border-b border-mesquite/12 last:border-0">
                    <td className="px-3 py-3 font-heading text-sm text-mesquite">
                      {t(r.stretch)}
                    </td>
                    <td className="px-3 py-3 font-serif text-sm tabular-nums text-piedra">
                      {r.stops}
                    </td>
                    <td className="px-3 py-3 font-serif text-sm text-mesquite">
                      {chapter ? (
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-verde"
                          />
                          {t(chapter.name)}
                        </span>
                      ) : (
                        <span className="text-rojo">{es ? 'Abierto' : 'Open'}</span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-3 font-serif text-sm tabular-nums ${
                        stretched ? 'text-rojo' : 'text-piedra'
                      }`}
                      title={
                        stretched
                          ? es
                            ? `Más de ${CHAPTER_REACH_MILES} millas`
                            : `Beyond ${CHAPTER_REACH_MILES} miles`
                          : undefined
                      }
                    >
                      {distance}
                    </td>
                    <td className="px-3 py-3 font-serif text-sm italic text-piedra">
                      {r.diocese}
                    </td>
                    <td className="px-3 py-3 font-serif text-sm leading-snug text-mesquite/85">
                      {t(r.ask)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 font-serif text-xs italic text-piedra">
          {es
            ? 'Los nombres de los capítulos son provisionales y las posiciones aproximadas, leídas de una captura de My Maps. Hay que cambiarlos por los nombres reales antes de enseñar esto fuera del capítulo. La diócesis que se muestra es la de las paradas; los capítulos de Woodville y Montgomery están en Beaumont y en Galveston-Houston, así que el camino cruza cuatro diócesis pero hablar con los capítulos son seis cancillerías.'
            : 'Chapter names are placeholders and positions approximate, read off a My Maps screenshot. Replace them with the real names before this is shown outside the chapter. The diocese shown is the diocese of the stops: the Woodville and Montgomery chapters sit in Beaumont and Galveston-Houston, so the road crosses four dioceses but talking to the chapters is six chanceries.'}
        </p>

        {/* This came out of drawing it rather than planning it, which is
            why it is worth keeping: the weakest stretch of road is weak
            twice over. */}
        <div className="mt-8 border-l-2 border-rojo bg-rojo/[0.04] px-5 py-4">
          <p className="font-caps text-[9px] tracking-[0.2em] text-rojo">
            {es ? 'LO QUE MOSTRÓ EL MAPA' : 'WHAT DRAWING IT SHOWED'}
          </p>
          <p className="prose-body mt-2 text-base leading-relaxed text-mesquite/90">
            {es
              ? 'Cuatro de las dieciocho paradas asignadas quedan fuera del alcance de sesenta millas de su propio capítulo: Alto y Mission Tejas a 72 millas de Woodville, Nacogdoches justo en el límite, y Crockett a 67 de Montgomery. Es el mismo tramo que tiene el hueco de 85 millas sin parroquia. La parte más débil del camino lo es dos veces, y eso convierte un capítulo nuevo cerca de Nacogdoches o Crockett en la petición más útil de toda esta página.'
              : 'Four of the eighteen assigned stops fall outside their own chapter’s sixty-mile reach: Alto and Mission Tejas at 72 miles from Woodville, Nacogdoches right on the line, and Crockett at 67 from Montgomery. That is the same stretch that holds the 85-mile gap with no parish. The weakest part of the road is weak twice over, which makes a new chapter near Nacogdoches or Crockett the most useful ask on this page.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              h: { en: 'Who would actually do this', es: 'Quién haría esto de verdad' },
              b: {
                en: 'The weak point in any regional vision is that it belongs to one person. This one belongs to chapters that already have members, leaders and charters. The plan asks them to face a road, not to start from nothing.',
                es: 'El punto débil de cualquier visión regional es que pertenece a una sola persona. Esta pertenece a capítulos que ya tienen miembros, líderes y estatutos. El plan les pide mirar hacia un camino, no empezar de cero.',
              },
            },
            {
              h: { en: 'A network, not one chapter’s project', es: 'Una red, no el proyecto de un capítulo' },
              b: {
                en: 'Each chapter already has its own bishop and its own parishes. No single chancery carries the whole road, and none of them can stop it either.',
                es: 'Cada capítulo ya tiene su obispo y sus parroquias. Ninguna cancillería lleva el camino entero, y ninguna puede detenerlo.',
              },
            },
            {
              h: { en: 'A cast for the first walk', es: 'Un reparto para la primera caminata' },
              b: {
                en: 'Each chapter finds a parish host for its own stages and walks them with the pilgrims. That is a concrete ask that can go out this year, before any land is discussed.',
                es: 'Cada capítulo busca una parroquia anfitriona para sus etapas y las camina con los peregrinos. Es una petición concreta que puede salir este año, antes de hablar de tierra.',
              },
            },
            {
              h: { en: 'Start where a mother chapter exists', es: 'Empezar donde ya hay capítulo madre' },
              b: {
                en: 'The Crockett to Bryan gap makes the strongest case, but Rockdale is about eighteen miles from the Lee County chapter and is the strongest place to start. The plan uses both: the gap is the argument, Rockdale is the first step.',
                es: 'El hueco de Crockett a Bryan es el mejor argumento, pero Rockdale está a unas dieciocho millas del capítulo del condado de Lee y es el mejor lugar para empezar. El plan usa los dos: el hueco es el argumento, Rockdale es el primer paso.',
              },
            },
          ].map((x) => (
            <div key={x.h.en} className="border-l-2 border-verde pl-4">
              <h3 className="font-heading text-lg leading-snug text-mesquite">{t(x.h)}</h3>
              <p className="prose-body mt-2 text-base leading-relaxed text-mesquite/80">
                {t(x.b)}
              </p>
            </div>
          ))}
        </div>
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
                        <p className="mt-0.5 font-serif text-xs italic text-piedra/70">
                          {s.county} · {s.diocese}
                          {s.kind === 'site' || s.kind === 'town' ? (
                            <span className="text-rojo">
                              {' '}
                              · {es ? 'sin parroquia' : 'no parish'}
                            </span>
                          ) : null}
                          {s.fix === 'town' ? (
                            <span>{' '}· {es ? 'falta punto GPS' : 'GPS point outstanding'}</span>
                          ) : null}
                        </p>
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
      {/* Why this road                                                     */}
      {/*                                                                   */}
      {/* Six facts, each with a source, and they are load-bearing rather   */}
      {/* than decorative: three of the San Antonio missions were founded   */}
      {/* in East Texas and walked here, which is why the corridor is the   */}
      {/* route it is. H6 is the closer on purpose.                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'POR QUÉ ESTE CAMINO' : 'WHY THIS ROAD'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es
            ? 'El camino ya es católico. Lo que falta son los que se quedan.'
            : 'The road is already Catholic. What it lacks is people who stay.'}
        </h2>
        <ol className="mt-8 space-y-7">
          {HERITAGE.map((h) => (
            <li key={h.id} className="border-l-2 border-ocre/40 pl-4">
              <h3 className="font-heading text-lg leading-snug text-mesquite">{t(h.title)}</h3>
              <p className="prose-body mt-2 text-base leading-relaxed text-mesquite/85">
                {t(h.body)}
              </p>
              <a
                className="mt-2 inline-block font-caps text-[9px] tracking-[0.15em] text-ocre underline decoration-ocre/40 underline-offset-4 hover:text-rojo"
                href={h.source.href}
                rel="noreferrer noopener"
                target="_blank"
              >
                {h.source.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ol>
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
        <Eyebrow>{es ? 'A CUÁNTO LLEGA' : 'WHAT IT ADDS UP TO'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es
            ? 'Una granja ayuda a una familia. Once aldeas son una cultura.'
            : 'One homestead helps one family. Eleven villages are a culture.'}
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
        <Eyebrow>{es ? 'CÓMO SE TIENE LA TIERRA' : 'HOW THE LAND IS HELD'}</Eyebrow>
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
            ? 'Cada uno leído por lo que demuestra y por cómo falla. Un precedente usado sólo por su mitad buena es un anuncio.'
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
                {es ? 'DE QUÉ ADVIERTE' : 'WHAT IT WARNS'}
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
      {/* What a village becomes                                            */}
      {/*                                                                   */}
      {/* The national office's three phases for the life of a chapter,     */}
      {/* which are NOT the corridor's phases below. A village on this road */}
      {/* is a chapter in miniature, and the two plans run on the same      */}
      {/* clock. Phase III is what the national office calls a              */}
      {/* demonstration farm and it has committed to five by 2030, so this  */}
      {/* is the section that turns the page into a funding case.           */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-narrow py-12">
        <Eyebrow>{es ? 'EN QUÉ SE CONVIERTE UNA ALDEA' : 'WHAT A VILLAGE BECOMES'}</Eyebrow>
        <h2 className="mt-3 font-heading text-3xl text-mesquite">
          {es ? 'Una aldea es un capítulo en pequeño.' : 'A village is a chapter in miniature.'}
        </h2>
        <p className="prose-body mt-4 max-w-2xl text-base leading-relaxed text-mesquite/85">
          {es
            ? 'Así planea el movimiento la vida de un capítulo. Este capítulo está en la primera fase, y decirlo sirve más que insinuar otra cosa. El trabajo del corredor es llevar once aldeas de la I a la III.'
            : 'This is how the movement plans the life of a chapter. This chapter is in the first phase, and saying so is more useful than implying otherwise. The corridor’s work is carrying eleven villages from I to III.'}
        </p>

        <ol className="mt-8 space-y-8">
          {VILLAGE_PHASES.map((v) => (
            <li
              key={v.roman}
              className={`border-l-2 pl-5 ${v.here ? 'border-ocre' : 'border-mesquite/15'}`}
            >
              <p className="font-caps text-[10px] tracking-[0.2em] text-ocre">
                {v.roman} · {t(v.years)}
                {v.here && (
                  <span className="ml-2 text-rojo">
                    {es ? 'AQUÍ ESTAMOS' : 'WE ARE HERE'}
                  </span>
                )}
              </p>
              <h3 className="mt-2 font-heading text-2xl text-mesquite">{t(v.name)}</h3>
              <p className="prose-body mt-2 text-base leading-relaxed text-mesquite/80">
                {t(v.body)}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-10 border-t border-mesquite/15 pt-6 font-serif italic leading-relaxed text-piedra">
          {t(NATIONAL_AIM)}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Phasing + what to measure                                         */}
      {/*                                                                   */}
      {/* These are the CORRIDOR's phases, not a village's. Same clock,     */}
      {/* different subject: above is what one village becomes, this is     */}
      {/* what the project does.                                            */}
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
                ? 'Lo que falta: los números de peregrinos del Centro Padre Margil, el padrón de hogares de las dieciséis parroquias, y un precio por acre por condado. Tres llamadas.'
                : 'Still missing: the pilgrim numbers from the Padre Margil centre, the registered-household count for each of the sixteen parishes, and a price per acre by county. Three phone calls.'}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
