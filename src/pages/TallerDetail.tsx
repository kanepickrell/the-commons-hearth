// src/pages/TallerDetail.tsx
// One workshop, with host link and (placeholder) RSVP counter.
// RSVP action is not yet wired to the DB — that's for the workshop-creation pass.

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

type WorkshopDetail = {
  id: string;
  title: string;
  description: string | null;
  language: 'en' | 'es' | null;
  craft: IconSlug | null;
  held_at: string;
  location_text: string | null;
  host: { id: string; display_name: string | null } | null;
};

const TallerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();

  const [w, setW] = useState<WorkshopDetail | null>(null);
  const [rsvpCount, setRsvpCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [workshopResult, countResult] = await Promise.all([
        supabase
          .from('workshops')
          .select(
            'id, title, description, language, craft, held_at, location_text, host:profiles!workshops_host_id_fkey(id, display_name)'
          )
          .eq('id', id)
          .eq('status', 'approved')
          .maybeSingle(),
        supabase
          .from('rsvps')
          .select('id', { count: 'exact', head: true })
          .eq('workshop_id', id),
      ]);

      if (workshopResult.error) {
        console.error('Failed to load workshop:', workshopResult.error);
      } else if (workshopResult.data) {
        setW(workshopResult.data as unknown as WorkshopDetail);
      }

      if (countResult.count !== null) {
        setRsvpCount(countResult.count);
      }

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

  if (!w) {
    return (
      <Layout>
        <div className="container-prose py-32 text-center">
          <p className="font-heading italic text-piedra">
            {locale === 'es' ? 'Taller no encontrado.' : 'Workshop not found.'}
          </p>
          <Link to={buildPath('talleres', locale)} className="mt-4 inline-block">
            {t(uiStrings.common.backToTalleres)}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container-prose py-20">
        <Link to={buildPath('talleres', locale)} className="text-sm">
          {t(uiStrings.common.backToTalleres)}
        </Link>

        <header className="mt-10 flex flex-col items-center text-center">
          {w.craft && <Icon slug={w.craft} size={96} locale={locale} />}
          <p className="mt-6 display-caps text-xs tracking-[0.2em] text-ocre">
            {new Date(w.held_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight text-mesquite">{w.title}</h1>
        </header>

        <div className="rule mt-12" />

        {w.description && (
          <p className="prose-body mt-10 text-xl text-mesquite">
            {w.description}
            <LanguageNote contentLanguage={w.language} className="ml-2" />
          </p>
        )}

        <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {w.host && (
            <div>
              <dt className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(uiStrings.workshop.hostedBy)}
              </dt>
              <dd className="mt-2 font-heading text-lg text-mesquite">
                <Link
                  to={buildPath('ofrendaDetail', locale, { id: w.host.id })}
                  className="no-underline hover:text-ocre"
                  style={{ textDecoration: 'none' }}
                >
                  {w.host.display_name ?? '—'}
                </Link>
              </dd>
            </div>
          )}
          {w.location_text && (
            <div>
              <dt className="display-caps text-xs tracking-[0.2em] text-ocre">
                {t(uiStrings.workshop.location)}
              </dt>
              <dd className="mt-2 font-heading text-lg text-mesquite">{w.location_text}</dd>
            </div>
          )}
        </dl>

        <div className="mt-14 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="border border-ocre bg-ocre px-8 py-3 font-heading text-lg text-cal transition-colors hover:bg-mesquite hover:border-mesquite"
          >
            {t(uiStrings.workshop.rsvp)}
          </button>
          <p className="text-sm italic text-piedra">
            {rsvpCount} {t(uiStrings.workshop.rsvpCount)}
          </p>
        </div>
      </article>
    </Layout>
  );
};

export default TallerDetail;