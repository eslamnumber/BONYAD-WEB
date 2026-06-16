'use client';

import { useTranslation } from 'react-i18next';

import { type CustomerSortKey } from '../lib/project-customer';

/** Down-direction options render the up-glyph flipped (Figma 1469:7438 / 7441). */
const SORT_ITEMS: { key: CustomerSortKey; down: boolean }[] = [
  { key: 'highPrice', down: false },
  { key: 'lowPrice', down: true },
  { key: 'oldest', down: false },
  { key: 'newest', down: true },
];

type Props = {
  value: CustomerSortKey;
  onSelect: (key: CustomerSortKey) => void;
};

/**
 * Sort menu (Figma 1468:7376) — a floating card of four price/date options, each
 * with a direction glyph and a hairline divider between them. Opened from the
 * toolbar's filter pill (the parent owns open state + outside-click). Options are
 * radio-style: the active sort is `aria-checked`. The arrow is the Figma's own
 * "↑" text glyph (no icon export); descending options flip it with `-scale-y-100`.
 */
export function ProjectsSortMenu({ value, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div
      role="menu"
      className="bg-card border-border absolute start-0 top-full z-20 mt-2 flex min-w-[188px] flex-col items-stretch rounded-xl border p-4 shadow-[0px_2px_20px_0px_rgba(0,0,0,0.1)]"
    >
      {SORT_ITEMS.map(({ key, down }, i) => (
        <div key={key} className="flex flex-col">
          {i > 0 ? <div className="bg-border my-2 h-px w-full" aria-hidden /> : null}
          <button
            type="button"
            role="menuitemradio"
            aria-checked={value === key}
            onClick={() => onSelect(key)}
            className={`flex items-center justify-end gap-[7px] text-xs whitespace-nowrap transition-colors ${
              value === key
                ? 'text-foreground font-medium'
                : 'text-foreground/70 motion-safe:hover:text-foreground'
            }`}
          >
            <span dir="auto">{t(`dashboard.projects.customer.sort.${key}`)}</span>
            <span aria-hidden className={`shrink-0 ${down ? '-scale-y-100' : ''}`}>
              ↑
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
