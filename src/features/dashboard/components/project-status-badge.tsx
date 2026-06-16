'use client';

import { useTranslation } from 'react-i18next';

import { statusVariant, type ProjectStatusVariant } from '../lib/project-status';

/** Soft-pill colour per variant (Figma 1046:7193 `Status` component). `completed`
 *  is a solid chip; the rest are a tinted background + matching foreground. */
const VARIANT_CLASS: Record<ProjectStatusVariant, string> = {
  approved: 'bg-status-approved-soft text-status-approved',
  contractSigning: 'bg-status-contract-soft text-status-contract',
  offerSent: 'bg-status-offer-soft text-status-offer',
  bidReceived: 'bg-status-bid-soft text-status-bid',
  inProgress: 'bg-status-progress-soft text-status-progress',
  rejected: 'bg-status-rejected-soft text-status-rejected',
  pending: 'bg-status-pending-soft text-status-pending',
  completed: 'bg-status-done-bg text-status-done',
};

export function ProjectStatusBadge({
  status,
  variant: forced,
}: {
  status?: string;
  /** Force a specific pill (e.g. the customer contract screen shows "contract
   *  signing" even while the backend status is still APPROVED). */
  variant?: ProjectStatusVariant;
}) {
  const { t } = useTranslation();
  const variant = forced ?? statusVariant(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${VARIANT_CLASS[variant]}`}
    >
      {t(`dashboard.projects.status.${variant}`)}
    </span>
  );
}
