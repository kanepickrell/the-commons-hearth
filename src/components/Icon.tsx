import { iconMap } from '@/lib/icons';
import type { IconSlug, Locale } from '@/lib/types';

type Props = {
  slug: IconSlug;
  size?: number;
  locale?: Locale;
  className?: string;
};

/**
 * Icon — placeholder-aware. Renders the PNG when present; otherwise renders
 * a typographic stand-in (a circle with the Spanish article + ornament) so
 * the layout doesn't break before final art is dropped in.
 *
 * Final hand-drawn art is wired by overwriting files in
 * /public/icons/placeholder/ — no component changes needed.
 */
export const Icon = ({ slug, size = 64, locale = 'es', className = '' }: Props) => {
  const meta = iconMap[slug];
  const label = meta.name[locale];

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
    >
      {/* Typographic stand-in — sits behind the img. If the PNG fails (file
          not yet uploaded), this remains visible. */}
      <span
        className="absolute inset-0 flex items-center justify-center rounded-full border border-mesquite/30 bg-cal/60 font-caps text-mesquite/80"
        style={{ fontSize: Math.max(10, size * 0.18) }}
      >
        {meta.name.es.replace(/^(La |El |Las |Los )/, '').slice(0, 2).toUpperCase()}
      </span>
      <img
        src={meta.src}
        alt={label}
        width={size}
        height={size}
        className="relative z-10"
        onError={(e) => {
          // Hide broken image so the typographic stand-in shows through.
          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
    </span>
  );
};
