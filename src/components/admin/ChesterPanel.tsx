// src/components/admin/ChesterPanel.tsx
// Admin panel for /mayordomo. Two things:
//   1. Chester's notes (chester_knowledge) — the chapter facts he answers from.
//      Edit a note, toggle it off, reorder, or add a new one; changes reach
//      Chester on his next answer (the function reads the table each request,
//      with a one-hour prompt cache keyed on the text).
//   2. Recent conversations (chester_messages) — what visitors are actually
//      asking, so stewards can spot gaps and write a note for them.

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/i18n/LocaleProvider';
import { toast } from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/dates';
import type { Database } from '@/lib/database.types';

type Note = Database['public']['Tables']['chester_knowledge']['Row'];
type Msg = Database['public']['Tables']['chester_messages']['Row'];

const inputClass =
  'w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none';

export const ChesterPanel = () => {
  const { locale, t } = useLocale();
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const [n, m] = await Promise.all([
      supabase.from('chester_knowledge').select('*').order('sort_order', { ascending: true }),
      supabase.from('chester_messages').select('*').order('created_at', { ascending: false }).limit(120),
    ]);
    if (n.error) toast({ title: 'Could not load Chester notes', description: n.error.message, variant: 'destructive' });
    if (m.error) toast({ title: 'Could not load Chester conversations', description: m.error.message, variant: 'destructive' });
    setNotes(n.data ?? []);
    setMessages(m.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="font-serif italic text-piedra">…</p>;

  // Group the log by session, newest session first.
  const sessions = new Map<string, Msg[]>();
  for (const m of messages) (sessions.get(m.session_id) ?? sessions.set(m.session_id, []).get(m.session_id)!).push(m);
  const sessionList = Array.from(sessions.values()).map((ms) => ms.slice().reverse());

  return (
    <section className="space-y-10">
      <div>
        <h2 className="font-heading text-3xl text-mesquite md:text-4xl">Chester</h2>
        <p className="mt-2 font-serif text-lg italic text-mesquite/70">
          {t({
            en: 'The notes Chester answers from, and what visitors have been asking him. Keep the notes factual and current — he will not invent what they leave out.',
            es: 'Las notas con las que responde Chester, y lo que los visitantes le han preguntado. Mantén las notas precisas y al día — no inventará lo que falte.',
          })}
        </p>
      </div>

      {/* ---------------- Notes ---------------- */}
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-heading text-xl text-mesquite">{t({ en: 'Notes', es: 'Notas' })}</h3>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="font-serif text-sm italic text-ocre transition hover:text-mesquite"
          >
            {adding ? t({ en: 'cancel', es: 'cancelar' }) : `+ ${t({ en: 'new note', es: 'nueva nota' })}`}
          </button>
        </div>

        {adding && (
          <NoteEditor
            note={null}
            nextSort={(notes[notes.length - 1]?.sort_order ?? 0) + 10}
            onDone={async () => { setAdding(false); await load(); }}
          />
        )}

        <ul className="divide-y divide-mesquite/10 border-y border-mesquite/10">
          {notes.map((n) => {
            const isOpen = expanded === n.id;
            return (
              <li key={n.id} className="py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <button onClick={() => setExpanded(isOpen ? null : n.id)} className="flex-1 text-left">
                    <span className={`font-heading text-lg ${n.enabled ? 'text-mesquite' : 'text-mesquite/40 line-through'}`}>{n.title}</span>
                    <span className="ml-2 font-mono text-xs text-mesquite/40">{n.slug}</span>
                    {n.slug === 'leadership' && n.body.includes('[STEWARDS:') && (
                      <span className="ml-2 rounded-full bg-rojo/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-rojo">
                        {t({ en: 'needs filling in', es: 'falta completar' })}
                      </span>
                    )}
                  </button>
                  <span className="font-serif text-xs italic text-piedra/60">
                    {formatDateTime(n.updated_at, locale)} · {isOpen ? '▲' : '▼'}
                  </span>
                </div>
                {isOpen && (
                  <NoteEditor key={n.id} note={n} nextSort={n.sort_order} onDone={async () => { setExpanded(null); await load(); }} />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---------------- Conversations ---------------- */}
      <div>
        <h3 className="mb-3 font-heading text-xl text-mesquite">
          {t({ en: 'Recent conversations', es: 'Conversaciones recientes' })}
          <span className="ml-2 font-serif text-sm italic text-piedra">
            {t({ en: 'last 120 messages', es: 'últimos 120 mensajes' })}
          </span>
        </h3>
        {sessionList.length === 0 ? (
          <p className="font-serif italic text-piedra">{t({ en: 'Nobody has asked Chester anything yet.', es: 'Nadie le ha preguntado nada a Chester todavía.' })}</p>
        ) : (
          <ul className="space-y-4">
            {sessionList.map((ms) => (
              <li key={ms[0].session_id} className="rounded-sm border border-mesquite/15 bg-cal/40 p-4">
                <p className="mb-2 font-mono text-[11px] text-mesquite/40">
                  {formatDateTime(ms[0].created_at, locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  {' · '}{ms[0].lang ?? '—'}
                </p>
                <div className="space-y-2">
                  {ms.map((m) => (
                    <p key={m.id} className={`whitespace-pre-wrap font-serif text-sm leading-relaxed ${m.role === 'user' ? 'text-mesquite' : 'pl-4 text-mesquite/70'}`}>
                      <span className="font-heading text-xs uppercase tracking-wide text-ocre">{m.role === 'user' ? t({ en: 'Visitor', es: 'Visitante' }) : 'Chester'}</span>{' '}
                      {m.content}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// NoteEditor — edit one note, or create one when `note` is null.
// ---------------------------------------------------------------------------
function NoteEditor({ note, nextSort, onDone }: { note: Note | null; nextSort: number; onDone: () => Promise<void> }) {
  const { t } = useLocale();
  const [slug, setSlug] = useState(note?.slug ?? '');
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [sort, setSort] = useState(String(note?.sort_order ?? nextSort));
  const [enabled, setEnabled] = useState(note?.enabled ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    if (!s || title.trim().length < 2 || body.trim().length < 10) {
      toast({ title: t({ en: 'Slug, title and a real body are required', es: 'Se requieren slug, título y un cuerpo real' }), variant: 'destructive' });
      return;
    }
    setSaving(true);
    const row = { slug: s, title: title.trim(), body: body.trim(), sort_order: Number(sort) || 0, enabled };
    const res = note
      ? await supabase.from('chester_knowledge').update(row).eq('id', note.id)
      : await supabase.from('chester_knowledge').insert(row);
    setSaving(false);
    if (res.error) {
      toast({ title: t({ en: 'Could not save', es: 'No pudimos guardar' }), description: res.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: t({ en: 'Note saved — Chester will use it on his next answer', es: 'Nota guardada — Chester la usará en su próxima respuesta' }) });
    await onDone();
  };

  const remove = async () => {
    if (!note) return;
    if (!window.confirm(t({ en: `Delete “${note.title}”?`, es: `¿Eliminar “${note.title}”?` }))) return;
    const { error } = await supabase.from('chester_knowledge').delete().eq('id', note.id);
    if (error) {
      toast({ title: t({ en: 'Could not delete', es: 'No pudimos eliminar' }), description: error.message, variant: 'destructive' });
      return;
    }
    await onDone();
  };

  return (
    <div className="mt-3 space-y-3 rounded-sm bg-cal/40 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem_auto]">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" disabled={!!note} className={`${inputClass} font-mono disabled:opacity-60`} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t({ en: 'Title', es: 'Título' })} className={inputClass} />
        <input value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" placeholder="order" className={`${inputClass} font-mono`} />
        <label className="flex items-center gap-2 font-serif text-sm text-mesquite">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          {t({ en: 'on', es: 'activa' })}
        </label>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={Math.min(24, Math.max(6, body.split('\n').length + 1))}
        className={`${inputClass} font-mono text-[13px] leading-relaxed`}
      />
      <div className="flex items-center justify-between">
        {note ? (
          <button type="button" onClick={remove} className="font-serif text-xs italic text-mesquite/50 transition hover:text-rojo">
            {t({ en: 'delete note', es: 'eliminar nota' })}
          </button>
        ) : <span />}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-sm bg-ocre px-5 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:opacity-40"
        >
          {saving ? t({ en: 'Saving…', es: 'Guardando…' }) : t({ en: 'Save', es: 'Guardar' })}
        </button>
      </div>
    </div>
  );
}
