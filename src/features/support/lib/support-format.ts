import { conventionalDirection, LOCALE_TAG, type Locale } from '@/types/locale';

/** Shared query namespace — invalidated after a new request is created. */
export const supportQueryKey = () => ['support', 'my-requests'] as const;
export const supportDetailQueryKey = (id: number) => ['support', 'request', id] as const;

export type StatusTone = 'pending' | 'progress' | 'resolved' | 'rejected' | 'neutral';
export type PriorityTone = 'low' | 'medium' | 'high';

/** Backend status string (uppercased) → badge tone. Map, not a switch, to keep
 *  cyclomatic complexity low. Unknown values fall through to `neutral`. */
const STATUS_TONE: Record<string, StatusTone> = {
  PENDING: 'pending',
  OPEN: 'pending',
  NEW: 'pending',
  WAITING: 'pending',
  ASSIGNED: 'progress',
  ACCEPTED: 'progress',
  IN_PROGRESS: 'progress',
  INPROGRESS: 'progress',
  ACTIVE: 'progress',
  RESOLVED: 'resolved',
  CLOSED: 'resolved',
  DONE: 'resolved',
  COMPLETED: 'resolved',
  REJECTED: 'rejected',
  CANCELLED: 'rejected',
  CANCELED: 'rejected',
  DECLINED: 'rejected',
};

const TONE_LABEL: Record<StatusTone, string> = {
  pending: 'support.status.pending',
  progress: 'support.status.inProgress',
  resolved: 'support.status.resolved',
  rejected: 'support.status.rejected',
  neutral: 'support.status.unknown',
};

/** Map a backend-controlled status string to an i18n label key + badge tone (permissive). */
export function resolveSupportStatus(raw?: string | null): { labelKey: string; tone: StatusTone } {
  const tone = STATUS_TONE[(raw ?? '').toUpperCase()] ?? 'neutral';
  return { labelKey: TONE_LABEL[tone], tone };
}

const PRIORITY_TONE: Record<string, PriorityTone> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'high',
  CRITICAL: 'high',
};

/** Map a priority string to an i18n label key + tone; defaults to `medium`. */
export function resolveSupportPriority(raw?: string | null): {
  labelKey: string;
  tone: PriorityTone;
} {
  const tone = PRIORITY_TONE[(raw ?? '').toUpperCase()] ?? 'medium';
  return { labelKey: `support.priorities.${tone}`, tone };
}

/** Conversations-tab filter buckets (client-side — /support/my-requests has no server filter). */
export const REQUEST_FILTERS = ['ALL', 'PENDING', 'ACTIVE', 'RESOLVED'] as const;
export type RequestFilter = (typeof REQUEST_FILTERS)[number];

const REQUEST_BUCKET: Record<string, RequestFilter> = {
  PENDING: 'PENDING',
  NEW: 'PENDING',
  WAITING: 'PENDING',
  ASSIGNED: 'ACTIVE',
  ACCEPTED: 'ACTIVE',
  IN_PROGRESS: 'ACTIVE',
  INPROGRESS: 'ACTIVE',
  ACTIVE: 'ACTIVE',
  RESOLVED: 'RESOLVED',
  CLOSED: 'RESOLVED',
  DONE: 'RESOLVED',
};

/** Whether a request's status falls in the selected filter bucket (`ALL` matches everything). */
export function requestMatchesFilter(
  status: string | null | undefined,
  filter: RequestFilter,
): boolean {
  if (filter === 'ALL') return true;
  return (REQUEST_BUCKET[(status ?? '').toUpperCase()] ?? 'PENDING') === filter;
}

/**
 * Conventional locale → direction, **scoped to the support screen only**. The project
 * default is the INVERTED `LOCALE_DIRECTION` (en→rtl, ar→ltr); this screen deliberately
 * overrides it to the conventional mapping (en→ltr, ar→rtl) at an explicit product
 * request ("revert it for now"). Applied via a `dir` attribute on the screen root + each
 * portalled modal. Do NOT reuse outside `features/support` without the same sign-off.
 */
export function conventionalDir(locale: Locale): 'ltr' | 'rtl' {
  return conventionalDirection(locale);
}

/** A conversation can be opened once an admin is assigned and a room exists. */
export function isConversationOpenable(status?: string | null, roomId?: string | null): boolean {
  return (
    Boolean(roomId) &&
    ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE', 'RESOLVED'].includes((status ?? '').toUpperCase())
  );
}

/** Localised medium date, or null for missing/invalid ISO strings. */
export function formatSupportDate(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], { dateStyle: 'medium' }).format(date);
}
