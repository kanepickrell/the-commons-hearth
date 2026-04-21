import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Parish = Database['public']['Tables']['parishes']['Row'];
type PendingRow = Profile & { parish: Parish | null };

export default function Mayordomo() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  const [pending, setPending] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<Record<string, 'approve' | 'reject' | null>>({});

  // Only kick to home AFTER auth has finished loading.
  // The key bug: if we redirect while authLoading is still true,
  // we bounce admins because isAdmin starts as false.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(buildPath('home', locale));
      return;
    }
    if (!isAdmin) {
      navigate(buildPath('home', locale));
    }
  }, [authLoading, user, isAdmin, navigate, locale]);

  const loadQueue = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, parish:parishes(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load pending profiles:', error);
      toast({
        title: t({ en: 'Could not load the queue', es: 'No pudimos cargar la cola' }),
        description: error.message,
        variant: 'destructive',
      });
      setPending([]);
    } else {
      setPending((data ?? []) as PendingRow[]);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadQueue();
    }
  }, [authLoading, user, isAdmin, loadQueue]);

  const act = async (profileId: string, action: 'approve' | 'reject') => {
    setActing((s) => ({ ...s, [profileId]: action }));
    const snapshot = pending;
    setPending((rows) => rows.filter((r) => r.id !== profileId));

    const rpc = action === 'approve' ? 'approve_profile' : 'reject_profile';
    const { error } = await supabase.rpc(rpc, { p_id: profileId });

    setActing((s) => ({ ...s, [profileId]: null }));

    if (error) {
      console.error(`${rpc} failed:`, error);
      setPending(snapshot);
      toast({
        title:
          action === 'approve'
            ? t({ en: 'Could not approve', es: 'No pudimos aprobar' })
            : t({ en: 'Could not reject', es: 'No pudimos rechazar' }),
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title:
        action === 'approve'
          ? t({ en: 'Approved', es: 'Aprobado' })
          : t({ en: 'Rejected', es: 'Rechazado' }),
    });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container-wide py-16 text-center font-serif text-mesquite/60">…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-12 md:py-16">
        <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
          {t({ en: 'STEWARDSHIP', es: 'MAYORDOMÍA' })}
        </p>

        <h1 className="mb-2 font-heading text-4xl text-mesquite md:text-5xl">
          {t({ en: 'Pending approvals', es: 'Aprobaciones pendientes' })}
        </h1>

        <p className="mb-10 font-serif text-lg italic text-mesquite/70">
          {t({
            en: 'New members awaiting a steward\u2019s blessing.',
            es: 'Nuevos miembros esperando la bendición del mayordomo.',
          })}
        </p>

        {pending.length === 0 ? (
          <div className="rounded-sm border border-mesquite/15 bg-cal/40 p-8 text-center">
            <p className="font-serif text-lg italic text-mesquite/60">
              {t({ en: 'Nothing waiting.', es: 'Nada pendiente.' })}
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {pending.map((p) => {
              const currentAction = acting[p.id];
              const busy = !!currentAction;
              return (
                <li key={p.id} className="rounded-sm border border-mesquite/20 bg-cal/60 p-6">
                  <div className="mb-3 flex items-baseline justify-between gap-4">
                    <h2 className="font-heading text-2xl text-mesquite">
                      {p.display_name ?? t({ en: '(no name)', es: '(sin nombre)' })}
                    </h2>
                    <span className="font-mono text-xs text-mesquite/40">
                      {new Date(p.created_at).toLocaleDateString(
                        locale === 'es' ? 'es-MX' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                  </div>

                  {p.parish && (
                    <p className="mb-3 font-serif text-sm italic text-mesquite/70">
                      {p.parish.name}
                      {p.parish.city ? ` · ${p.parish.city}` : ''}
                    </p>
                  )}

                  {p.bio && (
                    <p className="mb-5 whitespace-pre-wrap font-serif text-base leading-relaxed text-mesquite">
                      {p.bio}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => act(p.id, 'approve')}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-sm bg-ocre px-5 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {currentAction === 'approve'
                        ? t({ en: 'Approving…', es: 'Aprobando…' })
                        : t({ en: 'Approve', es: 'Aprobar' })}
                    </button>
                    <button
                      onClick={() => act(p.id, 'reject')}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-sm border border-mesquite/30 px-5 py-2 font-heading text-sm text-mesquite transition hover:border-rojo hover:text-rojo disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {currentAction === 'reject'
                        ? t({ en: 'Rejecting…', es: 'Rechazando…' })
                        : t({ en: 'Reject', es: 'Rechazar' })}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}