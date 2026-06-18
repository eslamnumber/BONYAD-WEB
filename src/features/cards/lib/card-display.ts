import { type PaymentCard } from '../schemas/card';

/** Gateway brand label, normalised for display (`visa` → `VISA`). Falls back to "Card". */
export function brandLabel(card: PaymentCard): string {
  return card.paymentBrand?.trim().toUpperCase() || 'CARD';
}

/** Masked PAN — the dot-leader plus the stored last four (`•••• 4242`). */
export function maskedNumber(card: PaymentCard): string {
  return `•••• ${card.lastFourDigits}`;
}

/**
 * Expiry as `MM/YY`. The gateway sends month/year as already-formatted strings; a
 * 4-digit year is trimmed to two. Latin digits + the `/` separator stay LTR via the
 * caller's `dir`, so the value reads the same in both locales.
 */
export function expiryLabel(card: PaymentCard): string {
  const month = card.expiryMonth?.padStart(2, '0') ?? '';
  const year = (card.expiryYear ?? '').slice(-2);
  return `${month}/${year}`;
}
