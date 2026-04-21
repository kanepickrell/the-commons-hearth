// src/pages/Talleres.tsx
// Upcoming approved workshops, ordered by date.
// Empty until approved workshops exist in the DB.

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

type WorkshopRow = {
  id: string;
  title: string;
  description: string | null;
  language: 'en' | 'es' | null;
  craft: IconSlug | null;
  held_at: string;
  location_text: string | null;
  host: { id: string; display_name: string | null } | null;
};

const Talleres = () => {
  const { t, locale } = useLocale();
  const [workshops, setWorkshops] = useState<WorkshopRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('workshops')
        .select(
          'id, title, description, language, craft, held_at, location_text, host:profiles!workshops_host_id_fkey(id, display_name)'
        )
        .eq('status', 'approved')
        .gte('held_at', new Date().toISOString())
        .order('held_at', { ascending: true });

      if (error) {
        console.error('Failed to load workshops:', error);
      } else if (data) {
        setWorkshops(data as unknown as WorkshopRow[]);
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
              : 'Real gatherings, in real places, with real hosts.'}
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
                      {new Date(w.held_at).toLocaleDateString(
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
                      {w.host?.display_name ?? '—'}
                      {w.location_text ? ` · ${w.location_text}` : ''}
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