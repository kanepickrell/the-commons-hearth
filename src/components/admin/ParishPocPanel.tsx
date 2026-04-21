// src/components/admin/ParishPocPanel.tsx
// Admin panel for /mayordomo. Lets admins:
//   - See parishes with members
//   - Manually enter lat/lng for parishes missing coords (with a Google Maps
//     search link for quick lookup — right-click the pin on Google Maps and
//     the first menu item copies lat,lng to clipboard)
//   - Assign POCs and set their contact email
//
// Manual entry is more reliable than auto-geocoding for specific parishes,
// since many churches aren't indexed well in public geocoders.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/i18n/LocaleProvider';
import { toast } from '@/hooks/use-toast';

type ParishRow = {
  id: string;
  name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  member_count: number;
  poc_count: number;
};

type MemberInParish = {
  id: string;
  display_name: string | null;
  is_poc: boolean;
  contact_email: string | null;
  auth_email: string;
};

export const ParishPocPanel = () => {
  const { locale } = useLocale();
  const [parishes, setParishes] = useState<ParishRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, MemberInParish[]>>({});

  const loadParishes = async () => {
    const { data, error } = await supabase
      .from('parish_overview')
      .select('*')
      .gt('member_count', 0)
      .order('name');
    if (error) {
      toast({ title: 'Failed to load parishes', description: error.message });
    } else {
      setParishes(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadParishes();
  }, []);

  const loadMembers = async (parishId: string) => {
    const { data, error } = await supabase.rpc('admin_list_parish_members', {
      p_parish_id: parishId,
    });
    if (error) {
      toast({ title: 'Failed to load members', description: error.message });
      return;
    }
    setMembers((prev) => ({ ...prev, [parishId]: data ?? [] }));
  };

  const toggle = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      if (!members[id]) loadMembers(id);
    }
  };

  const handleTogglePoc = async (
    memberId: string,
    parishId: string,
    currentIsPoc: boolean,
    contactEmail: string | null,
  ) => {
    const { error } = await supabase.rpc('set_poc_status', {
      p_profile_id: memberId,
      p_is_poc: !currentIsPoc,
      p_contact_email: !currentIsPoc ? contactEmail : null,
    });
    if (error) {
      toast({ title: 'Failed', description: error.message });
      return;
    }
    toast({
      title: !currentIsPoc
        ? (locale === 'es' ? 'Contacto asignado' : 'POC assigned')
        : (locale === 'es' ? 'Contacto removido' : 'POC removed'),
    });
    await loadMembers(parishId);
    await loadParishes();
  };

  const handleSaveContactEmail = async (memberId: string, parishId: string, newEmail: string) => {
    const { error } = await supabase.rpc('set_poc_status', {
      p_profile_id: memberId,
      p_is_poc: true,
      p_contact_email: newEmail || null,
    });
    if (error) {
      toast({ title: 'Failed', description: error.message });
      return;
    }
    toast({ title: locale === 'es' ? 'Correo guardado' : 'Email saved' });
    await loadMembers(parishId);
  };

  const handleSaveCoords = async (parishId: string, lat: number, lng: number) => {
    const { error } = await supabase.rpc('set_parish_coords', {
      p_parish_id: parishId,
      p_lat: lat,
      p_lng: lng,
    });
    if (error) {
      toast({ title: 'Failed to save coords', description: error.message });
      return;
    }
    toast({ title: locale === 'es' ? 'Coordenadas guardadas' : 'Coordinates saved' });
    await loadParishes();
  };

  if (loading) {
    return <p className="font-serif italic text-piedra">…</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-mesquite">
          {locale === 'es' ? 'Parroquias y contactos' : 'Parishes and contacts'}
        </h2>
        <p className="mt-2 font-serif text-sm italic text-piedra">
          {locale === 'es'
            ? 'Parroquias con miembros. Asigna un contacto por parroquia y añade coordenadas si faltan.'
            : 'Parishes with members. Assign a POC per parish and add coordinates if missing.'}
        </p>
      </div>

      {parishes.length === 0 ? (
        <p className="font-serif italic text-piedra">
          {locale === 'es' ? 'Todavía no hay parroquias con miembros.' : 'No parishes with members yet.'}
        </p>
      ) : (
        <ul className="divide-y divide-mesquite/10 border-y border-mesquite/10">
          {parishes.map((p) => {
            const isExpanded = expanded === p.id;
            const hasCoords = p.lat != null && p.lng != null;
            return (
              <li key={p.id} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <button onClick={() => toggle(p.id)} className="flex-1 text-left">
                    <span className="font-heading text-lg text-mesquite">{p.name}</span>
                    {p.city && (
                      <span className="ml-2 font-serif text-sm italic text-piedra">· {p.city}</span>
                    )}
                  </button>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-piedra">
                      {p.member_count}{' '}
                      {p.member_count === 1
                        ? (locale === 'es' ? 'miembro' : 'member')
                        : (locale === 'es' ? 'miembros' : 'members')}
                    </span>
                    {p.poc_count > 0 && (
                      <span className="rounded-sm bg-ocre/10 px-2 py-0.5 text-xs text-ocre">
                        {p.poc_count} {locale === 'es' ? 'contacto' : 'POC'}
                      </span>
                    )}
                    {hasCoords ? (
                      <span className="rounded-sm bg-mesquite/10 px-2 py-0.5 font-mono text-xs text-mesquite/60">
                        📍 {p.lat!.toFixed(3)}, {p.lng!.toFixed(3)}
                      </span>
                    ) : (
                      <span className="rounded-sm border border-rojo/40 bg-rojo/5 px-2 py-0.5 text-xs text-rojo">
                        {locale === 'es' ? 'sin ubicación' : 'no location'}
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-5 rounded-sm bg-cal/40 p-4">
                    {/* Coordinates row */}
                    <CoordsEditor
                      parishName={p.name}
                      parishCity={p.city}
                      currentLat={p.lat}
                      currentLng={p.lng}
                      onSave={(lat, lng) => handleSaveCoords(p.id, lat, lng)}
                      locale={locale}
                    />

                    {/* Members list */}
                    <div>
                      <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-mesquite/50">
                        {locale === 'es' ? 'MIEMBROS' : 'MEMBERS'}
                      </p>
                      {members[p.id] === undefined ? (
                        <p className="font-serif italic text-piedra">…</p>
                      ) : (
                        <ul className="space-y-3">
                          {members[p.id].map((m) => (
                            <MemberRow
                              key={m.id}
                              member={m}
                              onTogglePoc={() =>
                                handleTogglePoc(
                                  m.id,
                                  p.id,
                                  m.is_poc,
                                  m.contact_email ?? m.auth_email,
                                )
                              }
                              onSaveEmail={(email) => handleSaveContactEmail(m.id, p.id, email)}
                              locale={locale}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

// ---------------------------------------------------------------------------
// CoordsEditor — manual lat/lng entry with a Google Maps lookup link
// ---------------------------------------------------------------------------
function CoordsEditor({
  parishName,
  parishCity,
  currentLat,
  currentLng,
  onSave,
  locale,
}: {
  parishName: string;
  parishCity: string | null;
  currentLat: number | null;
  currentLng: number | null;
  onSave: (lat: number, lng: number) => void;
  locale: 'en' | 'es';
}) {
  const [latInput, setLatInput] = useState(currentLat?.toString() ?? '');
  const [lngInput, setLngInput] = useState(currentLng?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);

  const mapsQuery = encodeURIComponent(
    [parishName, parishCity, 'Texas'].filter(Boolean).join(', '),
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const handlePaste = (raw: string) => {
    // Accept "29.4872, -98.4615" from Google Maps right-click copy
    const parts = raw.split(',').map((s) => s.trim());
    if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
      setLatInput(parts[0]);
      setLngInput(parts[1]);
      setError(null);
      return true;
    }
    return false;
  };

  const handleSave = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      setError(locale === 'es' ? 'Números no válidos' : 'Not valid numbers');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError(locale === 'es' ? 'Coordenadas fuera de rango' : 'Coordinates out of range');
      return;
    }
    setError(null);
    onSave(lat, lng);
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="display-caps text-[10px] tracking-[0.2em] text-mesquite/50">
          {locale === 'es' ? 'UBICACIÓN' : 'LOCATION'}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif text-xs italic text-ocre hover:underline"
        >
          {locale === 'es' ? 'Buscar en Google Maps →' : 'Look up on Google Maps →'}
        </a>
      </div>

      <p className="mb-3 font-serif text-xs italic text-piedra">
        {locale === 'es'
          ? 'Tip: en Google Maps, clic derecho sobre el marcador y pega las coordenadas en el primer campo.'
          : 'Tip: on Google Maps, right-click the pin — the first menu item copies lat/lng. Paste into the first field.'}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={latInput}
          onChange={(e) => {
            const v = e.target.value;
            // If user pastes "29.48, -98.46", split across both fields
            if (v.includes(',') && handlePaste(v)) return;
            setLatInput(v);
          }}
          placeholder={locale === 'es' ? 'Latitud' : 'Latitude'}
          className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-1.5 font-mono text-sm text-mesquite focus:border-mesquite focus:outline-none sm:w-44"
        />
        <input
          type="text"
          value={lngInput}
          onChange={(e) => setLngInput(e.target.value)}
          placeholder={locale === 'es' ? 'Longitud' : 'Longitude'}
          className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-1.5 font-mono text-sm text-mesquite focus:border-mesquite focus:outline-none sm:w-44"
        />
        <button
          onClick={handleSave}
          disabled={!latInput || !lngInput}
          className="rounded-sm bg-ocre px-4 py-1.5 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
        >
          {locale === 'es' ? 'Guardar' : 'Save'}
        </button>
      </div>

      {error && (
        <p className="mt-2 font-serif text-xs italic text-rojo">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MemberRow — toggle POC + edit contact email inline
// ---------------------------------------------------------------------------
function MemberRow({
  member,
  onTogglePoc,
  onSaveEmail,
  locale,
}: {
  member: MemberInParish;
  onTogglePoc: () => void;
  onSaveEmail: (email: string) => void;
  locale: 'en' | 'es';
}) {
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(member.contact_email ?? member.auth_email);

  return (
    <li className="flex flex-col gap-2 border-b border-mesquite/5 pb-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <span className="font-heading text-mesquite">{member.display_name ?? '—'}</span>
        <span className="ml-2 font-mono text-xs text-piedra/60">{member.auth_email}</span>
        {member.is_poc && member.contact_email && (
          <div className="mt-1 flex items-center gap-2">
            {editingEmail ? (
              <>
                <input
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  className="rounded-sm border border-mesquite/20 bg-cal px-2 py-1 font-serif text-xs text-mesquite"
                />
                <button
                  onClick={() => {
                    onSaveEmail(emailDraft);
                    setEditingEmail(false);
                  }}
                  className="font-serif text-xs text-ocre hover:underline"
                >
                  {locale === 'es' ? 'guardar' : 'save'}
                </button>
                <button
                  onClick={() => {
                    setEmailDraft(member.contact_email ?? member.auth_email);
                    setEditingEmail(false);
                  }}
                  className="font-serif text-xs text-piedra hover:underline"
                >
                  {locale === 'es' ? 'cancelar' : 'cancel'}
                </button>
              </>
            ) : (
              <>
                <span className="font-serif text-xs italic text-ocre">
                  {locale === 'es' ? 'Contacto público: ' : 'Public contact: '}
                  {member.contact_email}
                </span>
                <button
                  onClick={() => setEditingEmail(true)}
                  className="font-serif text-xs text-piedra hover:text-mesquite"
                >
                  {locale === 'es' ? '(editar)' : '(edit)'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <button
        onClick={onTogglePoc}
        className={`rounded-sm border px-3 py-1 text-xs transition ${
          member.is_poc
            ? 'border-ocre bg-ocre/10 text-ocre hover:bg-ocre hover:text-cal'
            : 'border-mesquite/20 text-mesquite/60 hover:border-mesquite hover:text-mesquite'
        }`}
      >
        {member.is_poc
          ? (locale === 'es' ? 'Quitar contacto' : 'Remove POC')
          : (locale === 'es' ? 'Hacer contacto' : 'Make POC')}
      </button>
    </li>
  );
}