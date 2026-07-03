// src/components/admin/MonthSummaryPanel.tsx
// Admin panel for /mayordomo. Add + manage the "gathering summaries" that show
// under each month on the Year Wheel (Witness page), beside the photo carousel.
//
// Rows live in public.month_summaries (public read, admin write — same shape as
// month_photos). Month is 0-indexed (0 = January) to match the wheel.

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { toast } from '@/hooks/use-toast';

type MonthSummary = {
  id: string;
  year: number;
  month: number;
  title: string | null;
  body: string;
  sort_order: number;
  created_at: string;
};

export const MonthSummaryPanel = () => {
  const { locale } = useLocale();
  const monthNames = locale === 'es' ? uiStrings.months.es : uiStrings.months.en;

  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth());
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('month_summaries')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('sort_order', { ascending: true });
    if (error) {
      toast({ title: 'Failed to load summaries', description: error.message });
      setSummaries([]);
    } else {
      setSummaries((data ?? []) as MonthSummary[]);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!body.trim()) {
      toast({ title: locale === 'es' ? 'Escribe un resumen' : 'Write a summary' });
      return;
    }
    setSaving(true);
    try {
      const nextSort = summaries.length ? Math.max(...summaries.map((s) => s.sort_order)) + 1 : 0;
      const { error } = await supabase.from('month_summaries').insert({
        year,
        month,
        title: title.trim() || null,
        body: body.trim(),
        sort_order: nextSort,
      });
      if (error) throw error;
      toast({ title: locale === 'es' ? 'Resumen añadido' : 'Summary added' });
      setTitle('');
      setBody('');
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: locale === 'es' ? 'No se pudo guardar' : 'Could not save', description: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('month_summaries').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message });
      return;
    }
    toast({ title: locale === 'es' ? 'Resumen eliminado' : 'Summary removed' });
    await load();
  };

  const handleSave = async (id: string, nextTitle: string, nextBody: string, nextSort: number) => {
    if (!nextBody.trim()) {
      toast({ title: locale === 'es' ? 'El resumen no puede quedar vacío' : 'Summary can’t be empty' });
      return;
    }
    const { error } = await supabase
      .from('month_summaries')
      .update({ title: nextTitle.trim() || null, body: nextBody.trim(), sort_order: nextSort })
      .eq('id', id);
    if (error) {
      toast({ title: 'Failed to save', description: error.message });
      return;
    }
    toast({ title: locale === 'es' ? 'Guardado' : 'Saved' });
    await load();
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-mesquite">
          {locale === 'es' ? 'Resúmenes de reuniones' : 'Gathering summaries'}
        </h2>
        <p className="mt-2 font-serif text-sm italic text-piedra">
          {locale === 'es'
            ? 'Escribe un resumen de las reuniones del mes. Aparece bajo el mes en la rueda del año, junto a las fotos.'
            : 'Write a summary of the month’s gatherings. It appears under the month on the Year Wheel, alongside the photos.'}
        </p>
      </div>

      {/* Year + month picker */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="display-caps mb-2 block text-[10px] tracking-[0.2em] text-mesquite/50">
            {locale === 'es' ? 'AÑO' : 'YEAR'}
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || now.getFullYear())}
            className="w-28 rounded-sm border border-mesquite/20 bg-cal px-3 py-1.5 font-mono text-sm text-mesquite focus:border-mesquite focus:outline-none"
          />
        </div>
        <div>
          <label className="display-caps mb-2 block text-[10px] tracking-[0.2em] text-mesquite/50">
            {locale === 'es' ? 'MES' : 'MONTH'}
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="rounded-sm border border-mesquite/20 bg-cal px-3 py-1.5 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add form */}
      <div className="rounded-sm border border-mesquite/15 bg-cal/40 p-4">
        <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-ocre">
          {locale === 'es' ? 'AÑADIR RESUMEN' : 'ADD A SUMMARY'}
        </p>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={locale === 'es' ? 'Título (opcional)' : 'Title (optional)'}
            className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder={locale === 'es' ? 'Qué pasó este mes…' : 'What happened this month…'}
            className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm leading-relaxed text-mesquite focus:border-mesquite focus:outline-none"
          />
          <div>
            <button
              onClick={handleAdd}
              disabled={!body.trim() || saving}
              className="inline-flex items-center gap-2 rounded-sm bg-ocre px-5 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? locale === 'es' ? 'Guardando…' : 'Saving…'
                : locale === 'es' ? 'Añadir' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* Existing summaries for this month */}
      <div>
        <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-mesquite/50">
          {(locale === 'es' ? 'EN' : 'IN')} {monthNames[month].toUpperCase()} {year}
        </p>
        {loading ? (
          <p className="font-serif italic text-piedra">…</p>
        ) : summaries.length === 0 ? (
          <p className="font-serif italic text-piedra">
            {locale === 'es' ? 'Todavía no hay resúmenes para este mes.' : 'No summaries for this month yet.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {summaries.map((s) => (
              <SummaryCard
                key={s.id}
                summary={s}
                onDelete={() => handleDelete(s.id)}
                onSave={(ti, bo, so) => handleSave(s.id, ti, bo, so)}
                locale={locale}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// SummaryCard — inline edit title/body/sort + delete
// ---------------------------------------------------------------------------
function SummaryCard({
  summary,
  onDelete,
  onSave,
  locale,
}: {
  summary: MonthSummary;
  onDelete: () => void;
  onSave: (title: string, body: string, sortOrder: number) => void;
  locale: 'en' | 'es';
}) {
  const [title, setTitle] = useState(summary.title ?? '');
  const [body, setBody] = useState(summary.body);
  const [sortOrder, setSortOrder] = useState<number>(summary.sort_order);

  const dirty =
    title !== (summary.title ?? '') || body !== summary.body || sortOrder !== summary.sort_order;

  return (
    <li className="space-y-2 rounded-sm border border-mesquite/20 bg-cal/60 p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={locale === 'es' ? 'Título' : 'Title'}
        className="w-full rounded-sm border border-mesquite/20 bg-cal px-2 py-1 font-heading text-sm text-mesquite focus:border-mesquite focus:outline-none"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full rounded-sm border border-mesquite/20 bg-cal px-2 py-1 font-serif text-sm leading-relaxed text-mesquite focus:border-mesquite focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 font-serif text-xs text-piedra">
          {locale === 'es' ? 'Orden' : 'Order'}
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            className="w-16 rounded-sm border border-mesquite/20 bg-cal px-2 py-1 font-mono text-xs text-mesquite focus:border-mesquite focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(title, body, sortOrder)}
            disabled={!dirty}
            className="font-serif text-xs text-ocre transition hover:underline disabled:opacity-40"
          >
            {locale === 'es' ? 'guardar' : 'save'}
          </button>
          <button
            onClick={onDelete}
            className="font-serif text-xs text-mesquite/60 transition hover:text-rojo"
          >
            {locale === 'es' ? 'eliminar' : 'delete'}
          </button>
        </div>
      </div>
    </li>
  );
}