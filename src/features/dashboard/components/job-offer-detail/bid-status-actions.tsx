'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

const ACTION = 'h-12 w-full rounded-lg text-[15px] font-semibold';

/** PENDING bids can be edited/withdrawn; accepted/rejected ones are locked (mirrors RN). */
function isPendingStatus(status: string | undefined): boolean {
  return (status ?? 'PENDING').toUpperCase() === 'PENDING';
}

type Props = {
  status?: string;
  onEdit: () => void;
  onWithdraw: () => void;
};

/**
 * Edit / Withdraw block of the bid-status card. Both actions open a modal
 * ({@link EditOfferModal} / {@link WithdrawOfferModal}) owned by the panel. For
 * accepted/rejected bids the actions are replaced by a status message — the
 * backend only allows withdrawing/editing a PENDING bid.
 */
export function BidStatusActions({ status, onEdit, onWithdraw }: Props) {
  const { t } = useTranslation();

  if (!isPendingStatus(status)) return <LockedMessage status={status} />;

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onEdit}
        className={`border-brand-dark-navy text-brand-dark-navy ${ACTION}`}
      >
        {t('dashboard.jobOffer.status.edit')}
      </Button>
      <button
        type="button"
        onClick={onWithdraw}
        className="text-destructive p-1 text-center text-sm font-medium underline"
      >
        {t('dashboard.jobOffer.status.withdraw')}
      </button>
    </div>
  );
}

function LockedMessage({ status }: { status?: string }) {
  const { t } = useTranslation();
  const key =
    (status ?? '').toUpperCase() === 'ACCEPTED'
      ? 'dashboard.jobOffer.status.accepted'
      : 'dashboard.jobOffer.status.closed';
  return (
    <p dir="auto" className="text-foreground/60 text-start text-[13px] leading-[1.4]">
      {t(key)}
    </p>
  );
}
