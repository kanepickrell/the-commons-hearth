// src/pages/MiPerfil.tsx
// Minimal profile view — what this signed-in user has told us.
// Next iteration: edit controls, expertise list, workshops they host,
// witness posts they've authored. For now: just show the data.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import type { Database, CraftSlug } from '@/lib/database.types';

type Parish = Database['public']['Tables']['parishes']['Row'];
type Expertise = Database['public']['Tables']['expertise']['Row'];

const CRAFT_NAMES: Record<CraftSlug, { en: string; es: string }> = {
  'las-abejas':      { en: 'Bees',          es: 'Las Abejas' },
  'la-gallina':      { en: 'Hens',          es: 'La Gallina' },
  'el-pan':          { en: 'Bread',         es: 'El Pan' },
  'la-conserva':     { en: 'Preserving',    es: 'La Conserva' },
  'la-cisterna':     { en: 'Rainwater',     es: 'La Cisterna' },
  'la-azuela':       { en: 'Woodwork',      es: 'La Azuela' },
  'el-telar':        { en: 'Textiles',      es: 'El Telar' },
  'las-yerbas':      { en: 'Herbs',         es: 'Las Yerbas' },
  'el-huerto':       { en: 'Vegetable garden', es: 'El Huerto' },
  'el-invernadero':  { en: 'Greenhouse',    es: 'El Invernadero' },
  'la-milpa':        { en: 'Three-sisters field', es: 'La Milpa' },
  'el-rebano':       { en: 'Sheep',         es: 'El Rebaño' },
  'el-caldo':        { en: 'Broth & ferments', es: 'El Caldo' },
  'la-mesa':         { en: 'Scratch cooking', es: 'La Mesa' },
  'el-jabon':        { en: 'Soap',          es: 'El Jabón' },
  'el-candelero':    { en: 'Candles',       es: 'El Candelero' },
  'el-tractor':      { en: 'Land equipment', es: 'El Tractor' },
  'la-regla':        { en: 'Homestead rhythm', es: 'La Regla' },
  'las-medicinas':   { en: 'Natural medicine', es: 'Las Medicinas' },
  'la-escuela':      { en: 'Home schooling', es: 'La Escuela' },
  'el-jardin':       { en: 'Flower garden', es: 'El Jardín' },
  'la-mano':         { en: 'Home repair',   es: 'La Mano' },
};

export default function MiPerfil() {
  const { user, profile, loading: authLoading } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  const [parish, setParish] = useState<Parish | null>(null);
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(buildPath('home', locale));
    }
  }, [authLoading, user, navigate, locale]);

  // Redirect to onboarding if profile is not complete
  useEffect(() => {
    if (!authLoading && profile && (!profile.parish_id || !profile.bio)) {
      navigate(buildPath('bienvenido', locale));
    }
  }, [authLoading, profile, navigate, locale]);

  // Load parish + expertise
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [parishResult, expResult] = await Promise.all([
        profile?.parish_id
          ? supabase.from('parishes').select('*').eq('id', profile.parish_id).maybeSingle()
          : Promise.resolve({ data: null, error: null } as const),
        supabase
          .from('expertise')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at'),
      ]);
      if (parishResult.data) setParish(parishResult.data);
      if (expResult.data) setExpertise(expResult.data);
      setLoading(false);
    })();
  }, [user, profile?.parish_id]);

  if (authLoading || loading || !profile) {
    return (
      <div className="container-narrow py-16 text-center font-serif text-mesquite/60">
        …
      </div>
    );
  }

  return (
    <div className="container-narrow py-12 md:py-16">
      {profile.status === 'pending' && (
        <div className="mb-8 rounded-sm border border-ocre/30 bg-ocre/5 p-4 font-serif text-sm italic text-mesquite/80">
          {t(uiStrings.auth.pendingNotice)}
        </div>
      )}

      <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
        {t({ en: 'MY PROFILE', es: 'MI PERFIL' })}
      </p>

      <h1 className="mb-2 font-heading text-4xl text-mesquite md:text-5xl">
        {profile.display_name ?? user?.email}
      </h1>

      {parish && (
        <p className="mb-10 font-serif text-lg italic text-mesquite/70">
          {parish.name}
          {parish.city ? ` · ${parish.city}` : ''}
        </p>
      )}

      {profile.bio && (
        <div className="mb-12">
          <h2 className="mb-3 font-heading text-lg text-mesquite/60">
            {t(uiStrings.profile.offeringLabel)}
          </h2>
          <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-mesquite">
            {profile.bio}
          </p>
        </div>
      )}

      {expertise.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-4 font-heading text-lg text-mesquite/60">
            {t({ en: 'My crafts', es: 'Mis oficios' })}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {expertise.map((e) => (
              <li
                key={e.id}
                className="rounded-sm border border-mesquite/20 bg-cal/60 px-3 py-1.5 font-heading text-sm text-mesquite"
              >
                {CRAFT_NAMES[e.craft][locale]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 border-t border-mesquite/10 pt-6">
        <Link
          to={buildPath('bienvenido', locale)}
          className="font-serif text-sm italic text-mesquite/60 transition hover:text-mesquite"
        >
          {t({ en: '← Redo onboarding', es: '← Rehacer la bienvenida' })}
        </Link>
      </div>
    </div>
  );
}