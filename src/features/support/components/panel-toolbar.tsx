'use client';

import { Button, SegmentedTabs, type SegmentedOption } from '@/components/ui';

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  ctaLabel: string;
  onCta: () => void;
};

/** A panel's status-filter row + primary "new" CTA — shared by the tickets/conversations tabs. */
export function PanelToolbar<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  ctaLabel,
  onCta,
}: Props<T>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SegmentedTabs
        options={options}
        value={value}
        onChange={onChange}
        ariaLabel={ariaLabel}
        size="sm"
      />
      <Button
        type="button"
        onClick={onCta}
        className="h-11 shrink-0 rounded-lg px-5 text-base font-medium"
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
