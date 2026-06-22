'use client';

import { useTranslation } from 'react-i18next';

/** Supervisor-status → soft-pill tone, reusing the shared status-* surface tokens. */
const TONE: Record<string, string> = {
  INVITED: 'bg-status-pending-soft text-status-pending',
  ACTIVE: 'bg-status-approved-soft text-status-approved',
  DECLINED: 'bg-status-rejected-soft text-status-rejected',
  REMOVED: 'bg-muted text-muted-foreground',
};

const KNOWN = new Set(Object.keys(TONE));

/** A tinted pill for a supervision assignment's lifecycle state (INVITED / ACTIVE / …). */
export function SupervisorStatusPill({ status }: { status?: string | null }) {
  const { t } = useTranslation();
  const key = (status ?? '').toUpperCase();
  const tone = TONE[key] ?? 'bg-muted text-muted-foreground';
  const labelKey = KNOWN.has(key) ? key.toLowerCase() : 'unknown';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${tone}`}
    >
      {t(`dashboard.supervision.status.${labelKey}`)}
    </span>
  );
}
