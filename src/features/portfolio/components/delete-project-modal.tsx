'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, FieldHint, Modal, ModalFooter } from '@/components/ui';

import { PortfolioModalHeader } from './portfolio-modal-header';
import { usePortfolioDir } from './use-portfolio-dir';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

/** Destructive confirm + outline cancel. */
function DeleteActions({
  isDeleting,
  onClose,
  onConfirm,
}: {
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
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
        {t('portfolio.project.deleteConfirm')}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isDeleting}
        onClick={onClose}
        className={`${ACTION} border-border text-muted-foreground`}
      >
        {t('portfolio.project.cancel')}
      </Button>
    </ModalFooter>
  );
}

/** Confirm deleting a past project (DELETE /portfolios/projects/:id). */
export function DeleteProjectModal({
  open,
  title,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  isDeleting: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const dir = usePortfolioDir();
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dir={dir}>
      <PortfolioModalHeader
        titleId={titleId}
        title={t('portfolio.project.deleteTitle')}
        closeLabel={t('portfolio.project.close')}
        onClose={onClose}
      />
      <div className="flex flex-col gap-3 p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {t('portfolio.project.deleteBody', { title })}
        </p>
        <FieldHint tone="error">{errorMessage}</FieldHint>
      </div>
      <DeleteActions isDeleting={isDeleting} onClose={onClose} onConfirm={onConfirm} />
    </Modal>
  );
}
