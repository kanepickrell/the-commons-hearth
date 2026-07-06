// src/pages/Talleres.tsx
// Upcoming approved gatherings, ordered by date.
// Reads the redacting view: anon sees the day, parish, and host, but the
// exact time and address of UPCOMING gatherings are gated to members.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { LanguageNote } from '@/components/LanguageNote';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import type { IconSlug } from '@/lib/types';

type GatheringRow = {
  id: string;
  title: string;
  description: string | null;
  language: 'en' | 'es' | null;
  craft: IconSlug | null;
  event_date: string;            // 'YYYY-MM-DD', always present
  held_at: string | null;        // exact time — null when gated
  location_text: string | null;  // address — null when gated
  host_name: string | null;
  details_visible: boolean;
};

const Talleres = () => {
  const { t, locale } = useLocale();
  const [workshops, setWorkshops] = useState<GatheringRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
      const { data, error } = await supabase
        .from('gatherings_public')
        .select(
          'id, title, description, language, craft, event_date, held_at, location_text, host_name, details_visible'
        )
        .gte('event_date', today)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Failed to load gatherings:', error);
      } else if (data) {
        setWorkshops(data as unknown as GatheringRow[]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <section className="container-prose pb-24 pt-20">
        <header className="mb-16 text-center">
          <p className="display-caps text-xs tracking-[0.3em] text-ocre">
            {t(uiStrings.eyebrow.theWorkshop)}
          </p>
          <h1 className="mt-6 font-heading text-4xl leading-tight text-mesquite md:text-5xl">
            {t(uiStrings.workshop.upcoming)}
          </h1>
          <p className="prose-body mt-6 italic text-piedra">
            {locale === 'es'
              ? 'Reuniones reales, en lugares reales, con anfitriones reales.'
              : 'Monthly skill & education events for our local chapter.'}
          </p>
        </header>

        <div className="rule" />

        {loading ? (
          <p className="mt-20 text-center font-serif italic text-piedra/60">…</p>
        ) : workshops.length === 0 ? (
          <p className="mx-auto mt-20 max-w-md text-center font-serif italic text-piedra">
            {locale === 'es'
              ? 'Todavía no hay reuniones anunciadas. Los anfitriones están preparando.'
              : 'No gatherings announced yet. Hosts are preparing.'}
          </p>
        ) : (
          <ul className="mt-16 space-y-16">
            {workshops.map((w) => (
              <li key={w.id}>
                <Link
                  to={buildPath('tallerDetail', locale, { id: w.id })}
                  className="group flex gap-6 no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex-shrink-0 pt-1">
                    {w.craft && <Icon slug={w.craft} size={88} locale={locale} />}
                  </div>
                  <div className="flex-1">
                    <p className="display-caps text-xs tracking-[0.2em] text-ocre">
                      {new Date(`${w.event_date}T00:00:00`).toLocaleDateString(
                        locale === 'es' ? 'es-MX' : 'en-US',
                        { weekday: 'long', month: 'long', day: 'numeric' }
                      )}
                    </p>
                    <h2 className="mt-2 font-heading text-2xl leading-snug text-mesquite group-hover:text-ocre">
                      {w.title}
                    </h2>
                    {w.description && (
                      <p className="prose-body mt-4 text-[1.05rem] leading-relaxed text-mesquite/90">
                        {w.description}
                        <LanguageNote contentLanguage={w.language} className="ml-2" />
                      </p>
                    )}
                    <p className="mt-4 text-sm italic text-piedra">
                      {t(uiStrings.workshop.hostedBy)}{' '}
                      {w.host_name ?? '—'}
                      {w.details_visible
                        ? w.location_text
                          ? ` · ${w.location_text}`
                          : ''
                        : ` · ${
                            locale === 'es'
                              ? 'lugar y hora visibles para miembros'
                              : 'location & time shown to members'
                          }`}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
};

export default Talleres;