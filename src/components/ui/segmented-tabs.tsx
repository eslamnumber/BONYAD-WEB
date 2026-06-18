'use client';

import { cn } from '@/lib/utils';

export type SegmentedOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** `md` = primary tab switch (≥44px targets); `sm` = compact filter chips. */
  size?: 'sm' | 'md';
};

/**
 * Generic segmented control — a pill row of mutually-exclusive options. Logical
 * utilities + tokens only, so it mirrors under the inverted RTL map and is dark-safe.
 * Reused for the support tab switch and the status filter rows.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="bg-muted border-border flex w-fit max-w-full flex-wrap gap-1 rounded-xl border p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'focus-visible:outline-ring flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'min-h-11 px-4 text-sm',
            option.value === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground motion-safe:hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
