'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, FieldHint, Modal, ModalFooter } from '@/components/ui';

import { type PortfolioProject } from '../schemas/portfolio';

import { ImageUploader } from './image-uploader';
import { PortfolioModalHeader } from './portfolio-modal-header';
import { ProjectFields } from './project-fields';
import { usePortfolioDir } from './use-portfolio-dir';
import { useProjectForm } from './use-project-form';

const ACTION = 'h-11 rounded-lg text-base font-medium';

/** Save + cancel footer. */
function ProjectFormActions({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button type="submit" disabled={pending} className={`${ACTION} flex-1`}>
        {pending ? t('portfolio.project.saving') : t('portfolio.project.save')}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={onClose}
        className={`${ACTION} border-border text-muted-foreground`}
      >
        {t('portfolio.project.cancel')}
      </Button>
    </ModalFooter>
  );
}

/**
 * Add / edit a past project. Uploads any newly-picked images first
 * ({@link uploadPhotos}), concatenates them with kept URLs, then POSTs (add) or PUTs
 * (full-replace edit). My own web design — a single modal for both modes.
 */
export function ProjectFormModal({
  open,
  project,
  onClose,
}: {
  open: boolean;
  /** Present → edit mode; absent → add mode. */
  project?: PortfolioProject;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const dir = usePortfolioDir();
  const titleId = useId();
  const { form, existing, setExisting, files, setFiles, onSubmit, pending } = useProjectForm(
    project,
    onClose,
  );
  const rootError = form.formState.errors.root?.message;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dir={dir} className="max-w-[560px]">
      <PortfolioModalHeader
        titleId={titleId}
        title={project ? t('portfolio.project.editTitle') : t('portfolio.project.addTitle')}
        closeLabel={t('portfolio.project.close')}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col">
        <div className="flex flex-col gap-5 p-6">
          <ProjectFields form={form} />
          <ImageUploader
            existing={existing}
            onExistingChange={setExisting}
            files={files}
            onFilesChange={setFiles}
          />
          <FieldHint tone="error">{rootError ? rootError : undefined}</FieldHint>
        </div>
        <ProjectFormActions pending={pending} onClose={onClose} />
      </form>
    </Modal>
  );
}
