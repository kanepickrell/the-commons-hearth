import { iconMap } from '@/lib/icons';
import type { IconSlug, Locale } from '@/lib/types';

type Props = {
  slug: IconSlug;
  size?: number;
  locale?: Locale;
  className?: string;
};

/**
 * Icon — inlines the SVG markup into the DOM so the artwork inherits the
 * current text color (each SVG's root uses fill="currentColor"). Icons
 * automatically pick up mesquite ink, and shift to ocre on hover when a
 * parent uses `text-ocre` or `group-hover:text-ocre`.
 *
 * To swap artwork, replace the corresponding file in /src/assets/icons/ —
 * no component changes needed. The SVG files declare width="100%"
 * height="100%" and a viewBox, so they fill this wrapper naturally.
 */
export const Icon = ({ slug, size = 64, locale = 'es', className = '' }: Props) => {
  const meta = iconMap[slug];
  const label = meta.name[locale];

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-block text-mesquite ${className}`}
      style={{ width: size, height: size, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: meta.svg }}
    />
  );
};
