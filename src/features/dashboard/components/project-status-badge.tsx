'use client';

import { useTranslation } from 'react-i18next';

import { statusVariant, type ProjectStatusVariant } from '../lib/project-status';

/** Soft-pill colour per variant (Figma 1046:7193 `Status` component). `completed`
 *  is a solid chip; the rest are a tinted background + matching foreground. */
const VARIANT_CLASS: Record<ProjectStatusVariant, string> = {
  approved: 'bg-status-approved-soft text-status-approved',
  contractSigning: 'bg-status-contract-soft text-status-contract',
  offerSent: 'bg-status-offer-soft text-status-offer',
  inProgress: 'bg-status-progress-soft text-status-progress',
  rejected: 'bg-status-rejected-soft text-status-rejected',
  pending: 'bg-status-pending-soft text-status-pending',
  completed: 'bg-status-done-bg text-status-done',
};

export function ProjectStatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation();
  const variant = statusVariant(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${VARIANT_CLASS[variant]}`}
    >
      {t(`dashboard.projects.status.${variant}`)}
    </span>
  );
}
