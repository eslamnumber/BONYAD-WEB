'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

function CancelActions({
  isCancelling,
  onClose,
  onConfirm,
}: {
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button
        type="button"
        variant="destructive"
        disabled={isCancelling}
        onClick={onConfirm}
        className={ACTION}
      >
        {t('subscription.cancel.confirm')}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isCancelling}
        onClick={onClose}
        className={`border-border text-muted-foreground ${ACTION}`}
      >
        {t('subscription.cancel.keep')}
      </Button>
    </ModalFooter>
  );
}

/**
 * Cancel-subscription confirmation. Mirrors the iOS cancel alert and the project's
 * destructive-confirm pattern (DeleteCardModal): destructive confirm + outline
 * "keep". The plan name and access-until date are interpolated when known, falling
 * back to a date-less body so the copy still reads cleanly mid-activation.
 */
export function CancelSubscriptionModal({
  open,
  planName,
  endDate,
  isCancelling,
  onClose,
  onConfirm,
}: {
  open: boolean;
  planName: string;
  endDate: string | null;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const body =
    planName && endDate
      ? t('subscription.cancel.body', { plan: planName, date: endDate })
      : t('subscription.cancel.bodyNoDate');

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t('subscription.cancel.title')}
        closeLabel={t('subscription.cancel.close')}
        onClose={onClose}
      />
      <div className="p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {body}
        </p>
      </div>
      <CancelActions isCancelling={isCancelling} onClose={onClose} onConfirm={onConfirm} />
    </Modal>
  );
}
