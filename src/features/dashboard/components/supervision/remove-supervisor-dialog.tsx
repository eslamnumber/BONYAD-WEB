'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';

import { useRemoveSupervisor } from '../../api';

/**
 * Confirm cancelling a pending invitation (`mode: 'pending'`) or removing the active
 * supervisor (`mode: 'active'`) — both DELETE /projects/:id/supervisor. On success
 * the dialog closes and the projects list refetches.
 */
export function RemoveSupervisorDialog({
  projectId,
  mode,
  onClose,
}: {
  projectId: number;
  mode: 'pending' | 'active';
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const remove = useRemoveSupervisor();
  const key = mode === 'active' ? 'remove' : 'cancel';

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t(`dashboard.supervision.customer.confirm.${key}Title`)}
        closeLabel={t('common.close')}
        onClose={onClose}
      />
      <div className="flex flex-col gap-3 p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {t(`dashboard.supervision.customer.confirm.${key}Body`)}
        </p>
        {remove.isError ? (
          <p role="alert" className="text-destructive text-end text-sm">
            {t('dashboard.supervision.customer.confirm.error')}
          </p>
        ) : null}
      </div>
      <ConfirmFooter
        actionKey={key}
        busy={remove.isPending}
        onKeep={onClose}
        onConfirm={() => remove.mutate(projectId, { onSuccess: onClose })}
      />
    </Modal>
  );
}

function ConfirmFooter({
  actionKey,
  busy,
  onKeep,
  onConfirm,
}: {
  actionKey: 'remove' | 'cancel';
  busy: boolean;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button variant="outline" size="md" disabled={busy} onClick={onKeep} className="flex-1">
        {t('dashboard.supervision.customer.confirm.keep')}
      </Button>
      <Button
        variant="destructive"
        size="md"
        disabled={busy}
        onClick={onConfirm}
        className="flex-1"
      >
        {busy
          ? t('dashboard.supervision.customer.confirm.working')
          : t(`dashboard.supervision.customer.confirm.${actionKey}Confirm`)}
      </Button>
    </ModalFooter>
  );
}
