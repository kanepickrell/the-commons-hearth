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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WheatMeter } from '@/components/giving/WheatMeter';
import { GlassWindow } from '@/components/giving/GlassWindow';

import laAzuela from '@/assets/icons/la-azuela.svg?raw';
import laGallina from '@/assets/icons/la-gallina.svg?raw';
import elPan from '@/assets/icons/el-pan.svg?raw';
import laConserva from '@/assets/icons/la-conserva.svg?raw';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { chapterToday, formatDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import type { Bilingual } from '@/lib/types';

const PHOTO_BUCKET = 'month-photos';

// ---------------------------------------------------------------------------
// PLACEHOLDER DATA — none of these numbers are real. Cost the tools, set the
// goals, and wire `raised` to wherever giving is actually tracked before this
// page faces a donor.
//
// PHOTOGRAPHS: all four have one, in public/tools/<key>.jpg. They are stock,
// and they are placeholders — swap each for a photograph of the chapter's
// actual tool as it is bought, the way the hero already pulls a real
// gathering photo rather than an illustration of one. Each was checked
// against the copy it sits under rather than taken on its caption: the first
// "walk-behind tractor" results were full-size riding tractors, which
// contradicts the one line that sells the fund, and the first "grain mill"
// results were identifiable people in rural India, which is not this chapter
// and not ours to borrow.
//
const TOOL_COMMONS: {
  key: string;
  name: Bilingual;
  note: Bilingual;
  goal: number;
  raised: number;
  /** Photograph behind the glass. */
  photo?: string;
  /** Fallback line art, if the photograph is missing. */
  art?: string;
}[] = [
  {
    key: 'walk-behind-tractor',
    photo: '/tools/walk-behind-tractor.jpg',
    art: laAzuela,
    name: { en: 'Walk-behind tractor', es: 'Tractor de dos ruedas' },
    note: {
      en: 'Lets a family break ground on a quarter acre without buying a tractor.',
      es: 'Permite a una familia abrir un cuarto de acre sin comprar un tractor.',
    },
    goal: 4200,
    raised: 1580,
  },
  {
    key: 'butchering-kit',
    photo: '/tools/butchering-kit.jpg',
    art: laGallina,
    name: { en: 'Butchering kit', es: 'Equipo de matanza' },
    note: {
      en: 'Gambrel, saw, knives, and a cooler for Doug’s butchering workshop in November.',
      es: 'Gancho, sierra, cuchillos y una hielera para el taller de matanza de Doug en noviembre.',
    },
    goal: 650,
    raised: 540,
  },
  {
    key: 'grain-mill',
    photo: '/tools/grain-mill.jpg',
    art: elPan,
    name: { en: 'Grain mill', es: 'Molino de grano' },
    note: {
      en: 'Grinds whole wheat into flour for families who bake.',
      es: 'Muele trigo entero en harina para las familias que hornean.',
    },
    goal: 900,
    raised: 210,
  },
  {
    key: 'canning-setup',
    photo: '/tools/canning-setup.jpg',
    art: laConserva,
    name: { en: 'Canning setup', es: 'Equipo de conservas' },
    note: {
      en: 'Pressure canners and jars, passed between families at harvest.',
      es: 'Ollas a presión y frascos, que pasan entre las familias en la cosecha.',
    },
    goal: 500,
    raised: 500,
  },
];

// Amounts carry what they buy, in the chapter's units. PLACEHOLDER impact lines.
const AMOUNTS: { value: number; buys: Bilingual }[] = [
  { value: 10, buys: { en: 'Seed for one garden bed', es: 'Semilla para una cama de cultivo' } },
  { value: 25, buys: { en: 'Covers one person’s spot at a workshop', es: 'Cubre el lugar de una persona en un taller' } },
  { value: 50, buys: { en: 'Materials for one demonstration', es: 'Materiales para una demostración' } },
  { value: 100, buys: { en: 'Food and supplies for one month’s gathering', es: 'Comida y provisiones para la reunión de un mes' } },
];

const copy = {
  eyebrow: { en: 'SUPPORT THE CHAPTER', es: 'APOYA AL CAPÍTULO' },
  heading: { en: 'Help equip families to work the land', es: 'Ayuda a equipar a las familias que trabajan la tierra' },
  lede: {
    en: 'The Catholic Land Movement wants families to own the tools and land they work with. Most of what we raise goes to equipment and land the chapter owns together and lends to members.',
    es: 'El Movimiento Católico de la Tierra quiere que las familias posean las herramientas y la tierra con las que trabajan. Casi todo lo que recaudamos va a equipo y tierra que el capítulo posee en conjunto y presta a sus miembros.',
  },
  onceLabel: { en: 'Give once', es: 'Dar una vez' },
  monthlyLabel: { en: 'Give monthly', es: 'Dar cada mes' },
  chooseAmount: { en: 'CHOOSE AN AMOUNT', es: 'ELIGE UNA CANTIDAD' },
  giveSuffixMonthly: { en: 'monthly', es: 'al mes' },
  other: { en: 'Other', es: 'Otra' },
  giveOnce: { en: 'Give', es: 'Dar' },
  giveMonthly: { en: 'Give every month', es: 'Dar cada mes' },
  nameMe: {
    en: 'List my name in the chapter’s yearly record of givers.',
    es: 'Incluye mi nombre en el registro anual de donantes del capítulo.',
  },

  statsEyebrow: { en: 'THE CHAPTER SO FAR', es: 'EL CAPÍTULO HASTA AHORA' },
  statNeighbors: { en: 'members', es: 'miembros' },
  statParishes: { en: 'parishes', es: 'parroquias' },
  statGatherings: { en: 'gatherings this year', es: 'reuniones este año' },

  commonsEyebrow: { en: 'THE RESOURCE COMMONS', es: 'LOS RECURSOS COMUNES' },
  commonsHeading: { en: 'Help buy shared equipment', es: 'Ayuda a comprar equipo compartido' },
  commonsLede: {
    en: 'Some equipment costs too much for one household. The chapter buys it once and lends it to members all year. Money given towards a tool goes towards purchasing that asset only.',
    es: 'Hay equipo que cuesta demasiado para un solo hogar. El capítulo lo compra una vez y lo presta a sus miembros todo el año. El dinero que se da para una herramienta se destina sólo a la compra de ese bien.',
  },
  funded: { en: 'Fully funded', es: 'Totalmente financiado' },
  toGo: { en: 'to go', es: 'faltan' },
  // The window is the amount picker, so it needs one line of instruction.
  pickGlass: {
    en: 'Each piece of glass is a gift. Bigger pieces are bigger gifts. Pick one to give.',
    es: 'Cada vidrio es un donativo. Los vidrios grandes son donativos grandes. Elige uno para dar.',
  },
  // What a lit piece asks for, right where it was lit. The note is folded
  // away: most givers won't leave one, and two labelled boxes sitting open
  // under every window made the ask look like paperwork.
  glassAddNote: { en: 'Add a note', es: 'Añade una nota' },
  glassMessage: { en: 'Add a note (optional)', es: 'Añade una nota (opcional)' },
  glassPlaceholder: {
    en: 'In thanksgiving, or for whom you are giving',
    es: 'En acción de gracias, o por quién das',
  },
  glassNameLabel: { en: 'Your name (optional)', es: 'Tu nombre (opcional)' },
  glassGive: { en: 'Light this piece', es: 'Enciende este vidrio' },
  glassCancel: { en: 'Cancel', es: 'Cancelar' },

  // What the form funds when nobody has chosen a section.
  generalFund: {
    en: 'Goes to: food and supplies for our monthly gatherings',
    es: 'Va a: comida y provisiones para nuestras reuniones mensuales',
  },

  whereEyebrow: { en: 'WHERE THE MONEY GOES', es: 'A DÓNDE VA EL DINERO' },
  whereBody: {
    en: 'The chapter is run by volunteers. No one is paid. We report all gifts to members at the start of each year. Money given to a specific tool or fund is spent only on that. General gifts cover whatever the chapter needs most.',
    es: 'El capítulo lo llevan voluntarios. Nadie cobra. Informamos de todos los donativos a los miembros al comenzar cada año. El dinero que se da a una herramienta o fondo en particular se gasta sólo en eso. Los donativos generales cubren lo que el capítulo más necesite.',
  },
} satisfies Record<string, Bilingual>;

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Stable key for a designation, from the English name. */
const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const Dar = () => {
  const { t, locale } = useLocale();


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
        <GiveBox />
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
      {/* The resource commons                                              */}
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

        <p className="mx-auto mt-10 max-w-2xl text-center font-serif text-sm italic text-piedra">
          {t(copy.pickGlass)}
        </p>

        {/* A card per tool. The window carries the progress AND the ask, so
            there is no separate meter and no separate amount control. */}
        <ul className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {TOOL_COMMONS.map((item) => (
            <ToolWindow key={item.key} item={item} />
          ))}
        </ul>
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* Where it goes                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose py-16">
        <p className="display-caps text-xs tracking-[0.25em] text-ocre">{t(copy.whereEyebrow)}</p>
        <p className="prose-body mt-3 text-base leading-relaxed text-mesquite/85">
          {t(copy.whereBody)}
        </p>
      </section>

    </Layout>
  );
};

// ---------------------------------------------------------------------------
// The ask itself. Cadence and amount live on one control; sending recurring
// donors to a second page is the most reliable way to lose them.
// ---------------------------------------------------------------------------
const GiveBox = () => {
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

      {/* The form funds the general pot. A tool is given for at the tool,
          not up here — see the panel under each window. */}
      <div className="mb-5 border-l-2 border-ocre/40 pl-3">
        <p className="font-serif text-sm italic leading-snug text-piedra">
          {t(copy.generalFund)}
        </p>
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
        label={`${t(copy.giveOnce)}${chosen ? ` ${usd(chosen)}` : ''}${
          monthly ? ` ${t(copy.giveSuffixMonthly)}` : ''
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
            ? 'Aún no podemos recibir donativos en línea. Falta conectar el procesador de pagos.'
            : 'We can’t take gifts online yet. The payment processor isn’t connected.'}
        </p>
      )}
    </div>
  );
};

/**
 * One tool: the window, and — once a piece is lit — the giving itself, right
 * there under it.
 *
 * The giving does NOT jump back to the form at the top of the page. GiveBrick
 * is right about this: you pick your piece, say your word over it and pay from
 * the same spot. Scrolling someone away from the thing they just chose is how
 * you lose them, and the message only makes sense beside the piece it belongs
 * to.
 */
const ToolWindow = ({ item }: { item: (typeof TOOL_COMMONS)[number] }) => {
  const { t, locale } = useLocale();
  const [picked, setPicked] = useState<{ index: number; value: number } | null>(null);
  const [message, setMessage] = useState('');
  const [giver, setGiver] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);

  const done = item.raised >= item.goal;
  const remaining = Math.max(0, item.goal - item.raised);

  return (
    <li className="flex flex-col">
      <GlassWindow
        seedKey={item.key}
        goal={item.goal}
        raised={item.raised}
        photo={item.photo}
        art={item.art}
        picked={picked?.index ?? null}
        label={`${t(item.name)} — ${usd(item.raised)} of ${usd(item.goal)}`}
        onPick={(piece) => setPicked((v) => (v?.index === piece.index ? null : piece))}
      />

      <h3 className="mt-4 font-heading text-lg leading-snug text-mesquite">{t(item.name)}</h3>
      <p className="prose-body mt-1 flex-1 text-sm leading-relaxed text-mesquite/80">
        {t(item.note)}
      </p>
      <p className="mt-3 font-serif text-sm tabular-nums text-piedra">
        {done ? (
          <span className="font-caps text-[10px] tracking-[0.18em] text-ocre">
            {t(copy.funded).toUpperCase()}
          </span>
        ) : (
          <>
            {usd(item.raised)}
            <span className="text-piedra/60"> / {usd(item.goal)}</span>
            <span className="text-piedra/60"> · {usd(remaining)} {t(copy.toGo)}</span>
          </>
        )}
      </p>

      {/* Opens in place, under the piece that was lit. */}
      {picked && (
        <div className="mt-4 rounded-sm border border-mesquite/15 bg-cal/60 p-4">
          <p className="text-center font-heading text-2xl text-mesquite tabular-nums">
            {usd(picked.value)}
          </p>

          {/* Folded away: most givers won't leave a note, and two open boxes
              under every window turned the ask into paperwork. */}
          <button
            type="button"
            onClick={() => setNoteOpen((v) => !v)}
            aria-expanded={noteOpen}
            aria-controls={`note-${item.key}`}
            className="mx-auto mt-2 flex items-center gap-1.5 font-serif text-xs italic text-piedra transition-colors hover:text-ocre"
          >
            {t(copy.glassAddNote)}
            <svg
              width="9" height="9" viewBox="0 0 12 12" aria-hidden="true"
              fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${noteOpen ? 'rotate-180' : ''}`}
            >
              <path d="M2 4.5L6 8.5L10 4.5" />
            </svg>
          </button>

          <div
            id={`note-${item.key}`}
            className={`grid transition-all duration-300 ease-out ${
              noteOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <label className="sr-only" htmlFor={`msg-${item.key}`}>
                {t(copy.glassMessage)}
              </label>
              <textarea
                id={`msg-${item.key}`}
                rows={3}
                tabIndex={noteOpen ? 0 : -1}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 160))}
                placeholder={t(copy.glassPlaceholder)}
                className="mt-3 w-full resize-none rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm leading-relaxed text-mesquite placeholder:italic placeholder:text-piedra/40 focus:border-ocre focus:outline-none focus:ring-1 focus:ring-ocre/30"
              />

              <label className="sr-only" htmlFor={`who-${item.key}`}>
                {t(copy.glassNameLabel)}
              </label>
              <input
                id={`who-${item.key}`}
                tabIndex={noteOpen ? 0 : -1}
                value={giver}
                onChange={(e) => setGiver(e.target.value.slice(0, 60))}
                placeholder={t(copy.glassNameLabel)}
                className="mt-2 w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite placeholder:italic placeholder:text-piedra/40 focus:border-ocre focus:outline-none focus:ring-1 focus:ring-ocre/30"
              />
            </div>
          </div>

          <InertGive label={t(copy.glassGive)} />

          <button
            type="button"
            onClick={() => setPicked(null)}
            className="mt-2 w-full text-center font-serif text-xs italic text-piedra transition hover:text-mesquite"
          >
            {t(copy.glassCancel)}
          </button>
        </div>
      )}
    </li>
  );
};

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
