// src/pages/Bienvenido.tsx
// Six-step onboarding wizard. Runs after first sign-in, or whenever the
// user re-enters via ?redo=1 to update their answers.
//
// Steps:
//   0. Welcome card
//   1. Display name + parish picker (required)
//   2. Bio — "¿Qué ha puesto Dios en tus manos?" (required)
//   3. Building — what am I working on right now? (optional)
//   4. Learning — what do I want a teacher for? (optional)
//   5. Expertise badges — 8-craft grid (optional)
//
// On completion, writes:
//   - UPDATE profiles SET display_name, parish_id, bio, bio_language,
//     working_on, wants_to_learn
//   - DELETE expertise for this profile_id, then INSERT current selections
// Then redirects to /mi-perfil.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { Layout } from '@/components/Layout';
import type { Database, CraftSlug } from '@/lib/database.types';

type Parish = Database['public']['Tables']['parishes']['Row'];

const CRAFTS_V1: { slug: CraftSlug; iconPath: string; en: string; es: string }[] = [
  { slug: 'las-abejas',  iconPath: '/src/assets/icons/las-abejas.svg',  en: 'Bees',       es: 'Las Abejas' },
  { slug: 'la-gallina',  iconPath: '/src/assets/icons/la-gallina.svg',  en: 'Hens',       es: 'La Gallina' },
  { slug: 'el-pan',      iconPath: '/src/assets/icons/el-pan.svg',      en: 'Bread',      es: 'El Pan' },
  { slug: 'la-conserva', iconPath: '/src/assets/icons/la-conserva.svg', en: 'Preserving', es: 'La Conserva' },
  { slug: 'la-cisterna', iconPath: '/src/assets/icons/la-cisterna.svg', en: 'Rainwater',  es: 'La Cisterna' },
  { slug: 'la-azuela',   iconPath: '/src/assets/icons/la-azuela.svg',   en: 'Woodwork',   es: 'La Azuela' },
  { slug: 'el-telar',    iconPath: '/src/assets/icons/el-telar.svg',    en: 'Textiles',   es: 'El Telar' },
  { slug: 'las-yerbas',  iconPath: '/src/assets/icons/las-yerbas.svg',  en: 'Herbs',      es: 'Las Yerbas' },
];

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const TOTAL_STEPS = 6;

export default function Bienvenido() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRedo = searchParams.get('redo') === '1';

  const [step, setStep] = useState(0);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishLoading, setParishLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [parishId, setParishId] = useState<string>('');
  const [parishQuery, setParishQuery] = useState('');
  const [parishOpen, setParishOpen] = useState(false);
  const parishBoxRef = useRef<HTMLDivElement>(null);

  const [bio, setBio] = useState('');
  const [workingOn, setWorkingOn] = useState('');
  const [wantsToLearn, setWantsToLearn] = useState('');
  const [crafts, setCrafts] = useState<Set<CraftSlug>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = uiStrings.onboarding;
  const nav = uiStrings.nav;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(buildPath('home', locale));
    }
  }, [authLoading, user, navigate, locale]);

  // If already onboarded and not explicitly redoing, jump to profile
  useEffect(() => {
    if (isRedo) return;
    if (!authLoading && profile && profile.parish_id && profile.bio) {
      navigate(buildPath('miPerfil', locale));
    }
  }, [authLoading, profile, navigate, locale, isRedo]);

  // Pre-fill from existing profile
  useEffect(() => {
    if (profile) {
      if (profile.display_name) setDisplayName(profile.display_name);
      if (profile.parish_id) setParishId(profile.parish_id);
      if (profile.bio) setBio(profile.bio);
      if (profile.working_on) setWorkingOn(profile.working_on);
      if (profile.wants_to_learn) setWantsToLearn(profile.wants_to_learn);
    }
  }, [profile]);

  // Load parishes
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('parishes')
        .select('*')
        .order('name');
      if (error) {
        console.error('Failed to load parishes:', error);
        setError(t({
          en: 'Could not load parishes. Try refreshing.',
          es: 'No pudimos cargar las parroquias. Intenta actualizar la página.',
        }));
      } else {
        setParishes(data ?? []);
      }
      setParishLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select existing expertise on redo
  useEffect(() => {
    if (!isRedo || !user) return;
    (async () => {
      const { data } = await supabase
        .from('expertise')
        .select('craft')
        .eq('profile_id', user.id);
      if (data) {
        setCrafts(new Set(data.map((r) => r.craft as CraftSlug)));
      }
    })();
  }, [isRedo, user]);

  // Close parish dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (parishBoxRef.current && !parishBoxRef.current.contains(e.target as Node)) {
        setParishOpen(false);
      }
    }
    if (parishOpen) {
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }
  }, [parishOpen]);

  const selectedParish = parishes.find((p) => p.id === parishId) ?? null;

  const filteredParishes = (() => {
    const q = normalize(parishQuery.trim());
    if (!q) return parishes;
    return parishes.filter((p) => {
      const hay = normalize(`${p.name} ${p.city ?? ''}`);
      return hay.includes(q);
    });
  })();

  const selectParish = (p: Parish) => {
    setParishId(p.id);
    setParishQuery('');
    setParishOpen(false);
  };

  const toggleCraft = (slug: CraftSlug) => {
    setCrafts((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const trimmedBio = bio.trim();
      const trimmedWorking = workingOn.trim();
      const trimmedLearning = wantsToLearn.trim();

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          parish_id: parishId || null,
          bio: trimmedBio || null,
          bio_language: trimmedBio ? locale : null,
          working_on: trimmedWorking || null,
          wants_to_learn: trimmedLearning || null,
        })
        .eq('id', user.id);

      if (profileErr) throw profileErr;

      const { error: delErr } = await supabase
        .from('expertise')
        .delete()
        .eq('profile_id', user.id);
      if (delErr) throw delErr;

      if (crafts.size > 0) {
        const rows = Array.from(crafts).map((craft) => ({
          profile_id: user.id,
          craft,
        }));
        const { error: insErr } = await supabase.from('expertise').insert(rows);
        if (insErr) throw insErr;
      }

      await refreshProfile();
      navigate(buildPath('miPerfil', locale));
    } catch (e) {
      console.error('Onboarding save failed:', e);
      const message =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message: unknown }).message)
          : String(e);
      setError(
        t({
          en: `Could not save. ${message}`,
          es: `No pudimos guardar. ${message}`,
        })
      );
      setSaving(false);
    }
  };

  const canAdvanceFromStep1 = displayName.trim().length >= 2 && parishId !== '';
  const canAdvanceFromStep2 = bio.trim().length >= 10;

  if (authLoading || parishLoading) {
    return (
      <Layout>
        <div className="container-narrow py-16 text-center font-serif text-mesquite/60">
          …
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-narrow py-12 md:py-16">
        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step
                  ? 'bg-mesquite'
                  : i < step
                  ? 'bg-mesquite/50'
                  : 'bg-mesquite/20'
              }`}
            />
          ))}
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="text-center">
            <p className="display-caps mb-4 text-xs tracking-[0.2em] text-ocre">
              {t(nav.welcome).toUpperCase()}
            </p>
            <h1 className="mb-6 font-heading text-4xl text-mesquite md:text-5xl">
              {isRedo
                ? t({ en: 'Update your profile', es: 'Actualiza tu perfil' })
                : t({ en: 'Welcome to the Commons', es: 'Bienvenido al Commons' })}
            </h1>
            <p className="mx-auto mb-10 max-w-xl font-serif text-lg leading-relaxed text-mesquite/80">
              {isRedo
                ? t({
                    en: 'Edit what you like. We pre-filled your answers.',
                    es: 'Edita lo que quieras. Rellenamos tus respuestas anteriores.',
                  })
                : t({
                    en: 'A few questions. They will help your neighbors find you, and you find them.',
                    es: 'Unas preguntas. Te ayudarán a encontrar a tus vecinos, y a ellos a encontrarte.',
                  })}
            </p>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-sm bg-ocre px-8 py-3 font-heading text-base text-cal transition hover:bg-mesquite"
            >
              {t(s.continue)}
            </button>
          </div>
        )}

        {/* Step 1 — Name + Parish */}
        {step === 1 && (
          <div className="mx-auto max-w-xl">
            <h2 className="mb-8 font-heading text-2xl text-mesquite md:text-3xl">
              {t({ en: 'Who are you?', es: '¿Quién eres?' })}
            </h2>

            <div className="mb-6">
              <label className="mb-2 block font-heading text-lg text-mesquite">
                {t({ en: 'Your name', es: 'Tu nombre' })}
              </label>
              <p className="mb-3 font-serif text-sm italic text-mesquite/60">
                {t({
                  en: 'How your neighbors will see you.',
                  es: 'Cómo te verán tus vecinos.',
                })}
              </p>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border-b border-mesquite/30 bg-transparent px-1 py-2 font-serif text-lg text-mesquite focus:border-mesquite focus:outline-none"
                placeholder={t({ en: 'e.g. Maria Cruz', es: 'ej. María Cruz' })}
              />
            </div>

            <div className="mb-8" ref={parishBoxRef}>
              <label className="mb-2 block font-heading text-lg text-mesquite">
                {t(s.q3)}
              </label>
              <p className="mb-3 font-serif text-sm italic text-mesquite/60">
                {t(s.q3Help)}
              </p>

              {selectedParish && !parishOpen && (
                <div className="flex items-center justify-between rounded-sm border border-mesquite/30 bg-cal/50 px-3 py-2.5 font-serif text-lg text-mesquite">
                  <span>
                    {selectedParish.name}
                    {selectedParish.city ? (
                      <span className="text-mesquite/60"> · {selectedParish.city}</span>
                    ) : null}
                  </span>
                  <button
                    onClick={() => {
                      setParishId('');
                      setParishOpen(true);
                    }}
                    className="font-serif text-sm italic text-mesquite/60 transition hover:text-mesquite"
                  >
                    {t({ en: 'change', es: 'cambiar' })}
                  </button>
                </div>
              )}

              {(!selectedParish || parishOpen) && (
                <div className="relative">
                  <input
                    type="text"
                    value={parishQuery}
                    onChange={(e) => {
                      setParishQuery(e.target.value);
                      setParishOpen(true);
                    }}
                    onFocus={() => setParishOpen(true)}
                    className="w-full border-b border-mesquite/30 bg-transparent px-1 py-2 font-serif text-lg text-mesquite focus:border-mesquite focus:outline-none"
                    placeholder={t({
                      en: 'Type a parish or city…',
                      es: 'Escribe una parroquia o ciudad…',
                    })}
                    autoFocus={parishOpen}
                  />

                  {parishOpen && (
                    <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-sm border border-mesquite/20 bg-cal shadow-lg">
                      {filteredParishes.length === 0 ? (
                        <li className="px-3 py-2 font-serif text-sm italic text-mesquite/50">
                          {t({ en: 'No matches', es: 'Sin coincidencias' })}
                        </li>
                      ) : (
                        filteredParishes.map((p) => (
                          <li key={p.id}>
                            <button
                              onClick={() => selectParish(p)}
                              className="flex w-full items-baseline justify-between px-3 py-2 text-left font-serif text-base text-mesquite transition hover:bg-ocre/10"
                            >
                              <span>{p.name}</span>
                              {p.city && (
                                <span className="ml-3 font-mono text-xs italic text-mesquite/50">
                                  {p.city}
                                </span>
                              )}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <BackBtn onClick={() => setStep(0)} t={t} />
              <NextBtn onClick={() => setStep(2)} disabled={!canAdvanceFromStep1} label={t(s.continue)} />
            </div>
          </div>
        )}

        {/* Step 2 — Bio */}
        {step === 2 && (
          <div className="mx-auto max-w-xl">
            <h2 className="mb-4 font-heading text-2xl text-mesquite md:text-3xl">
              {t(s.q1)}
            </h2>
            <p className="mb-6 font-serif text-base italic text-mesquite/70">
              {t(s.q1Help)}
            </p>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              className="w-full rounded-sm border border-mesquite/20 bg-cal/50 p-4 font-serif text-base leading-relaxed text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
              placeholder={t({
                en: 'e.g. Twenty years of beekeeping. I could teach a family how to set a hive.',
                es: 'ej. Veinte años cuidando abejas. Podría enseñarle a una familia cómo armar una colmena.',
              })}
            />

            <p className="mt-2 text-right font-mono text-xs text-mesquite/40">
              {bio.trim().length} / 10+
            </p>

            <div className="mt-8 flex items-center justify-between">
              <BackBtn onClick={() => setStep(1)} t={t} />
              <NextBtn onClick={() => setStep(3)} disabled={!canAdvanceFromStep2} label={t(s.continue)} />
            </div>
          </div>
        )}

        {/* Step 3 — Building (working_on) */}
        {step === 3 && (
          <div className="mx-auto max-w-xl">
            <h2 className="mb-4 font-heading text-2xl text-mesquite md:text-3xl">
              {t(s.qBuilding)}
            </h2>
            <p className="mb-6 font-serif text-base italic text-mesquite/70">
              {t(s.qBuildingHelp)}
            </p>

            <textarea
              value={workingOn}
              onChange={(e) => setWorkingOn(e.target.value)}
              rows={4}
              className="w-full rounded-sm border border-mesquite/20 bg-cal/50 p-4 font-serif text-base leading-relaxed text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
              placeholder={t({
                en: 'e.g. Splitting a strong hive this spring and mending a run of broken fence.',
                es: 'ej. Dividiendo una colmena fuerte esta primavera y arreglando una cerca rota.',
              })}
            />

            <p className="mt-2 font-serif text-xs italic text-mesquite/50">
              {t({ en: 'Optional — leave blank if you want.', es: 'Opcional — déjalo en blanco si quieres.' })}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <BackBtn onClick={() => setStep(2)} t={t} />
              <NextBtn onClick={() => setStep(4)} label={t(s.continue)} />
            </div>
          </div>
        )}

        {/* Step 4 — Learning (wants_to_learn) */}
        {step === 4 && (
          <div className="mx-auto max-w-xl">
            <h2 className="mb-4 font-heading text-2xl text-mesquite md:text-3xl">
              {t(s.qLearning)}
            </h2>
            <p className="mb-6 font-serif text-base italic text-mesquite/70">
              {t(s.qLearningHelp)}
            </p>

            <textarea
              value={wantsToLearn}
              onChange={(e) => setWantsToLearn(e.target.value)}
              rows={4}
              className="w-full rounded-sm border border-mesquite/20 bg-cal/50 p-4 font-serif text-base leading-relaxed text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
              placeholder={t({
                en: 'e.g. How to preserve this summer\u2019s tomatoes. Scratch sourdough.',
                es: 'ej. Cómo conservar los tomates del verano. Masa madre desde cero.',
              })}
            />

            <p className="mt-2 font-serif text-xs italic text-mesquite/50">
              {t({ en: 'Optional — leave blank if you want.', es: 'Opcional — déjalo en blanco si quieres.' })}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <BackBtn onClick={() => setStep(3)} t={t} />
              <NextBtn onClick={() => setStep(5)} label={t(s.continue)} />
            </div>
          </div>
        )}

        {/* Step 5 — Crafts */}
        {step === 5 && (
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 font-heading text-2xl text-mesquite md:text-3xl">
              {t(s.qCraftsHeading)}
            </h2>
            <p className="mb-8 font-serif text-base italic text-mesquite/70">
              {t(s.qCraftsHelp)}
            </p>

            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CRAFTS_V1.map((craft) => {
                const selected = crafts.has(craft.slug);
                return (
                  <button
                    key={craft.slug}
                    onClick={() => toggleCraft(craft.slug)}
                    className={`flex flex-col items-center gap-2 rounded-sm border p-4 text-center transition ${
                      selected
                        ? 'border-ocre bg-ocre/10 text-mesquite'
                        : 'border-mesquite/15 bg-cal/40 text-mesquite/60 hover:border-mesquite/40 hover:text-mesquite'
                    }`}
                  >
                    <img
                      src={craft.iconPath}
                      alt=""
                      className={`h-12 w-12 transition ${selected ? 'opacity-100' : 'opacity-60'}`}
                      style={{ filter: selected ? 'none' : 'grayscale(40%)' }}
                    />
                    <span className="font-heading text-sm leading-tight">
                      {locale === 'es' ? craft.es : craft.en}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="mb-4 rounded-sm border border-rojo/30 bg-rojo/5 p-3 font-serif text-sm text-rojo">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <BackBtn onClick={() => setStep(4)} t={t} disabled={saving} />
              <button
                onClick={finish}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-sm bg-ocre px-6 py-2.5 font-heading text-base text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving
                  ? t({ en: 'Saving…', es: 'Guardando…' })
                  : t({ en: 'Finish', es: 'Terminar' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Small helpers for the nav buttons — keeps the main flow readable
function BackBtn({ onClick, t, disabled }: { onClick: () => void; t: (b: { en: string; es: string }) => string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite disabled:opacity-40"
    >
      ← {t({ en: 'Back', es: 'Atrás' })}
    </button>
  );
}

function NextBtn({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-sm bg-ocre px-6 py-2.5 font-heading text-base text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}
