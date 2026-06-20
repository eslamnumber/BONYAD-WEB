'use client';

import { useTranslation } from 'react-i18next';

import { FileIcon } from '@/components/icons';

import { useContractPdfUrl } from '../../api/generate-contract-pdf';

type Props = { projectId: number; technicianId: number | null | undefined };

const BASE_CLASS =
  'border-brand-dark-navy text-brand-dark-navy focus-visible:outline-ring motion-safe:hover:bg-field-surface flex w-full items-center justify-center gap-2 rounded-lg border p-3 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

/**
 * "Download contract (PDF)" action for both roles (RN's `handleDownloadContract` /
 * ContractPDFViewer). The PDF URL is pre-generated via POST /contracts/test/generate-pdf
 * ({@link useContractPdfUrl}) so the click opens it synchronously — an async open is
 * popup-blocked. Reads "Preparing…" while generating; a failure shows a retry-on-click
 * error line. Disabled until the assigned technicianId is known.
 */
export function ContractDownloadButton({ projectId, technicianId }: Props) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'AR' : 'EN';
  const {
    data: url,
    isFetching,
    isFetched,
    refetch,
  } = useContractPdfUrl(projectId, technicianId, language);

  const hasTechnician = typeof technicianId === 'number' && technicianId > 0;
  const failed = hasTechnician && isFetched && !isFetching && !url;

  const onClick = () => {
    if (url) openPdf(url, projectId);
    else void refetch();
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={!hasTechnician || isFetching}
        title={hasTechnician ? undefined : t('dashboard.contractSigning.downloadUnavailable')}
        className={BASE_CLASS}
      >
        <FileIcon className="size-[18px] shrink-0" aria-hidden />
        {isFetching
          ? t('dashboard.contractSigning.downloadPreparing')
          : t('dashboard.contractSigning.download')}
      </button>
      {failed ? (
        <p role="alert" dir="auto" className="text-destructive text-center text-xs">
          {t('dashboard.contractSigning.downloadError')}
        </p>
      ) : null}
    </div>
  );
}

/** Open the generated PDF in a new tab (the download hint applies for same-origin). */
function openPdf(url: string, projectId: number) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.download = `contract-${projectId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
