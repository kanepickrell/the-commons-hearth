// src/components/LanguageNote.tsx
// Small attribution line shown when a piece of user content was written
// in a language different from the viewer's current locale. Renders
// nothing when the languages match.

import { useLocale } from '@/i18n/LocaleProvider';

type Props = {
  contentLanguage: 'en' | 'es' | null;
  className?: string;
};

export const LanguageNote = ({ contentLanguage, className = '' }: Props) => {
  const { locale } = useLocale();
  if (!contentLanguage || contentLanguage === locale) return null;

  const label =
    locale === 'es'
      ? `escrito en ${contentLanguage === 'en' ? 'inglés' : 'español'}`
      : `written in ${contentLanguage === 'es' ? 'Spanish' : 'English'}`;

  return (
    <span className={`font-serif text-xs italic text-piedra/60 ${className}`}>
      — {label}
    </span>
  );
};