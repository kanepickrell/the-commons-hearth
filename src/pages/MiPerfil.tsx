// src/pages/MiPerfil.tsx
// The signed-in user's own profile view.
// Structured around the three chapter questions:
//   Sharing (crafts) · Building (working_on) · Learning (wants_to_learn) · Bio
// Plus:
//   - upcoming gatherings I'm hosting
//   - who's RSVP'd to my gatherings (what they're bringing)
//   - past gatherings I've hosted
//   - redo-onboarding escape hatch

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { Layout } from '@/components/Layout';
import type { Database } from '@/lib/database.types';

type Parish = Database['public']['Tables']['parishes']['Row'];
type Expertise = Database['public']['Tables']['expertise']['Row'];

type HostedWorkshop = {
  id: string;
  title: string;
  held_at: string;
  location_text: string | null;
};

type MyRsvpRow = {
  id: string;
  workshop_id: string;
  contribution_type: string;
  contribution_note: string | null;
  attendee: { display_name: string | null } | null;
};

const CRAFT_NAMES: Record<string, { en: string; es: string }> = {
  'las-abejas':     { en: 'Bees',              es: 'Las Abejas' },
  'la-gallina':     { en: 'Hens',              es: 'La Gallina' },
  'el-pan':         { en: 'Bread',             es: 'El Pan' },
  'la-conserva':    { en: 'Preserving',        es: 'La Conserva' },
  'la-cisterna':    { en: 'Rainwater',         es: 'La Cisterna' },
  'la-azuela':      { en: 'Woodwork',          es: 'La Azuela' },
  'el-telar':       { en: 'Textiles',          es: 'El Telar' },
  'las-yerbas':     { en: 'Herbs',             es: 'Las Yerbas' },
  'el-huerto':      { en: 'Vegetable garden',  es: 'El Huerto' },
  'el-invernadero': { en: 'Greenhouse',        es: 'El Invernadero' },
  'la-milpa':       { en: 'Three-sisters field', es: 'La Milpa' },
  'el-rebano':      { en: 'Sheep',             es: 'El Rebaño' },
  'el-caldo':       { en: 'Broth & ferments',  es: 'El Caldo' },
  'la-mesa':        { en: 'Scratch cooking',   es: 'La Mesa' },
  'el-jabon':       { en: 'Soap',              es: 'El Jabón' },
  'el-candelero':   { en: 'Candles',           es: 'El Candelero' },
  'el-tractor':     { en: 'Land equipment',    es: 'El Tractor' },
  'la-regla':       { en: 'Homestead rhythm',  es: 'La Regla' },
  'las-medicinas':  { en: 'Natural medicine',  es: 'Las Medicinas' },
  'la-escuela':     { en: 'Home schooling',    es: 'La Escuela' },
  'el-jardin':      { en: 'Flower garden',     es: 'El Jardín' },
  'la-mano':        { en: 'Home repair',       es: 'La Mano' },
};

const CONTRIBUTION_LABELS: Record<string, { en: string; es: string }> = {
  time:      { en: 'time',       es: 'tiempo' },
  skill:     { en: 'a skill',    es: 'una habilidad' },
  food:      { en: 'food',       es: 'comida' },
  tools:     { en: 'tools',      es: 'herramientas' },
  materials: { en: 'materials',  es: 'materiales' },
  other:     { en: 'other',      es: 'otra cosa' },
};

export default function MiPerfil() {
  const { user, profile, loading: authLoading } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  const [parish, setParish] = useState<Parish | null>(null);
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [upcoming, setUpcoming] = useState<HostedWorkshop[]>([]);
  const [past, setPast] = useState<HostedWorkshop[]>([]);
  const [hostedRsvps, setHostedRsvps] = useState<Record<string, MyRsvpRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(buildPath('home', locale));
    }
  }, [authLoading, user, navigate, locale]);

  useEffect(() => {
    if (!authLoading && profile && (!profile.parish_id || !profile.bio)) {
      navigate(buildPath('bienvenido', locale));
    }
  }, [authLoading, profile, navigate, locale]);

  useEffect(() => {
    if (!user) return;
    const now = new Date().toISOString();
    (async () => {
      const [parishResult, expResult, upcomingResult, pastResult] = await Promise.all([
        profile?.parish_id
          ? supabase.from('parishes').select('*').eq('id', profile.parish_id).maybeSingle()
          : Promise.resolve({ data: null, error: null } as const),
        supabase
          .from('expertise')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at'),
        supabase
          .from('workshops')
          .select('id, title, held_at, location_text')
          .eq('host_id', user.id)
          .eq('status', 'approved')
          .gte('held_at', now)
          .order('held_at', { ascending: true }),
        supabase
          .from('workshops')
          .select('id, title, held_at, location_text')
          .eq('host_id', user.id)
          .eq('status', 'approved')
          .lt('held_at', now)
          .order('held_at', { ascending: false })
          .limit(20),
      ]);
      if (parishResult.data) setParish(parishResult.data);
      if (expResult.data) setExpertise(expResult.data);
      if (upcomingResult.data) setUpcoming(upcomingResult.data);
      if (pastResult.data) setPast(pastResult.data);

      // For each upcoming workshop I'm hosting, fetch RSVPs
      if (upcomingResult.data && upcomingResult.data.length > 0) {
        const workshopIds = upcomingResult.data.map((w) => w.id);
        const { data: rsvpData } = await supabase
          .from('rsvps')
          .select(
            'id, workshop_id, contribution_type, contribution_note, attendee:profiles!rsvps_profile_id_fkey(display_name)'
          )
          .in('workshop_id', workshopIds)
          .order('created_at', { ascending: true });

        if (rsvpData) {
          const grouped: Record<string, MyRsvpRow[]> = {};
          for (const r of rsvpData as unknown as MyRsvpRow[]) {
            (grouped[r.workshop_id] ||= []).push(r);
          }
          setHostedRsvps(grouped);
        }
      }

      setLoading(false);
    })();
  }, [user, profile?.parish_id]);

  if (authLoading || loading || !profile) {
    return (
      <Layout>
        <div className="container-narrow py-16 text-center font-serif text-mesquite/60">
          …
        </div>
      </Layout>
    );
  }

  const craftLabel = (slug: string) => CRAFT_NAMES[slug]?.[locale] ?? slug;
  const contribLabel = (slug: string) => CONTRIBUTION_LABELS[slug]?.[locale] ?? slug;

  const hasAnyRsvps = Object.values(hostedRsvps).some((rs) => rs.length > 0);

  return (
    <Layout>
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

        {/* Sharing */}
        {expertise.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 display-caps text-xs tracking-[0.2em] text-ocre">
              {t(uiStrings.profile.sharingLabel)}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {expertise.map((e) => (
                <li
                  key={e.id}
                  className="rounded-sm border border-mesquite/20 bg-cal/60 px-3 py-1.5 font-heading text-sm text-mesquite"
                >
                  {craftLabel(e.craft)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Building */}
        {profile.working_on && (
          <section className="mb-12">
            <h2 className="mb-3 display-caps text-xs tracking-[0.2em] text-ocre">
              {t(uiStrings.profile.workingOnLabel)}
            </h2>
            <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-mesquite">
              {profile.working_on}
            </p>
          </section>
        )}

        {/* Learning */}
        {profile.wants_to_learn && (
          <section className="mb-12">
            <h2 className="mb-3 display-caps text-xs tracking-[0.2em] text-ocre">
              {t(uiStrings.profile.wantsToLearnLabel)}
            </h2>
            <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-mesquite">
              {profile.wants_to_learn}
            </p>
          </section>
        )}

        {/* Bio */}
        {profile.bio && (
          <section className="mb-12">
            <h2 className="mb-3 display-caps text-xs tracking-[0.2em] text-ocre">
              {t(uiStrings.profile.offeringLabel)}
            </h2>
            <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-mesquite">
              {profile.bio}
            </p>
          </section>
        )}

        {/* Upcoming gatherings I'm hosting */}
        {upcoming.length > 0 && (
          <section className="mb-12 border-t border-mesquite/10 pt-10">
            <h2 className="mb-4 font-heading text-xl text-mesquite">
              {t(uiStrings.profile.upcomingWorkshops)}
            </h2>
            <ul className="space-y-4">
              {upcoming.map((w) => (
                <li key={w.id}>
                  <Link
                    to={buildPath('tallerDetail', locale, { id: w.id })}
                    className="font-heading text-lg text-mesquite no-underline hover:text-ocre"
                    style={{ textDecoration: 'none' }}
                  >
                    {w.title}
                  </Link>
                  <p className="text-sm text-piedra">
                    {new Date(w.held_at).toLocaleDateString(
                      locale === 'es' ? 'es-MX' : 'en-US',
                      { month: 'long', day: 'numeric', year: 'numeric' }
                    )}
                    {w.location_text ? ` — ${w.location_text}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Host RSVP view — who's coming, what they're bringing */}
        {hasAnyRsvps && (
          <section className="mb-12 rounded-sm border border-ocre/20 bg-ocre/5 p-6">
            <h2 className="mb-4 font-heading text-xl text-mesquite">
              {t(uiStrings.profile.hostRsvpSummary)}
            </h2>
            <div className="space-y-6">
              {upcoming.map((w) => {
                const rs = hostedRsvps[w.id] ?? [];
                if (rs.length === 0) return null;
                return (
                  <div key={w.id}>
                    <h3 className="mb-2 font-heading text-base text-mesquite">{w.title}</h3>
                    <ul className="space-y-2 pl-4">
                      {rs.map((r) => (
                        <li key={r.id} className="font-serif text-sm text-mesquite">
                          <span className="font-heading">{r.attendee?.display_name ?? '—'}</span>
                          <span className="italic text-piedra">
                            {' '}— {contribLabel(r.contribution_type)}
                          </span>
                          {r.contribution_note && (
                            <span className="block pl-4 text-xs italic text-mesquite/70">
                              “{r.contribution_note}”
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Past gatherings I've hosted */}
        {past.length > 0 && (
          <section className="mb-12 border-t border-mesquite/10 pt-10">
            <h2 className="mb-4 font-heading text-xl text-mesquite">
              {t(uiStrings.profile.pastWorkshops)}
            </h2>
            <ul className="space-y-3">
              {past.map((w) => (
                <li key={w.id} className="flex items-baseline justify-between gap-4">
                  <Link
                    to={buildPath('tallerDetail', locale, { id: w.id })}
                    className="font-heading text-base text-mesquite no-underline hover:text-ocre"
                    style={{ textDecoration: 'none' }}
                  >
                    {w.title}
                  </Link>
                  <span className="font-mono text-xs italic text-piedra/70">
                    {new Date(w.held_at).toLocaleDateString(
                      locale === 'es' ? 'es-MX' : 'en-US',
                      { month: 'short', day: 'numeric', year: 'numeric' }
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 border-t border-mesquite/10 pt-6">
          <Link
            to={`${buildPath('bienvenido', locale)}?redo=1`}
            className="font-serif text-sm italic text-mesquite/60 transition hover:text-mesquite"
          >
            {t({ en: '← Edit my profile', es: '← Editar mi perfil' })}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
