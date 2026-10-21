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
  MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, Circle, CircleMarker,
  useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { useLocale } from '@/i18n/LocaleProvider';
import { tokenColor, type BrandToken } from '@/lib/tokens';
import {
  ANCHORS, CHAPTERS, CHAPTER_REACH_MILES, GAPS, STAGES, STOPS, chapterFor,
  householdsAt, hostedYear, milesBetween, type Stage,
} from '@/content/camino';

const stageToken = (s: Stage): BrandToken =>
  (STAGES.find((x) => x.key === s)?.token ?? 'mesquite') as BrandToken;

/**
 * Numbered stamp. A divIcon so the number is real text, not baked artwork.
 *
 * `hosted` is the timeline's main tell: a stop with a parish host is solid
 * and inked, one still wanting a host is dashed and greyed. Scrubbing the
 * year fills the road in from the chapters outward, which is the whole
 * argument made visible.
 */
const stamp = (n: number, color: string, anchor: boolean, hosted: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="
      width:26px;height:26px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:${hosted ? tokenColor('cal') : tokenColor('cal', 0.55)};
      border:${anchor ? 3 : 2}px ${hosted ? 'solid' : 'dashed'} ${
        hosted ? color : tokenColor('piedra', 0.6)
      };
      box-shadow:${hosted ? '0 1px 3px hsl(0 0% 0% / 0.25)' : 'none'};
      font-family:'EB Garamond',Georgia,serif;font-size:12px;line-height:1;
      color:${hosted ? tokenColor('mesquite') : tokenColor('piedra', 0.7)};
    ">${n}</div>`,
  });

/**
 * A chapter. A filled verde disc with a sprout, so it reads as a living body
 * rather than another numbered point on the road: the stops are places, the
 * chapters are people who are already there.
 */
const chapterStamp = () =>
  L.divIcon({
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div style="
      width:22px;height:22px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:${tokenColor('verde')};
      border:2px solid ${tokenColor('cal')};
      box-shadow:0 1px 3px hsl(0 0% 0% / 0.3);
    "><svg width="12" height="12" viewBox="0 0 12 12" fill="none"
        stroke="${tokenColor('cal')}" stroke-width="1.5" stroke-linecap="round">
      <path d="M6 10.5V4"/><path d="M6 5.5C6 4 4.8 3 3.2 3 3.2 4.6 4.3 5.5 6 5.5Z" fill="${tokenColor('cal')}"/>
      <path d="M6 6.8C6 5.3 7.2 4.3 8.8 4.3 8.8 5.9 7.7 6.8 6 6.8Z" fill="${tokenColor('cal')}"/>
    </svg></div>`,
  });

/** Metres in a mile, for Leaflet's Circle, which works in metres. */
const MILE_M = 1609.34;

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

/**
 * The chapters, their reach, and the stops each one would carry.
 *
 * Drawn UNDER the road and the stops so the road stays the subject. The
 * reach circle is the honest part: sixty miles is a day's drive and back,
 * and seeing the circles land on the road is the argument that this corridor
 * is not a line someone drew, it is where these chapters already are.
 *
 * Positions are approximate and the names are placeholders. See the warning
 * over CHAPTERS in content/camino.ts.
 */
const ChapterLayer = ({ year }: { year: number }) => {
  const { t } = useLocale();

  return (
    <>
      {CHAPTERS.map((c) => (
        <Circle
          key={`reach-${c.id}`}
          center={c.at}
          radius={CHAPTER_REACH_MILES * MILE_M}
          pathOptions={{
            color: tokenColor('verde', 0.45),
            fillColor: tokenColor('verde', 0.07),
            fillOpacity: 1,
            weight: 1,
            dashArray: '4 4',
          }}
          interactive={false}
        />
      ))}

      {/* A thread from each chapter to the stops it carries. Off at year 0,
          because at year 0 nobody has asked them yet. */}
      {year >= 1 &&
        CHAPTERS.flatMap((c) =>
          c.carries.map((n) => {
            const stop = STOPS.find((x) => x.n === n);
            if (!stop) return null;
            return (
              <Polyline
                key={`link-${c.id}-${n}`}
                positions={[c.at, stop.at]}
                pathOptions={{
                  color: tokenColor('verde', 0.5),
                  weight: 1,
                  dashArray: '2 4',
                }}
                interactive={false}
              />
            );
          }),
        )}

      {CHAPTERS.map((c) => (
        <Marker key={c.id} position={c.at} icon={chapterStamp()}>
          <Popup>
            <div style={{ minWidth: 190 }}>
              <p className="font-caps text-[10px] tracking-[0.18em] text-verde">
                {t({ en: 'CLM CHAPTER', es: 'CAPÍTULO MCT' })}
              </p>
              <p className="mt-1 font-heading text-base leading-snug text-mesquite">
                {t(c.name)}
              </p>
              <p className="font-serif text-xs italic text-piedra">
                {t({ en: 'Diocese of', es: 'Diócesis de' })} {c.diocese}
              </p>
              <p className="mt-2 font-serif text-xs leading-snug text-mesquite/80">
                {t({ en: 'Carries stops', es: 'Lleva las paradas' })}{' '}
                {c.carries[0]}–{c.carries[c.carries.length - 1]}
              </p>
              <p className="mt-2 font-serif text-[11px] italic text-piedra/80">
                {t({
                  en: 'Placeholder name and approximate position.',
                  es: 'Nombre provisional y posición aproximada.',
                })}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

/**
 * The villages, as discs that grow with the households in them.
 *
 * Area rather than radius tracks the count, so thirty households does not
 * read as ten times thirty acres of ink. Radius is sqrt-scaled for that
 * reason.
 */
const VillageLayer = ({ year }: { year: number }) => {
  const { t } = useLocale();

  return (
    <>
      {ANCHORS.map((v) => {
        const households = householdsAt(v.startYear, year);
        if (!households) return null;
        const stop = STOPS.find((x) => x.n === v.stop);
        if (!stop) return null;
        return (
          <CircleMarker
            key={v.name}
            center={stop.at}
            radius={13 + Math.sqrt(households) * 3.4}
            pathOptions={{
              color: tokenColor('ocre', 0.55),
              fillColor: tokenColor('ocre', 0.3),
              fillOpacity: 1,
              weight: 1.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="font-serif text-xs">
                <strong>{v.name}</strong> · {households}{' '}
                {t({ en: 'households', es: 'hogares' })}
                {v.proposed && (
                  <em> · {t({ en: 'proposed', es: 'propuesta' })}</em>
                )}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
};

const StopMarkers = ({ year }: { year: number }) => {
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
          icon={stamp(
            s.n,
            tokenColor(stageToken(s.stage)),
            !!s.anchorCandidate,
            year >= hostedYear(s.n),
          )}
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
              <p className="mt-2 font-serif text-xs text-mesquite/80">
                {(() => {
                  const id = chapterFor(s.n);
                  const ch = CHAPTERS.find((c) => c.id === id);
                  if (!ch) {
                    return locale === 'es'
                      ? 'Sin capítulo al alcance todavía'
                      : 'No chapter in reach yet';
                  }
                  const d = Math.round(milesBetween(s.at, ch.at));
                  return `${locale === 'es' ? 'Lo lleva' : 'Carried by'} ${t(ch.name)}, ${d} mi`;
                })()}
              </p>
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

export const CaminoMap = ({
  height = 560,
  year = 0,
}: {
  height?: number;
  /** Model year. Drives hosted stops, villages, and which gaps are shut. */
  year?: number;
}) => {
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
        {/* Chapters go under the road: the road is the subject. */}
        <ChapterLayer year={year} />

        {/* A closed gap stops being drawn. Watching the red spans go out as
            the year advances is the plan working. */}
        {gapLines
          .filter(({ gap }) => year < gap.closesInYear)
          .map(({ gap, line }) => (
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

        <VillageLayer year={year} />
        <StopMarkers year={year} />
      </MapContainer>
    </div>
  );
};
