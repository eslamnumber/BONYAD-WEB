'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal, ModalHeader } from '@/components/ui/modal';

import { ContractDownloadButton } from './contract-download-button';

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: number;
  technicianId: number;
  language: 'EN' | 'AR';
};

const TITLE_ID = 'contract-pdf-viewer-title';

/**
 * In-app contract viewer: a wide, tall modal embedding the contract PDF in an
 * `<iframe>`. The iframe points at the same-origin `/api/contract-pdf` stream (the
 * dashboard CSP only allows framing `'self'`), which generates the PDF server-side and
 * streams it back. A "Download contract (PDF)" action stays available as a fallback —
 * it opens the absolute backend URL in a new tab, independent of the framed stream.
 * Portalled, so it inherits the document direction (the inverted `en→rtl` mapping) like
 * the other CONTRACT_SIGNING modals — no explicit `dir` needed.
 */
export function ContractPdfViewer({ open, onClose, projectId, technicianId, language }: Props) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  const src = `/api/contract-pdf?projectId=${projectId}&technicianId=${technicianId}&language=${language}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={TITLE_ID}
      className="h-[calc(100dvh-2rem)] max-w-[920px] overflow-hidden"
    >
      <ModalHeader
        titleId={TITLE_ID}
        title={t('dashboard.contractSigning.viewer.title')}
        closeLabel={t('dashboard.contractSigning.viewer.close')}
        onClose={onClose}
      />
      <div className="bg-muted relative min-h-0 flex-1">
        {loaded ? null : (
          <p className="text-foreground/50 absolute inset-0 flex items-center justify-center text-sm">
            {t('dashboard.contractSigning.viewer.loading')}
          </p>
        )}
        <iframe
          src={src}
          title={t('dashboard.contractSigning.viewer.frameTitle')}
          onLoad={() => setLoaded(true)}
          className="relative size-full border-0"
        />
      </div>
      <div className="border-border flex flex-col gap-2 border-t p-4">
        <p dir="auto" className="text-foreground/50 text-center text-xs">
          {t('dashboard.contractSigning.viewer.hint')}
        </p>
        <ContractDownloadButton projectId={projectId} technicianId={technicianId} />
      </div>
    </Modal>
  );
}
