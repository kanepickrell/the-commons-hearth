// src/components/map/AnnotationLayer.tsx
// Draws the rows of `map_annotations` onto the parish map.
//
// Every annotation renders through one <GeoJSON>, whatever its geometry: a
// Polygon or LineString becomes a path, a Point becomes a text label (or a
// small mark when it has no label). Keeping one component per row is what
// lets each carry its own id into Leaflet, which is how the admin tools find
// the row again after someone drags a vertex.
//
// Nothing here filters by audience. The three RLS policies on the table
// decide which rows are sent at all, so if a shape is in this array, this
// viewer is allowed to see it.

import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { useLocale } from '@/i18n/LocaleProvider';
import { tokenColor } from '@/lib/tokens';
import type { MapAnnotation } from '@/lib/annotations';

declare module 'leaflet' {
  interface LayerOptions {
    /** Row id of the map_annotations record this layer was drawn from. */
    annotationId?: string;
  }
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );

/**
 * A point annotation is a word set on the land. The icon box is collapsed to
 * nothing and the text centred inside it, because Leaflet drives the icon
 * element's own transform for positioning and a transform of ours would
 * replace it.
 */
const labelIcon = (text: string) =>
  L.divIcon({
    html: `<span>${escapeHtml(text)}</span>`,
    className: 'clm-annotation-label',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const markIcon = () =>
  L.divIcon({ html: '', className: 'clm-annotation-mark', iconSize: [12, 12], iconAnchor: [6, 6] });

export const AnnotationLayer = ({ annotations }: { annotations: MapAnnotation[] }) => {
  const { locale } = useLocale();

  return (
    <>
      {annotations.map((a) => {
        const label = (locale === 'es' ? a.labelEs : a.labelEn) ?? a.labelEn ?? a.labelEs ?? '';
        const color = tokenColor(a.style.color ?? 'ocre');

        const feature: Feature<Geometry, { annotationId: string }> = {
          type: 'Feature',
          geometry: a.geometry as Geometry,
          properties: { annotationId: a.id },
        };

        return (
          <GeoJSON
            // Leaflet's GeoJSON layer never re-reads `data`, so an edited
            // shape has to come back as a new layer.
            key={`${a.id}:${a.updatedAt ?? ''}:${locale}`}
            data={feature}
            pathOptions={{
              color,
              weight: a.style.weight ?? 2,
              opacity: 0.85,
              fillColor: color,
              fillOpacity: a.style.fillOpacity ?? 0.08,
              dashArray: a.style.dashed ? '6 5' : undefined,
            }}
            pointToLayer={(_f, latlng) =>
              L.marker(latlng, {
                icon: label ? labelIcon(label) : markIcon(),
                interactive: !label,
                annotationId: a.id,
              })
            }
            onEachFeature={(_f, layer) => {
              // Stamped on the layer itself so pm:update / pm:remove can say
              // which row the shape the steward just dragged belongs to.
              layer.options.annotationId = a.id;
              if (label && a.geometry.type !== 'Point') {
                layer.bindTooltip(label, {
                  permanent: true,
                  direction: 'center',
                  className: 'seg-label',
                  opacity: 1,
                });
              }
            }}
          />
        );
      })}
    </>
  );
};
