// src/components/ParishMap.tsx
// Renders approved members on their parish dots, with upcoming approved
// workshops as separate pins. All data live from Supabase.

import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { iconMap } from '@/lib/icons';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import type { IconSlug } from '@/lib/types';

type ProfileWithParish = {
  id: string;
  display_name: string | null;
  parish: { id: string; name: string; lat: number | null; lng: number | null } | null;
};

type WorkshopMarker = {
  id: string;
  title: string;
  craft: IconSlug | null;
  location_text: string | null;
  lat: number;
  lng: number;
};

type ParishCluster = {
  key: string;
  parishName: string;
  latLon: [number, number];
  members: { id: string; name: string }[];
};

const buildWorkshopIcon = (slug: IconSlug) => {
  const meta = iconMap[slug];
  const html = `
    <div style="
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      background: hsl(42 47% 92%);
      border: 1px solid hsl(92 24% 25% / 0.4);
      border-radius: 9999px;
      box-shadow: 0 1px 2px rgba(62,79,47,0.18);
      color: hsl(92 24% 25%);
      position: relative;
      overflow: hidden;
    ">
      <span style="display:inline-block;width:28px;height:28px;line-height:0;">
        ${meta.svg}
      </span>
    </div>`;
  return L.divIcon({
    html,
    className: 'clm-workshop-pin',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
};

const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map(([la, lo]) => L.latLng(la, lo)));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
};

export const ParishMap = () => {
  const { t, locale } = useLocale();
  const [clusters, setClusters] = useState<ParishCluster[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopMarker[]>([]);
  const [selectedParish, setSelectedParish] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [profileResult, workshopResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, parish:parishes(id, name, lat, lng)')
          .eq('status', 'approved'),
        supabase
          .from('workshops')
          .select('id, title, craft, location_text, lat, lng, host_id')
          .eq('status', 'approved')
          .gte('held_at', new Date().toISOString()),
      ]);

      // Group profiles by parish.
      const map = new Map<string, ParishCluster>();
      for (const p of (profileResult.data ?? []) as unknown as ProfileWithParish[]) {
        if (!p.parish || p.parish.lat == null || p.parish.lng == null) continue;
        const key = p.parish.id;
        const entry = map.get(key);
        if (entry) {
          entry.members.push({ id: p.id, name: p.display_name ?? '—' });
        } else {
          map.set(key, {
            key,
            parishName: p.parish.name,
            latLon: [p.parish.lat, p.parish.lng],
            members: [{ id: p.id, name: p.display_name ?? '—' }],
          });
        }
      }
      setClusters(Array.from(map.values()));

      // Workshops with geocoords only.
      const marks: WorkshopMarker[] = [];
      for (const w of workshopResult.data ?? []) {
        if (w.lat == null || w.lng == null) continue;
        marks.push({
          id: w.id,
          title: w.title,
          craft: w.craft as IconSlug | null,
          location_text: w.location_text,
          lat: w.lat,
          lng: w.lng,
        });
      }
      setWorkshops(marks);
    })();
  }, []);

  const allPoints: [number, number][] = useMemo(
    () => [...clusters.map((c) => c.latLon), ...workshops.map((w) => [w.lat, w.lng] as [number, number])],
    [clusters, workshops]
  );

  const selected = clusters.find((c) => c.key === selectedParish) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,260px]">
      <div className="overflow-hidden rounded border border-mesquite/20" style={{ height: 460 }}>
        <MapContainer
          center={[29.6, -98.5]}
          zoom={9}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {allPoints.length > 0 && <FitBounds points={allPoints} />}

          {clusters.map((c) => (
            <CircleMarker
              key={c.key}
              center={c.latLon}
              radius={Math.max(8, 6 + c.members.length * 2)}
              pathOptions={{
                color: 'hsl(92 24% 25%)',
                weight: 1.5,
                fillColor: 'hsl(32 56% 51%)',
                fillOpacity: 0.7,
              }}
              eventHandlers={{ click: () => setSelectedParish(c.key) }}
            >
              <Popup>
                <div className="font-heading text-mesquite">
                  <div className="text-base">{c.parishName}</div>
                  <div className="text-sm text-piedra">
                    {c.members.length}{' '}
                    {c.members.length === 1
                      ? t(uiStrings.common.member)
                      : t(uiStrings.common.members)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {workshops.map((w) =>
            w.craft ? (
              <Marker
                key={w.id}
                position={[w.lat, w.lng]}
                icon={buildWorkshopIcon(w.craft)}
              >
                <Popup>
                  <div className="font-heading text-mesquite">
                    <div className="text-base leading-tight">{w.title}</div>
                    {w.location_text && (
                      <div className="mt-1 text-sm text-piedra">{w.location_text}</div>
                    )}
                    <Link
                      to={buildPath('tallerDetail', locale, { id: w.id })}
                      className="mt-2 inline-block text-sm"
                      style={{ color: 'hsl(32 56% 51%)' }}
                    >
                      →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <aside className="rounded border border-mesquite/20 bg-cal/50 p-5">
        {selected ? (
          <>
            <h3 className="font-heading text-lg text-mesquite">{selected.parishName}</h3>
            <p className="mt-1 text-sm text-piedra">
              {selected.members.length} {t(uiStrings.common.members)}
            </p>
            <div className="rule my-4" />
            <ul className="space-y-2">
              {selected.members.map((m) => (
                <li key={m.id}>
                  <Link
                    to={buildPath('ofrendaDetail', locale, { id: m.id })}
                    className="font-heading text-mesquite no-underline hover:text-ocre"
                    style={{ textDecoration: 'none' }}
                  >
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="font-heading italic text-piedra">
            {locale === 'es'
              ? 'Toca una parroquia para ver a sus miembros.'
              : 'Tap a parish to see its members.'}
          </p>
        )}
      </aside>
    </div>
  );
};