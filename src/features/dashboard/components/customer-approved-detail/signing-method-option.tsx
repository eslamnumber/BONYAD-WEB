'use client';

import { type ReactNode } from 'react';

type Props = {
  value: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (value: string) => void;
  /** The 44px icon container for this method (mail glyph or brand logo). */
  children: ReactNode;
};

/**
 * One signing-method radio card (Figma 1485:8818). The whole card is the radio
 * control (`role="radio"`). Selected → brand-navy 2px border + filled radio + brand
 * title; unselected → slate hairline. Logical alignment: text packs to the inline-end,
 * the icon sits at the inline-start (mirrors with the locale).
 */
export function SigningMethodOption({
  value,
  title,
  description,
  selected,
  onSelect,
  children,
}: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={`focus-visible:outline-ring flex w-full items-center gap-3 rounded-xl p-4 text-end transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        selected ? 'border-brand-dark-navy border-2' : 'border border-slate-300'
      }`}
    >
      <span
        aria-hidden
        className={`flex size-5 shrink-0 rounded-full ${
          selected ? 'border-brand-dark-navy border-[6px]' : 'bg-card border border-slate-300'
        }`}
      />
      <span className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
        <span
          className={`text-[15px] font-medium ${selected ? 'text-brand-dark-navy' : 'text-foreground'}`}
        >
          {title}
        </span>
        <span className="text-foreground/40 text-xs leading-[1.4]">{description}</span>
      </span>
      {children}
    </button>
  );
}
