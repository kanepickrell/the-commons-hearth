// src/lib/annotations.ts
// Read/write helpers for `map_annotations` — the shapes, lines and labels a
// Mayordomo draws on the parish map. See
// supabase/sql/2026-10-16_map_annotations.sql for the table and its RLS.
//
// Deliberately separate from `regions` (src/lib/segments.ts): regions are the
// chapter's named territories, replaced wholesale on save; these are
// marginalia, each row standing on its own with its own audience.
//
// The generated database.types.ts does not include this table yet, so the
// untyped casts live here and nowhere else. Regenerate types
// (`supabase gen types typescript --linked`) and they can go.
//
// IMPORTANT: `visibility` is not a UI setting. The three RLS policies decide
// which rows ever leave Postgres, so an 'admin' annotation is absent from a
// member's response rather than hidden in their browser. Nothing here needs
// to filter by audience, and nothing here should start.

import { supabase } from '@/lib/supabase';
import { isBrandToken, type BrandToken } from '@/lib/tokens';

export type AnnotationVisibility = 'public' | 'members' | 'admin';

/** Geometry as GeoJSON stores it: coordinates are [lng, lat]. */
export type AnnotationGeometry =
  | { type: 'Point'; coordinates: [number, number] }
  | { type: 'LineString'; coordinates: [number, number][] }
  | { type: 'Polygon'; coordinates: [number, number][][] };

/** Styles name palette tokens, never colors — see src/lib/tokens.ts. */
export type AnnotationStyle = {
  color?: BrandToken;
  weight?: number;
  fillOpacity?: number;
  dashed?: boolean;
};

export type MapAnnotation = {
  id: string;
  layer: string;
  geometry: AnnotationGeometry;
  labelEn: string | null;
  labelEs: string | null;
  style: AnnotationStyle;
  visibility: AnnotationVisibility;
  updatedAt: string | null;
};

export type NewAnnotation = Omit<MapAnnotation, 'id' | 'updatedAt'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

const GEOMETRY_TYPES = ['Point', 'LineString', 'Polygon'];

/** Keep unknown token names out of the renderer rather than painting nothing. */
const parseStyle = (raw: unknown): AnnotationStyle => {
  const s = (raw ?? {}) as Record<string, unknown>;
  return {
    color: isBrandToken(s.color) ? s.color : undefined,
    weight: typeof s.weight === 'number' ? s.weight : undefined,
    fillOpacity: typeof s.fillOpacity === 'number' ? s.fillOpacity : undefined,
    dashed: s.dashed === true,
  };
};

export async function listAnnotations(): Promise<MapAnnotation[]> {
  const { data, error } = await sb
    .from('map_annotations')
    .select('id, layer, geojson, label_en, label_es, style, visibility, updated_at')
    .order('created_at', { ascending: true });

  if (error) {
    // Until the migration is applied the table does not exist. That is a
    // missing layer, not a broken map, so say so once and carry on.
    console.error('Failed to load map annotations:', error.message);
    return [];
  }

  return (data ?? [])
    .filter((r: { geojson?: { type?: string } }) => GEOMETRY_TYPES.includes(r.geojson?.type ?? ''))
    .map(
      (r: {
        id: string; layer: string; geojson: AnnotationGeometry;
        label_en: string | null; label_es: string | null;
        style: unknown; visibility: AnnotationVisibility; updated_at: string | null;
      }) => ({
        id: r.id,
        layer: r.layer,
        geometry: r.geojson,
        labelEn: r.label_en,
        labelEs: r.label_es,
        style: parseStyle(r.style),
        visibility: r.visibility,
        updatedAt: r.updated_at,
      })
    );
}

export async function createAnnotation(a: NewAnnotation): Promise<{ error: string | null }> {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await sb.from('map_annotations').insert({
    layer: a.layer,
    geojson: a.geometry,
    label_en: a.labelEn,
    label_es: a.labelEs,
    style: a.style,
    visibility: a.visibility,
    created_by: auth.user?.id ?? null,
  });
  return { error: error ? error.message : null };
}

export async function updateAnnotation(
  id: string,
  patch: Partial<Pick<MapAnnotation, 'geometry' | 'labelEn' | 'labelEs' | 'style' | 'visibility'>>
): Promise<{ error: string | null }> {
  const row: Record<string, unknown> = {};
  if (patch.geometry !== undefined) row.geojson = patch.geometry;
  if (patch.labelEn !== undefined) row.label_en = patch.labelEn;
  if (patch.labelEs !== undefined) row.label_es = patch.labelEs;
  if (patch.style !== undefined) row.style = patch.style;
  if (patch.visibility !== undefined) row.visibility = patch.visibility;

  const { error } = await sb.from('map_annotations').update(row).eq('id', id);
  return { error: error ? error.message : null };
}

export async function deleteAnnotation(id: string): Promise<{ error: string | null }> {
  const { error } = await sb.from('map_annotations').delete().eq('id', id);
  return { error: error ? error.message : null };
}
