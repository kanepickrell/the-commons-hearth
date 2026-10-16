// src/components/map/AnnotationTools.tsx
// The steward's drawing toolbar for map annotations. Mounted inside the
// MapContainer and only for admins.
//
// This component does NOT import Geoman. ParishMap loads it before the map
// is constructed and holds the map back until it has, because Geoman installs
// itself through L.Map.addInitHook — which only ever runs for maps created
// after the import. Importing it from in here, inside a child's effect, left
// `map.pm` permanently undefined on an already-built map, and Geoman's own
// layeradd handler then dereferenced it on the next marker added and took the
// whole page down with it. By the time this mounts, `map.pm` exists.
//
// Separate from the community-area editor in Mayordomo → Areas, which keeps
// its own map and its own leaflet-draw instance. The two never share a map,
// so the two drawing libraries never meet.
//
// Division of labour: Geoman owns geometry — drawing a new shape, dragging a
// vertex, removing one. Everything else about an annotation (its words, who
// may see it, its color) belongs to the panel beside the map, because a
// toolbar is a poor place to ask "who is this for?".

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { AnnotationGeometry } from '@/lib/annotations';

type Props = {
  /** A shape was just drawn; the parent decides what it says and who sees it. */
  onDraw: (geometry: AnnotationGeometry) => void;
  /** An existing shape was reshaped or dragged. */
  onReshape: (id: string, geometry: AnnotationGeometry) => void;
  /** An existing shape was removed with the eraser. */
  onErase: (id: string) => void;
  locale: 'en' | 'es';
};

type PmLayer = L.Layer & { toGeoJSON?: () => { geometry?: AnnotationGeometry } };

const geometryOf = (layer: PmLayer): AnnotationGeometry | null => {
  const gj = layer.toGeoJSON?.();
  const geometry = gj?.geometry;
  if (!geometry) return null;
  return ['Point', 'LineString', 'Polygon'].includes(geometry.type) ? geometry : null;
};

export const AnnotationTools = ({ onDraw, onReshape, onErase, locale }: Props) => {
  const map = useMap();
  // Handlers change identity every render; the Geoman listeners are bound
  // once, so they read the current ones through a ref instead of being
  // rebound (which would mean tearing the toolbar down mid-draw).
  const handlers = useRef({ onDraw, onReshape, onErase });
  handlers.current = { onDraw, onReshape, onErase };

  useEffect(() => {
    // Should always be present (ParishMap gates on it), but a missing pm must
    // never again be the thing that throws.
    if (!map.pm) {
      console.error('Geoman is not initialised on this map; draw tools skipped.');
      return;
    }

    {
      map.pm.setLang(locale === 'es' ? 'es' : 'en');
      map.pm.addControls({
        position: 'topleft',
        drawMarker: true,
        drawPolyline: true,
        drawPolygon: true,
        drawCircle: false,
        drawCircleMarker: false,
        drawRectangle: false,
        drawText: false, // our labels are Points with EN/ES text, not Geoman's
        editMode: true,
        dragMode: true,
        removalMode: true,
        rotateMode: false,
        cutPolygon: false,
      });

      map.on('pm:create', (e: { layer: PmLayer }) => {
        const geometry = geometryOf(e.layer);
        // The drawn layer is scratch. The annotation comes back from the
        // database on the next load, so this one must not linger as a twin.
        map.removeLayer(e.layer);
        if (geometry) handlers.current.onDraw(geometry);
      });

      map.on('pm:remove', (e: { layer: PmLayer }) => {
        const id = e.layer.options?.annotationId;
        if (id) handlers.current.onErase(id);
      });

      // pm:update fires on the edited layer after edit mode commits; pm:dragend
      // after a drag. Both mean "this shape has new coordinates".
      const persist = (e: { layer: PmLayer }) => {
        const id = e.layer.options?.annotationId;
        const geometry = geometryOf(e.layer);
        if (id && geometry) handlers.current.onReshape(id, geometry);
      };
      map.on('pm:update', persist);
      map.on('pm:dragend', persist);
    }

    return () => {
      map.off('pm:create');
      map.off('pm:remove');
      map.off('pm:update');
      map.off('pm:dragend');
      map.pm?.removeControls();
    };
  }, [map, locale]);

  return null;
};
