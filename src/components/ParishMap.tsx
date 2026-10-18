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

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { listSegments, type ChapterSegment } from '@/lib/segments';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { iconMap, hasIcon } from '@/lib/icons';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { IconSlug } from '@/lib/types';
import { ContactModal } from '@/components/ContactModal';
import { RsvpModal } from '@/components/RsvpModal';
import { AnnotationLayer } from '@/components/map/AnnotationLayer';
import { AnnotationTools } from '@/components/map/AnnotationTools';
import { AnnotationAdmin, type AnnotationDraft } from '@/components/map/AnnotationAdmin';
import {
  createAnnotation,
  deleteAnnotation,
  listAnnotations,
  updateAnnotation,
  type AnnotationGeometry,
  type MapAnnotation,
} from '@/lib/annotations';
import { useRsvp } from '@/hooks/useRsvp';
import { toast } from '@/hooks/use-toast';
import { chapterToday, formatDate, fromDateOnly, todayLocalISO } from '@/lib/dates';
import { readViewState, writeViewState, type MapFilter, type MapView } from '@/lib/mapView';

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
    hasUpcoming?: boolean;
  }
}

// How far ahead a gathering counts as "coming up". Inclusive at both ends:
// something happening today shows, and so does day 30; day 31 does not.
const EVENT_WINDOW_DAYS = 30;

// The soonest gathering at a parish inside that window. Non-members get the
// title and the date but not `locationText` — gatherings_public withholds
// held_at/location_text/lat/lng on upcoming gatherings from anyone who isn't
// an approved member, which is why the ring is pinned to the PARISH's
// coordinates rather than the gathering's. Everyone, signed in or out, can
// then be told the same true thing: something is happening here soon.
type UpcomingGathering = {
  id: string;
  title: string;
  eventDate: string;
  locationText: string | null;
};

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

const buildParishStamp = (memberCount: number, selected: boolean, hasUpcoming: boolean) => {
  const tier = tierFor(STAMP_TIERS, memberCount);
  const className = ['clm-stamp', tier.cls];
  if (selected) className.push('is-selected');
  if (hasUpcoming) className.push('clm-stamp--upcoming');
  return L.divIcon({
    html: `<span>${memberCount}</span>`,
    className: className.join(' '),
    iconSize: [tier.size, tier.size],
    iconAnchor: [tier.size / 2, tier.size / 2],
    popupAnchor: [0, -tier.size / 2],
  });
};

// Leaflet.markercluster calls this for every cluster it forms. Summing
// options.memberCount (rather than using getChildCount()) is what makes the
// number on a cluster mean "people here", consistent with a single stamp.
const buildClusterIcon = (cluster: L.MarkerCluster) => {
  const children = cluster.getAllChildMarkers();
  const total = children.reduce((sum, m) => sum + (m.options.memberCount ?? 0), 0);
  const anyUpcoming = children.some((m) => m.options.hasUpcoming);
  const tier = tierFor(CLUSTER_TIERS, total);
  const className = ['clm-stamp', 'clm-cluster', tier.cls];
  if (anyUpcoming) className.push('clm-cluster--upcoming');
  return L.divIcon({
    html: `<span>${total}</span>`,
    className: className.join(' '),
    iconSize: [tier.size, tier.size],
    iconAnchor: [tier.size / 2, tier.size / 2],
  });
};

/**
 * What a parish stamp says when you open it, and the same body the sidebar
 * shows for the selected parish. Names here are POCs only — `members` never
 * holds anyone else (see the note at the top of this file).
 */
const ParishCard = ({
  parish,
  next,
  onRsvp,
}: {
  parish: ParishCluster;
  next: UpcomingGathering | null;
  onRsvp: (gatheringId: string) => void;
}) => {
  const { t, locale } = useLocale();

  return (
    <div className="font-heading text-mesquite">
      <div className="text-base leading-tight">{parish.parishName}</div>
      <div className="text-sm text-piedra">
        {parish.memberCount}{' '}
        {parish.memberCount === 1 ? t(uiStrings.common.member) : t(uiStrings.common.members)}
      </div>

      {parish.members.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {parish.members.map((m) => (
            <li key={m.id} className="text-sm">
              <Link
                to={buildPath('memberDetail', locale, { id: m.id })}
                className="text-piedra no-underline hover:text-ocre"
                style={{ textDecoration: 'none' }}
              >
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {next && (
        <div className="mt-3 border-t border-mesquite/15 pt-2">
          <p className="display-caps text-[10px] tracking-[0.2em] text-ocre">
            {t(uiStrings.map.nextGathering)}
          </p>
          <Link
            to={buildPath('tallerDetail', locale, { id: next.id })}
            className="mt-1 block text-sm leading-tight text-mesquite no-underline hover:text-ocre"
            style={{ textDecoration: 'none' }}
          >
            {next.title}
          </Link>
          <p className="text-sm text-piedra">
            {formatDate(fromDateOnly(next.eventDate), locale, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {/* Withheld from non-members by gatherings_public, so it is simply
              absent rather than explained away. */}
          {next.locationText && (
            <p className="font-serif text-xs italic text-piedra/80">{next.locationText}</p>
          )}
          <button
            type="button"
            onClick={() => onRsvp(next.id)}
            className="mt-2 rounded-sm bg-ocre px-3 py-1 font-heading text-xs text-cal transition hover:bg-mesquite"
          >
            {t(uiStrings.workshop.rsvp)}
          </button>
        </div>
      )}
    </div>
  );
};

/** Reports the view after every pan or zoom, so it can be written to the URL. */
const ViewReporter = ({ onView }: { onView: (v: MapView) => void }) => {
  const map = useMapEvents({
    moveend: () => onView({ center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() }),
  });
  return null;
};

const FitBounds = ({ points, enabled }: { points: [number, number][]; enabled: boolean }) => {
  const map = useMap();
  const lastSig = useRef<string>('');
  useEffect(() => {
    // A view carried in from a link is somebody's deliberate choice of
    // ground. Framing the data over the top of it would throw that away.
    if (!enabled) return;
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
  }, [map, points, enabled]);
  return null;
};

// Which story layers are drawn. Partners are deliberately absent: the
// chapter has no partners table yet, and the toggle is built so one can be
// added here without touching anything else.
type LayerKey = 'parishes' | 'gatherings' | 'annotations';

const LAYER_ORDER: LayerKey[] = ['parishes', 'gatherings', 'annotations'];

const LAYER_LABEL: Record<LayerKey, keyof typeof uiStrings.map> = {
  parishes: 'layerParishes',
  gatherings: 'layerGatherings',
  annotations: 'layerNotes',
};

type ParishMapProps = {
  /**
   * Keep the view, the lit layers and the filter in the URL, and offer the
   * share and export controls. Off for the homepage section — panning a map
   * a visitor is scrolling past should not keep rewriting the homepage's
   * address — and on for the dedicated map page, where a link to a view is
   * the point.
   */
  syncUrl?: boolean;
  /**
   * Offer a steward the drawing toolbar and the annotation panel. On for the
   * dedicated map page only: annotations are read everywhere, but drawing
   * them belongs where the map is the subject rather than one section of the
   * homepage, which a steward also reads as an ordinary visitor. Keeping it
   * off here is also what stops the homepage fetching Geoman at all.
   */
  drawTools?: boolean;
  /** Presentation mode: the map alone, with a title, a legend and the mark. */
  presentation?: boolean;
  /** Shown as the title in presentation mode. */
  title?: string;
};

export const ParishMap = ({
  syncUrl = false,
  drawTools = false,
  presentation = false,
  title,
}: ParishMapProps) => {
  const { t, locale } = useLocale();

  // One-finger drag inside a map that is only ONE SECTION of a page steals the
  // page's scroll: a reader swiping past the homepage map pans the map instead
  // of moving down the article, and with the map full-bleed there's no margin
  // left to swipe on instead. So on touch devices the embedded map doesn't
  // drag — pinch-zoom still works (two fingers never read as a scroll), the
  // +/− control still works, and tapping a parish or using the parish list is
  // untouched. On /map the map IS the page, with nothing to scroll past, so it
  // keeps dragging on every device.
  const embedded = !syncUrl && !presentation;
  const coarsePointer =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const allowDrag = !(embedded && coarsePointer);
  const { user, profile, isAdmin } = useAuth();
  const isAuthenticated = !!user;
  const isApprovedMember = !!profile && profile.status === 'approved';

  const [searchParams, setSearchParams] = useSearchParams();
  // Read once, on mount. After that the URL is something this component
  // writes, not something it listens to — re-reading would fight the user's
  // own panning.
  const initial = useRef(readViewState(searchParams)).current;

  const [clusters, setClusters] = useState<ParishCluster[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopMarker[]>([]);
  const [upcoming, setUpcoming] = useState<Map<string, UpcomingGathering>>(new Map());
  const [onlyUpcoming, setOnlyUpcoming] = useState(
    syncUrl ? initial.filter === 'upcoming' : false
  );
  const [view, setView] = useState<MapView | null>(syncUrl ? initial.view : null);
  const [selectedParish, setSelectedParish] = useState<string | null>(null);
  const [segments, setSegments] = useState<ChapterSegment[]>([]);
  // Which gathering the RSVP modal is for. One modal serves every popup:
  // the button in a popup names its parish's next gathering and opens it.
  const [rsvpTarget, setRsvpTarget] = useState<string | null>(null);
  // Mobile only — the parish list collapses so the map keeps the screen.
  const [listOpen, setListOpen] = useState(false);

  const [annotations, setAnnotations] = useState<MapAnnotation[]>([]);
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(() => {
    const fromUrl = syncUrl ? initial.layers : null;
    if (!fromUrl) return new Set<LayerKey>(LAYER_ORDER);
    // An unknown layer name in a link is dropped, not fatal.
    return new Set<LayerKey>(LAYER_ORDER.filter((k) => fromUrl.includes(k)));
  });
  const [layersOpen, setLayersOpen] = useState(false);
  const [draft, setDraft] = useState<AnnotationDraft | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  // Geoman installs itself with L.Map.addInitHook, which only runs for maps
  // constructed AFTER the import. It therefore has to be loaded before this
  // map exists — and, because `isAdmin` arrives late (the profile loads after
  // the first render), the map that already exists has to go away while it
  // loads. `mapReady` below is what tears it down: the moment we learn draw
  // tools are wanted, the pm-less map unmounts, Geoman loads against no map
  // at all, and a fresh one is built with `pm` on it.
  //
  // Getting this wrong is not a degraded toolbar. Geoman's own layeradd
  // handler reads map.pm on every marker added, so a map without it throws
  // on the next render and the page's error boundary eats the whole site.
  const needsDrawTools = drawTools && isAdmin && !presentation;
  const [drawToolsReady, setDrawToolsReady] = useState(false);

  useEffect(() => {
    if (!needsDrawTools || drawToolsReady) return;
    let cancelled = false;
    (async () => {
      await import('@geoman-io/leaflet-geoman-free');
      await import('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css');
      if (!cancelled) setDrawToolsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [needsDrawTools, drawToolsReady]);

  const mapReady = !needsDrawTools || drawToolsReady;

  const mapRef = useRef<L.Map | null>(null);
  const mapFrameRef = useRef<HTMLDivElement | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerRefs = useRef(new Map<string, L.Marker>());
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());

  const rsvp = useRsvp({ workshopId: rsvpTarget });

  // Point the one modal at this gathering, then open it. The target lands in
  // state before any submit can run, so the hook always inserts against the
  // gathering whose button was pressed.
  const startRsvp = (gatheringId: string) => {
    setRsvpTarget(gatheringId);
    rsvp.openModal();
  };

  // State → URL. `replace` so panning doesn't fill the back button with a
  // hundred near-identical views, and only once a view exists, so the link
  // never names a centre the map hasn't settled on.
  useEffect(() => {
    if (!syncUrl || !view) return;
    const next = writeViewState(searchParams, {
      view,
      layers: LAYER_ORDER.filter((k) => activeLayers.has(k)),
      filter: (onlyUpcoming ? 'upcoming' : 'all') as MapFilter,
    });
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [syncUrl, view, activeLayers, onlyUpcoming, searchParams, setSearchParams]);

  const copyViewLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: locale === 'es' ? 'Enlace copiado.' : 'Link copied.' });
    } catch {
      // Clipboard access can be refused outright (insecure origin, denied
      // permission). Showing the address is more use than an apology.
      toast({ title: window.location.href });
    }
  };

  // PNG of the map as it stands, for a packet or a slide. Members and
  // stewards only. The controls and the vignette are left out of the frame:
  // a filter toggle is useless in a still, and the exported file should look
  // like a printed map rather than a screenshot of a website.
  const [exporting, setExporting] = useState(false);
  const exportPng = async () => {
    const node = mapFrameRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        filter: (el) => {
          if (!(el instanceof HTMLElement)) return true;
          if (el.dataset.exportHide !== undefined) return false;
          // Zoom buttons and the draw toolbar are controls, not map. The
          // attribution deliberately stays: Esri's terms require it, and an
          // exported map travels further than the page it came from.
          if (el.classList.contains('leaflet-control-zoom')) return false;
          if (el.classList.contains('leaflet-pm-toolbar')) return false;
          return true;
        },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `commons-map-${todayLocalISO(chapterToday())}.png`;
      a.click();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : String(e) });
    } finally {
      setExporting(false);
    }
  };

  const toggleLayer = (key: LayerKey) =>
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // --- steward's annotation edits ------------------------------------------
  // A freshly drawn shape waits here, unsaved, until it has been given its
  // words and its audience. Defaulting a new annotation to 'members' rather
  // than 'public' means a slip of the hand publishes nothing.
  const handleDraw = (geometry: AnnotationGeometry) =>
    setDraft({ geometry, labelEn: '', labelEs: '', visibility: 'members', color: 'ocre' });

  const saveDraft = async () => {
    if (!draft) return;
    setSavingDraft(true);
    const { error } = await createAnnotation({
      layer: 'annotations',
      geometry: draft.geometry,
      labelEn: draft.labelEn.trim() || null,
      labelEs: draft.labelEs.trim() || null,
      style: { color: draft.color },
      visibility: draft.visibility,
    });
    setSavingDraft(false);
    if (error) {
      toast({ title: error });
      return;
    }
    setDraft(null);
    reloadAnnotations();
  };

  const editAnnotation = async (id: string, patch: Partial<MapAnnotation>) => {
    const { error } = await updateAnnotation(id, patch);
    if (error) toast({ title: error });
    else reloadAnnotations();
  };

  const removeAnnotation = async (id: string) => {
    const { error } = await deleteAnnotation(id);
    if (error) toast({ title: error });
    else reloadAnnotations();
  };
  // Parish whose "would you be the contact?" offer is open, if any.
  const [pocOffer, setPocOffer] = useState<string | null>(null);

  // Chapter community areas, drawn by a Mayordomo in the admin editor.
  useEffect(() => {
    listSegments().then(setSegments);
  }, []);

  const reloadAnnotations = useCallback(() => {
    listAnnotations().then(setAnnotations);
  }, []);

  // Re-fetched when the viewer changes, because RLS answers a different
  // question for each one: signing in as a steward is what makes the
  // members-only and steward-only rows exist at all.
  useEffect(() => {
    reloadAnnotations();
  }, [reloadAnnotations, isAuthenticated, isApprovedMember, isAdmin]);

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

  // Which parishes have something coming up. One query for every parish and
  // every viewer — the window is filtered in Postgres, and the rows anon gets
  // back are the redacted ones, so signed-in and signed-out run exactly the
  // same code path. Ordering by date means the first row seen for a parish is
  // its soonest, so a plain "first wins" insert finds the next gathering.
  useEffect(() => {
    (async () => {
      const from = todayLocalISO(chapterToday());
      const until = new Date(chapterToday());
      until.setDate(until.getDate() + EVENT_WINDOW_DAYS);

      const { data, error } = await supabase
        .from('gatherings_public')
        .select('id, title, event_date, parish_id, location_text')
        .gte('event_date', from)
        .lte('event_date', todayLocalISO(until))
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Failed to load upcoming gatherings for map:', error);
        return;
      }

      const next = new Map<string, UpcomingGathering>();
      for (const g of data ?? []) {
        if (!g.parish_id || !g.id || !g.title || !g.event_date) continue;
        if (next.has(g.parish_id)) continue;
        next.set(g.parish_id, {
          id: g.id,
          title: g.title,
          eventDate: g.event_date,
          locationText: g.location_text,
        });
      }
      setUpcoming(next);
    })();
  }, []);

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

  // Parishes that can actually show a ring. Not every gathering inside the
  // window produces one: a gathering with no parish, or at a parish with no
  // approved members (which keeps it out of parish_member_counts, and so off
  // the map), has nowhere to put the mark. Deriving this instead of reading
  // upcoming.size is what stops the legend promising a ring that cannot
  // appear.
  const parishesWithUpcoming = useMemo(
    () => clusters.filter((c) => upcoming.has(c.key)),
    [clusters, upcoming]
  );

  // The "upcoming" filter hides parishes rather than dimming them, so the
  // clusters recount themselves around what is left and the numbers keep
  // meaning "members you can see".
  const visibleParishes = onlyUpcoming ? parishesWithUpcoming : clusters;

  const allPoints: [number, number][] = useMemo(
    () => [
      ...visibleParishes.map((c) => c.latLon),
      ...workshops.map((w) => [w.lat, w.lng] as [number, number]),
    ],
    [visibleParishes, workshops]
  );

  // Resolved against the VISIBLE set: filtering to "upcoming" should not
  // leave the sidebar describing a parish whose stamp is no longer on the
  // map. The key stays in state, so switching back to "all" restores it.
  // The list reads biggest-first, then alphabetically so equal counts keep a
  // stable order instead of shuffling with whatever Postgres returned.
  const listedParishes = useMemo(
    () =>
      [...visibleParishes].sort(
        (a, b) => b.memberCount - a.memberCount || a.parishName.localeCompare(b.parishName)
      ),
    [visibleParishes]
  );

  // Hover lighting is done by hand on the marker's own element rather than by
  // rebuilding its icon through React: pointing at a row should not re-render
  // every other marker on the map.
  //
  // A parish folded into a cluster has no element of its own, which would
  // leave those rows with no answer at all. getVisibleParent gives back the
  // cluster standing in for it, so the row still lights the thing on screen
  // that contains it.
  const highlightMarker = (key: string, on: boolean) => {
    const marker = markerRefs.current.get(key);
    if (!marker) return;
    const onScreen = clusterRef.current?.getVisibleParent(marker) ?? marker;
    onScreen?.getElement()?.classList.toggle('is-hovered', on);
  };

  // Row click → find the parish on the map. zoomToShowLayer is what makes
  // this work on a marker currently folded into a cluster: it zooms until
  // the marker stands alone, then runs the callback.
  const focusParish = (key: string) => {
    setSelectedParish(key);
    const marker = markerRefs.current.get(key);
    if (!marker) return;
    const group = clusterRef.current;
    if (group) {
      group.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      mapRef.current?.flyTo(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 12));
      marker.openPopup();
    }
  };

  // Marker click → bring its row into view, so the two halves never disagree
  // about what is selected.
  useEffect(() => {
    if (!selectedParish) return;
    rowRefs.current.get(selectedParish)?.scrollIntoView({ block: 'nearest' });
  }, [selectedParish]);

  const selected = visibleParishes.find((c) => c.key === selectedParish) ?? null;
  // Only POCs are ever loaded, so every listed name is a point of contact.
  const selectedPocs = selected?.members ?? [];

  return (
    <div
      className={
        presentation
          ? // h-full matters: the frame below asks for height:100%, and a grid
            // child with no height of its own resolves that to nothing.
            'grid h-full grid-cols-1'
          : 'grid grid-cols-1 gap-6 md:grid-cols-[1fr,280px]'
      }
    >
      <div
        ref={mapFrameRef}
        className="relative overflow-hidden rounded border border-mesquite/20"
        style={{ height: presentation ? '100%' : 460 }}
      >
        {!mapReady && (
          <div className="flex h-full items-center justify-center font-serif italic text-piedra/60">
            …
          </div>
        )}
        {mapReady && (
        <MapContainer
          ref={mapRef}
          center={view?.center ?? [29.6, -98.5]}
          zoom={view?.zoom ?? 9}
          minZoom={7}
          maxZoom={17}
          zoomSnap={0.5}
          zoomDelta={0.5}
          scrollWheelZoom={true}
          dragging={allowDrag}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Esri's light-gray canvas + a separate labels layer. Same quiet
              Positron-style look the palette was tuned for, without CARTO's
              "API KEY REQUIRED" watermark. Native tiles stop at z16; Leaflet
              upscales beyond that. */}
          {/* crossOrigin is what lets the PNG export read these tiles back
              out of the canvas. Esri answers with Access-Control-Allow-Origin:
              *, so the images stay untainted and toPng produces a map rather
              than an empty frame. */}
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={16}
            maxZoom={17}
            crossOrigin="anonymous"
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={16}
            maxZoom={17}
            zIndex={2}
            crossOrigin="anonymous"
          />
          {/* Frame members + all chapter areas, so the territory shows even
              before any members load — unless a link already said where to
              look. */}
          <FitBounds
            points={[...allPoints, ...segments.flatMap((s) => s.ring)]}
            enabled={!(syncUrl && initial.view)}
          />
          {syncUrl && <ViewReporter onView={setView} />}

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

          {/* Marginalia a steward has drawn. Rendered before the stamps so a
              shape never sits on top of a parish. */}
          {activeLayers.has('annotations') && <AnnotationLayer annotations={annotations} />}

          {needsDrawTools && (
            <AnnotationTools
              locale={locale}
              onDraw={handleDraw}
              onReshape={(id, geometry) => editAnnotation(id, { geometry })}
              onErase={removeAnnotation}
            />
          )}

          {/* Parish stamps, gathered into cluster stamps while the view is
              wide. Clustering switches off at z13, where parishes in the same
              town have separated enough to stand on their own. */}
          {activeLayers.has('parishes') && (
          <MarkerClusterGroup
            /* Remount the group whenever the marker set or the upcoming set
               changes. Two things make this necessary rather than tidy:
               markercluster caches the icon it built for a cluster, so a
               badge arriving with the later gatherings query would never be
               painted; and react-leaflet's updateMarker only ever reassigns
               position/icon/zIndex/opacity/draggable, so memberCount and
               hasUpcoming are fixed at construction. The set is a dozen
               markers, so rebuilding is free. */
            key={`${onlyUpcoming}:${visibleParishes.length}:${upcoming.size}`}
            ref={clusterRef}
            iconCreateFunction={buildClusterIcon}
            disableClusteringAtZoom={13}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={false}
            maxClusterRadius={48}
            chunkedLoading
          >
            {visibleParishes.map((c) => (
              <Marker
                key={c.key}
                position={c.latLon}
                memberCount={c.memberCount}
                hasUpcoming={upcoming.has(c.key)}
                icon={buildParishStamp(c.memberCount, c.key === selectedParish, upcoming.has(c.key))}
                ref={(m) => {
                  if (m) markerRefs.current.set(c.key, m);
                  else markerRefs.current.delete(c.key);
                }}
                eventHandlers={{ click: () => setSelectedParish(c.key) }}
              >
                <Popup>
                  <ParishCard
                    parish={c}
                    next={upcoming.get(c.key) ?? null}
                    onRsvp={startRsvp}
                  />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
          )}

          {activeLayers.has('gatherings') && workshops.map((w) =>
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
        )}
        {/* Soft inner vignette frames the open parchment so the wide,
            zoomed-out view reads as intentional rather than empty. */}
        <div className="map-vignette pointer-events-none absolute inset-0 z-[500] rounded" />

        {/* Map controls. Above the vignette but below Leaflet's popups
            (z700), so a popup opening near this corner is never covered. */}
        <div
          data-export-hide
          className="absolute right-3 top-3 z-[600] flex w-44 flex-col items-stretch gap-2"
        >
          <div className="flex overflow-hidden rounded-sm border border-mesquite/20 bg-cal/95 shadow-sm">
            {([false, true] as const).map((wantsUpcoming) => {
              const active = onlyUpcoming === wantsUpcoming;
              return (
                <button
                  key={String(wantsUpcoming)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setOnlyUpcoming(wantsUpcoming)}
                  className={`flex-1 px-2 py-1.5 font-heading text-xs transition ${
                    active
                      ? 'bg-ocre/15 text-mesquite'
                      : 'text-mesquite/60 hover:bg-ocre/5 hover:text-mesquite'
                  }`}
                >
                  {t(wantsUpcoming ? uiStrings.map.filterUpcoming : uiStrings.map.filterAll)}
                </button>
              );
            })}
          </div>

          {/* Layers, with the legend folded into the same list: each row is
              both the switch and the key to what it draws. */}
          <div className="overflow-hidden rounded-sm border border-mesquite/20 bg-cal/95 shadow-sm">
            <button
              type="button"
              onClick={() => setLayersOpen((v) => !v)}
              aria-expanded={layersOpen}
              className="flex w-full items-center justify-between px-2 py-1.5 font-heading text-xs text-mesquite"
            >
              {t(uiStrings.map.layers)}
              <span aria-hidden="true" className="text-ocre">{layersOpen ? '−' : '+'}</span>
            </button>

            {layersOpen && (
              <ul className="border-t border-mesquite/10 px-2 py-1.5">
                {LAYER_ORDER.map((key) => (
                  <li key={key}>
                    <label className="flex cursor-pointer items-center gap-2 py-1 font-serif text-xs text-mesquite">
                      <input
                        type="checkbox"
                        checked={activeLayers.has(key)}
                        onChange={() => toggleLayer(key)}
                        className="accent-ocre"
                      />
                      <span aria-hidden="true" className={`clm-key clm-key--${key}`} />
                      {t(uiStrings.map[LAYER_LABEL[key]])}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {syncUrl && (
            <div className="flex flex-col gap-1 rounded-sm border border-mesquite/20 bg-cal/95 p-1 shadow-sm">
              <button
                type="button"
                onClick={copyViewLink}
                className="px-2 py-1 text-left font-heading text-xs text-mesquite/80 transition hover:text-mesquite"
              >
                {t(uiStrings.map.copyLink)}
              </button>
              {/* Members and stewards only. The export carries member-only
                  marks when a member made it, so it is not a visitor's to
                  hand out. */}
              {(isApprovedMember || isAdmin) && (
                <button
                  type="button"
                  onClick={exportPng}
                  disabled={exporting}
                  className="px-2 py-1 text-left font-heading text-xs text-mesquite/80 transition hover:text-mesquite disabled:opacity-40"
                >
                  {exporting ? t(uiStrings.map.exporting) : t(uiStrings.map.exportPng)}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Presentation chrome. Only in presentation mode, and inside the map
            frame so it lands in the PNG export too. */}
        {presentation && (
          <>
            {title && (
              // Indented clear of Leaflet's zoom control, which sits top-left
              // at a higher z-index and would otherwise eat the first letter.
              <div className="absolute left-20 top-4 z-[600] max-w-[55%]">
                <h1 className="font-heading text-2xl leading-tight text-mesquite drop-shadow-[0_1px_2px_hsl(var(--cal))]">
                  {title}
                </h1>
              </div>
            )}
            <p className="absolute bottom-6 left-4 z-[600] display-caps text-[10px] tracking-[0.2em] text-ocre drop-shadow-[0_1px_2px_hsl(var(--cal))]">
              {t(uiStrings.eyebrow.chapter)}
            </p>
            <ul className="absolute bottom-6 right-4 z-[600] rounded-sm border border-mesquite/20 bg-cal/90 px-3 py-2">
              {LAYER_ORDER.filter((k) => activeLayers.has(k)).map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-2 py-0.5 font-serif text-xs text-mesquite"
                >
                  <span aria-hidden="true" className={`clm-key clm-key--${key}`} />
                  {t(uiStrings.map[LAYER_LABEL[key]])}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* The parish list. It is also the map's accessible equivalent: every
          parish, its count, whether something is coming up, and the same
          details the popup carries, all reachable by keyboard. Anything the
          stamps say, this says too. */}
      <aside
        aria-label={t(uiStrings.map.parishList)}
        hidden={presentation}
        className="rounded border border-mesquite/20 bg-cal/50"
      >
        {/* Phone: the list collapses so the map keeps the screen. It stays in
            the page flow rather than floating as a sheet — this map is one
            section of the homepage, and an overlay would cover the article
            around it. */}
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          aria-expanded={listOpen}
          className="flex w-full items-center justify-between p-4 font-heading text-sm text-mesquite md:hidden"
        >
          <span>
            {t(uiStrings.map.showList)}
            <span className="ml-2 text-piedra/70">{listedParishes.length}</span>
          </span>
          <span aria-hidden="true" className="text-ocre">{listOpen ? '−' : '+'}</span>
        </button>

        <div className={`${listOpen ? 'block' : 'hidden'} md:block`}>
          <div className="p-4 pb-2">
            <p className="display-caps text-[10px] tracking-[0.2em] text-ocre">
              {t(uiStrings.map.parishList)}
            </p>
            <p className="mt-1 font-serif text-xs italic text-piedra/70">
              {listedParishes.length === 0
                ? t(uiStrings.map.noneUpcoming)
                : t(uiStrings.map.listHint)}
            </p>
          </div>

          <ul className="max-h-[22rem] overflow-y-auto px-2 pb-2">
            {listedParishes.map((c) => {
              const isSelected = c.key === selectedParish;
              const hasUpcoming = upcoming.has(c.key);
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) rowRefs.current.set(c.key, el);
                      else rowRefs.current.delete(c.key);
                    }}
                    onClick={() => focusParish(c.key)}
                    onMouseEnter={() => highlightMarker(c.key, true)}
                    onMouseLeave={() => highlightMarker(c.key, false)}
                    /* Focus mirrors hover so a keyboard walk down the list
                       lights the same stamps a mouse would. */
                    onFocus={() => highlightMarker(c.key, true)}
                    onBlur={() => highlightMarker(c.key, false)}
                    aria-current={isSelected ? 'true' : undefined}
                    aria-expanded={isSelected}
                    className={`flex w-full items-baseline justify-between gap-2 rounded-sm px-2 py-1.5 text-left transition ${
                      isSelected ? 'bg-ocre/15' : 'hover:bg-ocre/5'
                    }`}
                  >
                    <span className="font-heading text-sm leading-tight text-mesquite">
                      {c.parishName}
                      {hasUpcoming && (
                        <>
                          {' '}
                          <span aria-hidden="true" className="text-ocre">●</span>
                          <span className="sr-only"> — {t(uiStrings.map.filterUpcoming)}</span>
                        </>
                      )}
                    </span>
                    <span className="shrink-0 font-caps text-xs text-piedra">{c.memberCount}</span>
                  </button>

                  {isSelected && (
                    <div className="border-l-2 border-ocre/40 px-3 py-2 pl-4">
                      <ParishCard
                        parish={c}
                        next={upcoming.get(c.key) ?? null}
                        onRsvp={startRsvp}
                      />

                      {/* POC emails live here rather than in the popup: the
                          popup is the glance, this is the panel you read. */}
                      {selectedPocs.some((m) => m.contactEmail) && (
                        <ul className="mt-2 space-y-0.5">
                          {selectedPocs
                            .filter((m) => m.contactEmail)
                            .map((m) => (
                              <li key={m.id}>
                                <a
                                  href={`mailto:${m.contactEmail}`}
                                  className="font-serif text-xs italic text-ocre hover:underline"
                                >
                                  {m.contactEmail}
                                </a>
                              </li>
                            ))}
                        </ul>
                      )}

                      {selectedPocs.length === 0 && (
                        <>
                          <p className="mt-2 font-serif text-xs italic text-piedra/70">
                            {locale === 'es'
                              ? 'Aún no hay un contacto designado para esta parroquia.'
                              : 'No point of contact listed yet for this parish.'}
                          </p>
                          {/* Someone who just opened their own parish and
                              found it unclaimed is the best candidate the
                              chapter will ever get for the role the whole
                              directory depends on, so ask them. */}
                          <button
                            type="button"
                            onClick={() => setPocOffer(c.parishName)}
                            className="mt-1 font-heading text-xs text-ocre underline-offset-4 transition hover:text-mesquite hover:underline"
                          >
                            {locale === 'es' ? '¿Te gustaría serlo? →' : 'Would you be the one? →'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="px-4 pb-4">
            {parishesWithUpcoming.length > 0 && (
              <p className="font-serif text-xs italic text-piedra/70">
                {t(uiStrings.map.upcomingRing)}
              </p>
            )}
            {!isApprovedMember && !user && (
              <p className="mt-3 border-t border-mesquite/10 pt-3 font-serif text-xs italic text-piedra/70">
                {t(uiStrings.workshop.memberOnlyMap)}
              </p>
            )}
          </div>
        </div>
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

      {/* One modal for every popup's RSVP button; portal-rendered, so it sits
          above the map rather than inside a Leaflet pane. */}
      <RsvpModal open={rsvp.modalOpen} onClose={rsvp.closeModal} onSubmit={rsvp.submit} />

      {needsDrawTools && (
        <AnnotationAdmin
          locale={locale}
          annotations={annotations}
          draft={draft}
          onDraftChange={setDraft}
          onDraftSave={saveDraft}
          onDraftCancel={() => setDraft(null)}
          onEdit={editAnnotation}
          onDelete={removeAnnotation}
          saving={savingDraft}
        />
      )}
    </div>
  );
};