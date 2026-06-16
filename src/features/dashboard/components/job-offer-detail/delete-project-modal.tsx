'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error?: boolean;
};

/**
 * Delete-confirmation modal for a pending project (RN ProjectDetailScreen
 * `handleDeleteProject`). Mirrors {@link WithdrawOfferModal}; confirming runs the
 * delete via {@link onConfirm}. Customer-only.
 */
export function DeleteProjectModal({ open, onClose, onConfirm, isDeleting, error }: Props) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.jobOffer.customer.deleteConfirm.title')}
        closeLabel={t('dashboard.jobOffer.customer.deleteConfirm.cancel')}
        onClose={onClose}
      />
      <div className="p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {t('dashboard.jobOffer.customer.deleteConfirm.body1')}
          <br />
          {t('dashboard.jobOffer.customer.deleteConfirm.body2')}
        </p>
        {error ? (
          <p role="alert" className="text-destructive mt-3 text-start text-sm">
            {t('dashboard.jobOffer.customer.deleteError')}
          </p>
        ) : null}
      </div>
      <ModalFooter>
        <Button
          type="button"
          variant="destructive"
          disabled={isDeleting}
          onClick={onConfirm}
          className={ACTION}
        >
          {t('dashboard.jobOffer.customer.deleteConfirm.confirm')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isDeleting}
          onClick={onClose}
          className={`border-border text-muted-foreground ${ACTION}`}
        >
          {t('dashboard.jobOffer.customer.deleteConfirm.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
