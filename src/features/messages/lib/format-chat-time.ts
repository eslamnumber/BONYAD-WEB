import type { Locale } from '@/types/locale';

type Labels = { now: string; yesterday: string };

/**
 * Format a message/room timestamp as the short relative label the chat list and
 * thread show: today → "now", 1 day → "yesterday", <7 days → localized weekday,
 * older → localized short date. Mirrors the RN `formatRelativeTime`. The day/date
 * labels come from the caller's `t(...)` so they stay translatable.
 */
export function formatChatTime(iso: string | undefined, locale: Locale, labels: Labels): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  if (dayDiff <= 0) return labels.now;
  if (dayDiff === 1) return labels.yesterday;

  const intlLocale = locale === 'ar' ? 'ar' : 'en';
  if (dayDiff < 7) return new Intl.DateTimeFormat(intlLocale, { weekday: 'long' }).format(date);
  return new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short' }).format(date);
}

/** Clock time under a message bubble, e.g. "10:00 AM" / "١٠:٠٠ ص". */
export function formatMessageTime(iso: string | undefined, locale: Locale): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
