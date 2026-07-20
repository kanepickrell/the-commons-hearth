// src/components/testimonio/MonthDetail.tsx
// Full-width "this month" band for the Witness page, shown beneath the wheel /
// month-panel row. It carries the month's gathering recaps (curated summaries)
// and its photo gallery.
//
// Both sources are keyed to (year, month), and a photo is NOT tied to a
// specific recap — so recaps and photos are presented as two separate carousels
// (Option B) rather than guessing a pairing:
//   - recaps: 1 → a single recap block; >1 → a swipeable carousel of recaps.
//   - photos: a gallery carousel using object-contain, so nothing is cropped.
// Renders nothing when the month has neither recaps nor photos. Public read +
// public bucket, so it works for signed-out visitors.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { Locale } from '@/lib/types';

const BUCKET = 'month-photos';

type MonthSummary = { id: string; title: string | null; body: string; sort_order: number };
type MonthPhoto = { id: string; storage_path: string; caption: string | null; sort_order: number };

const publicUrl = (path: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

type Props = {
  year: number;
  month: number; // 0-indexed (0 = January)
  locale: Locale;
};

export const MonthDetail = ({ year, month, locale }: Props) => {
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [photos, setPhotos] = useState<MonthPhoto[]>([]);
  const [loading, setLoading] = useState(true);

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
          .select('id, storage_path, caption, sort_order')
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

  // Nothing while loading, and nothing when the month has neither recaps nor
  // photos — the band only appears when there's something to show.
  if (loading) return null;
  if (summaries.length === 0 && photos.length === 0) return null;

  return (
    <div className="mx-auto mt-12 max-w-4xl border-t border-mesquite/10 pt-8 md:mt-16">
      {summaries.length > 0 && (
        <section className="mb-12">
          <p className="display-caps mb-5 text-center text-[11px] tracking-[0.25em] text-ocre">
            {locale === 'es' ? 'ENCUENTROS DE ESTE MES' : 'GATHERINGS THIS MONTH'}
          </p>
          {summaries.length === 1 ? (
            <Recap summary={summaries[0]} />
          ) : (
            <EventsCarousel summaries={summaries} locale={locale} />
          )}
        </section>
      )}

      {photos.length > 0 && (
        <section>
          {summaries.length > 0 && (
            <p className="display-caps mb-5 text-center text-[11px] tracking-[0.25em] text-ocre">
              {locale === 'es' ? 'FOTOS' : 'PHOTOS'}
            </p>
          )}
          <PhotoGallery photos={photos} />
        </section>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Recap — one gathering summary: title + body, in a comfortable reading measure
// ---------------------------------------------------------------------------
const Recap = ({ summary }: { summary: MonthSummary }) => (
  <article className="mx-auto max-w-2xl">
    {summary.title && (
      <h3 className="mb-3 text-center font-heading text-xl text-mesquite md:text-2xl">
        {summary.title}
      </h3>
    )}
    <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-mesquite">
      {summary.body}
    </p>
  </article>
);

// ---------------------------------------------------------------------------
// EventsCarousel — one recap per slide, with a dot + arrow control bar below so
// the controls never overlap the prose (and stay thumb-friendly on mobile).
// ---------------------------------------------------------------------------
const EventsCarousel = ({
  summaries,
  locale,
}: {
  summaries: MonthSummary[];
  locale: Locale;
}) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <div>
      <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
        <CarouselContent>
          {summaries.map((s) => (
            <CarouselItem key={s.id}>
              <Recap summary={s} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Control bar — arrows flank a row of dots; sits below the text so it
          never covers a recap. */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          disabled={current === 0}
          aria-label={locale === 'es' ? 'Anterior' : 'Previous'}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-mesquite/20 bg-cal/80 text-mesquite transition hover:border-mesquite/40 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          {summaries.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`${locale === 'es' ? 'Ir al encuentro' : 'Go to gathering'} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-ocre' : 'w-1.5 bg-mesquite/25 hover:bg-mesquite/40'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => api?.scrollNext()}
          disabled={current === summaries.length - 1}
          aria-label={locale === 'es' ? 'Siguiente' : 'Next'}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-mesquite/20 bg-cal/80 text-mesquite transition hover:border-mesquite/40 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PhotoGallery — uniform-height frame with object-contain so portrait and
// landscape photos both show in full (letterboxed on a soft ground) instead of
// being cropped by object-cover.
// ---------------------------------------------------------------------------
const PhotoGallery = ({ photos }: { photos: MonthPhoto[] }) => (
  <Carousel opts={{ loop: photos.length > 1 }} className="mx-auto w-full max-w-3xl">
    <CarouselContent>
      {photos.map((p) => (
        <CarouselItem key={p.id}>
          <figure>
            <div className="flex h-72 items-center justify-center overflow-hidden rounded-sm border border-mesquite/20 bg-mesquite/[0.04] sm:h-96 md:h-[28rem]">
              <img
                src={publicUrl(p.storage_path)}
                alt={p.caption ?? ''}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            {p.caption && (
              <figcaption className="mt-2 text-center font-serif text-sm italic text-piedra">
                {p.caption}
              </figcaption>
            )}
          </figure>
        </CarouselItem>
      ))}
    </CarouselContent>
    {photos.length > 1 && (
      <>
        <CarouselPrevious className="left-2 border-mesquite/20 bg-cal/80 text-mesquite" />
        <CarouselNext className="right-2 border-mesquite/20 bg-cal/80 text-mesquite" />
      </>
    )}
  </Carousel>
);