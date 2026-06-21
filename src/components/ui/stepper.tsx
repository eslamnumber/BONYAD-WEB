'use client';

import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accessible name for the whole control (e.g. the field label). */
  label: string;
  decrementLabel: string;
  incrementLabel: string;
  className?: string;
};

/**
 * Numeric +/− counter. A labelled group with two 44px buttons and a live value —
 * keyboard- and screen-reader-accessible, tokens-only, and direction-agnostic
 * (logical layout). Generic primitive; the caller supplies translated labels.
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
  decrementLabel,
  incrementLabel,
  className,
}: StepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const btn =
    'text-foreground hover:bg-muted focus-visible:outline-ring flex size-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'border-border bg-field-surface inline-flex items-center gap-1 rounded-xl border p-1',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={decrementLabel}
        className={btn}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span
        aria-live="polite"
        className="min-w-10 text-center text-base font-semibold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={incrementLabel}
        className={btn}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
