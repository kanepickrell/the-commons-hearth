// src/components/testimonio/MonthDetail.tsx
// Full-width "this month" band for the Witness page. One combined carousel:
// each slide is a gathering (a month_summaries row) shown together with its own
// photos (month_photos rows linked by summary_id) — so advancing the carousel
// moves the writeup and its images as a single unit.
//
// Photos with no linked event (summary_id null) appear as trailing photo-only
// slides, and a month with only unlinked photos falls back to a plain photo
// carousel. Renders nothing when the month has neither summaries nor photos.
// Public read + public bucket, so it works for signed-out visitors.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { Locale } from '@/lib/types';

const BUCKET = 'month-photos';

type MonthSummary = { id: string; title: string | null; body: string; sort_order: number };
type MonthPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  summary_id: string | null;
};

const publicUrl = (path: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

type Slide =
  | { kind: 'event'; summary: MonthSummary; photos: MonthPhoto[] }
  | { kind: 'photo'; photo: MonthPhoto };

type Props = {
  year: number;
  month: number; // 0-indexed (0 = January)
  locale: Locale;
};

export const MonthDetail = ({ year, month, locale }: Props) => {
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [photos, setPhotos] = useState<MonthPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [sumRes, phoRes] = await Promise.all([
        supabase
          .from('month_summaries')
          .select('id, title, body, sort_order')
          .eq('year', year)
          .eq('month', month)
          .order('sort_order', { ascending: true }),
        supabase
          .from('month_photos')
          .select('id, storage_path, caption, sort_order, summary_id')
          .eq('year', year)
          .eq('month', month)
          .order('sort_order', { ascending: true }),
      ]);
      if (!active) return;
      if (sumRes.error) console.error('Failed to load month summaries:', sumRes.error);
      if (phoRes.error) console.error('Failed to load month photos:', phoRes.error);
      setSummaries(sumRes.error ? [] : ((sumRes.data ?? []) as unknown as MonthSummary[]));
      setPhotos(phoRes.error ? [] : ((phoRes.data ?? []) as unknown as MonthPhoto[]));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [year, month]);

  // Group photos under their gathering; anything unlinked becomes its own slide.
  const photosBySummary = new Map<string, MonthPhoto[]>();
  const orphanPhotos: MonthPhoto[] = [];
  for (const p of photos) {
    if (p.summary_id) {
      const arr = photosBySummary.get(p.summary_id) ?? [];
      arr.push(p);
      photosBySummary.set(p.summary_id, arr);
    } else {
      orphanPhotos.push(p);
    }
  }
  const slides: Slide[] = [
    ...summaries.map((s) => ({
      kind: 'event' as const,
      summary: s,
      photos: photosBySummary.get(s.id) ?? [],
    })),
    ...orphanPhotos.map((p) => ({ kind: 'photo' as const, photo: p })),
  ];

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Snap back to the first slide whenever the month changes.
  useEffect(() => {
    api?.scrollTo(0, true);
  }, [api, year, month]);

  if (loading) return null;
  if (slides.length === 0) return null;

  const heading =
    summaries.length > 0
      ? locale === 'es'
        ? 'ENCUENTROS DE ESTE MES'
        : 'SWIPE TO VIEW CONTENT'
      : locale === 'es'
      ? 'FOTOS'
      : 'PHOTOS';

  return (
    <div className="mx-auto mt-12 max-w-4xl border-t border-mesquite/10 pt-8 md:mt-16">
      <p className="display-caps mb-6 text-center text-[11px] tracking-[0.25em] text-ocre">
        {heading}
      </p>

      <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.kind === 'event' ? slide.summary.id : slide.photo.id}>
              {slide.kind === 'event' ? (
                <EventSlide summary={slide.summary} photos={slide.photos} />
              ) : (
                <PhotoSlide photo={slide.photo} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Control bar — arrows flank a row of dots, below the content so nothing
          overlaps the writeup. Hidden when there's only one slide. */}
      {slides.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <NavBtn dir="prev" disabled={current === 0} onClick={() => api?.scrollPrev()} locale={locale} />
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`${locale === 'es' ? 'Ir a' : 'Go to'} ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-6 bg-ocre' : 'w-1.5 bg-mesquite/25 hover:bg-mesquite/40'
                }`}
              />
            ))}
          </div>
          <NavBtn
            dir="next"
            disabled={current === slides.length - 1}
            onClick={() => api?.scrollNext()}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// EventSlide — a gathering's writeup beside its photo(s). When the gathering has
// multiple photos, a thumbnail strip swaps the main image. When it has none, the
// writeup stands on its own in a comfortable reading measure.
// ---------------------------------------------------------------------------
const EventSlide = ({ summary, photos }: { summary: MonthSummary; photos: MonthPhoto[] }) => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    setActive(0);
  }, [summary.id]);

  const text = (
    <div className="min-w-0">
      {summary.title && (
        <h3 className="mb-3 font-heading text-xl text-mesquite md:text-2xl">{summary.title}</h3>
      )}
      <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-mesquite">
        {summary.body}
      </p>
    </div>
  );

  if (photos.length === 0) {
    return <article className="mx-auto max-w-2xl">{text}</article>;
  }

  const main = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="grid items-start gap-6 md:grid-cols-2 md:items-center md:gap-10">
      <figure className="min-w-0">
        <div className="flex h-72 items-center justify-center overflow-hidden rounded-sm border border-mesquite/20 bg-mesquite/[0.04] sm:h-80 md:h-[24rem]">
          <img
            src={publicUrl(main.storage_path)}
            alt={main.caption ?? summary.title ?? ''}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>

        {photos.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
                className={`h-12 w-16 overflow-hidden rounded-sm border transition ${
                  i === active ? 'border-ocre' : 'border-mesquite/20 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={publicUrl(p.storage_path)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {main.caption && (
          <figcaption className="mt-2 font-serif text-sm italic text-piedra">{main.caption}</figcaption>
        )}
      </figure>

      <article className="min-w-0">{text}</article>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PhotoSlide — an unlinked photo, shown full (object-contain) with its caption.
// ---------------------------------------------------------------------------
const PhotoSlide = ({ photo }: { photo: MonthPhoto }) => (
  <figure className="mx-auto max-w-3xl">
    <div className="flex h-72 items-center justify-center overflow-hidden rounded-sm border border-mesquite/20 bg-mesquite/[0.04] sm:h-96 md:h-[28rem]">
      <img
        src={publicUrl(photo.storage_path)}
        alt={photo.caption ?? ''}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    </div>
    {photo.caption && (
      <figcaption className="mt-2 text-center font-serif text-sm italic text-piedra">
        {photo.caption}
      </figcaption>
    )}
  </figure>
);

// ---------------------------------------------------------------------------
// NavBtn — round prev/next control used in the bar beneath the carousel.
// ---------------------------------------------------------------------------
const NavBtn = ({
  dir,
  disabled,
  onClick,
  locale,
}: {
  dir: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  locale: Locale;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={
      dir === 'prev'
        ? locale === 'es'
          ? 'Anterior'
          : 'Previous'
        : locale === 'es'
        ? 'Siguiente'
        : 'Next'
    }
    className="flex h-8 w-8 items-center justify-center rounded-full border border-mesquite/20 bg-cal/80 text-mesquite transition hover:border-mesquite/40 disabled:cursor-not-allowed disabled:opacity-30"
  >
    {dir === 'prev' ? '‹' : '›'}
  </button>
);