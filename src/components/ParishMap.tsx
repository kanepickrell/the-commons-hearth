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

import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { listSegments, type ChapterSegment } from '@/lib/segments';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { iconMap, hasIcon } from '@/lib/icons';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { IconSlug } from '@/lib/types';
import { ContactModal } from '@/components/ContactModal';
import { todayLocalISO } from '@/lib/dates';

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
  craft: string | null; // any craft_slug; only the illustrated ones get a pin
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

// A cluster has to show the number of PEOPLE it covers, not the number of
// parish stamps inside it, so each marker carries its parish's count in its
// Leaflet options and the cluster adds them up. react-leaflet hands every
// prop except `position` straight to the L.Marker constructor as an option,
// so augmenting MarkerOptions is what makes `memberCount` a typed prop here
// and readable as `child.options.memberCount` in the cluster icon builder.
declare module 'leaflet' {
  interface MarkerOptions {
    memberCount?: number;
  }
}

type ParishCluster = {
  key: string;
  parishName: string;
  latLon: [number, number];
  memberCount: number;   // total approved members (drives node size + count)
  members: Member[];     // identities we may show: everyone (signed in) or POCs only (signed out)
};

const buildWorkshopIcon = (slug: IconSlug) =>
  L.divIcon({
    html: iconMap[slug].svg,
    className: 'clm-workshop-pin',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });

// Stamp sizes step with the count in three tiers. The pixel size lives here
// rather than in CSS because Leaflet writes width/height inline from
// iconSize, where it would beat a stylesheet rule anyway; index.css carries
// the matching typography.
type Tier = { upTo: number; size: number; cls: string };

const STAMP_TIERS: Tier[] = [
  { upTo: 2, size: 30, cls: 'clm-stamp--sm' },
  { upTo: 6, size: 38, cls: 'clm-stamp--md' },
  { upTo: Infinity, size: 46, cls: 'clm-stamp--lg' },
];

// Clusters stand for several parishes at once and carry a larger number, so
// they get their own, roomier scale.
const CLUSTER_TIERS: Tier[] = [
  { upTo: 9, size: 42, cls: 'clm-cluster--sm' },
  { upTo: 24, size: 52, cls: 'clm-cluster--md' },
  { upTo: Infinity, size: 62, cls: 'clm-cluster--lg' },
];

const tierFor = (tiers: Tier[], count: number) =>
  tiers.find((t) => count <= t.upTo) ?? tiers[tiers.length - 1];

const buildParishStamp = (memberCount: number, selected: boolean) => {
  const tier = tierFor(STAMP_TIERS, memberCount);
  return L.divIcon({
    html: `<span>${memberCount}</span>`,
    className: ['clm-stamp', tier.cls, selected ? 'is-selected' : ''].filter(Boolean).join(' '),
    iconSize: [tier.size, tier.size],
    iconAnchor: [tier.size / 2, tier.size / 2],
    popupAnchor: [0, -tier.size / 2],
  });
};

// Leaflet.markercluster calls this for every cluster it forms. Summing
// options.memberCount (rather than using getChildCount()) is what makes the
// number on a cluster mean "people here", consistent with a single stamp.
const buildClusterIcon = (cluster: L.MarkerCluster) => {
  const total = cluster
    .getAllChildMarkers()
    .reduce((sum, m) => sum + (m.options.memberCount ?? 0), 0);
  const tier = tierFor(CLUSTER_TIERS, total);
  return L.divIcon({
    html: `<span>${total}</span>`,
    className: `clm-stamp clm-cluster ${tier.cls}`,
    iconSize: [tier.size, tier.size],
    iconAnchor: [tier.size / 2, tier.size / 2],
  });
};

const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  const lastSig = useRef<string>('');
  useEffect(() => {
    if (!points.length) return;
    // Only frame the map when the *set of coordinates* actually changes (data
    // loads), not on every render. Selecting a parish re-renders this component
    // and would otherwise re-fit and yank the user's manual zoom back out.
    const sig = points
      .map(([la, lo]) => `${la.toFixed(5)},${lo.toFixed(5)}`)
      .sort()
      .join('|');
    if (sig === lastSig.current) return;
    lastSig.current = sig;
    const bounds = L.latLngBounds(points.map(([la, lo]) => L.latLng(la, lo)));
    // Cap the zoom so a lone dot (or a tight cluster) doesn't slam all the way
    // in, and pad generously so the territory breathes inside the frame.
    map.fitBounds(bounds, { padding: [64, 64], maxZoom: 10 });
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
  // Parish whose "would you be the contact?" offer is open, if any.
  const [pocOffer, setPocOffer] = useState<string | null>(null);

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
      const today = todayLocalISO();
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
          craft: w.craft,
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
      <div className="relative overflow-hidden rounded border border-mesquite/20" style={{ height: 460 }}>
        <MapContainer
          center={[29.6, -98.5]}
          zoom={9}
          minZoom={7}
          maxZoom={17}
          zoomSnap={0.5}
          zoomDelta={0.5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Esri's light-gray canvas + a separate labels layer. Same quiet
              Positron-style look the palette was tuned for, without CARTO's
              "API KEY REQUIRED" watermark. Native tiles stop at z16; Leaflet
              upscales beyond that. */}
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={16}
            maxZoom={17}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={16}
            maxZoom={17}
            zIndex={2}
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

          {/* Parish stamps, gathered into cluster stamps while the view is
              wide. Clustering switches off at z13, where parishes in the same
              town have separated enough to stand on their own. */}
          <MarkerClusterGroup
            iconCreateFunction={buildClusterIcon}
            disableClusteringAtZoom={13}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={false}
            maxClusterRadius={48}
            chunkedLoading
          >
            {clusters.map((c) => (
              <Marker
                key={c.key}
                position={c.latLon}
                memberCount={c.memberCount}
                icon={buildParishStamp(c.memberCount, c.key === selectedParish)}
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
              </Marker>
            ))}
          </MarkerClusterGroup>

          {workshops.map((w) =>
            hasIcon(w.craft) ? (
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
        {/* Soft inner vignette frames the open parchment so the wide,
            zoomed-out view reads as intentional rather than empty. */}
        <div className="map-vignette pointer-events-none absolute inset-0 z-[500] rounded" />
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
                {/* This used to be where the panel stopped. Someone who just
                    clicked their own parish and found it unclaimed is the best
                    candidate the chapter will ever get for the role the whole
                    directory depends on, so ask them. */}
                <button
                  type="button"
                  onClick={() => setPocOffer(selected.parishName)}
                  className="mt-3 font-heading text-sm text-ocre underline-offset-4 transition hover:text-mesquite hover:underline"
                >
                  {locale === 'es'
                    ? '¿Te gustaría serlo? →'
                    : 'Would you be the one? →'}
                </button>
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

      {/* Offer to serve as a parish's point of contact. The form opens on the
          parish-partnership category with the parish already named, so the
          visitor only has to say yes. */}
      <ContactModal
        open={pocOffer !== null}
        onClose={() => setPocOffer(null)}
        defaultCategory="parish"
        defaultMessage={
          pocOffer
            ? locale === 'es'
              ? `Me gustaría ser el contacto del capítulo en ${pocOffer}.`
              : `I would like to be the chapter's point of contact for ${pocOffer}.`
            : undefined
        }
      />
    </div>
  );
};