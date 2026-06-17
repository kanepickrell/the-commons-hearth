// src/pages/NuevaReunion.tsx
// Member "host a gathering" form. Inserts a workshops row at status='pending'
// (the RLS insert policy forces that and requires an approved member). This
// page just mirrors that gate in the UI for a friendlier experience.

import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icon';
import { iconMap } from '@/lib/icons';
import type { Database } from '@/lib/database.types';
import type { IconSlug } from '@/lib/types';

type Parish = Database['public']['Tables']['parishes']['Row'];

// Only the eight crafts that have icons — craft drives the icon everywhere
// a workshop renders, so picking one outside this set would break the Icon.
const CRAFT_SLUGS = Object.keys(iconMap) as IconSlug[];

const inputClass =
  'w-full rounded-sm border border-mesquite/20 bg-cal/50 p-3 font-serif text-base text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none';

export default function NuevaReunion() {
  const { user, profile, loading: authLoading } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  const [parishes, setParishes] = useState<Parish[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [craft, setCraft] = useState<IconSlug | ''>('');
  const [parishId, setParishId] = useState('');
  const [locationText, setLocationText] = useState('');
  const [heldAt, setHeldAt] = useState('');
  const [coords, setCoords] = useState(''); // optional "lat, lng" paste
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApproved = profile?.status === 'approved';

  useEffect(() => {
    if (!authLoading && !user) navigate(buildPath('home', locale));
  }, [authLoading, user, navigate, locale]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('parishes').select('*').order('name');
      if (data) setParishes(data);
    })();
  }, []);

  const parseCoords = (raw: string): { lat: number; lng: number } | null => {
    const parts = raw.split(',').map((s) => s.trim());
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  };

  const canSubmit =
    isApproved &&
    title.trim().length >= 3 &&
    locationText.trim().length >= 3 &&
    heldAt !== '';

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    let latLng: { lat: number; lng: number } | null = null;
    if (coords.trim()) {
      latLng = parseCoords(coords);
      if (!latLng) {
        setError(t({
          en: 'Coordinates look invalid. Use "29.49, -98.46" or clear the field.',
          es: 'Las coordenadas no son válidas. Usa "29.49, -98.46" o deja el campo vacío.',
        }));
        setSaving(false);
        return;
      }
    }

    const when = new Date(heldAt);
    if (Number.isNaN(when.getTime()) || when.getTime() < Date.now()) {
      setError(t({
        en: 'Pick a date and time in the future.',
        es: 'Elige una fecha y hora en el futuro.',
      }));
      setSaving(false);
      return;
    }

    const { error: insErr } = await supabase.from('workshops').insert({
      host_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      craft: craft || null,
      parish_id: parishId || null,
      location_text: locationText.trim(),
      lat: latLng?.lat ?? null,
      lng: latLng?.lng ?? null,
      held_at: when.toISOString(),
      language: locale,
      // status omitted → DB default 'pending' (RLS also enforces this)
    });

    if (insErr) {
      console.error('Create gathering failed:', insErr);
      setError(t({
        en: `Could not submit. ${insErr.message}`,
        es: `No pudimos enviar. ${insErr.message}`,
      }));
      setSaving(false);
      return;
    }

    toast({
      title: t({
        en: 'Gathering submitted for approval',
        es: 'Reunión enviada para aprobación',
      }),
    });
    navigate(buildPath('miPerfil', locale));
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container-prose py-16 text-center font-serif text-mesquite/60">…</div>
      </Layout>
    );
  }

  if (!isApproved) {
    return (
      <Layout>
        <div className="container-prose py-20 text-center">
          <h1 className="font-heading text-3xl text-mesquite">
            {t({ en: 'Host a gathering', es: 'Ofrecer una reunión' })}
          </h1>
          <p className="mt-4 font-serif text-lg italic text-mesquite/70">
            {t({
              en: 'Your profile is awaiting a steward’s approval. Once approved, you can host a gathering.',
              es: 'Tu perfil espera la aprobación del mayordomo. Una vez aprobado, podrás ofrecer una reunión.',
            })}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-prose py-12 md:py-16">
        <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
          {t({ en: 'HOST A GATHERING', es: 'OFRECER UNA REUNIÓN' })}
        </p>
        <h1 className="mb-2 font-heading text-4xl text-mesquite md:text-5xl">
          {t({ en: 'A new gathering', es: 'Una nueva reunión' })}
        </h1>
        <p className="mb-10 font-serif text-lg italic text-mesquite/70">
          {t({
            en: 'It goes to a steward for approval. Once approved, members can RSVP.',
            es: 'Se envía al mayordomo para aprobación. Una vez aprobada, los miembros pueden confirmar.',
          })}
        </p>

        <Field label={t({ en: 'Title', es: 'Título' })}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t({ en: 'e.g. Spring hive inspection', es: 'ej. Revisión de colmena de primavera' })}
            className={inputClass}
          />
        </Field>

        <Field label={t({ en: 'Description', es: 'Descripción' })} hint={t({ en: 'Optional', es: 'Opcional' })}>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t({ en: 'What you’ll do, what to bring, who it’s for.', es: 'Qué harán, qué traer, para quién es.' })}
            className={inputClass}
          />
        </Field>

        <Field label={t({ en: 'Craft', es: 'Oficio' })} hint={t({ en: 'Optional — sets the icon', es: 'Opcional — define el ícono' })}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CRAFT_SLUGS.map((slug) => {
              const selected = craft === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setCraft(selected ? '' : slug)}
                  className={`flex flex-col items-center gap-2 rounded-sm border p-4 text-center transition ${
                    selected
                      ? 'border-ocre bg-ocre/10 text-mesquite'
                      : 'border-mesquite/15 bg-cal/40 text-mesquite/60 hover:border-mesquite/40 hover:text-mesquite'
                  }`}
                >
                  <Icon slug={slug} size={40} locale={locale} />
                  <span className="font-heading text-xs leading-tight">
                    {iconMap[slug].name[locale]}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label={t({ en: 'Parish', es: 'Parroquia' })} hint={t({ en: 'Optional', es: 'Opcional' })}>
          <select value={parishId} onChange={(e) => setParishId(e.target.value)} className={inputClass}>
            <option value="">{t({ en: '— none —', es: '— ninguna —' })}</option>
            {parishes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.city ? ` · ${p.city}` : ''}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={t({ en: 'Location', es: 'Lugar' })}
          hint={t({ en: 'Shown to approved members only', es: 'Visible solo para miembros aprobados' })}
        >
          <input
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder={t({ en: 'e.g. The Abernathy place, Helotes', es: 'ej. La casa de los Abernathy, Helotes' })}
            className={inputClass}
          />
        </Field>

        <Field label={t({ en: 'Date and time', es: 'Fecha y hora' })}>
          <input
            type="datetime-local"
            value={heldAt}
            onChange={(e) => setHeldAt(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label={t({ en: 'Map coordinates', es: 'Coordenadas del mapa' })}
          hint={t({
            en: 'Optional — right-click the spot in Google Maps and paste "lat, lng"',
            es: 'Opcional — clic derecho en el lugar en Google Maps y pega "lat, lng"',
          })}
        >
          <input
            type="text"
            value={coords}
            onChange={(e) => setCoords(e.target.value)}
            placeholder="29.49, -98.46"
            className={`${inputClass} font-mono`}
          />
        </Field>

        {error && (
          <p className="mb-4 rounded-sm border border-rojo/30 bg-rojo/5 p-3 font-serif text-sm text-rojo">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => navigate(buildPath('miPerfil', locale))}
            className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite"
          >
            ← {t({ en: 'Cancel', es: 'Cancelar' })}
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="inline-flex items-center gap-2 rounded-sm bg-ocre px-6 py-2.5 font-heading text-base text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving
              ? t({ en: 'Submitting…', es: 'Enviando…' })
              : t({ en: 'Submit for approval', es: 'Enviar para aprobación' })}
          </button>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <label className="mb-2 block font-heading text-lg text-mesquite">
        {label}
        {hint && <span className="ml-2 font-serif text-sm italic text-mesquite/50">{hint}</span>}
      </label>
      {children}
    </div>
  );
}