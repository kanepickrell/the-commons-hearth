// src/pages/MemberDetail.tsx
// One member's public profile — structured around the three questions:
//   Sharing (crafts) · Building (working_on) · Learning (wants_to_learn) · Bio
// Plus upcoming + past gatherings they host.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { LanguageNote } from '@/components/LanguageNote';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import type { IconSlug } from '@/lib/types';

type DetailRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  working_on: string | null;
  wants_to_learn: string | null;
  bio_language: 'en' | 'es' | null;
  icon_slug: IconSlug | null;
  parish: { name: string; city: string | null } | null;
};

type Expertise = { id: string; craft: string };

type HostedWorkshop = {
  id: string;
  title: string;
  held_at: string;
  location_text: string | null;
};

// Kept in sync with the craft enum. Used for friendly display labels.
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

const MemberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const s = uiStrings.profile;

  const [member, setMember] = useState<DetailRow | null>(null);
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [upcoming, setUpcoming] = useState<HostedWorkshop[]>([]);
  const [past, setPast] = useState<HostedWorkshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const now = new Date().toISOString();
    (async () => {
      const [profileResult, expertiseResult, upcomingResult, pastResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'id, display_name, bio, working_on, wants_to_learn, bio_language, icon_slug, parish:parishes(name, city)'
          )
          .eq('id', id)
          .eq('status', 'approved')
          .maybeSingle(),
        supabase
          .from('expertise')
          .select('id, craft')
          .eq('profile_id', id)
          .order('created_at'),
        supabase
          .from('workshops')
          .select('id, title, held_at, location_text')
          .eq('host_id', id)
          .eq('status', 'approved')
          .gte('held_at', now)
          .order('held_at', { ascending: true }),
        supabase
          .from('workshops')
          .select('id, title, held_at, location_text')
          .eq('host_id', id)
          .eq('status', 'approved')
          .lt('held_at', now)
          .order('held_at', { ascending: false })
          .limit(10),
      ]);

      if (profileResult.data) setMember(profileResult.data as unknown as DetailRow);
      if (expertiseResult.data) setExpertise(expertiseResult.data);
      if (upcomingResult.data) setUpcoming(upcomingResult.data);
      if (pastResult.data) setPast(pastResult.data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container-prose py-32 text-center font-serif italic text-piedra/60">…</div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout>
        <div className="container-prose py-32 text-center">
          <p className="font-heading italic text-piedra">
            {locale === 'es' ? 'Miembro no encontrado.' : 'Member not found.'}
          </p>
          <Link to={buildPath('vision', locale)} className="mt-4 inline-block">
            {t(uiStrings.common.backToVision)}
          </Link>
        </div>
      </Layout>
    );
  }

  const craftLabel = (slug: string) =>
    CRAFT_NAMES[slug] ? CRAFT_NAMES[slug][locale] : slug;

  return (
    <Layout>
      <article className="container-prose py-20">
        <header className="flex flex-col items-center text-center">
          {member.icon_slug && <Icon slug={member.icon_slug} size={120} locale={locale} />}
          <h1 className="mt-8 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
            {member.display_name ?? '—'}
          </h1>
          {member.parish && (
            <p className="mt-3 text-base text-piedra">
              {member.parish.name}
              {member.parish.city ? ` · ${member.parish.city}` : ''}
            </p>
          )}
        </header>

        <div className="rule mt-12" />

        <section className="mt-12 space-y-12">
          {/* Sharing — crafts */}
          {expertise.length > 0 && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.sharingLabel)}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {expertise.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-sm border border-mesquite/20 bg-cal/60 px-3 py-1.5 font-heading text-sm text-mesquite"
                  >
                    {craftLabel(e.craft)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Building — working_on */}
          {member.working_on && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.workingOnLabel)}
              </h2>
              <p className="prose-body mt-4 text-xl text-mesquite">
                {member.working_on}
                <LanguageNote contentLanguage={member.bio_language} className="ml-2" />
              </p>
            </div>
          )}

          {/* Learning — wants_to_learn */}
          {member.wants_to_learn && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.wantsToLearnLabel)}
              </h2>
              <p className="prose-body mt-4 text-xl text-mesquite">
                {member.wants_to_learn}
                <LanguageNote contentLanguage={member.bio_language} className="ml-2" />
              </p>
            </div>
          )}

          {/* Bio — the longer narrative */}
          {member.bio && (
            <div>
              <h2 className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(s.offeringLabel)}
              </h2>
              <p className="prose-body mt-4 text-xl text-mesquite">
                {member.bio}
                <LanguageNote contentLanguage={member.bio_language} className="ml-2" />
              </p>
            </div>
          )}
        </section>

        {upcoming.length > 0 && (
          <>
            <div className="rule mt-16" />
            <section className="mt-12">
              <h2 className="font-heading text-xl text-mesquite">{t(s.upcomingWorkshops)}</h2>
              <ul className="mt-6 space-y-4">
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
          </>
        )}

        {past.length > 0 && (
          <>
            <div className="rule mt-16" />
            <section className="mt-12">
              <h2 className="font-heading text-xl text-mesquite">{t(s.pastWorkshops)}</h2>
              <ul className="mt-6 space-y-3">
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
          </>
        )}
      </article>
    </Layout>
  );
};

export default MemberDetail;
