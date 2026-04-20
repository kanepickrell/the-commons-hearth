// src/pages/Bienvenido.tsx
// Four-step onboarding wizard. Runs after first sign-in.
//
// Steps:
//   1. Welcome card
//   2. Display name + parish selection (required)
//   3. Bio — "¿Qué ha puesto Dios en tus manos?" (required)
//   4. Expertise badges — 8-craft grid (optional)
//
// On completion, writes:
//   - UPDATE profiles SET display_name, parish_id, bio
//   - INSERT expertise rows for each selected craft
// Then redirects to /mi-perfil.
//
// If the user closes the tab mid-flow, partial progress survives in
// profiles (steps 2-3). We check profile.display_name + profile.parish_id
// on load to jump to the earliest incomplete step.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import type { Database, CraftSlug } from '@/lib/database.types';

type Parish = Database['public']['Tables']['parishes']['Row'];

// The 8 crafts with drawn icons. We'll add the other 14 later.
const CRAFTS_V1: { slug: CraftSlug; iconPath: string; en: string; es: string }[] = [
  { slug: 'las-abejas',  iconPath: '/src/assets/icons/las-abejas.svg',  en: 'Bees',          es: 'Las Abejas' },
  { slug: 'la-gallina',  iconPath: '/src/assets/icons/la-gallina.svg',  en: 'Hens',          es: 'La Gallina' },
  { slug: 'el-pan',      iconPath: '/src/assets/icons/el-pan.svg',      en: 'Bread',         es: 'El Pan' },
  { slug: 'la-conserva', iconPath: '/src/assets/icons/la-conserva.svg', en: 'Preserving',    es: 'La Conserva' },
  { slug: 'la-cisterna', iconPath: '/src/assets/icons/la-cisterna.svg', en: 'Rainwater',     es: 'La Cisterna' },
  { slug: 'la-azuela',   iconPath: '/src/assets/icons/la-azuela.svg',   en: 'Woodwork',      es: 'La Azuela' },
  { slug: 'el-telar',    iconPath: '/src/assets/icons/el-telar.svg',    en: 'Textiles',      es: 'El Telar' },
  { slug: 'las-yerbas',  iconPath: '/src/assets/icons/las-yerbas.svg',  en: 'Herbs',         es: 'Las Yerbas' },
];

export default function Bienvenido() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishLoading, setParishLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [parishId, setParishId] = useState<string>('');
  const [bio, setBio] = useState('');
  const [crafts, setCrafts] = useState<Set<CraftSlug>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = uiStrings.onboarding;
  const nav = uiStrings.nav;

  // Guard: if not signed in, send home
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(buildPath('home', locale));
    }
  }, [authLoading, user, navigate, locale]);

  // Guard: if already completed (has parish + bio), jump to profile
  useEffect(() => {
    if (!authLoading && profile && profile.parish_id && profile.bio) {
      navigate(buildPath('miPerfil', locale));
    }
  }, [authLoading, profile, navigate, locale]);

  // Pre-fill form with any existing profile data
  useEffect(() => {
    if (profile) {
      if (profile.display_name) setDisplayName(profile.display_name);
      if (profile.parish_id) setParishId(profile.parish_id);
      if (profile.bio) setBio(profile.bio);
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
        setError(t({ en: 'Could not load parishes. Try refreshing.',
                     es: 'No pudimos cargar las parroquias. Intenta actualizar la página.' }));
      } else {
        setParishes(data ?? []);
      }
      setParishLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Update profile
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          parish_id: parishId || null,
          bio: bio.trim() || null,
        })
        .eq('id', user.id);

      if (profileErr) throw profileErr;

      // Insert expertise rows (ignore if crafts set is empty)
      if (crafts.size > 0) {
        const rows = Array.from(crafts).map((craft) => ({
          profile_id: user.id,
          craft,
        }));
        const { error: expErr } = await supabase
          .from('expertise')
          .upsert(rows, { onConflict: 'profile_id,craft', ignoreDuplicates: true });
        if (expErr) throw expErr;
      }

      await refreshProfile();
      navigate(buildPath('miPerfil', locale));
    } catch (e) {
      console.error('Onboarding save failed:', e);
      const message = e instanceof Error ? e.message : String(e);
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
      <div className="container-narrow py-16 text-center font-serif text-mesquite/60">
        …
      </div>
    );
  }

  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
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
            {t({
              en: 'Welcome to the Commons',
              es: 'Bienvenido al Commons',
            })}
          </h1>
          <p className="mx-auto mb-10 max-w-xl font-serif text-lg leading-relaxed text-mesquite/80">
            {t({
              en: 'Three questions. They will help your neighbors find you, and you find them.',
              es: 'Tres preguntas. Te ayudarán a encontrar a tus vecinos, y a ellos a encontrarte.',
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

          <div className="mb-8">
            <label className="mb-2 block font-heading text-lg text-mesquite">
              {t(s.q3)}
            </label>
            <p className="mb-3 font-serif text-sm italic text-mesquite/60">
              {t(s.q3Help)}
            </p>
            <select
              value={parishId}
              onChange={(e) => setParishId(e.target.value)}
              className="w-full border-b border-mesquite/30 bg-transparent px-1 py-2 font-serif text-lg text-mesquite focus:border-mesquite focus:outline-none"
            >
              <option value="">
                {t({ en: '— Choose your parish —', es: '— Elige tu parroquia —' })}
              </option>
              {parishes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.city ? ` · ${p.city}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(0)}
              className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite"
            >
              ← {t({ en: 'Back', es: 'Atrás' })}
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!canAdvanceFromStep1}
              className="inline-flex items-center gap-2 rounded-sm bg-ocre px-6 py-2.5 font-heading text-base text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t(s.continue)}
            </button>
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
            <button
              onClick={() => setStep(1)}
              className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite"
            >
              ← {t({ en: 'Back', es: 'Atrás' })}
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canAdvanceFromStep2}
              className="inline-flex items-center gap-2 rounded-sm bg-ocre px-6 py-2.5 font-heading text-base text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t(s.continue)}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Crafts */}
      {step === 3 && (
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 font-heading text-2xl text-mesquite md:text-3xl">
            {t({ en: 'Your crafts', es: 'Tus oficios' })}
          </h2>
          <p className="mb-8 font-serif text-base italic text-mesquite/70">
            {t({
              en: 'Tap any skill you can teach. Leave them all unlit — you can add them later.',
              es: 'Toca cualquier oficio que puedas enseñar. Puedes dejarlos todos apagados y agregarlos después.',
            })}
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
                    style={{
                      filter: selected
                        ? 'none'
                        : 'grayscale(40%)',
                    }}
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
            <button
              onClick={() => setStep(2)}
              className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite"
              disabled={saving}
            >
              ← {t({ en: 'Back', es: 'Atrás' })}
            </button>
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
  );
}