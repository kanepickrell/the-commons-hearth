// src/components/camino/CaminoMap.tsx
// The corridor, drawn: twenty-one stops from Natchitoches to San Fernando
// Cathedral, the stages coloured, and the gaps marked where the road stops
// working on foot.
//
// Two things this map does that the parish map doesn't, and why:
//
//   · The gaps are drawn, not just listed. A dashed red span across the 85
//     miles between Crockett and Bryan says more about where the first
//     village goes than any paragraph does — the hole in the route and the
//     opportunity are the same object, and the map is the only place that
//     reads as one thing.
//   · Stops are numbered stamps rather than craft icons. This is a planning
//     map, so the order of the stops is the information; which saint the
//     parish is under is not, at this zoom.
//
// Colours reach Leaflet through tokenColor() rather than Tailwind, because
// Leaflet writes vector colours onto SVG presentation attributes where
// var() is never resolved. Same reason, same helper as ParishMap.

import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { useLocale } from '@/i18n/LocaleProvider';
import { tokenColor, type BrandToken } from '@/lib/tokens';
import { GAPS, STAGES, STOPS, type Stage } from '@/content/camino';

const stageToken = (s: Stage): BrandToken =>
  (STAGES.find((x) => x.key === s)?.token ?? 'mesquite') as BrandToken;

/** Numbered stamp. A divIcon so the number is real text, not baked artwork. */
const stamp = (n: number, color: string, anchor: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="
      width:26px;height:26px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:${tokenColor('cal')};
      border:${anchor ? 3 : 2}px solid ${color};
      box-shadow:0 1px 3px hsl(0 0% 0% / 0.25);
      font-family:'EB Garamond',Georgia,serif;font-size:12px;line-height:1;
      color:${tokenColor('mesquite')};
    ">${n}</div>`,
  });

/**
 * The last five stops are the official Camino de San Antonio Missions, and
 * they sit inside thirteen miles. At corridor zoom that is four pixels, so
 * five 26px stamps land on top of each other.
 *
 * Below this zoom they are drawn as one pill that flies the map down to them
 * when clicked; above it they are five ordinary stamps. Eleven is where the
 * tightest pair separates: Espada and San Juan are 1.06 miles apart, which
 * at z11 and this latitude is about 26 pixels, one stamp's width.
 *
 * Marker clustering is already a dependency here and was the other option.
 * It loses the numbers, and on a planning map the order of the stops is the
 * information.
 */
const SA_SPLIT_ZOOM = 11;

/** The grouped stamp. Wider than a numbered one, and reads as a range. */
const groupStamp = (label: string, color: string) =>
  L.divIcon({
    className: '',
    iconSize: [56, 26],
    iconAnchor: [28, 13],
    html: `<div style="
      width:56px;height:26px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:${tokenColor('cal')};
      border:2px solid ${color};
      box-shadow:0 1px 3px hsl(0 0% 0% / 0.25);
      font-family:'EB Garamond',Georgia,serif;font-size:12px;line-height:1;
      color:${tokenColor('mesquite')};
      cursor:zoom-in;
    ">${label}</div>`,
  });

/** Fit to the whole corridor once, on mount. */
const FitRoute = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [28, 28] });
  }, [map, points]);
  return null;
};

const SA_STOPS = STOPS.filter((s) => s.stage === 'missions-sa');

/** Centroid of the San Antonio five, for the grouped stamp. */
const SA_CENTRE: [number, number] = [
  SA_STOPS.reduce((a, s) => a + s.at[0], 0) / SA_STOPS.length,
  SA_STOPS.reduce((a, s) => a + s.at[1], 0) / SA_STOPS.length,
];

const StopMarkers = () => {
  const { t, locale } = useLocale();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: (e) => setZoom(e.target.getZoom()) });

  const grouped = zoom < SA_SPLIT_ZOOM;
  const shown = grouped ? STOPS.filter((s) => s.stage !== 'missions-sa') : STOPS;

  return (
    <>
      {shown.map((s) => (
        <Marker
          key={s.n}
          position={s.at}
          icon={stamp(s.n, tokenColor(stageToken(s.stage)), !!s.anchorCandidate)}
        >
          <Popup>
            <div style={{ minWidth: 190 }}>
              <p className="font-caps text-[10px] tracking-[0.18em] text-ocre">
                {s.n} · {t(STAGES.find((x) => x.key === s.stage)!.name)}
              </p>
              <p className="mt-1 font-heading text-base leading-snug text-mesquite">{s.name}</p>
              <p className="font-serif text-xs italic text-piedra">{s.town}</p>
              {s.note && (
                <p className="mt-2 font-serif text-xs leading-snug text-mesquite/80">{t(s.note)}</p>
              )}
              {s.anchorCandidate && (
                <p className="mt-2 font-caps text-[9px] tracking-[0.18em] text-rojo">
                  {locale === 'es' ? 'CANDIDATA A ALDEA ANCLA' : 'ANCHOR VILLAGE CANDIDATE'}
                </p>
              )}
              <p className="mt-2 font-serif text-[11px] text-piedra/80">{s.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Click zooms rather than opening a popup, because the useful thing
          to do with five stops in thirteen miles is look closer. */}
      {grouped && (
        <Marker
          position={SA_CENTRE}
          icon={groupStamp(
            `${SA_STOPS[0].n}–${SA_STOPS[SA_STOPS.length - 1].n}`,
            tokenColor(stageToken('missions-sa')),
          )}
          eventHandlers={{
            // Fit the five rather than flying to a fixed zoom, so the
            // cathedral at the north end cannot land off the top edge.
            click: () =>
              map.flyToBounds(L.latLngBounds(SA_STOPS.map((s) => s.at)), {
                padding: [48, 48],
                duration: 0.8,
              }),
          }}
        >
          <Tooltip direction="right" offset={[16, 0]}>
            <span className="font-serif text-xs">
              {locale === 'es'
                ? 'Las cinco paradas de San Antonio en trece millas. Clic para acercar.'
                : 'The five San Antonio stops, in thirteen miles. Click to zoom in.'}
            </span>
          </Tooltip>
        </Marker>
      )}
    </>
  );
};

export const CaminoMap = ({ height = 560 }: { height?: number }) => {
  const points = useMemo(() => STOPS.map((s) => s.at), []);

  // One polyline per stage, so each leg carries its own colour. Each starts
  // at the previous stage's last stop, or the line would break at the seams.
  const legs = useMemo(() => {
    const out: { stage: Stage; line: [number, number][] }[] = [];
    for (const stage of STAGES) {
      const idx = STOPS.map((s, i) => ({ s, i })).filter((x) => x.s.stage === stage.key);
      if (!idx.length) continue;
      const first = idx[0].i;
      const line = (first > 0 ? [STOPS[first - 1], ...idx.map((x) => x.s)] : idx.map((x) => x.s)).map(
        (s) => s.at,
      );
      out.push({ stage: stage.key, line });
    }
    return out;
  }, []);

  // The walker's gaps, as straight spans between the two towns they name.
  const gapLines = useMemo(
    () =>
      GAPS.map((g) => {
        const a = STOPS.find((s) => s.town.startsWith(g.from));
        const b = STOPS.find((s) => s.town.startsWith(g.to));
        return a && b ? { gap: g, line: [a.at, b.at] as [number, number][] } : null;
      }).filter((x): x is { gap: (typeof GAPS)[number]; line: [number, number][] } => !!x),
    [],
  );

  return (
    <div className="overflow-hidden rounded border border-mesquite/20" style={{ height }}>
      <MapContainer
        center={[30.7, -96.2]}
        zoom={7}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={16}
          crossOrigin="anonymous"
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={16}
          zIndex={2}
          crossOrigin="anonymous"
        />

        <FitRoute points={points} />

        {/* The gaps go underneath the road, drawn wide and soft, so a hole in
            the route reads as a place rather than as a missing line. */}
        {gapLines.map(({ gap, line }) => (
          <Polyline
            key={`gap-${gap.from}`}
            positions={line}
            pathOptions={{ color: tokenColor('rojo', 0.18), weight: 16, lineCap: 'round' }}
          />
        ))}

        {legs.map(({ stage, line }) => (
          <Polyline
            key={stage}
            positions={line}
            pathOptions={{ color: tokenColor(stageToken(stage)), weight: 3.5, opacity: 0.9 }}
          />
        ))}

        <StopMarkers />
      </MapContainer>
    </div>
  );
};
