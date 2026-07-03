// src/lib/segments.ts
// Read/write helpers for chapter "community area" segments (the `regions`
// table). Kept in one place so the untyped-table casts live here and the rest
// of the app sees a clean typed surface.
//
// The generated database.types.ts doesn't yet include `regions`, so we cast the
// client to `any` inside this module only. Regenerate types
// (`supabase gen types typescript`) and this cast can go away.

import { supabase } from '@/lib/supabase';

export type ChapterSegment = {
  id?: string;
  name: string;
  color: string;
  ring: [number, number][]; // [lat, lng] pairs
  sort_order?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export async function listSegments(): Promise<ChapterSegment[]> {
  const { data, error } = await sb
    .from('regions')
    .select('id, name, color, ring, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load regions:', error);
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    ring: r.ring,
    sort_order: r.sort_order,
  }));
}

// The set is small and admin-curated, so we replace it wholesale on save:
// clear the table, then insert the current areas in order. Simpler and less
// error-prone than diffing individual rows.
export async function replaceSegments(
  segs: ChapterSegment[]
): Promise<{ error: string | null }> {
  const del = await sb.from('regions').delete().not('id', 'is', null);
  if (del.error) return { error: del.error.message };

  if (segs.length === 0) return { error: null };

  const rows = segs.map((s, i) => ({
    name: s.name || 'Untitled',
    color: s.color,
    ring: s.ring,
    sort_order: i,
  }));
  const ins = await sb.from('regions').insert(rows);
  return { error: ins.error ? ins.error.message : null };
}