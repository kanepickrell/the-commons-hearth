// src/components/testimonio/MonthSummaries.tsx
// Admin-curated gathering summaries for one month of the Year Wheel. Renders in
// the month column on the Witness page, above the photo carousel. Reads
// public.month_summaries for the given (year, month) — month is 0-indexed —
// and renders nothing when the month has no summaries. Public read, so it works
// for signed-out visitors.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MonthSummary = {
  id: string;
  title: string | null;
  body: string;
  sort_order: number;
};

type Props = {
  year: number;
  month: number; // 0-indexed (0 = January)
};

export const MonthSummaries = ({ year, month }: Props) => {
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('month_summaries')
        .select('id, title, body, sort_order')
        .eq('year', year)
        .eq('month', month)
        .order('sort_order', { ascending: true });
      if (!active) return;
      if (error) {
        console.error('Failed to load month summaries:', error);
        setSummaries([]);
      } else {
        setSummaries((data ?? []) as MonthSummary[]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [year, month]);

  if (loading || summaries.length === 0) return null;

  return (
    <div className="mt-8 space-y-6 border-t border-mesquite/10 pt-6">
      {summaries.map((s) => (
        <article key={s.id}>
          {s.title && (
            <h4 className="font-heading text-lg text-mesquite">{s.title}</h4>
          )}
          <p className="mt-1 whitespace-pre-wrap font-serif text-base leading-relaxed text-mesquite">
            {s.body}
          </p>
        </article>
      ))}
    </div>
  );
};