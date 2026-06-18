'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

type Props = {
  open: boolean;
  cardLabel: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Destructive confirm + outline cancel (shared layout with WithdrawOfferModal). */
function DeleteActions({ isDeleting, onClose, onConfirm }: Omit<Props, 'open' | 'cardLabel'>) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button
        type="button"
        variant="destructive"
        disabled={isDeleting}
        onClick={onConfirm}
        className={ACTION}
      >
        {t('cards.delete.confirm')}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isDeleting}
        onClick={onClose}
        className={`border-border text-muted-foreground ${ACTION}`}
      >
        {t('cards.delete.cancel')}
      </Button>
    </ModalFooter>
  );
}

/**
 * Delete-card confirmation. Mirrors the iOS `confirm_delete_card` alert. The card's
 * masked label is interpolated into the body so the shopper sees which card they're
 * removing.
 */
export function DeleteCardModal({ open, cardLabel, isDeleting, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t('cards.delete.title')}
        closeLabel={t('cards.delete.close')}
        onClose={onClose}
      />
      <div className="p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {t('cards.delete.body', { card: cardLabel })}
        </p>
      </div>
      <DeleteActions isDeleting={isDeleting} onClose={onClose} onConfirm={onConfirm} />
    </Modal>
  );
}
