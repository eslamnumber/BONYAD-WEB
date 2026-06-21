'use client';

import { useTranslation } from 'react-i18next';

import {
  changeRequestStatusVariant,
  type ChangeRequestStatusVariant,
} from '../../lib/change-request-status';

/** Soft-pill colour per variant, reusing the project status-token palette (rule 19). */
const VARIANT_CLASS: Record<ChangeRequestStatusVariant, string> = {
  pending: 'bg-status-pending-soft text-status-pending',
  responded: 'bg-status-offer-soft text-status-offer',
  agreed: 'bg-status-approved-soft text-status-approved',
  rejected: 'bg-status-rejected-soft text-status-rejected',
  completed: 'bg-status-done-bg text-status-done',
};

/** Status pill for a change request. `status` is the backend string; the variant
 *  (and thus the colour + label) is derived permissively (rule 1). */
export function ChangeRequestStatusBadge({ status }: { status?: string | null }) {
  const { t } = useTranslation();
  const variant = changeRequestStatusVariant(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${VARIANT_CLASS[variant]}`}
    >
      {t(`dashboard.changeRequests.status.${variant}`)}
    </span>
  );
}
