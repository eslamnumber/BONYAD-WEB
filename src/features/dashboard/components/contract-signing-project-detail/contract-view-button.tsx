'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileIcon } from '@/components/icons';

import { CONTRACT_ACTION_CLASS } from './contract-download-button';
import { ContractPdfViewer } from './contract-pdf-viewer';

type Props = { projectId: number; technicianId: number | null | undefined };

/**
 * "View contract" action for both roles — opens {@link ContractPdfViewer}, the in-app
 * PDF viewer. Disabled until the assigned technician is known (the PDF can't be
 * generated without it). The viewer itself exposes the download fallback.
 */
export function ContractViewButton({ projectId, technicianId }: Props) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'AR' : 'EN';
  const [open, setOpen] = useState(false);

  const hasTechnician = typeof technicianId === 'number' && technicianId > 0;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasTechnician}
        title={hasTechnician ? undefined : t('dashboard.contractSigning.downloadUnavailable')}
        className={CONTRACT_ACTION_CLASS}
      >
        <FileIcon className="size-[18px] shrink-0" aria-hidden />
        {t('dashboard.contractSigning.view')}
      </button>
      {hasTechnician && open ? (
        <ContractPdfViewer
          open
          onClose={() => setOpen(false)}
          projectId={projectId}
          technicianId={technicianId}
          language={language}
        />
      ) : null}
    </div>
  );
}
