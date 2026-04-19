import { iconMap } from '@/lib/icons';
import type { IconSlug, Locale } from '@/lib/types';
import { useState } from 'react';

type Props = {
  slug: IconSlug;
  size?: number;
  locale?: Locale;
  className?: string;
};

/**
 * Icon — renders the placeholder PNG directly on the page background, with
 * a typographic fallback that only appears if the image fails to load.
 * No disc, no border, no second-color halo when the image succeeds — the
 * icon breathes on the cream page.
 *
 * Final hand-drawn art is wired by overwriting files in
 * /public/icons/placeholder/ — no component changes needed.
 */
export const Icon = ({ slug, size = 64, locale = 'es', className = '' }: Props) => {
  const meta = iconMap[slug];
  const label = meta.name[locale];
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
    >
      {imgFailed && (
        <span
          className="absolute inset-0 flex items-center justify-center rounded-full border border-mesquite/30 bg-cal/60 display-caps text-mesquite/80"
          style={{ fontSize: Math.max(10, size * 0.18) }}
        >
          {meta.name.es.replace(/^(La |El |Las |Los )/, '').slice(0, 2).toUpperCase()}
        </span>
      )}
      <img
        src={meta.src}
        alt={label}
        width={size}
        height={size}
        className="relative z-10 h-full w-full object-contain"
        onError={() => setImgFailed(true)}
      />
    </span>
  );
};