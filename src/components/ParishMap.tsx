// src/components/ParishMap.tsx
// Renders a dot per parish, sized by its approved-member COUNT. Individual
// member names are never listed on the map — the only identities shown are
// members marked as POC in the admin panel (Mayordomo → Parishes & contacts).
// The sidebar shows the parish's member count plus its POC(s); when signed in,
// each POC also gets a mailto link. Workshop icons stay gated to approved
// members.
//
// Counts come from the `parish_member_counts` view, which exposes totals only
// (no member rows), so non-POC names never reach the browser for any viewer.
//
// Note on the POC query: column-level RLS prevents anon from reading
// `contact_email` at all. Including that column in the SELECT for an anon user
// makes PostgREST fail the whole query (not just the column). So we request
// contact_email only when the viewer is authenticated; anon users get the
// non-sensitive subset and simply never see POC emails.

import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { listSegments, type ChapterSegment } from '@/lib/segments';
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
  memberCount: number;   // total approved members (drives node size + count)
  members: Member[];     // identities we may show: everyone (signed in) or POCs only (signed out)
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
  const isAuthenticated = !!user;
  const isApprovedMember = !!profile && profile.status === 'approved';

  const [clusters, setClusters] = useState<ParishCluster[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopMarker[]>([]);
  const [selectedParish, setSelectedParish] = useState<string | null>(null);
  const [segments, setSegments] = useState<ChapterSegment[]>([]);

  // Chapter community areas, drawn by a Mayordomo in the admin editor.
  useEffect(() => {
    listSegments().then(setSegments);
  }, []);

  useEffect(() => {
    (async () => {
      // Counts per parish drive the node size and the number we display. They
      // come from a view that exposes totals only — never individual member
      // rows — so non-POC identities are never sent to the browser for anyone.
      //
      // Names are shown ONLY for members marked as POC in the admin panel.
      // Signed-in viewers additionally receive each POC's contact_email so the
      // mailto link can render; column-level RLS blocks that column for anon,
      // so we only request it when authenticated (see note at top of file).
      const pocSelect = isAuthenticated
        ? 'id, display_name, is_poc, contact_email, parish:parishes(id, name, lat, lng)'
        : 'id, display_name, is_poc, parish:parishes(id, name, lat, lng)';

      const [countsRes, pocRes] = await Promise.all([
        supabase
          .from('parish_member_counts')
          .select('parish_id, name, lat, lng, member_count'),
        supabase
          .from('profiles')
          .select(pocSelect)
          .eq('status', 'approved')
          .eq('is_poc', true),
      ]);

      if (countsRes.error) {
        console.error('Failed to load parish counts for map:', countsRes.error);
        return;
      }

      const map = new Map<string, ParishCluster>();
      for (const r of (countsRes.data ?? []) as unknown as Array<{
        parish_id: string; name: string; lat: number | null; lng: number | null; member_count: number;
      }>) {
        if (r.lat == null || r.lng == null) continue;
        map.set(r.parish_id, {
          key: r.parish_id,
          parishName: r.name,
          latLon: [r.lat, r.lng],
          memberCount: r.member_count,
          members: [],
        });
      }

      // Attach POC identities — the only names the map ever shows.
      for (const row of (pocRes.data ?? []) as unknown as Array<ProfileWithParish & { contact_email?: string | null }>) {
        if (!row.parish) continue;
        const cluster = map.get(row.parish.id);
        if (cluster) {
          cluster.members.push({
            id: row.id,
            name: row.display_name ?? '—',
            isPoc: true,
            contactEmail: row.contact_email ?? null,
          });
        }
      }

      for (const cluster of map.values()) {
        cluster.members.sort((a, b) => a.name.localeCompare(b.name));
      }

      setClusters(Array.from(map.values()));
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isApprovedMember) {
      setWorkshops([]);
      return;
    }
    (async () => {
      const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
      const { data } = await supabase
        .from('gatherings_public')
        .select('id, title, craft, location_text, lat, lng')
        .gte('event_date', today);

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
  // Only POCs are ever loaded, so every listed name is a point of contact.
  const selectedPocs = selected?.members ?? [];

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
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            subdomains="abcd"
          />
          {/* Frame members + all chapter areas, so the territory shows even
              before any members load. */}
          <FitBounds points={[...allPoints, ...segments.flatMap((s) => s.ring)]} />

          {/* Chapter community areas — each its own soft colored region with a
              floating label. Rendered before the markers so they sit underneath,
              and non-interactive so they never swallow a marker click. */}
          {segments.map((s) => (
            <Polygon
              key={s.id ?? s.name}
              positions={s.ring}
              pathOptions={{
                interactive: false,
                color: s.color,
                weight: 2,
                opacity: 0.6,
                fillColor: s.color,
                fillOpacity: 0.06,
              }}
            >
              <Tooltip permanent direction="center" className="seg-label" opacity={1}>
                {s.name}
              </Tooltip>
            </Polygon>
          ))}

          {clusters.map((c) => (
            <CircleMarker
              key={c.key}
              center={c.latLon}
              radius={Math.max(8, 6 + c.memberCount * 2)}
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
                    {c.memberCount}{' '}
                    {c.memberCount === 1
                      ? t(uiStrings.common.member)
                      : t(uiStrings.common.members)}
                  </div>
                  {c.members[0] && (
                    <div className="text-sm text-piedra">{c.members[0].name}</div>
                  )}
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
              {selected.memberCount} {selected.memberCount === 1 ? t(uiStrings.common.member) : t(uiStrings.common.members)}
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

            {selectedPocs.length === 0 && (
              <>
                <div className="rule my-4" />
                <p className="font-serif text-xs italic text-piedra/70">
                  {locale === 'es'
                    ? 'Aún no hay un contacto designado para esta parroquia.'
                    : 'No point of contact listed yet for this parish.'}
                </p>
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