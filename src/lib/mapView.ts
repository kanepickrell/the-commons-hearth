// src/lib/mapView.ts
// The map's view, encoded in the URL so a link carries it.
//
//   /map?c=29.42,-98.49&z=11&layers=parishes,annotations&filter=upcoming
//
// A steward sends that link to a parish office or drops it in a Phase II
// packet, and whoever opens it lands on exactly the view that was meant —
// same ground, same zoom, same layers lit.
//
// Everything here is defensive: a hand-edited or truncated link should land
// somewhere sensible rather than on a blank world, so each parameter falls
// back on its own and a bad one is ignored rather than fatal.

export type MapFilter = 'all' | 'upcoming';

export type MapView = {
  center: [number, number];
  zoom: number;
};

export type MapViewState = {
  view: MapView | null;
  layers: string[] | null;
  filter: MapFilter | null;
  present: boolean;
};

const ZOOM_MIN = 7;
const ZOOM_MAX = 17;

const parseCenter = (raw: string | null): [number, number] | null => {
  if (!raw) return null;
  const [lat, lng] = raw.split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
};

const parseZoom = (raw: string | null): number | null => {
  if (!raw) return null;
  const z = Number(raw);
  if (!Number.isFinite(z)) return null;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
};

export const readViewState = (params: URLSearchParams): MapViewState => {
  const center = parseCenter(params.get('c'));
  const zoom = parseZoom(params.get('z'));
  const layersRaw = params.get('layers');
  const filterRaw = params.get('filter');

  return {
    // A view needs both halves to mean anything; half of one is no view.
    view: center && zoom !== null ? { center, zoom } : null,
    layers: layersRaw === null ? null : layersRaw.split(',').filter(Boolean),
    filter: filterRaw === 'upcoming' ? 'upcoming' : filterRaw === 'all' ? 'all' : null,
    present: params.get('present') === '1',
  };
};

/** Five decimals is a metre or so — more is noise in a link someone reads. */
const fmt = (n: number) => n.toFixed(5).replace(/\.?0+$/, '');

export const writeViewState = (
  params: URLSearchParams,
  state: { view: MapView; layers: string[]; filter: MapFilter }
): URLSearchParams => {
  const next = new URLSearchParams(params);
  next.set('c', `${fmt(state.view.center[0])},${fmt(state.view.center[1])}`);
  next.set('z', String(state.view.zoom));
  next.set('layers', state.layers.join(','));
  next.set('filter', state.filter);
  return next;
};
