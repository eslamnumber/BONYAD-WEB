'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isWithdrawing: boolean;
};

/**
 * Withdraw-confirmation modal (Figma "Modal-Decline-Bid", node 1103:7511). Shown
 * when the SP taps "Withdraw offer" on the bid-status card; confirming runs the
 * delete via {@link onConfirm}. Replaces the old inline two-step confirm.
 */
export function WithdrawOfferModal({ open, onClose, onConfirm, isWithdrawing }: Props) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.jobOffer.withdrawModal.title')}
        closeLabel={t('dashboard.jobOffer.withdrawModal.close')}
        onClose={onClose}
      />
      <div className="p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {t('dashboard.jobOffer.withdrawModal.body1')}
          <br />
          {t('dashboard.jobOffer.withdrawModal.body2')}
        </p>
      </div>
      <ModalFooter>
        <Button
          type="button"
          variant="destructive"
          disabled={isWithdrawing}
          onClick={onConfirm}
          className={ACTION}
        >
          {t('dashboard.jobOffer.withdrawModal.confirm')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isWithdrawing}
          onClick={onClose}
          className={`border-border text-muted-foreground ${ACTION}`}
        >
          {t('dashboard.jobOffer.status.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
