import { z } from 'zod';

const ARABIC_DIGIT_OFFSET = 0x0660;
const PERSIAN_DIGIT_OFFSET = 0x06f0;
/** Saudi mobile national format is 9 digits: 5XXXXXXXX. */
const SAUDI_MOBILE_LENGTH = 9;

function arabicToEnglishDigits(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code >= ARABIC_DIGIT_OFFSET && code <= ARABIC_DIGIT_OFFSET + 9) {
      out += String(code - ARABIC_DIGIT_OFFSET);
    } else if (code >= PERSIAN_DIGIT_OFFSET && code <= PERSIAN_DIGIT_OFFSET + 9) {
      out += String(code - PERSIAN_DIGIT_OFFSET);
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Reduce any raw value to its Saudi national mobile body: convert
 * Arabic/Persian digits to Western, drop everything that isn't a digit, then
 * peel a leading international (`00` / `966`) or local (`0`) prefix so a number
 * pasted in any common form (`+966 5x`, `00966 5x`, `05x`, `5x`) lands on the
 * same `5XXXXXXXX` body.
 */
function toSaudiNationalDigits(raw: string): string {
  return arabicToEnglishDigits(raw)
    .replace(/\D/g, '')
    .replace(/^00/, '')
    .replace(/^966/, '')
    .replace(/^0+/, '');
}

/**
 * Live input filter for phone fields. Keeps only a valid Saudi mobile body —
 * it MUST start with `5` and is hard-capped at 9 digits — so the field can
 * never hold a non-Saudi number as the user types. A first digit that isn't
 * `5` (e.g. a stray `9` or `1`) is rejected; anything beyond 9 digits is
 * dropped.
 */
export function normalizePhoneInput(raw: string): string {
  const national = toSaudiNationalDigits(raw);
  if (!national.startsWith('5')) return '';
  return national.slice(0, SAUDI_MOBILE_LENGTH);
}

/**
 * Value sent to the backend. The field is already filtered to the national
 * body, so this is the same `5XXXXXXXX` string (kept as a distinct name for
 * call-site clarity and so non-field callers get the same normalisation).
 */
export function normalizePhoneForApi(raw: string): string {
  return normalizePhoneInput(raw);
}

export const saudiPhoneSchema = z
  .string()
  .min(1, { message: 'auth.errors.phoneRequired' })
  .refine((raw) => normalizePhoneForApi(raw).length === SAUDI_MOBILE_LENGTH, {
    message: 'auth.errors.phoneMust9DigitsStarting5',
  });
