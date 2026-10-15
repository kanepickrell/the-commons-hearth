// src/pages/Dar.tsx
// Giving — "Support the chapter".
//
// ⚠️ NOT READY TO SHIP. Every amount on this page is INERT: no payment
// processor is wired, and the buttons do nothing. Before this route goes
// live, three things have to happen:
//
//   1. Provision Stripe through the Vercel Marketplace (`vercel integration
//      add stripe`). Donations with no product catalog are the `payments`
//      category; Stripe is the provider this project standardises on. Do not
//      hand-roll a checkout or npm-install the SDK directly.
//   2. Settle the tax language. The chapter is described as a non-profit LLC,
//      which is NOT automatically a 501(c)(3) — and gifts to an entity that
//      isn't one are generally not deductible. There is deliberately no
//      "tax-deductible" claim anywhere on this page. Add one only on an
//      accountant's word, not a developer's.
//   3. Replace the placeholder figures in TOOL_COMMONS and the monthly tiers
//      with real numbers. They are invented, and marked as such.
//
// The structure is the argument: a CLM chapter asking for money should ask
// for it the way distributism asks for it — gifts that become productive
// property the chapter holds in common, not gifts that disappear into
// overhead. Hence the tool commons sitting above the general fund.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ContactModal } from '@/components/ContactModal';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { chapterToday, formatDate } from '@/lib/dates';
import { nextFeast } from '@/lib/liturgical';
import type { Bilingual } from '@/lib/types';

// ---------------------------------------------------------------------------
// Copy — authored inline like Home.tsx, since it's editorial and will be
// revised often.
// ---------------------------------------------------------------------------
const copy = {
  eyebrow: { en: 'SUPPORT THE CHAPTER', es: 'APOYA AL CAPÍTULO' } satisfies Bilingual,
  heading: { en: 'Give toward something that lasts', es: 'Da hacia algo que permanece' } satisfies Bilingual,
  lede: {
    en: 'The movement’s whole argument is that ordinary families should own the things they work with. So most of what we ask for isn’t overhead — it’s tools, equipment and land that the chapter holds in common and puts into members’ hands.',
    es: 'Todo el argumento del movimiento es que las familias comunes deben poseer aquello con lo que trabajan. Por eso casi todo lo que pedimos no son gastos administrativos — son herramientas, equipo y tierra que el capítulo guarda en común y pone en manos de sus miembros.',
  } satisfies Bilingual,

  monthlyEyebrow: { en: 'MONTHLY', es: 'CADA MES' } satisfies Bilingual,
  monthlyHeading: { en: 'Steady giving', es: 'Dar con constancia' } satisfies Bilingual,
  monthlyLede: {
    en: 'A gathering every month needs someone paying for it every month. Steady gifts are what let a host say yes without counting the cost of the meal.',
    es: 'Una reunión cada mes necesita que alguien la sostenga cada mes. Los dones constantes son los que permiten a un anfitrión decir que sí sin contar el costo de la comida.',
  } satisfies Bilingual,

  commonsEyebrow: { en: 'THE TOOL COMMONS', es: 'LAS HERRAMIENTAS COMUNES' } satisfies Bilingual,
  commonsHeading: { en: 'Buy a thing the chapter keeps', es: 'Compra algo que el capítulo guarda' } satisfies Bilingual,
  commonsLede: {
    en: 'Equipment no single household would buy alone, bought once and lent out all year. A gift here doesn’t get spent — it becomes a thing with a name, kept by the chapter and used by whoever needs it next.',
    es: 'Equipo que ninguna familia compraría sola, comprado una vez y prestado todo el año. Un don aquí no se gasta — se convierte en algo con nombre, guardado por el capítulo y usado por quien lo necesite.',
  } satisfies Bilingual,
  commonsGoal: { en: 'of', es: 'de' } satisfies Bilingual,

  gatheringEyebrow: { en: 'UNDERWRITE A GATHERING', es: 'PATROCINA UNA REUNIÓN' } satisfies Bilingual,
  gatheringBody: {
    en: 'Cover the food and materials for one month’s gathering. We’ll name the month you carried in the year’s record — or leave you out of it entirely, if you’d rather it stay between you and God.',
    es: 'Cubre la comida y los materiales de la reunión de un mes. Nombraremos el mes que sostuviste en el registro del año — o te dejaremos fuera por completo, si prefieres que quede entre tú y Dios.',
  } satisfies Bilingual,
  gatheringLink: { en: 'See what a month looks like', es: 'Mira cómo es un mes' } satisfies Bilingual,

  feastEyebrow: { en: 'GIVE ON A FEAST', es: 'DA EN UNA FIESTA' } satisfies Bilingual,
  feastBody: {
    en: 'The chapter keeps the farmers’ feasts. Some households would rather give on one of them than on the first of the month — an offering with a day attached to it.',
    es: 'El capítulo guarda las fiestas de los labradores. Hay hogares que prefieren dar en una de ellas y no el primero del mes — una ofrenda con un día propio.',
  } satisfies Bilingual,
  feastNext: { en: 'Next', es: 'Próxima' } satisfies Bilingual,

  kindEyebrow: { en: 'GIVE WHAT YOU HAVE', es: 'DA LO QUE TIENES' } satisfies Bilingual,
  kindBody: {
    en: 'Not everything worth giving is money. A trailer for a weekend, a freezer, seed stock, a ram at breeding time, an acre someone can practise on, a Saturday of your hands. Tell us what you’ve got and we’ll find who needs it.',
    es: 'No todo lo que vale la pena dar es dinero. Un remolque por un fin de semana, un congelador, semilla, un carnero en temporada, un acre donde alguien pueda practicar, un sábado de tus manos. Dinos qué tienes y encontraremos quién lo necesita.',
  } satisfies Bilingual,
  kindCta: { en: 'Offer something', es: 'Ofrece algo' } satisfies Bilingual,

  landEyebrow: { en: 'THE LAND FUND', es: 'EL FONDO DE LA TIERRA' } satisfies Bilingual,
  landBody: {
    en: 'Resettlement is the first pillar and the slowest one. The land fund is a long patience: money set aside toward helping a family onto working ground. It is not a campaign with a deadline, and we would rather say so than invent urgency.',
    es: 'El reasentamiento es el primer pilar y el más lento. El fondo de la tierra es una paciencia larga: dinero apartado para ayudar a una familia a establecerse en tierra de labor. No es una campaña con fecha límite, y preferimos decirlo a inventar urgencia.',
  } satisfies Bilingual,

  whereEyebrow: { en: 'WHERE IT GOES', es: 'A DÓNDE VA' } satisfies Bilingual,
  whereBody: {
    en: 'The chapter is run by its members; no one draws a salary. Gifts are reported to the chapter at the start of each year, and anything given toward a named tool is spent on that tool or returned.',
    es: 'El capítulo lo llevan sus miembros; nadie cobra sueldo. Los donativos se informan al capítulo al comenzar cada año, y lo que se da para una herramienta nombrada se gasta en ella o se devuelve.',
  } satisfies Bilingual,
};

// Monthly tiers. Names are agrarian rather than Bronze/Silver/Gold — the
// chapter's own idiom. AMOUNTS ARE REAL; the "what it covers" lines are
// PLACEHOLDERS until someone costs a gathering properly.
const TIERS: { amount: number; name: Bilingual; covers: Bilingual }[] = [
  {
    amount: 5,
    name: { en: 'The seed', es: 'La semilla' },
    covers: {
      en: 'Seed and starts passed around at a gathering.',
      es: 'Semilla y plántulas que se reparten en una reunión.',
    },
  },
  {
    amount: 25,
    name: { en: 'The row', es: 'El surco' },
    covers: {
      en: 'A share of the food on the table each month.',
      es: 'Parte de la comida en la mesa cada mes.',
    },
  },
  {
    amount: 100,
    name: { en: 'The field', es: 'El campo' },
    covers: {
      en: 'A month’s gathering, carried end to end.',
      es: 'La reunión de un mes, sostenida de principio a fin.',
    },
  },
];

// PLACEHOLDER DATA. Replace with real items the chapter actually wants, real
// prices, and a real `raised` figure from wherever giving is tracked. Shipping
// invented targets on a live fundraising page would be a lie to donors.
const TOOL_COMMONS: { name: Bilingual; note: Bilingual; goal: number; raised: number }[] = [
  {
    name: { en: 'Walk-behind tractor', es: 'Tractor de dos ruedas' },
    note: {
      en: 'Breaks ground on a quarter acre without a tractor payment.',
      es: 'Abre un cuarto de acre sin pagar un tractor entero.',
    },
    goal: 4200,
    raised: 0,
  },
  {
    name: { en: 'Butchering kit', es: 'Equipo de matanza' },
    note: {
      en: 'Gambrel, saw, knives and a cooler — the day Doug teaches it.',
      es: 'Gancho, sierra, cuchillos y una hielera — el día que Doug lo enseña.',
    },
    goal: 650,
    raised: 0,
  },
  {
    name: { en: 'Grain mill', es: 'Molino de grano' },
    note: {
      en: 'Whole wheat to flour, for the households that bake.',
      es: 'De trigo entero a harina, para los hogares que hornean.',
    },
    goal: 900,
    raised: 0,
  },
  {
    name: { en: 'Canning setup', es: 'Equipo de conservas' },
    note: {
      en: 'Pressure canners and jars that circulate through the harvest.',
      es: 'Ollas a presión y frascos que circulan en la cosecha.',
    },
    goal: 500,
    raised: 0,
  },
];

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

const Dar = () => {
  const { t, locale } = useLocale();
  const [offerOpen, setOfferOpen] = useState(false);

  const feast = useMemo(() => nextFeast(chapterToday()), []);

  return (
    <Layout>
      {/* ---------------------------------------------------------------- */}
      {/* Masthead                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose pb-10 pt-20 text-center">
        <p className="display-caps text-[11px] tracking-[0.3em] text-ocre">{t(copy.eyebrow)}</p>
        <h1 className="mt-4 font-heading text-[34px] leading-[1.15] text-mesquite md:text-[44px]">
          {t(copy.heading)}
        </h1>
        <p className="prose-body mx-auto mt-6 max-w-xl text-lg leading-relaxed text-mesquite/85">
          {t(copy.lede)}
        </p>
      </section>

      <div className="rule container-prose" />

      {/* ---------------------------------------------------------------- */}
      {/* Monthly tiers                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-16">
        <header className="mx-auto mb-10 max-w-xl text-center">
          <p className="display-caps text-xs tracking-[0.25em] text-ocre">{t(copy.monthlyEyebrow)}</p>
          <h2 className="mt-3 font-heading text-3xl text-mesquite">{t(copy.monthlyHeading)}</h2>
          <p className="prose-body mt-4 text-base italic leading-relaxed text-piedra">
            {t(copy.monthlyLede)}
          </p>
        </header>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.amount}
              className="flex flex-col items-center border border-mesquite/15 bg-cal/40 px-5 py-7 text-center"
            >
              <p className="font-caps text-[10px] tracking-[0.2em] text-ocre">{t(tier.name)}</p>
              <p className="mt-3 font-heading text-[40px] leading-none text-mesquite tabular-nums">
                {usd(tier.amount)}
              </p>
              <p className="mt-1 font-serif text-xs italic text-piedra">
                {locale === 'es' ? 'al mes' : 'a month'}
              </p>
              <p className="prose-body mt-4 flex-1 text-sm leading-relaxed text-mesquite/80">
                {t(tier.covers)}
              </p>
              <GiveButton label={locale === 'es' ? 'Dar cada mes' : 'Give monthly'} />
            </div>
          ))}
        </div>
      </section>

      <div className="rule container-wide" />

      {/* ---------------------------------------------------------------- */}
      {/* The tool commons — the distributist heart of the page             */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-wide py-16">
        <header className="mx-auto mb-10 max-w-xl text-center">
          <p className="display-caps text-xs tracking-[0.25em] text-ocre">{t(copy.commonsEyebrow)}</p>
          <h2 className="mt-3 font-heading text-3xl text-mesquite">{t(copy.commonsHeading)}</h2>
          <p className="prose-body mt-4 text-base italic leading-relaxed text-piedra">
            {t(copy.commonsLede)}
          </p>
        </header>

        <ul className="mx-auto max-w-2xl divide-y divide-mesquite/10 border-y border-mesquite/15">
          {TOOL_COMMONS.map((item) => {
            const pct = Math.min(100, Math.round((item.raised / item.goal) * 100));
            return (
              <li key={item.name.en} className="py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-heading text-xl text-mesquite">{t(item.name)}</h3>
                  <p className="font-serif text-sm text-piedra tabular-nums">
                    {usd(item.raised)} {t(copy.commonsGoal)} {usd(item.goal)}
                  </p>
                </div>
                <p className="prose-body mt-1 text-sm leading-relaxed text-mesquite/80">
                  {t(item.note)}
                </p>
                {/* Progress rail. Reads as a furrow rather than a candy bar. */}
                <div
                  className="mt-3 h-[3px] w-full bg-mesquite/10"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t(item.name)}
                >
                  <div className="h-full bg-ocre" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3">
                  <GiveButton label={locale === 'es' ? 'Dar hacia esto' : 'Give toward this'} quiet />
                </div>
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
          {/* Underwrite a gathering */}
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

          {/* Feast-day giving — uses the liturgical calendar the site keeps */}
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

          {/* In kind */}
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
      {/* The land fund + where it goes                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="container-prose py-16">
        <p className="display-caps text-xs tracking-[0.25em] text-ocre">{t(copy.landEyebrow)}</p>
        <p className="prose-body mt-3 text-base leading-relaxed text-mesquite/85">
          {t(copy.landBody)}
        </p>
        <div className="mt-5">
          <GiveButton label={locale === 'es' ? 'Dar al fondo' : 'Give to the fund'} quiet />
        </div>

        <div className="rule my-12" />

        <p className="display-caps text-xs tracking-[0.25em] text-ocre">{t(copy.whereEyebrow)}</p>
        <p className="prose-body mt-3 text-base leading-relaxed text-mesquite/85">
          {t(copy.whereBody)}
        </p>
      </section>

      {/* Reuses the chapter contact form; the offer arrives as a normal
          message so a steward can reply by hitting Reply. */}
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

/**
 * A giving button that does not yet take money.
 *
 * Deliberately inert: no processor is provisioned, and a button that looks
 * live but silently fails is worse than one that says so. Swap the onClick
 * for a Stripe checkout session once the integration exists.
 */
const GiveButton = ({ label, quiet = false }: { label: string; quiet?: boolean }) => {
  const { locale } = useLocale();
  const [touched, setTouched] = useState(false);

  return (
    <div className={quiet ? '' : 'mt-5 w-full'}>
      <button
        type="button"
        onClick={() => setTouched(true)}
        className={
          quiet
            ? 'font-heading text-sm text-ocre underline-offset-4 transition hover:text-mesquite hover:underline'
            : 'w-full rounded-sm bg-ocre px-5 py-2.5 font-heading text-base text-cal transition hover:bg-mesquite'
        }
      >
        {label}
        {quiet ? ' →' : ''}
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

export default Dar;
