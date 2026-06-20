import type { SowCostRange } from '../../../../api/ai/sow-types';

/** Group a number with Western digits (kept LTR everywhere — numbers don't mirror). */
export function formatAmount(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

/**
 * Render a cost band: `1,000 – 2,000` when it's a real range, a single figure when
 * min === max or only one bound is present, and `''` when there's nothing to show.
 * The caller wraps the result with the currency label.
 */
export function formatRange(range?: SowCostRange): string {
  if (!range) return '';
  const { min, max } = range;
  const hasMin = typeof min === 'number';
  const hasMax = typeof max === 'number';
  if (hasMin && hasMax && min !== max) return `${formatAmount(min)} – ${formatAmount(max)}`;
  if (hasMin) return formatAmount(min);
  if (hasMax) return formatAmount(max);
  return '';
}

export function hasText(value?: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Drop empty/blank entries from a possibly-undefined array. */
export function compact<T>(items?: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item !== null && item !== undefined && item !== '');
}
