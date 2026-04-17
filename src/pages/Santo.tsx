import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';

const Santo = () => {
  const { t } = useLocale();
  const s = uiStrings.patron;

  return (
    <Layout>
      <article className="container-prose py-20">
        <header className="text-center">
          {/* Icon placeholder — circle with the saint's name */}
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

        <p className="prose-body mt-12 text-xl text-mesquite">{t(s.story)}</p>

        <blockquote className="mt-16 border-l-2 border-rojo pl-6">
          <p className="prose-body italic text-mesquite/90">{t(s.prayer)}</p>
        </blockquote>
      </article>
    </Layout>
  );
};

export default Santo;
