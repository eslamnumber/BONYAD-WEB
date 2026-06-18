'use client';

import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { type Locale } from '@/types/locale';

import { conventionalDir, formatSupportDate, resolveSupportPriority } from '../lib/support-format';
import { type SupportRequest } from '../schemas/support';

import { RequestStatusBadge } from './request-status-badge';

type Props = {
  request: SupportRequest;
  locale: Locale;
  onOpen: (id: number) => void;
};

/**
 * One support request as a drill-in card. **Conventional direction** (this screen
 * overrides the inverted map): status badge leads at the reading-start, subject +
 * date · priority meta are `text-start` (left in en, right in ar), and the drill chevron
 * trails at the reading-end, pointing forward. The flip is computed from `conventionalDir`
 * (NOT a `ltr:`/`rtl:` variant — those also match the inverted `<html dir>`, so they misfire
 * under this screen's local dir override). `<bdi>` isolates the subject script for a clean column.
 */
export function RequestCard({ request, locale, onOpen }: Props) {
  const { t } = useTranslation();
  const date = formatSupportDate(request.requestedAt, locale);
  const priority = resolveSupportPriority(request.priority);
  const meta = [date, t(priority.labelKey)].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={() => onOpen(request.id)}
      className="focus-visible:outline-ring bg-card border-border motion-safe:hover:bg-muted/40 flex w-full items-center gap-3 rounded-2xl border p-4 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <RequestStatusBadge status={request.status} />
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-start text-sm font-medium">
          <bdi>{request.subject}</bdi>
        </span>
        <span className="text-muted-foreground mt-1 block truncate text-start text-xs">{meta}</span>
      </span>
      <ChevronLeftIcon
        className={`text-muted-foreground/50 size-3 shrink-0 ${conventionalDir(locale) === 'ltr' ? '-scale-x-100' : ''}`}
        aria-hidden
      />
    </button>
  );
}
