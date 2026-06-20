'use client';

import { useTranslation } from 'react-i18next';

import { ContractSentIcon } from '@/components/icons';

import { ContractDownloadButton } from './contract-download-button';

type Props = { projectId: number; technicianId: number | null | undefined };

/**
 * Technician's CONTRACT_SIGNING card — RN's `isTechnician` branch of
 * ContractSigningProjectScreen (view + download only). The technician cannot send or
 * resend the contract: both parties sign through the link emailed to them, so this
 * shows the "contract ready" state, a waiting note, and the download action. Routed
 * from {@link AssignedProjectDetail} for technicians (customers get the sent card).
 */
export function TechnicianContractCard({ projectId, technicianId }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-card border-border flex w-full flex-col items-center justify-center gap-6 rounded-xl border px-6 py-11 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <ContractSentIcon className="text-status-contract size-[45px] shrink-0" aria-hidden />
      <div className="flex flex-col items-center gap-3.5">
        <p className="text-foreground text-center text-lg font-medium">
          {t('dashboard.contractSigning.technician.title')}
        </p>
        <p dir="auto" className="text-foreground/60 max-w-[292px] text-center text-sm">
          {t('dashboard.contractSigning.technician.description')}
        </p>
        <p dir="auto" className="text-foreground/40 max-w-[292px] text-center text-xs">
          {t('dashboard.contractSigning.technician.waiting')}
        </p>
      </div>
      <ContractDownloadButton projectId={projectId} technicianId={technicianId} />
    </section>
  );
}
