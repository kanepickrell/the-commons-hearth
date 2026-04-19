import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { members } from '@/lib/fixtures/members';
import { workshops } from '@/lib/fixtures/workshops';
import { iconMap } from '@/lib/icons';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { buildPath } from '@/i18n/routes';
import { Link } from 'react-router-dom';

// Group members by their parish coordinate.
type ParishCluster = {
  key: string;
  parish: string;
  latLon: [number, number];
  members: typeof members;
};

const groupParishes = (): ParishCluster[] => {
  const map = new Map<string, ParishCluster>();
  for (const m of members) {
    const key = `${m.parishLatLon[0]}|${m.parishLatLon[1]}`;
    const existing = map.get(key);
    if (existing) {
      existing.members.push(m);
    } else {
      map.set(key, { key, parish: m.parish, latLon: m.parishLatLon, members: [m] });
    }
  }
  return Array.from(map.values());
};

const buildWorkshopIcon = (slug: keyof typeof iconMap) => {
  const meta = iconMap[slug];
  const initials = meta.name.es.replace(/^(La |El |Las |Los )/, '').slice(0, 2).toUpperCase();
  // Map pins need a visual container so they read on top of map tiles.
  // Quiet cream disc with a mesquite hairline, icon centered inside.
  const html = `
    <div style="
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      background: hsl(42 47% 92%);
      border: 1px solid hsl(92 24% 25% / 0.4);
      border-radius: 9999px;
      box-shadow: 0 1px 2px rgba(62,79,47,0.18);
      font-family: 'Marcellus SC', serif;
      color: hsl(92 24% 25%);
      font-size: 10px;
      letter-spacing: 0.05em;
      position: relative;
      overflow: hidden;
    ">
      <img src="${meta.src}" alt="" style="width:32px;height:32px;object-fit:contain;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${initials}'}))"/>
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
  const clusters = useMemo(groupParishes, []);
  const [selectedParish, setSelectedParish] = useState<string | null>(null);

  const allPoints: [number, number][] = useMemo(
    () => [...clusters.map((c) => c.latLon), ...workshops.map((w) => w.locationLatLon)],
    [clusters]
  );

  const selected = clusters.find((c) => c.key === selectedParish) ?? null;
  const selectedWorkshops = selected
    ? workshops.filter((w) => selected.members.some((m) => m.id === w.hostId))
    : [];

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
          <FitBounds points={allPoints} />

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
              eventHandlers={{
                click: () => setSelectedParish(c.key),
              }}
            >
              <Popup>
                <div className="font-heading text-mesquite">
                  <div className="text-base">{c.parish}</div>
                  <div className="text-sm text-piedra">
                    {c.members.length} {c.members.length === 1 ? t(uiStrings.common.member) : t(uiStrings.common.members)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {workshops.map((w) => (
            <Marker key={w.id} position={w.locationLatLon} icon={buildWorkshopIcon(w.iconSlug)}>
              <Popup>
                <div className="font-heading text-mesquite">
                  <div className="text-base leading-tight">{t(w.title)}</div>
                  <div className="mt-1 text-sm text-piedra">{w.locationName}</div>
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
          ))}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <aside className="rounded border border-mesquite/20 bg-cal/50 p-5">
        {selected ? (
          <>
            <h3 className="font-heading text-lg text-mesquite">{selected.parish}</h3>
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
            {selectedWorkshops.length > 0 && (
              <>
                <div className="rule my-4" />
                <p className="mb-2 font-heading text-sm text-piedra">
                  {t(uiStrings.workshop.upcoming)}
                </p>
                <ul className="space-y-2">
                  {selectedWorkshops.map((w) => (
                    <li key={w.id}>
                      <Link
                        to={buildPath('tallerDetail', locale, { id: w.id })}
                        className="font-heading text-sm text-mesquite no-underline hover:text-ocre"
                        style={{ textDecoration: 'none' }}
                      >
                        {t(w.title)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
