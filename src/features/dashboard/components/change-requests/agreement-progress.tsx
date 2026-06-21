'use client';

import { useTranslation } from 'react-i18next';

import { PhaseCheckIcon } from '@/components/icons';

import type { ChangeRequest } from '../../schemas/change-request';

type Props = {
  cr: Pick<
    ChangeRequest,
    'userAgreed' | 'technicianAgreed' | 'userAgreedAt' | 'technicianAgreedAt'
  >;
  /** True when the viewer is the technician — marks their own chip with "(You)". */
  isTechnician: boolean;
};

/**
 * Two-party agreement indicator. Agreement is per-party — the change locks in only
 * once both the customer and the technician have agreed. The viewer's own side is
 * tagged "(You)" so each party can see whose move is outstanding.
 */
export function AgreementProgress({ cr, isTechnician }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <PartyChip
        label={t('dashboard.changeRequests.agreement.customer')}
        agreed={Boolean(cr.userAgreed || cr.userAgreedAt)}
        isYou={!isTechnician}
      />
      <PartyChip
        label={t('dashboard.changeRequests.agreement.technician')}
        agreed={Boolean(cr.technicianAgreed || cr.technicianAgreedAt)}
        isYou={isTechnician}
      />
    </div>
  );
}

function PartyChip({ label, agreed, isYou }: { label: string; agreed: boolean; isYou: boolean }) {
  const { t } = useTranslation();
  const name = isYou ? `${label} · ${t('dashboard.changeRequests.agreement.you')}` : label;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        agreed ? 'bg-status-approved-soft text-status-approved' : 'bg-muted text-muted-foreground'
      }`}
    >
      {agreed && <PhaseCheckIcon className="size-3 shrink-0" aria-hidden />}
      <span>{name}</span>
      <span className="opacity-70">
        {agreed
          ? t('dashboard.changeRequests.agreement.agreed')
          : t('dashboard.changeRequests.agreement.waiting')}
      </span>
    </span>
  );
}
