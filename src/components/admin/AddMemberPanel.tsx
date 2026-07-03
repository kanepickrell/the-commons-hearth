// src/components/admin/AddMemberPanel.tsx
// Admin panel for /mayordomo. Lets a steward add a member by hand:
//   display name + email + parish.
// The heavy lifting (creating the auth.users row, which the browser client
// can't do) happens in the `admin-add-member` Edge Function. The member fills
// in their own bio / crafts / working_on / wants_to_learn the first time they
// sign in with that same email — onboarding pre-fills the name and parish we
// set here.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/i18n/LocaleProvider';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/lib/database.types';

type Parish = Database['public']['Tables']['parishes']['Row'];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const NEW_PARISH = '__new__';
const NO_PARISH = '';

export const AddMemberPanel = () => {
  const { locale, t } = useLocale();

  const [parishes, setParishes] = useState<Parish[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [parishChoice, setParishChoice] = useState<string>(NO_PARISH);
  const [newParishName, setNewParishName] = useState('');
  const [newParishCity, setNewParishCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<{ name: string; email: string; existed: boolean }[]>([]);

  useEffect(() => {
    supabase
      .from('parishes')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) {
          toast({
            title: t({ en: 'Could not load parishes', es: 'No pudimos cargar las parroquias' }),
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        setParishes(data ?? []);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setName('');
    setEmail('');
    setParishChoice(NO_PARISH);
    setNewParishName('');
    setNewParishCity('');
    setError(null);
  };

  const submit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setError(t({ en: 'Enter a name.', es: 'Escribe un nombre.' }));
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(t({ en: 'Enter a valid email address.', es: 'Escribe un correo válido.' }));
      return;
    }
    if (parishChoice === NEW_PARISH && newParishName.trim().length < 2) {
      setError(t({ en: 'Name the new parish.', es: 'Nombra la nueva parroquia.' }));
      return;
    }

    setSubmitting(true);
    setError(null);

    const body: Record<string, unknown> = {
      display_name: trimmedName,
      email: trimmedEmail,
      language: locale,
    };
    if (parishChoice === NEW_PARISH) {
      body.new_parish = { name: newParishName.trim(), city: newParishCity.trim() || null };
    } else if (parishChoice !== NO_PARISH) {
      body.parish_id = parishChoice;
    }

    const { data, error: fnErr } = await supabase.functions.invoke('admin-add-member', { body });
    setSubmitting(false);

    if (fnErr || (data && data.error)) {
      const detail = data?.detail || fnErr?.message || 'unknown error';
      setError(
        t({
          en: `Could not add member. ${detail}`,
          es: `No pudimos añadir al miembro. ${detail}`,
        }),
      );
      return;
    }

    const existed = data?.created_auth_user === false;
    setAdded((prev) => [{ name: trimmedName, email: trimmedEmail, existed }, ...prev].slice(0, 8));

    // If we created a new parish, add it to the local list so it's selectable next time.
    if (parishChoice === NEW_PARISH && data?.parish_id) {
      setParishes((prev) =>
        [...prev, { id: data.parish_id, name: newParishName.trim(), city: newParishCity.trim() || null } as Parish]
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    }

    toast({
      title: existed
        ? t({ en: 'Member already had an account — profile updated', es: 'El miembro ya tenía cuenta — perfil actualizado' })
        : t({ en: 'Member added', es: 'Miembro añadido' }),
    });
    reset();
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-mesquite">
          {t({ en: 'Add a member', es: 'Añadir un miembro' })}
        </h2>
        <p className="mt-2 font-serif text-sm italic text-piedra">
          {t({
            en: 'Enter a name, email, and parish. They can complete their bio and crafts the first time they sign in with that email.',
            es: 'Escribe un nombre, correo y parroquia. Ellos completan su biografía y oficios la primera vez que entren con ese correo.',
          })}
        </p>
      </div>

      <div className="max-w-xl space-y-4 rounded-sm border border-mesquite/20 bg-cal/60 p-6">
        {/* Name */}
        <div>
          <label className="mb-1 block font-serif text-xs text-mesquite/70">
            {t({ en: 'Name', es: 'Nombre' })}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t({ en: 'Full name', es: 'Nombre completo' })}
            className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block font-serif text-xs text-mesquite/70">
            {t({ en: 'Email', es: 'Correo' })}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder={t({ en: 'name@example.com', es: 'nombre@ejemplo.com' })}
            className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
          />
          <p className="mt-1 font-serif text-[11px] italic text-piedra">
            {t({
              en: 'Use the address they’ll sign in with (Google or magic link).',
              es: 'Usa el correo con el que iniciarán sesión (Google o enlace mágico).',
            })}
          </p>
        </div>

        {/* Parish */}
        <div>
          <label className="mb-1 block font-serif text-xs text-mesquite/70">
            {t({ en: 'Parish', es: 'Parroquia' })}
          </label>
          <select
            value={parishChoice}
            onChange={(e) => setParishChoice(e.target.value)}
            className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
          >
            <option value={NO_PARISH}>{t({ en: 'No parish yet', es: 'Sin parroquia por ahora' })}</option>
            {parishes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.city ? ` · ${p.city}` : ''}
              </option>
            ))}
            <option value={NEW_PARISH}>{t({ en: '+ Add a new parish…', es: '+ Añadir una nueva parroquia…' })}</option>
          </select>

          {parishChoice === NEW_PARISH && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={newParishName}
                onChange={(e) => setNewParishName(e.target.value)}
                placeholder={t({ en: 'Parish name', es: 'Nombre de la parroquia' })}
                className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
              />
              <input
                type="text"
                value={newParishCity}
                onChange={(e) => setNewParishCity(e.target.value)}
                placeholder={t({ en: 'City (optional)', es: 'Ciudad (opcional)' })}
                className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none sm:w-48"
              />
            </div>
          )}
          {parishChoice === NEW_PARISH && (
            <p className="mt-1 font-serif text-[11px] italic text-piedra">
              {t({
                en: 'Add its map coordinates later in “Parishes and contacts” below.',
                es: 'Agrega sus coordenadas después en “Parroquias y contactos” abajo.',
              })}
            </p>
          )}
        </div>

        {error && <p className="font-serif text-xs italic text-rojo">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-sm bg-ocre px-5 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? t({ en: 'Adding…', es: 'Añadiendo…' })
              : t({ en: 'Add member', es: 'Añadir miembro' })}
          </button>
          {(name || email) && !submitting && (
            <button
              onClick={reset}
              className="font-serif text-sm text-mesquite/60 transition hover:text-mesquite"
            >
              {t({ en: 'Clear', es: 'Limpiar' })}
            </button>
          )}
        </div>
      </div>

      {added.length > 0 && (
        <div>
          <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-mesquite/50">
            {t({ en: 'ADDED THIS SESSION', es: 'AÑADIDOS EN ESTA SESIÓN' })}
          </p>
          <ul className="space-y-1">
            {added.map((m, i) => (
              <li key={i} className="font-serif text-sm text-mesquite">
                <span className="font-heading">{m.name}</span>
                <span className="ml-2 font-mono text-xs text-piedra/60">{m.email}</span>
                {m.existed && (
                  <span className="ml-2 font-serif text-xs italic text-ocre">
                    {t({ en: '(already had an account)', es: '(ya tenía cuenta)' })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};