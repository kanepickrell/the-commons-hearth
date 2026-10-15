// src/components/giving/WheatMeter.tsx
// A progress meter drawn as a stalk of wheat filling from the root up.
//
// Every fundraising page reaches for a thermometer. A thermometer means fever
// and emergency, which is the opposite of what a land movement is asking for —
// and the chapter already owns a better image: the wheat stem that stands for a
// quiet month on the Witness page. Here the same drawing fills as the goal is
// met, so the chapter's two uses of it rhyme: one marks a season with nothing
// in it, the other a season filling up.
//
// Built by stacking two copies of WheatStem and clipping the top one, so the
// artwork stays in one file and this component holds no path data of its own.

import { WheatStem } from '@/components/testimonio/WheatStem';

type Props = {
  /** 0–100. Values outside the range are clamped. */
  percent: number;
  size?: number;
  /** Accessible description, e.g. "Walk-behind tractor: 38% funded". */
  label: string;
};

export const WheatMeter = ({ percent, size = 96, label }: Props) => {
  const pct = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="relative inline-block leading-none"
      role="img"
      aria-label={label}
      title={label}
    >
      {/* Empty state — the whole stalk, barely there. */}
      <WheatStem size={size} className="text-mesquite/20" />

      {/* Filled portion, revealed from the bottom up. inset() takes the amount
          to CUT from each edge, so the top cut is the unfilled remainder. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }}
        aria-hidden="true"
      >
        <WheatStem size={size} className="text-ocre" />
      </div>
    </div>
  );
};

/**
 * The horizontal counterpart, for rows where a stalk would be too tall: a
 * single furrow filling left to right.
 *
 * One hue on a muted track — this encodes magnitude, not identity, so it takes
 * a sequential treatment and never a second colour. The figure is always
 * printed beside it, so the bar is never the only way to read the number.
 */
export const FurrowMeter = ({ percent, label }: { percent: number; label: string }) => {
  const pct = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-mesquite/10"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-ocre transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
