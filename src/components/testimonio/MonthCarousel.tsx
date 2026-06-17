// src/components/testimonio/MonthCarousel.tsx
// Admin-curated photo carousel for one month of the Year Wheel. Renders below
// the MonthPanel on the Witness page. Reads public.month_photos for the given
// (year, month) — month is 0-indexed to match the wheel — and renders nothing
// at all when the month has no photos ("...a carousel for that month if photos
// exist"). Public read + public bucket, so it works for logged-out visitors.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import type { Locale } from '@/lib/types';

const BUCKET = 'month-photos';

type MonthPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
};

const publicUrl = (path: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

type Props = {
  year: number;
  month: number; // 0-indexed (0 = January)
  locale: Locale;
};

export const MonthCarousel = ({ year, month }: Props) => {
  const [photos, setPhotos] = useState<MonthPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('month_photos')
        .select('id, storage_path, caption, sort_order')
        .eq('year', year)
        .eq('month', month)
        .order('sort_order', { ascending: true });
      if (!active) return;
      if (error) {
        console.error('Failed to load month photos:', error);
        setPhotos([]);
      } else {
        setPhotos((data ?? []) as MonthPhoto[]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [year, month]);

  // Nothing while loading, and nothing when the month is empty — the carousel
  // only appears when there's something to show.
  if (loading || photos.length === 0) return null;

  return (
    <div className="mt-8 border-t border-mesquite/10 pt-6">
      <Carousel opts={{ loop: photos.length > 1 }} className="w-full">
        <CarouselContent>
          {photos.map((p) => (
            <CarouselItem key={p.id}>
              <figure>
                <img
                  src={publicUrl(p.storage_path)}
                  alt={p.caption ?? ''}
                  className="aspect-[4/3] w-full rounded-sm border border-mesquite/20 object-cover"
                  loading="lazy"
                />
                {p.caption && (
                  <figcaption className="mt-2 text-center font-serif text-sm italic text-piedra">
                    {p.caption}
                  </figcaption>
                )}
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Arrows positioned INSIDE the frame (left-2/right-2) rather than the
            component default (-left-12/-right-12), which would clip in the
            narrow month column and off-screen on mobile. twMerge lets these
            override the default offset while keeping the vertical centering. */}
        {photos.length > 1 && (
          <>
            <CarouselPrevious className="left-2 border-mesquite/20 bg-cal/80 text-mesquite" />
            <CarouselNext className="right-2 border-mesquite/20 bg-cal/80 text-mesquite" />
          </>
        )}
      </Carousel>
    </div>
  );
};