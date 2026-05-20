const ARABIC_DIGIT_OFFSET = 0x0660;
const PERSIAN_DIGIT_OFFSET = 0x06f0;
const PHONE_MAX_INPUT_LENGTH = 10;

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
 * Filters a raw phone-input string for storage in form state.
 * - Converts Arabic / Persian digits to Western digits.
 * - Strips any non-digit character.
 * - Caps at 10 characters so the field can hold a leading `0` plus the 9-digit body.
 * Apply on every `onChange` so non-digits never enter form state.
 */
export function normalizePhoneInput(raw: string): string {
  return arabicToEnglishDigits(raw).replace(/\D/g, '').slice(0, PHONE_MAX_INPUT_LENGTH);
}

/**
 * Final normalization before sending to the backend.
 * Strips the leading `0` users sometimes prefix, yielding the bare 9-digit Saudi mobile
 * (e.g. `0501234567` → `501234567`). Use ONLY inside `features/auth/api/*` fetchers,
 * never inside form components.
 */
export function normalizePhoneForApi(raw: string): string {
  return normalizePhoneInput(raw).replace(/^0+/, '');
}
