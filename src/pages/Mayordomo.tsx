// src/pages/Mayordomo.tsx
// Admin / stewardship page — placeholder for v1.
// Next iteration: approval queues for profiles, workshops, witness posts.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildPath } from '@/i18n/routes';

export default function Mayordomo() {
  const { user, isAdmin, loading } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate(buildPath('home', locale));
    }
  }, [loading, user, isAdmin, navigate, locale]);

  if (loading) {
    return (
      <div className="container-narrow py-16 text-center font-serif text-mesquite/60">
        …
      </div>
    );
  }

  return (
    <div className="container-narrow py-12 md:py-16">
      <p className="display-caps mb-3 text-xs tracking-[0.2em] text-ocre">
        {t({ en: 'STEWARDSHIP', es: 'MAYORDOMÍA' })}
      </p>

      <h1 className="mb-8 font-heading text-4xl text-mesquite md:text-5xl">
        {t({ en: 'Pending approvals', es: 'Aprobaciones pendientes' })}
      </h1>

      <div className="rounded-sm border border-mesquite/15 bg-cal/40 p-8 text-center">
        <p className="font-serif text-lg italic text-mesquite/60">
          {t({
            en: 'Nothing waiting. Approval queues land here next.',
            es: 'Nada pendiente. Las colas de aprobación llegarán aquí.',
          })}
        </p>
      </div>
    </div>
  );
}