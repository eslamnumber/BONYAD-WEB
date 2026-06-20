'use client';

import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalHeader } from '@/components/ui';

import { useOwnerEdit } from '../../api/get-owner-edit';
import { responseToFormValues } from '../../lib/owner-edit-mapping';

import { ProjectEditForm } from './project-edit-form';

type Props = {
  open: boolean;
  projectId: number;
  onClose: () => void;
};

/**
 * Customer project-edit modal (replaces the old /dashboard/projects/[id]/edit
 * screen). Opens over the pending job-offer detail: loads the owner-editable view
 * (GET /owner-edit, gated to when the dialog is open) and maps it to form defaults.
 * Saving (PUT /owner-edit) invalidates the project caches so the detail behind the
 * modal refetches; both save and cancel close the dialog.
 */
export function ProjectEditModal({ open, projectId, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { data, isPending, isError, refetch } = useOwnerEdit(projectId, open);
  const defaults = useMemo(() => (data ? responseToFormValues(data) : null), [data]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="max-w-[560px] overflow-hidden"
    >
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.projectEdit.title')}
        closeLabel={t('dashboard.projectEdit.close')}
        onClose={onClose}
      />
      {isPending ? (
        <p className="text-foreground/60 p-6 text-end text-sm">
          {t('dashboard.projectEdit.loading')}
        </p>
      ) : isError || !defaults ? (
        <div className="flex flex-col items-end gap-3 p-6">
          <p className="text-destructive text-end text-sm">
            {t('dashboard.projectEdit.loadError')}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="border-border text-foreground h-10 rounded-lg text-sm"
          >
            {t('dashboard.projectEdit.retry')}
          </Button>
        </div>
      ) : (
        <ProjectEditForm
          projectId={projectId}
          defaultValues={defaults}
          onSaved={onClose}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
