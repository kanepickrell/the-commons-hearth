// src/components/ParishMap.tsx
// Renders approved members on parish dots. Workshop icons gated to approved
// members. When a parish has POCs, they appear at the top of the sidebar with
// a mailto link; rest of members listed below.

import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { iconMap } from '@/lib/icons';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { IconSlug } from '@/lib/types';

type ProfileWithParish = {
  id: string;
  display_name: string | null;
  is_poc: boolean;
  contact_email: string | null;
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

type Member = {
  id: string;
  name: string;
  isPoc: boolean;
  contactEmail: string | null;
};

type ParishCluster = {
  key: string;
  parishName: string;
  latLon: [number, number];
  members: Member[];
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
      cursor: pointer;
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
  const { user, profile } = useAuth();
  const isApprovedMember = !!profile && profile.status === 'approved';

  const [clusters, setClusters] = useState<ParishCluster[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopMarker[]>([]);
  const [selectedParish, setSelectedParish] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, is_poc, contact_email, parish:parishes(id, name, lat, lng)')
        .eq('status', 'approved');

      const map = new Map<string, ParishCluster>();
      for (const p of (data ?? []) as unknown as ProfileWithParish[]) {
        if (!p.parish || p.parish.lat == null || p.parish.lng == null) continue;
        const key = p.parish.id;
        const member: Member = {
          id: p.id,
          name: p.display_name ?? '—',
          isPoc: p.is_poc,
          contactEmail: p.contact_email,
        };
        const entry = map.get(key);
        if (entry) {
          entry.members.push(member);
        } else {
          map.set(key, {
            key,
            parishName: p.parish.name,
            latLon: [p.parish.lat, p.parish.lng],
            members: [member],
          });
        }
      }
      // Sort members within each cluster: POCs first, then alphabetical
      for (const cluster of map.values()) {
        cluster.members.sort((a, b) => {
          if (a.isPoc && !b.isPoc) return -1;
          if (!a.isPoc && b.isPoc) return 1;
          return a.name.localeCompare(b.name);
        });
      }
      setClusters(Array.from(map.values()).filter((c) => c.members.length > 0));
    })();
  }, []);

  useEffect(() => {
    if (!isApprovedMember) {
      setWorkshops([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('workshops')
        .select('id, title, craft, location_text, lat, lng, host_id')
        .eq('status', 'approved')
        .gte('held_at', new Date().toISOString());

      const marks: WorkshopMarker[] = [];
      for (const w of data ?? []) {
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
  }, [isApprovedMember]);

  const allPoints: [number, number][] = useMemo(
    () => [...clusters.map((c) => c.latLon), ...workshops.map((w) => [w.lat, w.lng] as [number, number])],
    [clusters, workshops]
  );

  const selected = clusters.find((c) => c.key === selectedParish) ?? null;
  const selectedPocs = selected?.members.filter((m) => m.isPoc) ?? [];
  const selectedNonPocs = selected?.members.filter((m) => !m.isPoc) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,280px]">
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
                      {locale === 'es' ? 'Ver reunión →' : 'View gathering →'}
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      <aside className="rounded border border-mesquite/20 bg-cal/50 p-5">
        {selected ? (
          <>
            <h3 className="font-heading text-lg text-mesquite">{selected.parishName}</h3>
            <p className="mt-1 text-sm text-piedra">
              {selected.members.length} {selected.members.length === 1 ? t(uiStrings.common.member) : t(uiStrings.common.members)}
            </p>

            {selectedPocs.length > 0 && (
              <>
                <div className="rule my-4" />
                <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-ocre">
                  {locale === 'es' ? 'CONTACTO' : 'POINT OF CONTACT'}
                </p>
                <ul className="space-y-3">
                  {selectedPocs.map((m) => (
                    <li key={m.id}>
                      <Link
                        to={buildPath('memberDetail', locale, { id: m.id })}
                        className="font-heading text-mesquite no-underline hover:text-ocre"
                        style={{ textDecoration: 'none' }}
                      >
                        {m.name}
                      </Link>
                      {m.contactEmail && (
                        <a
                          href={`mailto:${m.contactEmail}`}
                          className="mt-0.5 block font-serif text-xs italic text-ocre hover:underline"
                        >
                          {m.contactEmail}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {selectedNonPocs.length > 0 && (
              <>
                <div className="rule my-4" />
                {selectedPocs.length > 0 && (
                  <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-mesquite/50">
                    {locale === 'es' ? 'OTROS MIEMBROS' : 'OTHER MEMBERS'}
                  </p>
                )}
                <ul className="space-y-2">
                  {selectedNonPocs.map((m) => (
                    <li key={m.id}>
                      <Link
                        to={buildPath('memberDetail', locale, { id: m.id })}
                        className="font-heading text-mesquite no-underline hover:text-ocre"
                        style={{ textDecoration: 'none' }}
                      >
                        {m.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <div>
            <p className="font-heading italic text-piedra">
              {locale === 'es'
                ? 'Toca una parroquia para ver a sus miembros.'
                : 'Tap a parish to see its members.'}
            </p>
            {!isApprovedMember && !user && (
              <p className="mt-4 border-t border-mesquite/10 pt-4 font-serif text-xs italic text-piedra/70">
                {t(uiStrings.workshop.memberOnlyMap)}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
