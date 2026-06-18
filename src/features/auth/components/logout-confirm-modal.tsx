'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';

import { useLogout } from '../api/logout';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Sign-out confirmation. Mirrors the shared destructive-confirm layout
 * ({@link DeleteCardModal} / WithdrawOfferModal): destructive confirm + outline
 * cancel. Owns the {@link useLogout} mutation so every trigger (sidebar account
 * menu, profile settings row) only opens the dialog and clears the session here.
 */
export function LogoutConfirmModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { mutate: logout, isPending } = useLogout();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t('auth.logout.title')}
        closeLabel={t('auth.logout.close')}
        onClose={onClose}
      />
      <div className="p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {t('auth.logout.body')}
        </p>
      </div>
      <ModalFooter>
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() => logout()}
          className={ACTION}
        >
          {t('auth.logout.confirm')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
          className={`border-border text-muted-foreground ${ACTION}`}
        >
          {t('auth.logout.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
