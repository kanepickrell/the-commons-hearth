// src/components/admin/GatheringPanel.tsx
// Admin panel for /mayordomo. Lists every upcoming gathering (any status) and
// lets a steward edit its details — title, description, craft, parish,
// location, date/time, map coordinates, and status.
//
// Why this panel exists: the parish map only draws a gathering pin when the
// gathering is APPROVED *and* has lat/lng *and* has a craft. All three are
// optional at submission time, so a gathering can be perfectly valid yet never
// appear on the map. Each row surfaces exactly what's missing ("Won't show on
// the map yet") so the fix is obvious, and coordinates can be added right here.
//
// Writes go through the admin_update_gathering RPC (SECURITY DEFINER), the same
// pattern as approve_workshop / set_parish_coords — the workshops table itself
// is not directly writable by the client under RLS.

import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/i18n/LocaleProvider';
import { toast } from '@/hooks/use-toast';
import { Icon } from '@/components/Icon';
import { iconMap } from '@/lib/icons';
import type { Database } from '@/lib/database.types';
import type { IconSlug } from '@/lib/types';

type Status = Database['public']['Enums']['content_status'];

// Only the eight crafts that have icons can render a map pin, so the picker is
// scoped to those — matching the "Host a gathering" form.
const CRAFT_SLUGS = Object.keys(iconMap) as IconSlug[];

type Parish = { id: string; name: string; city: string | null };

type Gathering = {
  id: string;
  title: string;
  description: string | null;
  craft: string | null;
  location_text: string | null;
  held_at: string;
  lat: number | null;
  lng: number | null;
  status: Status;
  language: 'en' | 'es' | null;
  parish_id: string | null;
  parish: { name: string; city: string | null } | null;
  host: { display_name: string | null } | null;
};

const inputClass =
  'w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none';

// timestamptz (ISO) -> value for <input type="datetime-local"> in local time.
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export const GatheringPanel = () => {
  const { locale, t } = useLocale();
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [gRes, pRes] = await Promise.all([
      supabase
        .from('workshops')
        .select(
          'id, title, description, craft, location_text, held_at, lat, lng, status, language, parish_id, parish:parishes(name, city), host:profiles!workshops_host_id_fkey(display_name)'
        )
        .gte('held_at', startOfToday.toISOString())
        .order('held_at', { ascending: true }),
      supabase.from('parishes').select('id, name, city').order('name'),
    ]);

    if (gRes.error) {
      toast({
        title: t({ en: 'Could not load gatherings', es: 'No pudimos cargar las reuniones' }),
        description: gRes.error.message,
        variant: 'destructive',
      });
      setGatherings([]);
    } else {
      setGatherings((gRes.data ?? []) as unknown as Gathering[]);
    }
    if (pRes.data) setParishes(pRes.data as Parish[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id));

  if (loading) {
    return <p className="font-serif italic text-piedra">…</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl text-mesquite md:text-4xl">
          {t({ en: 'Manage gatherings', es: 'Administrar reuniones' })}
        </h2>
        <p className="mt-2 font-serif text-lg italic text-mesquite/70">
          {t({
            en: 'Upcoming gatherings. Edit details, add map coordinates, and approve — a gathering shows on the map once it is approved and has both coordinates and a craft.',
            es: 'Reuniones próximas. Edita detalles, agrega coordenadas y aprueba — una reunión aparece en el mapa cuando está aprobada y tiene coordenadas y un oficio.',
          })}
        </p>
      </div>

      {gatherings.length === 0 ? (
        <div className="rounded-sm border border-mesquite/15 bg-cal/40 p-8 text-center">
          <p className="font-serif text-lg italic text-mesquite/60">
            {t({ en: 'No upcoming gatherings.', es: 'No hay reuniones próximas.' })}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-mesquite/10 border-y border-mesquite/10">
          {gatherings.map((g) => {
            const isExpanded = expanded === g.id;
            const blockers = mapBlockers(g);
            return (
              <li key={g.id} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <button onClick={() => toggle(g.id)} className="flex-1 text-left">
                    <span className="font-heading text-lg text-mesquite">{g.title}</span>
                    <span className="ml-2 font-serif text-sm italic text-piedra">
                      {new Date(g.held_at).toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {g.host?.display_name ? ` · ${g.host.display_name}` : ''}
                    </span>
                  </button>
                  <div className="flex flex-shrink-0 items-center gap-2 text-xs">
                    <StatusBadge status={g.status} locale={locale} />
                    <span className="font-serif text-piedra/60">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {blockers.length > 0 && (
                  <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-sm border border-rojo/30 bg-rojo/5 px-2 py-1 font-serif text-xs italic text-rojo">
                    {locale === 'es' ? 'Aún no aparece en el mapa:' : "Won't show on the map yet:"}{' '}
                    {blockers.map((b) => blockerLabel(b, locale)).join(' · ')}
                  </p>
                )}

                {isExpanded && (
                  <GatheringEditor
                    key={g.id}
                    gathering={g}
                    parishes={parishes}
                    locale={locale}
                    onSaved={async () => {
                      await load();
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

// What's keeping this gathering off the map, in order.
type Blocker = 'status' | 'coords' | 'craft';
function mapBlockers(g: Gathering): Blocker[] {
  const out: Blocker[] = [];
  if (g.status !== 'approved') out.push('status');
  if (g.lat == null || g.lng == null) out.push('coords');
  if (!g.craft || !(g.craft in iconMap)) out.push('craft');
  return out;
}
function blockerLabel(b: Blocker, locale: 'en' | 'es') {
  const map = {
    status: { en: 'needs approval', es: 'falta aprobación' },
    coords: { en: 'needs coordinates', es: 'faltan coordenadas' },
    craft: { en: 'needs a craft', es: 'falta un oficio' },
  } as const;
  return map[b][locale];
}

function StatusBadge({ status, locale }: { status: Status; locale: 'en' | 'es' }) {
  const styles: Record<Status, string> = {
    approved: 'bg-ocre/10 text-ocre',
    pending: 'bg-mesquite/10 text-mesquite/60',
    rejected: 'bg-rojo/10 text-rojo',
  };
  const label: Record<Status, { en: string; es: string }> = {
    approved: { en: 'approved', es: 'aprobada' },
    pending: { en: 'pending', es: 'pendiente' },
    rejected: { en: 'rejected', es: 'rechazada' },
  };
  return (
    <span className={`rounded-sm px-2 py-0.5 ${styles[status]}`}>{label[status][locale]}</span>
  );
}

// ---------------------------------------------------------------------------
// GatheringEditor — full detail form for one gathering. Seeded from the row;
// remounts (via key) when a different gathering is opened.
// ---------------------------------------------------------------------------
function GatheringEditor({
  gathering,
  parishes,
  locale,
  onSaved,
}: {
  gathering: Gathering;
  parishes: Parish[];
  locale: 'en' | 'es';
  onSaved: () => Promise<void>;
}) {
  const { t } = useLocale();
  const [title, setTitle] = useState(gathering.title);
  const [description, setDescription] = useState(gathering.description ?? '');
  const [craft, setCraft] = useState<string>(gathering.craft ?? '');
  const [parishId, setParishId] = useState(gathering.parish_id ?? '');
  const [locationText, setLocationText] = useState(gathering.location_text ?? '');
  const [heldAt, setHeldAt] = useState(toLocalInput(gathering.held_at));
  const [latInput, setLatInput] = useState(gathering.lat?.toString() ?? '');
  const [lngInput, setLngInput] = useState(gathering.lng?.toString() ?? '');
  const [status, setStatus] = useState<Status>(gathering.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parish = parishes.find((p) => p.id === parishId) ?? null;
  const mapsQuery = encodeURIComponent(
    [locationText, parish?.name, parish?.city, 'Texas'].filter(Boolean).join(', ')
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // Accept a pasted "29.49, -98.46" into the latitude field and split it.
  const handleLatChange = (v: string) => {
    if (v.includes(',')) {
      const [a, b] = v.split(',').map((s) => s.trim());
      if (a && b && !isNaN(parseFloat(a)) && !isNaN(parseFloat(b))) {
        setLatInput(a);
        setLngInput(b);
        return;
      }
    }
    setLatInput(v);
  };

  const parseCoords = (): { lat: number | null; lng: number | null } | 'error' => {
    const latRaw = latInput.trim();
    const lngRaw = lngInput.trim();
    if (!latRaw && !lngRaw) return { lat: null, lng: null }; // clearing coords is allowed
    const lat = parseFloat(latRaw);
    const lng = parseFloat(lngRaw);
    if (isNaN(lat) || isNaN(lng)) return 'error';
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return 'error';
    return { lat, lng };
  };

  const save = async () => {
    setError(null);

    if (title.trim().length < 3) {
      setError(t({ en: 'Title needs at least 3 characters.', es: 'El título necesita al menos 3 caracteres.' }));
      return;
    }
    const coords = parseCoords();
    if (coords === 'error') {
      setError(
        t({
          en: 'Coordinates look invalid. Use "29.49, -98.46" or clear both fields.',
          es: 'Las coordenadas no son válidas. Usa "29.49, -98.46" o deja ambos campos vacíos.',
        })
      );
      return;
    }
    const when = new Date(heldAt);
    if (isNaN(when.getTime())) {
      setError(t({ en: 'Pick a valid date and time.', es: 'Elige una fecha y hora válidas.' }));
      return;
    }

    setSaving(true);
    const { error: rpcErr } = await supabase.rpc('admin_update_gathering', {
      p_id: gathering.id,
      p_title: title.trim(),
      p_description: description.trim() || null,
      p_craft: craft || null,
      p_location_text: locationText.trim() || null,
      p_held_at: when.toISOString(),
      p_lat: coords.lat,
      p_lng: coords.lng,
      p_parish_id: parishId || null,
      p_status: status,
    });
    setSaving(false);

    if (rpcErr) {
      setError(rpcErr.message);
      toast({
        title: t({ en: 'Could not save', es: 'No pudimos guardar' }),
        description: rpcErr.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: t({ en: 'Gathering saved', es: 'Reunión guardada' }) });
    await onSaved();
  };

  return (
    <div className="mt-4 space-y-5 rounded-sm bg-cal/40 p-4">
      <FieldRow label={t({ en: 'Title', es: 'Título' })}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </FieldRow>

      <FieldRow label={t({ en: 'Description', es: 'Descripción' })}>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </FieldRow>

      <FieldRow
        label={t({ en: 'Craft', es: 'Oficio' })}
        hint={t({ en: 'Sets the map icon', es: 'Define el ícono del mapa' })}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CRAFT_SLUGS.map((slug) => {
            const selected = craft === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setCraft(selected ? '' : slug)}
                className={`flex flex-col items-center gap-1.5 rounded-sm border p-3 text-center transition ${
                  selected
                    ? 'border-ocre bg-ocre/10 text-mesquite'
                    : 'border-mesquite/15 bg-cal/40 text-mesquite/60 hover:border-mesquite/40 hover:text-mesquite'
                }`}
              >
                <Icon slug={slug} size={32} locale={locale} />
                <span className="font-heading text-[11px] leading-tight">
                  {iconMap[slug].name[locale]}
                </span>
              </button>
            );
          })}
        </div>
      </FieldRow>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label={t({ en: 'Parish', es: 'Parroquia' })}>
          <select value={parishId} onChange={(e) => setParishId(e.target.value)} className={inputClass}>
            <option value="">{t({ en: '— none —', es: '— ninguna —' })}</option>
            {parishes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.city ? ` · ${p.city}` : ''}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label={t({ en: 'Date and time', es: 'Fecha y hora' })}>
          <input
            type="datetime-local"
            value={heldAt}
            onChange={(e) => setHeldAt(e.target.value)}
            className={inputClass}
          />
        </FieldRow>
      </div>

      <FieldRow label={t({ en: 'Location', es: 'Lugar' })}>
        <input
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          placeholder={t({ en: 'e.g. The Abernathy place, Helotes', es: 'ej. La casa de los Abernathy, Helotes' })}
          className={inputClass}
        />
      </FieldRow>

      {/* Coordinates */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <label className="font-heading text-sm text-mesquite">
            {t({ en: 'Map coordinates', es: 'Coordenadas del mapa' })}
          </label>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif text-xs italic text-ocre hover:underline"
          >
            {t({ en: 'Look up on Google Maps →', es: 'Buscar en Google Maps →' })}
          </a>
        </div>
        <p className="mb-2 font-serif text-xs italic text-piedra">
          {t({
            en: 'On Google Maps, right-click the spot — the first menu item copies lat/lng. Paste into the first field.',
            es: 'En Google Maps, clic derecho en el lugar — el primer campo copia lat/lng. Pega en el primer campo.',
          })}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={latInput}
            onChange={(e) => handleLatChange(e.target.value)}
            placeholder={t({ en: 'Latitude', es: 'Latitud' })}
            className={`${inputClass} font-mono sm:w-48`}
          />
          <input
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            placeholder={t({ en: 'Longitude', es: 'Longitud' })}
            className={`${inputClass} font-mono sm:w-48`}
          />
        </div>
      </div>

      {/* Status */}
      <FieldRow label={t({ en: 'Status', es: 'Estado' })}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className={`${inputClass} sm:w-48`}
        >
          <option value="pending">{t({ en: 'Pending', es: 'Pendiente' })}</option>
          <option value="approved">{t({ en: 'Approved', es: 'Aprobada' })}</option>
          <option value="rejected">{t({ en: 'Rejected', es: 'Rechazada' })}</option>
        </select>
      </FieldRow>

      {error && (
        <p className="rounded-sm border border-rojo/30 bg-rojo/5 p-3 font-serif text-sm text-rojo">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-sm bg-ocre px-6 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? t({ en: 'Saving…', es: 'Guardando…' }) : t({ en: 'Save changes', es: 'Guardar cambios' })}
        </button>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-heading text-sm text-mesquite">
        {label}
        {hint && <span className="ml-2 font-serif text-xs italic text-mesquite/50">{hint}</span>}
      </label>
      {children}
    </div>
  );
}