// src/components/map/AnnotationAdmin.tsx
// Steward's panel for the map's annotations, shown under the map to admins.
//
// Geoman handles geometry on the map itself; this is where an annotation
// gets its words, its audience and its color. Those three don't belong in a
// drawing toolbar — especially the audience, which is the one choice with
// consequences if it's guessed at.
//
// Follows the admin convention elsewhere in the project (see SegmentPanel):
// bilingual via inline ternaries rather than uiStrings, which carries the
// public copy.

import { useState } from 'react';
import { BRAND_TOKENS, type BrandToken } from '@/lib/tokens';
import type {
  AnnotationGeometry,
  AnnotationVisibility,
  MapAnnotation,
} from '@/lib/annotations';

type Draft = {
  geometry: AnnotationGeometry;
  labelEn: string;
  labelEs: string;
  visibility: AnnotationVisibility;
  color: BrandToken;
};

type Props = {
  locale: 'en' | 'es';
  annotations: MapAnnotation[];
  /** Set when a shape has just been drawn and is waiting to be described. */
  draft: Draft | null;
  onDraftChange: (d: Draft) => void;
  onDraftSave: () => void;
  onDraftCancel: () => void;
  onEdit: (id: string, patch: Partial<MapAnnotation>) => void;
  onDelete: (id: string) => void;
  saving: boolean;
};

const VISIBILITIES: AnnotationVisibility[] = ['public', 'members', 'admin'];

const visibilityLabel = (v: AnnotationVisibility, es: boolean) =>
  es
    ? { public: 'Cualquiera', members: 'Miembros', admin: 'Solo mayordomos' }[v]
    : { public: 'Anyone', members: 'Members', admin: 'Stewards only' }[v];

const geometryLabel = (t: AnnotationGeometry['type'], es: boolean) =>
  es
    ? { Point: 'Punto', LineString: 'Línea', Polygon: 'Área' }[t]
    : { Point: 'Label', LineString: 'Line', Polygon: 'Area' }[t];

export const AnnotationAdmin = ({
  locale,
  annotations,
  draft,
  onDraftChange,
  onDraftSave,
  onDraftCancel,
  onEdit,
  onDelete,
  saving,
}: Props) => {
  const es = locale === 'es';
  const [openId, setOpenId] = useState<string | null>(null);

  const field =
    'w-full rounded-sm border border-mesquite/20 bg-cal p-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none';

  return (
    <div className="mt-4 rounded border border-ocre/40 bg-cal/60 p-4 md:col-span-2">
      <p className="display-caps text-[10px] tracking-[0.2em] text-ocre">
        {es ? 'ANOTACIONES DEL MAPA' : 'MAP ANNOTATIONS'}
      </p>

      {draft ? (
        <div className="mt-3 rounded-sm border border-mesquite/20 bg-cal p-3">
          <p className="font-heading text-sm text-mesquite">
            {es ? 'Nueva anotación' : 'New annotation'} —{' '}
            <span className="text-piedra">{geometryLabel(draft.geometry.type, es)}</span>
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-heading text-xs text-mesquite/70">
                {es ? 'Texto (inglés)' : 'Label (English)'}
              </span>
              <input
                className={field}
                value={draft.labelEn}
                onChange={(e) => onDraftChange({ ...draft, labelEn: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-heading text-xs text-mesquite/70">
                {es ? 'Texto (español)' : 'Label (Spanish)'}
              </span>
              <input
                className={field}
                value={draft.labelEs}
                onChange={(e) => onDraftChange({ ...draft, labelEs: e.target.value })}
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-4">
            <label className="block">
              <span className="mb-1 block font-heading text-xs text-mesquite/70">
                {es ? 'Quién lo ve' : 'Who sees it'}
              </span>
              <select
                className={field}
                value={draft.visibility}
                onChange={(e) =>
                  onDraftChange({ ...draft, visibility: e.target.value as AnnotationVisibility })
                }
              >
                {VISIBILITIES.map((v) => (
                  <option key={v} value={v}>
                    {visibilityLabel(v, es)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-heading text-xs text-mesquite/70">
                {es ? 'Color' : 'Color'}
              </span>
              <select
                className={field}
                value={draft.color}
                onChange={(e) => onDraftChange({ ...draft, color: e.target.value as BrandToken })}
              >
                {BRAND_TOKENS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={onDraftCancel}
                disabled={saving}
                className="font-serif text-sm text-mesquite/60 hover:text-mesquite disabled:opacity-40"
              >
                {es ? 'Descartar' : 'Discard'}
              </button>
              <button
                type="button"
                onClick={onDraftSave}
                disabled={saving}
                className="rounded-sm bg-ocre px-4 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:opacity-40"
              >
                {saving ? (es ? 'Guardando…' : 'Saving…') : es ? 'Guardar' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-2 font-serif text-xs italic text-piedra/70">
          {es
            ? 'Usa las herramientas en el mapa para dibujar un área, una línea o un punto. Al terminar, aquí le pones el texto y decides quién lo ve.'
            : 'Use the tools on the map to draw an area, a line or a point. When you finish one, name it here and choose who sees it.'}
        </p>
      )}

      {annotations.length > 0 && (
        <ul className="mt-4 space-y-1">
          {annotations.map((a) => {
            const open = openId === a.id;
            return (
              <li key={a.id} className="rounded-sm border border-mesquite/10">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : a.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                >
                  <span className="font-heading text-sm text-mesquite">
                    {a.labelEn || a.labelEs || (
                      <span className="italic text-piedra/60">{es ? 'Sin texto' : 'Untitled'}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-serif text-xs italic text-piedra/70">
                    {geometryLabel(a.geometry.type, es)} · {visibilityLabel(a.visibility, es)}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-mesquite/10 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className={field}
                        defaultValue={a.labelEn ?? ''}
                        placeholder={es ? 'Texto (inglés)' : 'Label (English)'}
                        onBlur={(e) => onEdit(a.id, { labelEn: e.target.value || null })}
                      />
                      <input
                        className={field}
                        defaultValue={a.labelEs ?? ''}
                        placeholder={es ? 'Texto (español)' : 'Label (Spanish)'}
                        onBlur={(e) => onEdit(a.id, { labelEs: e.target.value || null })}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <select
                        className={field + ' w-auto'}
                        value={a.visibility}
                        onChange={(e) =>
                          onEdit(a.id, { visibility: e.target.value as AnnotationVisibility })
                        }
                      >
                        {VISIBILITIES.map((v) => (
                          <option key={v} value={v}>
                            {visibilityLabel(v, es)}
                          </option>
                        ))}
                      </select>
                      <select
                        className={field + ' w-auto'}
                        value={a.style.color ?? 'ocre'}
                        onChange={(e) =>
                          onEdit(a.id, { style: { ...a.style, color: e.target.value as BrandToken } })
                        }
                      >
                        {BRAND_TOKENS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
                        className="ml-auto font-serif text-sm text-rojo hover:underline"
                      >
                        {es ? 'Borrar' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export type { Draft as AnnotationDraft };
