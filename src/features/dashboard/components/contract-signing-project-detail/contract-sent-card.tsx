'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ContractSentIcon } from '@/components/icons';
import { useAuthStore } from '@/stores/auth-store';

import { useCreateSignature } from '../../api/create-signature';
import { contractQueryKey, useContractByProject } from '../../api/get-contract';
import { projectQueryKey } from '../../api/get-project';
import { type Contract } from '../../schemas/contract';
import { type ProjectDetail } from '../../schemas/project';
import { type ProjectPhase } from '../../schemas/project-phase';

import { ContractDownloadButton } from './contract-download-button';

type Props = { project: ProjectDetail; phases: ProjectPhase[] };
type ResendState = { isPending: boolean; isSuccess: boolean };

/**
 * "Contract sent to email" card (Figma node 1501:14702) — the customer's
 * CONTRACT_SIGNING state. Backend-driven from `CONTRACTS.BY_PROJECT` (`createdAt`
 * → "sent N ago", recipient = the signed-in customer's email). "Resend" re-POSTs
 * /signatures (`useCreateSignature`); "I've signed" refetches the project +
 * contract (the backend "mark signed" verb is not yet exposed — RN has no such
 * call — so this acknowledges + re-reads any out-of-band status change).
 */
export function ContractSentCard({ project, phases }: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const queryClient = useQueryClient();
  const [acknowledged, setAcknowledged] = useState(false);

  const { data: contract, isPending } = useContractByProject(project.id);
  const userEmail = useAuthStore((s) => s.user?.email);
  const { ready, onResend, resend } = useResendContract(project, phases, locale);

  const onSigned = () => {
    setAcknowledged(true);
    void queryClient.invalidateQueries({ queryKey: projectQueryKey(project.id) });
    void queryClient.invalidateQueries({ queryKey: contractQueryKey(project.id) });
  };

  return (
    <section className="bg-card border-border flex w-full flex-col items-center justify-center gap-6 rounded-xl border px-6 py-11 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <ContractSentIcon className="text-status-contract size-[45px] shrink-0" aria-hidden />
      <SentBody contract={contract} isPending={isPending} userEmail={userEmail} locale={locale} />
      <SentActions
        projectId={project.id}
        technicianId={project.assignedTechnicianId}
        acknowledged={acknowledged}
        ready={ready}
        resend={resend}
        onSigned={onSigned}
        onResend={onResend}
      />
    </section>
  );
}

/** Resend orchestration: assemble the /signatures body (projectId + phaseIds +
 *  language, emails auto-fetched backend-side) and expose a guarded `onResend`. */
function useResendContract(project: ProjectDetail, phases: ProjectPhase[], locale: string) {
  const resend = useCreateSignature();
  const phaseIds = phaseIdsOf(phases);
  const ready = phaseIds.length > 0 && !resend.isPending;

  const onResend = () => {
    if (!ready) return;
    resend.mutate({
      projectId: project.id,
      phaseIds,
      language: locale === 'ar' ? 'AR' : 'EN',
    });
  };

  return { ready, onResend, resend };
}

function SentBody({
  contract,
  isPending,
  userEmail,
  locale,
}: {
  contract: Contract | null | undefined;
  isPending: boolean;
  userEmail: string | undefined;
  locale: string;
}) {
  const { t } = useTranslation();
  const sentAgo = relativeFromNow(contract?.createdAt, locale);

  return (
    <div className="flex flex-col items-center gap-3.5">
      <p className="text-foreground text-center text-lg font-medium">
        {t('dashboard.contractSigning.sent.title')}
      </p>
      <div className="flex flex-col items-center gap-1 text-center text-xs">
        {isPending ? (
          <span className="text-foreground/40">
            {t('dashboard.contractSigning.sent.preparing')}
          </span>
        ) : null}
        {!isPending && sentAgo ? (
          <span className="text-foreground/40">
            {t('dashboard.contractSigning.sent.sentAgo', { value: sentAgo })}
          </span>
        ) : null}
        {!isPending && userEmail ? (
          <span className="text-foreground">
            <bdi>{userEmail}</bdi>
          </span>
        ) : null}
      </div>
      <p className="text-foreground/60 max-w-[292px] text-center text-sm">
        {t('dashboard.contractSigning.sent.description')}
      </p>
    </div>
  );
}

function SentActions({
  projectId,
  technicianId,
  acknowledged,
  ready,
  resend,
  onSigned,
  onResend,
}: {
  projectId: number;
  technicianId: number | null | undefined;
  acknowledged: boolean;
  ready: boolean;
  resend: ResendState;
  onSigned: () => void;
  onResend: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={onSigned}
        disabled={acknowledged}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex w-full items-center justify-center rounded-lg p-3 text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {t(`dashboard.contractSigning.sent.${acknowledged ? 'signedAck' : 'signed'}`)}
      </button>
      <ContractDownloadButton projectId={projectId} technicianId={technicianId} />
      <button
        type="button"
        onClick={onResend}
        disabled={!ready}
        className="text-brand-dark-navy focus-visible:outline-ring flex w-full items-center justify-center rounded-lg p-3 text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 motion-safe:hover:opacity-80"
      >
        {t(`dashboard.contractSigning.sent.${resendLabel(resend)}`)}
      </button>
    </div>
  );
}

function resendLabel(resend: ResendState): 'resending' | 'resent' | 'resend' {
  if (resend.isPending) return 'resending';
  if (resend.isSuccess) return 'resent';
  return 'resend';
}

function phaseIdsOf(phases: ProjectPhase[]): number[] {
  return phases.map((p) => p.id).filter((id): id is number => typeof id === 'number' && id > 0);
}

/** Localised "N <unit> ago" from an ISO timestamp (seconds → days), via Intl. */
function relativeFromNow(iso: string | undefined, locale: string): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffSec = Math.round((then - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(Math.trunc(diffSec), 'second');
  if (abs < 3600) return rtf.format(Math.trunc(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.trunc(diffSec / 3600), 'hour');
  return rtf.format(Math.trunc(diffSec / 86400), 'day');
}
