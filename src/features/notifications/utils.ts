import { LOCALE_DIRECTION, LOCALE_TAG, type Locale } from '@/types/locale';

import type { Notification } from './schemas/notification';

/**
 * Pick the localised string for the active locale. The backend may send a single
 * value (`title`/`message`) or `…En`/`…Ar` pairs. Locale → field follows the
 * project's inverted mapping (ar → ltr → Arabic field), never `locale === 'ar'`.
 */
function localised(
  en: string | undefined,
  ar: string | undefined,
  fallback: string | undefined,
  locale: Locale,
): string {
  const preferred = LOCALE_DIRECTION[locale] === 'ltr' ? ar : en;
  return preferred ?? fallback ?? en ?? ar ?? '';
}

export function notificationTitle(n: Notification, locale: Locale): string {
  return localised(n.titleEn, n.titleAr, n.title, locale);
}

export function notificationMessage(n: Notification, locale: Locale): string {
  return localised(n.messageEn, n.messageAr, n.message, locale);
}

/** "15 October 13:00" — Gregorian month + 24h time + Latin digits, matching Figma 1046:7858. */
export function formatNotificationTime(createdAt: string | undefined, locale: Locale): string {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(date);
}
