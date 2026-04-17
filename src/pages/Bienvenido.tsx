import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';

const Bienvenido = () => {
  const { t } = useLocale();
  const s = uiStrings.onboarding;

  // Static mock — no submission, no state. This is the demo's vision frame.
  return (
    <Layout>
      <section className="container-prose py-20">
        <header className="mb-12 text-center">
          <p className="display-caps text-xs tracking-[0.25em] text-ocre">
            CLM CENTRAL TEXAS
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight text-mesquite">
            {t(s.heading)}
          </h1>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-12"
        >
          <Field label={t(s.q1)} help={t(s.q1Help)} />
          <Field label={t(s.q2)} help={t(s.q2Help)} />
          <Field label={t(s.q3)} help={t(s.q3Help)} />

          <div className="pt-4 text-center">
            <button
              type="submit"
              className="border border-ocre bg-ocre px-10 py-3 font-heading text-lg text-cal transition-colors hover:border-mesquite hover:bg-mesquite"
            >
              {t(s.continue)}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

const Field = ({ label, help }: { label: string; help: string }) => (
  <div>
    <label className="block">
      <span className="font-heading text-xl text-mesquite">{label}</span>
      <span className="mt-1 block text-sm italic text-piedra">{help}</span>
      <input
        type="text"
        className="mt-3 w-full border-0 border-b border-mesquite/40 bg-transparent px-0 py-2 font-body text-lg text-mesquite focus:border-ocre focus:outline-none focus:ring-0"
      />
    </label>
  </div>
);

export default Bienvenido;
