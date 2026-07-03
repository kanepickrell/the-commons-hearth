// src/components/admin/SegmentPanel.tsx
// Admin-only editor for chapter "community areas". Draw polygons on the map,
// name and color them, and Save persists the whole set to the `regions` table.
// The public ParishMap reads the same table and renders them.
//
// Uses Leaflet + leaflet-draw imperatively (not react-leaflet) to avoid the
// react-leaflet/leaflet-draw version friction. Lives inside Mayordomo, which
// already gates on isAdmin, so this component assumes an admin viewer.

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { toast } from '@/hooks/use-toast';
import { useLocale } from '@/i18n/LocaleProvider';
import { listSegments, replaceSegments, type ChapterSegment } from '@/lib/segments';

const PALETTE = ['#C68B3E', '#3E4F2F', '#2B4872', '#7A1E1E', '#4A5568', '#8A6D3B', '#5B7553', '#9C5A2E'];

type Item = { key: string; name: string; color: string; layer: L.Polygon };
type Row = { key: string; name: string; color: string; pts: number };

export function SegmentPanel() {
  const { locale } = useLocale();
  const es = locale === 'es';

  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawnRef = useRef<L.FeatureGroup | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const colorIdx = useRef(0);

  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const styleFor = (c: string): L.PathOptions => ({
    color: c, weight: 2, opacity: 0.9, fillColor: c, fillOpacity: 0.16,
  });

  const refresh = useCallback(() => {
    setRows(itemsRef.current.map((it) => ({
      key: it.key,
      name: it.name,
      color: it.color,
      pts: (it.layer.getLatLngs()[0] as L.LatLng[]).length,
    })));
  }, []);

  const addItem = useCallback((layer: L.Polygon, name?: string, color?: string) => {
    const c = color ?? PALETTE[colorIdx.current++ % PALETTE.length];
    const it: Item = {
      key: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name ?? `Segment ${itemsRef.current.length + 1}`,
      color: c,
      layer,
    };
    layer.setStyle(styleFor(c));
    layer.bindTooltip(it.name, { permanent: true, direction: 'center', className: 'seg-label', opacity: 1 });
    drawnRef.current!.addLayer(layer);
    itemsRef.current.push(it);
    refresh();
  }, [refresh]);

  // Initialize the map once.
  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView([30.0, -98.1], 8);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    const drawn = new L.FeatureGroup().addTo(map);
    mapRef.current = map;
    drawnRef.current = drawn;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LD = L as any;
    const control = new LD.Control.Draw({
      edit: { featureGroup: drawn },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: false, // avoids the leaflet-draw readableArea bug on L 1.9
          shapeOptions: { color: PALETTE[0], weight: 2, fillOpacity: 0.16 },
        },
        polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false,
      },
    });
    map.addControl(control);

    // Draw plugin events aren't in Leaflet's core event type map; use a retyped
    // view of the same map object (preserves `this`) to bind them.
    const m = map as unknown as { on(type: string, fn: (e: any) => void): void };
    m.on(LD.Draw.Event.CREATED, (e) => { addItem(e.layer as L.Polygon); setDirty(true); });
    m.on(LD.Draw.Event.EDITED, () => { refresh(); setDirty(true); });
    m.on(LD.Draw.Event.DELETED, (e) => {
      (e.layers as L.LayerGroup).eachLayer((layer) => {
        itemsRef.current = itemsRef.current.filter((it) => it.layer !== layer);
      });
      refresh(); setDirty(true);
    });

    listSegments().then((segs) => {
      segs.forEach((s) => {
        const layer = L.polygon(s.ring as unknown as L.LatLngExpression[]);
        addItem(layer, s.name, s.color);
      });
      if (itemsRef.current.length) map.fitBounds(drawn.getBounds(), { padding: [40, 40] });
      setDirty(false);
      setReady(true);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [addItem, refresh]);

  const rename = (key: string, name: string) => {
    const it = itemsRef.current.find((i) => i.key === key);
    if (!it) return;
    it.name = name;
    it.layer.getTooltip()?.setContent(name || 'Untitled');
    setDirty(true);
    refresh();
  };
  const recolor = (key: string) => {
    const it = itemsRef.current.find((i) => i.key === key);
    if (!it) return;
    it.color = PALETTE[colorIdx.current++ % PALETTE.length];
    it.layer.setStyle(styleFor(it.color));
    setDirty(true);
    refresh();
  };
  const remove = (key: string) => {
    const it = itemsRef.current.find((i) => i.key === key);
    if (!it) return;
    drawnRef.current!.removeLayer(it.layer);
    itemsRef.current = itemsRef.current.filter((i) => i.key !== key);
    setDirty(true);
    refresh();
  };

  const save = async () => {
    setSaving(true);
    const payload: ChapterSegment[] = itemsRef.current.map((it, i) => {
      const ring = (it.layer.getLatLngs()[0] as L.LatLng[]).map(
        (ll) => [Math.round(ll.lat * 1e5) / 1e5, Math.round(ll.lng * 1e5) / 1e5] as [number, number]
      );
      return { name: it.name, color: it.color, ring, sort_order: i };
    });
    const { error } = await replaceSegments(payload);
    setSaving(false);
    if (error) {
      toast({ title: es ? 'No se pudieron guardar las áreas' : 'Could not save areas', description: error, variant: 'destructive' });
    } else {
      setDirty(false);
      toast({ title: es ? `${payload.length} área(s) guardada(s)` : `Saved ${payload.length} area${payload.length === 1 ? '' : 's'}` });
    }
  };

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="display-caps text-[11px] tracking-[0.18em] text-ocre">
            {es ? 'ÁREAS DEL CAPÍTULO' : 'CHAPTER AREAS'}
          </p>
          <h2 className="font-heading text-2xl text-mesquite">
            {es ? 'Editor de áreas' : 'Area editor'}
          </h2>
          <p className="mt-1 max-w-prose font-serif text-sm italic text-piedra">
            {es
              ? 'Dibuja un área para cada agrupación de parroquias. Ponle nombre y guárdala; aparecerá en el mapa parroquial.'
              : 'Draw an area for each parish cluster. Name it and save — it appears on the parish map.'}
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="display-caps shrink-0 rounded border border-mesquite bg-mesquite px-5 py-2 text-[12px] tracking-[0.08em] text-cal disabled:opacity-40"
        >
          {saving ? (es ? 'Guardando…' : 'Saving…') : dirty ? (es ? 'Guardar' : 'Save') : (es ? 'Guardado' : 'Saved')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,280px]">
        <div
          ref={elRef}
          className="overflow-hidden rounded border border-mesquite/20"
          style={{ height: 460 }}
        />

        <aside className="rounded border border-mesquite/20 bg-cal/50 p-5">
          {rows.length === 0 ? (
            <p className="font-heading italic text-piedra">
              {ready
                ? (es
                    ? 'Usa la herramienta de polígono (arriba a la izquierda del mapa) para trazar tu primera área.'
                    : 'Use the polygon tool (top-left of the map) to trace your first area.')
                : (es ? 'Cargando…' : 'Loading…')}
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map((r) => (
                <li key={r.key} className="flex items-center gap-2">
                  <button
                    onClick={() => recolor(r.key)}
                    title={es ? 'Cambiar color' : 'Change color'}
                    className="h-3.5 w-3.5 shrink-0 rounded-sm border border-black/15"
                    style={{ background: r.color }}
                  />
                  <input
                    value={r.name}
                    onChange={(e) => rename(r.key, e.target.value)}
                    className="min-w-0 flex-1 border-b border-transparent bg-transparent font-heading text-base text-mesquite focus:border-ocre focus:outline-none"
                  />
                  <span className="shrink-0 text-[11px] text-piedra">{r.pts}</span>
                  <button
                    onClick={() => remove(r.key)}
                    title={es ? 'Eliminar' : 'Delete'}
                    className="shrink-0 rounded px-1 text-piedra hover:bg-rojo/10 hover:text-rojo"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}