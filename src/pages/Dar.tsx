// src/pages/Dar.tsx
// Giving — "Support the chapter".
//
// ⚠️ DRAFT. Nothing here can take money: no processor is provisioned, and every
// give control says so when pressed rather than failing silently. Before this
// route shows anyone:
//
//   1. Provision Stripe via the Vercel Marketplace (`vercel integration add
//      stripe`). Donations with no catalog are the `payments` category. Don't
//      hand-roll a checkout or npm-install the SDK.
//   2. Settle the tax language with an accountant. A non-profit LLC is NOT
//      automatically a 501(c)(3), and gifts to an entity that isn't one are
//      generally not deductible. There is deliberately no deductibility claim
//      on this page. Add one on an accountant's word, never a developer's.
//   3. Replace every invented figure — see PLACEHOLDER markers below.
//
// ---------------------------------------------------------------------------
// What the layout is doing, and why (patterns from how good donation pages are
// actually built, adapted to a chapter that is not a disaster charity):
//
//   · A real photograph, not a stock one. The chapter has a year of gathering
//     photos in Supabase; the hero pulls the most recent rather than shipping
//     an illustration of a thing that didn't happen.
//   · Amounts translated into the chapter's own units. Donors think in meals,
//     or seats, or tools — not dollars. Every amount carries what it buys.
//   · One-time / monthly on the SAME control. Sending recurring donors to a
//     separate page is the most common way to lose them.
//   · The transparency promise stated three times — hero, beside the button,
//     and in full at the end. Repetition is the mechanism, not clutter.
//   · Live chapter numbers as social proof, read from the database, so the page
//     cannot drift from the truth.
//   · Exactly one optional question. Not five.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ContactModal } from '@/components/ContactModal';
import { WheatMeter, FurrowMeter } from '@/components/giving/WheatMeter';
import { WoodcutFill } from '@/components/giving/WoodcutFill';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { chapterToday, formatDate } from '@/lib/dates';
import { nextFeast } from '@/lib/liturgical';
import { supabase } from '@/lib/supabase';
import type { Bilingual } from '@/lib/types';

const PHOTO_BUCKET = 'month-photos';

// ---------------------------------------------------------------------------
// PLACEHOLDER DATA — none of these numbers are real. Cost the tools, set the
// goals, and wire `raised` to wherever giving is actually tracked before this
// page faces a donor.
// ---------------------------------------------------------------------------
const TOOL_COMMONS: {
  name: Bilingual;
  note: Bilingual;
  goal: number;
  raised: number;
}[] = [
  {
    name: { en: 'Walk-behind tractor', es: 'Tractor de dos ruedas' },
    note: {
      en: 'Breaks ground on a quarter acre without a tractor payment.',
      es: 'Abre un cuarto de acre sin pagar un tractor entero.',
    },
    goal: 4200,
    raised: 1580,
  },
  {
    name: { en: 'Butchering kit', es: 'Equipo de matanza' },
    note: {
      en: 'Gambrel, saw, knives and a cooler — the day Doug teaches it.',
      es: 'Gancho, sierra, cuchillos y una hielera — el día que Doug lo enseña.',
    },
    goal: 650,
    raised: 540,
  },
  {
    name: { en: 'Grain mill', es: 'Molino de grano' },
    note: {
      en: 'Whole wheat to flour, for the households that bake.',
      es: 'De trigo entero a harina, para los hogares que hornean.',
    },
    goal: 900,
    raised: 210,
  },
  {
    name: { en: 'Canning setup', es: 'Equipo de conservas' },
    note: {
      en: 'Pressure canners and jars that circulate through the harvest.',
      es: 'Ollas a presión y frascos que circulan en la cosecha.',
    },
    goal: 500,
    raised: 500,
  },
];

// The land fund, drawn as one acre filling a hundred square feet at a time.
//
// An acre is 43,560 sq ft, so at 100 sq ft a tile that is 436 squares — which
// makes no tidy rectangle, hence the centred short row in WoodcutFill. The
// count is the unit the page shows: "212 of 436 squares" is ground, "49%" is
// a statistic, and this fund has no deadline for a percentage to run against.
//
// PLACEHOLDER: price a square with the chapter before this faces a donor. The
// goal follows from it, so there is one number to set, not two.
const ACRE_SQUARES = Math.round(43560 / 100);
const LAND_PRICE_PER_SQUARE = 25;
const LAND_RAISED = 5300;

// Amounts carry what they buy, in the chapter's units. PLACEHOLDER impact lines.
const AMOUNTS: { value: number; buys: Bilingual }[] = [
  { value: 10, buys: { en: 'Seed for a bed', es: 'Semilla para una cama' } },
  { value: 25, buys: { en: 'Sponsors a workshop seat', es: 'Patrocina un lugar en un taller' } },
  { value: 50, buys: { en: 'Materials for a demonstration', es: 'Materiales para una demostración' } },
  { value: 100, buys: { en: 'A whole month’s gathering', es: 'La reunión de todo un mes' } },
];

const copy = {
  eyebrow: { en: 'SUPPORT THE CHAPTER', es: 'APOYA AL CAPÍTULO' },
  heading: { en: 'Give toward something that lasts', es: 'Da hacia algo que permanece' },
  lede: {
    en: 'The movement’s whole argument is that ordinary families should own the things they work with. So most of what we ask for isn’t overhead — it’s tools, equipment and land the chapter holds in common and puts into members’ hands.',
    es: 'Todo el argumento del movimiento es que las familias comunes deben poseer aquello con lo que trabajan. Por eso casi todo lo que pedimos no son gastos administrativos — son herramientas, equipo y tierra que el capítulo guarda en común y pone en manos de sus miembros.',
  },
  onceLabel: { en: 'Once', es: 'Una vez' },
  monthlyLabel: { en: 'Every month', es: 'Cada mes' },
  chooseAmount: { en: 'CHOOSE AN AMOUNT', es: 'ELIGE UNA CANTIDAD' },
  other: { en: 'Other', es: 'Otra' },
  giveOnce: { en: 'Give', es: 'Dar' },
  giveMonthly: { en: 'Give every month', es: 'Dar cada mes' },
  nameMe: {
    en: 'You may name me in the year’s record.',
    es: 'Pueden nombrarme en el registro del año.',
  },

  statsEyebrow: { en: 'WHAT YOUR GIVING JOINS', es: 'A LO QUE SE SUMA TU DONATIVO' },
  statNeighbors: { en: 'neighbors', es: 'vecinos' },
  statParishes: { en: 'parishes', es: 'parroquias' },
  statGatherings: { en: 'gatherings this year', es: 'reuniones este año' },

  commonsEyebrow: { en: 'THE TOOL COMMONS', es: 'LAS HERRAMIENTAS COMUNES' },
  commonsHeading: { en: 'Buy a thing the chapter keeps', es: 'Compra algo que el capítulo guarda' },
  commonsLede: {
    en: 'Equipment no single household would buy alone, bought once and lent out all year. A gift here doesn’t get spent — it becomes a thing with a name, kept by the chapter and used by whoever needs it next.',
    es: 'Equipo que ninguna familia compraría sola, comprado una vez y prestado todo el año. Un don aquí no se gasta — se convierte en algo con nombre, guardado por el capítulo y usado por quien lo necesite.',
  },
  funded: { en: 'Fully given', es: 'Completo' },
  toGo: { en: 'to go', es: 'faltan' },

  gatheringEyebrow: { en: 'UNDERWRITE A GATHERING', es: 'PATROCINA UNA REUNIÓN' },
  gatheringBody: {
    en: 'Cover the food and materials for one month’s gathering. We’ll name the month you carried in the year’s record — or leave you out of it entirely, if you’d rather it stay between you and God.',
    es: 'Cubre la comida y los materiales de la reunión de un mes. Nombraremos el mes que sostuviste en el registro del año — o te dejaremos fuera por completo, si prefieres que quede entre tú y Dios.',
  },
  gatheringLink: { en: 'See what a month looks like', es: 'Mira cómo es un mes' },

  feastEyebrow: { en: 'GIVE ON A FEAST', es: 'DA EN UNA FIESTA' },
  feastBody: {
    en: 'The chapter keeps the farmers’ feasts. Some households would rather give on one of them than on the first of the month — an offering with a day attached to it.',
    es: 'El capítulo guarda las fiestas de los labradores. Hay hogares que prefieren dar en una de ellas y no el primero del mes — una ofrenda con un día propio.',
  },
  feastNext: { en: 'Next', es: 'Próxima' },

  kindEyebrow: { en: 'GIVE WHAT YOU HAVE', es: 'DA LO QUE TIENES' },
  kindBody: {
    en: 'Not everything worth giving is money. A trailer for a weekend, a freezer, seed stock, a ram at breeding time, an acre someone can practise on, a Saturday of your hands. Tell us what you’ve got and we’ll find who needs it.',
    es: 'No todo lo que vale la pena dar es dinero. Un remolque por un fin de semana, un congelador, semilla, un carnero en temporada, un acre donde alguien pueda practicar, un sábado de tus manos. Dinos qué tienes y encontraremos quién lo necesita.',
  },
  kindCta: { en: 'Offer something', es: 'Ofrece algo' },

  landEyebrow: { en: 'THE LAND FUND', es: 'EL FONDO DE LA TIERRA' },
  landSquares: { en: 'squares', es: 'cuadros' },
  landSquareNote: {
    en: 'One square is a hundred square feet of ground. No deadline — it fills as it fills.',
    es: 'Un cuadro son cien pies cuadrados de tierra. Sin fecha límite — se llena como se llene.',
  },
  landBody: {
    en: 'Resettlement is the first pillar and the slowest one. The land fund is a long patience: money set aside toward helping a family onto working ground. It is not a campaign with a deadline, and we would rather say so than invent urgency.',
    es: 'El reasentamiento es el primer pilar y el más lento. El fondo de la tierra es una paciencia larga: dinero apartado para ayudar a una familia a establecerse en tierra de labor. No es una campaña con fecha límite, y preferimos decirlo a inventar urgencia.',
  },

  // What the form funds when nobody has chosen a section. Without this the
  // amounts sat above no stated purpose at all.
  generalFund: {
    en: 'General fund: food, materials, and supplies for gatherings',
    es: 'Fondo general: comida, materiales y provisiones para las reuniones',
  },
  givingToward: { en: 'Giving toward', es: 'Para' },
  changeDesignation: { en: 'change', es: 'cambiar' },
  landFundName: { en: 'The land fund', es: 'El fondo de la tierra' },

  whereEyebrow: { en: 'WHERE IT GOES', es: 'A DÓNDE VA' },
  whereBody: {
    en: 'The chapter is run by its members; no one draws a salary. Gifts are reported to the chapter at the start of each year, and anything given toward a named tool is spent on that tool or returned.',
    es: 'El capítulo lo llevan sus miembros; nadie cobra sueldo. Los donativos se informan al capítulo al comenzar cada año, y lo que se da para una herramienta nombrada se gasta en ella o se devuelve.',
  },
} satisfies Record<string, Bilingual>;

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Stable key for a designation, from the English name. */
const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * What a gift is FOR. Set by the "Give toward this" controls further down the
 * page, which scroll back up to the one form rather than opening a second one.
 *
 * `key` is the value that belongs on the gift record once there is a gift
 * record to put it on — see the note in GiveBox. It is deliberately a stable
 * machine string ("tool:grain-mill"), not the display label, so the tool
 * totals can be summed from real gifts without matching on prose that gets
 * reworded or translated.
 */
type Designation = { key: string; label: Bilingual };

const Dar = () => {
  const { t, locale } = useLocale();
  const [offerOpen, setOfferOpen] = useState(false);
  const [designation, setDesignation] = useState<Designation | null>(null);
  const giveRef = useRef<HTMLDivElement>(null);

  // One form on this page, not one per section. Choosing a section sets what
  // the gift is for and sends the reader back to it. rAF so the scroll starts
  // after React has painted the designation line, or it lands a row short.
  const designate = (d: Designation) => {
    setDesignation(d);
    requestAnimationFrame(() => {
      giveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      giveRef.current?.focus({ preventScroll: true });
    });
  };
  const feast = useMemo(() => nextFeast(chapterToday()), []);

  // --- live chapter numbers: social proof that can't drift from the truth ---
  const [neighbors, setNeighbors] = useState<number | null>(null);
  const [parishes, setParishes] = useState<number | null>(null);
  const [gatherings, setGatherings] = useState<number | null>(null);
  const [heroPhoto, setHeroPhoto] = useState<string | null>(null);
  const [heroCaption, setHeroCaption] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const year = chapterToday().getFullYear();
      const [members, parishRows, months, photos] = await Promise.all([
        supabase.rpc('approved_member_count'),
        supabase.from('parish_member_counts').select('member_count'),
        supabase.from('month_metrics').select('gatherings').eq('year', year),
        // Captioned photos only. "Most recent" picked the September upload,
        // which is an event FLYER — a wall of text that fought the headline.
        // A caption means a steward looked at the image and described it, which
        // is the closest signal we have to "this is a photograph". No caption
        // anywhere, no hero image; the page reads fine without one.
        supabase
          .from('month_photos')
          .select('storage_path, caption')
          .not('caption', 'is', null)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(1),
      ]);

      if (!members.error) setNeighbors((members.data as number) ?? 0);
      if (!parishRows.error) {
        const rows = (parishRows.data ?? []) as Array<{ member_count: number | null }>;
        setParishes(rows.filter((r) => (r.member_count ?? 0) > 0).length);
      }
      if (!months.error) {
        const rows = (months.data ?? []) as Array<{ gatherings: number }>;
        setGatherings(rows.reduce((sum, r) => sum + (r.gatherings ?? 0), 0));
      }
      if (!photos.error && photos.data?.length) {
        const row = photos.data[0] as { storage_path: string; caption: string | null };
        setHeroPhoto(supabase.storage.from(PHOTO_BUCKET).getPublicUrl(row.storage_path).data.publicUrl);
        setHeroCaption(row.caption);
      }
    })();
  }, []);

  // Squares paid for, not a percentage of a goal — the unit the section shows.
  const landSquares = Math.min(
    ACRE_SQUARES,
    Math.floor(LAND_RAISED / LAND_PRICE_PER_SQUARE),
  );

  const commonsTotal = TOOL_COMMONS.reduce((s, i) => s + i.goal, 0);
  const commonsRaised = TOOL_COMMONS.reduce((s, i) => s + i.raised, 0);
  const commonsPct = (commonsRaised / commonsTotal) * 100;

  return (
    <Layout>
      {/* ---------------------------------------------------------------- */}
      {/* Hero — a real photograph of a real gathering                      */}
      {/* ---------------------------------------------------------------- */}
      {/* ---------------------------------------------------------------- */}
      {/* Hero — words on cream, photograph beside them.                    */}
      {/*                                                                   */}
      {/* The photo started out BEHIND the headline with a wash over it,    */}
      {/* which is the usual pattern and was wrong here: the library holds  */}
      {/* event flyers as well as photographs, and a wall of poster type    */}
      {/* showing through a headline is unreadable. Beside, never behind —  */}
      {/* then no image can break the words, whatever a steward uploads.    */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide pt-16 md:pt-20">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="text-center md:text-left">
            <p className="display-caps text-[11px] tracking-[0.3em] text-ocre">{t(copy.eyebrow)}</p>
            <h1 className="mt-4 font-heading text-[34px] leading-[1.12] text-mesquite md:text-[46px]">
              {t(copy.heading)}
            </h1>
            <p className="prose-body mt-6 text-lg leading-relaxed text-mesquite/85">
              {t(copy.lede)}
            </p>
          </div>

          {/* The caption is the ALT text and nothing else. Stewards write these
              for themselves ("Chicken posing for audience"), and printing that
              under a donation headline reads as a joke at the chapter's
              expense. */}
          {heroPhoto && (
            <figure className="min-w-0">
              <div className="overflow-hidden rounded-sm border border-mesquite/15 bg-mesquite/[0.04]">
                <img
                  src={heroPhoto}
                  alt={heroCaption ?? ''}
                  className="h-64 w-full object-cover md:h-[22rem]"
                  loading="eager"
                />
              </div>
            </figure>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The ask — amounts, cadence, one question                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose pb-16">
        {/* tabIndex -1 so the scroll can hand focus over: a sighted reader
            sees the jump, a screen-reader user otherwise wouldn't know the
            page had moved. */}
        <div ref={giveRef} tabIndex={-1} className="outline-none">
          <GiveBox designation={designation} onClear={() => setDesignation(null)} />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Live chapter figures                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide pb-16">
        <p className="mb-4 text-center font-caps text-[9px] tracking-[0.25em] text-piedra/70">
          {t(copy.statsEyebrow)}
        </p>
        <dl className="mx-auto grid max-w-2xl grid-cols-3 border-y border-mesquite/15">
          <Stat n={neighbors} label={t(copy.statNeighbors)} />
          <Stat n={parishes} label={t(copy.statParishes)} divided />
          <Stat n={gatherings} label={t(copy.statGatherings)} divided />
        </dl>
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* The tool commons                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-10 md:grid-cols-[150px_1fr]">
          {/* The chapter-wide meter, as a filling stalk of wheat. */}
          <div className="flex justify-center">
            <WheatMeter
              percent={commonsPct}
              size={120}
              label={`${t(copy.commonsEyebrow)}: ${Math.round(commonsPct)}%`}
            />
          </div>
          <header>
            <p className="display-caps text-xs tracking-[0.25em] text-ocre">
              {t(copy.commonsEyebrow)}
            </p>
            <h2 className="mt-3 font-heading text-3xl text-mesquite">{t(copy.commonsHeading)}</h2>
            <p className="prose-body mt-4 text-base italic leading-relaxed text-piedra">
              {t(copy.commonsLede)}
            </p>
            <p className="mt-4 font-serif text-sm text-mesquite tabular-nums">
              <span className="font-heading text-2xl text-mesquite">{usd(commonsRaised)}</span>
              <span className="text-piedra"> / {usd(commonsTotal)}</span>
            </p>
          </header>
        </div>

        <ul className="mx-auto mt-12 max-w-2xl divide-y divide-mesquite/10 border-y border-mesquite/15">
          {TOOL_COMMONS.map((item) => {
            const pct = (item.raised / item.goal) * 100;
            const done = item.raised >= item.goal;
            const remaining = Math.max(0, item.goal - item.raised);
            return (
              <li key={item.name.en} className="py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-heading text-xl text-mesquite">{t(item.name)}</h3>
                  <p className="font-serif text-sm tabular-nums text-piedra">
                    {done ? (
                      <span className="font-caps text-[10px] tracking-[0.18em] text-ocre">
                        {t(copy.funded).toUpperCase()}
                      </span>
                    ) : (
                      <>
                        {usd(item.raised)} <span className="text-piedra/60">/ {usd(item.goal)}</span>
                      </>
                    )}
                  </p>
                </div>
                <p className="prose-body mt-1 text-sm leading-relaxed text-mesquite/80">
                  {t(item.note)}
                </p>
                <div className="mt-3">
                  <FurrowMeter percent={pct} label={`${t(item.name)} — ${Math.round(pct)}%`} />
                </div>
                {!done && (
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="font-serif text-xs italic text-piedra/80">
                      {usd(remaining)} {t(copy.toGo)}
                    </span>
                    <DesignateButton
                      label={locale === 'es' ? 'Dar hacia esto' : 'Give toward this'}
                      onClick={() =>
                        designate({
                          key: `tool:${slug(item.name.en)}`,
                          label: item.name,
                        })
                      }
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* Three smaller ways                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-3">
          <article className="flex flex-col">
            <p className="display-caps text-[10px] tracking-[0.2em] text-ocre">
              {t(copy.gatheringEyebrow)}
            </p>
            <p className="prose-body mt-3 flex-1 text-sm leading-relaxed text-mesquite/85">
              {t(copy.gatheringBody)}
            </p>
            <Link
              to={buildPath('testimonio', locale)}
              className="mt-4 font-heading text-sm text-ocre no-underline hover:text-mesquite"
              style={{ textDecoration: 'none' }}
            >
              {t(copy.gatheringLink)} →
            </Link>
          </article>

          <article className="flex flex-col">
            <p className="display-caps text-[10px] tracking-[0.2em] text-ocre">
              {t(copy.feastEyebrow)}
            </p>
            <p className="prose-body mt-3 flex-1 text-sm leading-relaxed text-mesquite/85">
              {t(copy.feastBody)}
            </p>
            {feast && (
              <p className="mt-4 font-serif text-sm italic text-piedra">
                {t(copy.feastNext)}: {feast.feast.name[locale]},{' '}
                {formatDate(feast.date, locale, { month: 'long', day: 'numeric' })}
              </p>
            )}
          </article>

          <article className="flex flex-col">
            <p className="display-caps text-[10px] tracking-[0.2em] text-ocre">
              {t(copy.kindEyebrow)}
            </p>
            <p className="prose-body mt-3 flex-1 text-sm leading-relaxed text-mesquite/85">
              {t(copy.kindBody)}
            </p>
            <button
              type="button"
              onClick={() => setOfferOpen(true)}
              className="mt-4 self-start font-heading text-sm text-ocre underline-offset-4 transition hover:text-mesquite hover:underline"
            >
              {t(copy.kindCta)} →
            </button>
          </article>
        </div>
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* Land fund + transparency                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose py-16">
        <p className="display-caps text-xs tracking-[0.25em] text-ocre">{t(copy.landEyebrow)}</p>
        <p className="prose-body mt-3 text-base leading-relaxed text-mesquite/85">
          {t(copy.landBody)}
        </p>

        <div className="mt-8">
          <WoodcutFill
            total={ACRE_SQUARES}
            filled={landSquares}
            cols={22}
            label={`${t(copy.landEyebrow)}: ${landSquares} / ${ACRE_SQUARES} ${t(copy.landSquares)}`}
          />
          <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-serif text-sm tabular-nums text-mesquite">
              <span className="font-heading text-2xl">{landSquares}</span>
              <span className="text-piedra">
                {' '}/ {ACRE_SQUARES} {t(copy.landSquares)}
              </span>
            </span>
            <span className="font-serif text-xs italic text-piedra/80">
              {t(copy.landSquareNote)}
            </span>
          </p>
        </div>

        <div className="mt-5 text-right">
          <DesignateButton
            label={locale === 'es' ? 'Dar al fondo' : 'Give to the fund'}
            onClick={() => designate({ key: 'land-fund', label: copy.landFundName })}
          />
        </div>

        <div className="rule my-12" />

        <p className="display-caps text-xs tracking-[0.25em] text-ocre">{t(copy.whereEyebrow)}</p>
        <p className="prose-body mt-3 text-base leading-relaxed text-mesquite/85">
          {t(copy.whereBody)}
        </p>
      </section>

      <ContactModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        defaultCategory="general"
        defaultMessage={
          locale === 'es'
            ? 'Me gustaría ofrecer lo siguiente al capítulo:\n\n'
            : 'I’d like to offer the chapter the following:\n\n'
        }
      />
    </Layout>
  );
};

// ---------------------------------------------------------------------------
// The ask itself. Cadence and amount live on one control; sending recurring
// donors to a second page is the most reliable way to lose them.
// ---------------------------------------------------------------------------
const GiveBox = ({
  designation,
  onClear,
}: {
  designation: Designation | null;
  onClear: () => void;
}) => {
  const { t, locale } = useLocale();
  const [monthly, setMonthly] = useState(true); // recurring pre-selected
  const [amount, setAmount] = useState<number | null>(25);
  const [custom, setCustom] = useState('');

  // Number('') is 0 and Number('abc') is NaN — neither is nullish, so `??`
  // would never have caught them and a bad entry would render "$NaN".
  const typed = Number(custom);
  const chosen = amount ?? (Number.isFinite(typed) && typed > 0 ? typed : 0);
  const buys = AMOUNTS.find((a) => a.value === amount)?.buys ?? null;

  return (
    <div className="mx-auto max-w-xl border border-mesquite/15 bg-cal/50 p-6 md:p-8">
      {/* Cadence */}
      <div
        className="mb-6 grid grid-cols-2 gap-1 rounded-sm bg-mesquite/[0.06] p-1"
        role="group"
        aria-label={locale === 'es' ? 'Frecuencia' : 'Frequency'}
      >
        {[
          { on: false, label: t(copy.onceLabel) },
          { on: true, label: t(copy.monthlyLabel) },
        ].map((opt) => (
          <button
            key={String(opt.on)}
            type="button"
            onClick={() => setMonthly(opt.on)}
            aria-pressed={monthly === opt.on}
            className={`rounded-sm py-2 font-heading text-sm transition ${
              monthly === opt.on
                ? 'bg-cal text-mesquite shadow-sm'
                : 'text-mesquite/60 hover:text-mesquite'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* What this gift is for, always — the general fund by default, or the
          section the reader came from, with the way back out. Amounts above
          no stated purpose is the thing this fixes. */}
      <div className="mb-5 border-l-2 border-ocre/40 pl-3">
        {designation ? (
          <>
            <p className="font-caps text-[9px] tracking-[0.22em] text-piedra/70">
              {t(copy.givingToward).toUpperCase()}
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-3 font-heading text-base text-mesquite">
              {t(designation.label)}
              <button
                type="button"
                onClick={onClear}
                className="font-serif text-xs italic text-ocre underline-offset-4 transition hover:text-mesquite hover:underline"
              >
                {t(copy.changeDesignation)}
              </button>
            </p>
          </>
        ) : (
          <p className="font-serif text-sm italic leading-snug text-piedra">
            {t(copy.generalFund)}
          </p>
        )}
      </div>

      <p className="mb-3 font-caps text-[9px] tracking-[0.22em] text-piedra/70">
        {t(copy.chooseAmount)}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AMOUNTS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => {
              setAmount(a.value);
              setCustom('');
            }}
            aria-pressed={amount === a.value}
            className={`rounded-sm border py-3 font-heading text-lg tabular-nums transition ${
              amount === a.value
                ? 'border-ocre bg-ocre/10 text-mesquite'
                : 'border-mesquite/15 bg-cal/60 text-mesquite/70 hover:border-mesquite/40 hover:text-mesquite'
            }`}
          >
            {usd(a.value)}
          </button>
        ))}
      </div>

      {/* Impact line — what this amount buys, in the chapter's units. */}
      <p className="mt-3 min-h-[1.25rem] text-center font-serif text-sm italic text-piedra">
        {buys ? t(buys) : ' '}
      </p>

      <label className="mt-4 flex items-center gap-2">
        <span className="font-serif text-sm text-piedra">{t(copy.other)}</span>
        <span className="flex flex-1 items-center border-b border-mesquite/25 px-1">
          <span className="font-heading text-mesquite">$</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setAmount(null);
            }}
            className="w-full bg-transparent px-1 py-1 font-heading text-mesquite outline-none"
          />
        </span>
      </label>

      {/* Exactly one optional question. */}
      <label className="mt-5 flex items-start gap-2.5">
        <input type="checkbox" className="mt-1 accent-[hsl(32_56%_51%)]" />
        <span className="prose-body text-sm leading-snug text-mesquite/80">{t(copy.nameMe)}</span>
      </label>

      {/* When a processor exists, `designation?.key ?? 'general'` is what
          belongs on the gift record, so tool totals and month claims can be
          summed from real gifts instead of the placeholder numbers at the top
          of this file. Nothing persists it yet — there is no gift to persist. */}
      <InertGive
        label={`${monthly ? t(copy.giveMonthly) : t(copy.giveOnce)}${
          chosen ? ` ${usd(chosen)}` : ''
        }`}
      />
    </div>
  );
};

/**
 * A give control that cannot take money, and admits it on press.
 *
 * A button that looks live and silently fails is worse than one that tells the
 * truth. Replace the onClick with a Stripe checkout session once the
 * integration is provisioned.
 */
const InertGive = ({ label }: { label: string }) => {
  const { locale } = useLocale();
  const [touched, setTouched] = useState(false);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setTouched(true)}
        className="w-full rounded-sm bg-ocre px-5 py-3 font-heading text-lg text-cal transition hover:bg-mesquite"
      >
        {label}
      </button>
      {touched && (
        <p className="mt-2 font-serif text-xs italic text-piedra">
          {locale === 'es'
            ? 'Aún no podemos recibir donativos en línea — falta conectar el procesador de pagos.'
            : 'We can’t take gifts online yet — the payment processor isn’t connected.'}
        </p>
      )}
    </div>
  );
};

/**
 * Sends the reader to the one form with the gift's purpose already set.
 *
 * Deliberately NOT an InertGive: these aren't the moment of payment, so
 * confessing "we can't take gifts online yet" here would answer a question
 * nobody had asked. The form says it, once, where the giving happens.
 */
const DesignateButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="font-heading text-sm text-ocre underline-offset-4 transition hover:text-mesquite hover:underline"
  >
    {label} →
  </button>
);

/** One live figure. A stat tile, not a chart — there's no shape to plot. */
const Stat = ({ n, label, divided = false }: { n: number | null; label: string; divided?: boolean }) => (
  <div className={`px-3 py-5 text-center ${divided ? 'border-l border-mesquite/12' : ''}`}>
    <dd className="font-heading text-[30px] leading-none text-mesquite tabular-nums md:text-[36px]">
      {n === null ? '—' : n}
    </dd>
    <dt className="mt-2 font-caps text-[9px] tracking-[0.18em] text-ocre">{label.toUpperCase()}</dt>
  </div>
);

export default Dar;
