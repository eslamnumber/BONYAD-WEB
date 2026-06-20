import { SaudiRiyalIcon } from '@/components/icons';

import { type ReviewRow } from '../../lib/review-sections';

type Props = {
  title: string;
  editLabel: string;
  /** Screen-reader text for the Riyal glyph on currency rows (e.g. "SAR"). */
  currencyLabel: string;
  onEdit: () => void;
  rows: ReviewRow[];
};

/**
 * One review summary card (Figma 1550:1565): a bordered surface with the section
 * title at the inline-end, an Edit link at the inline-start, and label/value rows
 * beneath. Rows pack to the inline-end (value then label, mirroring with the
 * inverted en→rtl mapping). Labels end in a colon (weak punctuation) and values
 * are user-entered, so both opt into content direction with `dir="auto"`. Amount
 * rows append the official Saudi Riyal glyph (never a "SAR" text suffix) — the
 * shared currency convention (see `MoneyAmount`).
 */
export function ReviewCard({ title, editLabel, currencyLabel, onEdit, rows }: Props) {
  return (
    <div className="bg-card border-border flex w-full flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="text-brand-dark-navy hover:text-brand-navy -my-1 rounded-sm px-1 py-1 text-sm font-semibold underline underline-offset-2"
        >
          {editLabel}
        </button>
        <h3 className="text-foreground text-end text-base font-medium">{title}</h3>
      </div>
      <div className="flex flex-col items-end gap-2 text-sm">
        {rows.map((row, i) => (
          <p key={i} className="flex w-full flex-wrap items-baseline justify-end gap-1">
            <span
              dir="auto"
              className={`text-foreground/80 min-w-0 ${row.currency ? 'inline-flex items-center gap-1' : ''}`}
            >
              {row.value}
              {row.currency ? (
                <>
                  <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
                  <span className="sr-only">{currencyLabel}</span>
                </>
              ) : null}
            </span>
            {row.label ? (
              <span dir="auto" className="text-foreground/60 shrink-0">
                {row.label}
              </span>
            ) : null}
          </p>
        ))}
      </div>
    </div>
  );
}
