'use client';

import { type ReactNode } from 'react';

type Props = {
  selected: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
};

/** One assignment-method radio card (Figma 1394:7430 / 7442). */
export function AssignmentOptionCard({ selected, title, description, icon, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full max-w-[346px] items-center gap-3 rounded-xl border p-4 text-end ${
        selected ? 'border-brand-dark-navy' : 'border-border'
      }`}
    >
      <span
        aria-hidden
        className={`bg-background size-5 shrink-0 rounded-full ${
          selected ? 'border-brand-dark-navy border-[6px]' : 'border border-slate-300'
        }`}
      />
      <span className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
        <span className="text-foreground text-[15px] font-medium">{title}</span>
        <span className="text-foreground/40 text-xs leading-[1.4]">{description}</span>
      </span>
      <span className="flex size-11 items-center justify-center rounded-lg [&_svg]:size-6">
        {icon}
      </span>
    </button>
  );
}
