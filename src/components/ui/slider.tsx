'use client';

import { cn } from '@/lib/utils';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel: string;
  /** Localised text describing the current value, announced to screen readers. */
  valueText?: string;
  className?: string;
};

/**
 * A single-thumb range slider. Wraps the native `<input type="range">` (free
 * keyboard support + `aria-valuenow`) and tints it with the primary token. The
 * visible value label is rendered by the caller next to the track.
 */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  ariaLabel,
  valueText,
  className,
}: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      aria-valuetext={valueText}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        'accent-primary focus-visible:outline-ring h-2 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-4',
        className,
      )}
    />
  );
}
