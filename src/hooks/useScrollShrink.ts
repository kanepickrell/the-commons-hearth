// src/hooks/useScrollShrink.ts
// Scroll progress for an element that sticks and shrinks as the reader moves
// past it. Used by the Witness page so the year wheel compacts into a small
// persistent dial while the month's gatherings come up underneath.
//
// Returns a 0→1 number rather than styles, so the caller decides what to do
// with it (width, opacity, both). Progress is 0 while the tracked element's
// top is still below `offset`, then rises over the next `distance` pixels.
//
// Deliberately inert in two cases, both returning a permanent 0 so the caller
// renders the plain full-size layout:
//   - viewports under `minViewport`, where a sticky wheel would eat the screen
//   - readers who prefer reduced motion

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Distance from the top of the viewport where the element pins. */
  offset?: number;
  /** Pixels of scrolling over which progress travels from 0 to 1. */
  distance?: number;
  /** Below this viewport width the effect is disabled entirely. */
  minViewport?: number;
};

export const useScrollShrink = ({
  offset = 24,
  distance = 360,
  minViewport = 768,
}: Options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia(`(min-width: ${minViewport}px)`);

    let frame = 0;

    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el || reduced.matches || !wide.matches) {
        setProgress(0);
        return;
      }
      const { top } = el.getBoundingClientRect();
      const raw = (offset - top) / distance;
      const next = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      // Skip imperceptible changes so a slow scroll doesn't re-render on every
      // frame for a sub-pixel difference.
      setProgress((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };

    // Scroll fires far more often than paint; coalesce onto the frame.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    wide.addEventListener('change', schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
      wide.removeEventListener('change', schedule);
    };
  }, [offset, distance, minViewport]);

  return { ref, progress };
};
