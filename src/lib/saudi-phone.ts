import { z } from 'zod';

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

export function normalizePhoneInput(raw: string): string {
  return arabicToEnglishDigits(raw).replace(/\D/g, '').slice(0, PHONE_MAX_INPUT_LENGTH);
}

export function normalizePhoneForApi(raw: string): string {
  return normalizePhoneInput(raw).replace(/^0+/, '');
}

export const saudiPhoneSchema = z
  .string()
  .min(1, { message: 'auth.errors.phoneRequired' })
  .refine(
    (raw) => {
      const normalized = normalizePhoneForApi(raw);
      return normalized.length === 9 && normalized.startsWith('5');
    },
    { message: 'auth.errors.phoneMust9DigitsStarting5' },
  );
