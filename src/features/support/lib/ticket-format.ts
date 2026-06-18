import { type Locale } from '@/types/locale';

import { type SupportCategory } from '../schemas/ticket';

import { type StatusTone } from './support-format';

export const ticketsQueryKey = (status: string) => ['support', 'tickets', status] as const;
export const ticketsRootKey = () => ['support', 'tickets'] as const;
export const ticketDetailQueryKey = (id: number) => ['support', 'ticket', id] as const;
export const categoriesQueryKey = () => ['support', 'categories'] as const;

const TICKET_STATUS_TONE: Record<string, StatusTone> = {
  OPEN: 'pending',
  IN_PROGRESS: 'progress',
  WAITING_FOR_CUSTOMER: 'progress',
  RESOLVED: 'resolved',
  CLOSED: 'resolved',
};

const TONE_LABEL: Record<StatusTone, string> = {
  pending: 'support.ticketStatus.open',
  progress: 'support.ticketStatus.inProgress',
  resolved: 'support.ticketStatus.resolved',
  rejected: 'support.ticketStatus.resolved',
  neutral: 'support.ticketStatus.open',
};

/** Map a backend-controlled ticket status to an i18n label key + badge tone (permissive). */
export function resolveTicketStatus(raw?: string | null): { labelKey: string; tone: StatusTone } {
  const tone = TICKET_STATUS_TONE[(raw ?? '').toUpperCase()] ?? 'neutral';
  return { labelKey: TONE_LABEL[tone], tone };
}

/** A ticket is still actionable (can receive replies) until it is resolved/closed. */
export function isTicketOpen(status?: string | null): boolean {
  return !['RESOLVED', 'CLOSED'].includes((status ?? '').toUpperCase());
}

/** Locale-aware category label — keyed by `Locale`, never a `locale === 'ar'` branch (rule 23e). */
export function categoryName(category: SupportCategory, locale: Locale): string {
  const byLocale: Record<Locale, string | null | undefined> = {
    ar: category.nameAr,
    en: category.nameEn,
  };
  return byLocale[locale] ?? category.nameEn ?? category.nameAr ?? '';
}
