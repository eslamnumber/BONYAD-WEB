'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, SaudiRiyalIcon } from '@/components/icons';
import { Modal } from '@/components/ui';

import { type ProjectDetail } from '../../schemas/project';
import { type ProjectPhase } from '../../schemas/project-phase';
import { formatBudgetRange } from '../job-offer-detail/job-offer-format';

import { useApprovePhases } from './use-approve-phases';

type Props = {
  open: boolean;
  onClose: () => void;
  project: ProjectDetail;
  phases: ProjectPhase[];
};

/**
 * "Project phases" review modal (Figma node 1501:13040) — opened from the signing
 * card's "Approve phases" CTA. Lists every phase with its amount + duration badge
 * and a total, then a confirm CTA that runs {@link useApprovePhases} (approve-all +
 * signatures). On success the project moves to CONTRACT_SIGNING and the detail screen
 * re-routes to the contract-sent view, so the modal just closes.
 */
export function ReviewPhasesModal({ open, onClose, project, phases }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { approve, isPending, isError } = useApprovePhases(project, phases);

  const onApprove = async () => {
    try {
      await approve();
      onClose();
    } catch {
      /* surfaced via isError */
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-[560px]">
      <ModalHead titleId={titleId} onClose={onClose} />
      <div className="flex w-full flex-col gap-4 p-6">
        <PhaseList phases={phases} />
        <TotalRow phases={phases} />
        {isError ? (
          <p role="alert" className="text-destructive text-end text-sm">
            {t('dashboard.customerApproved.review.error')}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onApprove}
          disabled={isPending}
          className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex h-12 w-full items-center justify-center rounded-[10px] text-[15px] font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 motion-safe:hover:opacity-90"
        >
          {t(`dashboard.customerApproved.review.${isPending ? 'approving' : 'approve'}`)}
        </button>
      </div>
    </Modal>
  );
}

function ModalHead({ titleId, onClose }: { titleId: string; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex w-full items-start justify-between gap-4 border-b px-6 py-5">
      <button
        type="button"
        onClick={onClose}
        aria-label={t('dashboard.customerApproved.review.close')}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-lg p-2 focus-visible:ring-2 focus-visible:outline-none"
      >
        <CloseIcon className="size-4" aria-hidden />
      </button>
      <div className="flex min-w-0 flex-col items-end gap-1 text-end">
        <h2 id={titleId} className="text-foreground text-xl font-bold">
          {t('dashboard.customerApproved.review.title')}
        </h2>
        <p className="text-muted-foreground text-[13px]">
          {t('dashboard.customerApproved.review.subtitle')}
        </p>
      </div>
    </div>
  );
}

function PhaseList({ phases }: { phases: ProjectPhase[] }) {
  const { t } = useTranslation();
  if (phases.length === 0)
    return (
      <p className="text-foreground/60 text-end text-sm">
        {t('dashboard.customerApproved.review.empty')}
      </p>
    );
  return (
    <ul className="divide-border flex w-full flex-col divide-y">
      {phases.map((phase) => (
        <PhaseRow key={phase.id} phase={phase} />
      ))}
    </ul>
  );
}

function PhaseRow({ phase }: { phase: ProjectPhase }) {
  const heading = phase.title ?? phase.description ?? '—';
  return (
    <li className="flex w-full items-center justify-between gap-3 py-3.5">
      <div className="flex shrink-0 items-center gap-2">
        <DurationBadge days={phase.timeSpentDays} />
        <AmountBadge amount={phase.moneySpent} />
      </div>
      <p className="text-foreground min-w-0 text-end text-[13px] font-medium">
        <bdi>{heading}</bdi>
      </p>
    </li>
  );
}

function DurationBadge({ days }: { days?: number }) {
  const { t } = useTranslation();
  if (typeof days !== 'number') return null;
  return (
    <span className="bg-field-surface text-muted-foreground inline-flex items-center rounded-[13px] px-2.5 py-1 text-xs">
      <bdi>{t('dashboard.contractSigning.phases.days', { count: days })}</bdi>
    </span>
  );
}

function AmountBadge({ amount }: { amount?: number }) {
  const { t } = useTranslation();
  const value = typeof amount === 'number' ? formatBudgetRange(null, null, amount) : null;
  if (!value) return null;
  return (
    <span className="bg-phase-amount-soft text-phase-amount inline-flex items-center gap-1 rounded-[13px] px-2.5 py-1 text-xs font-medium">
      <bdi>{value}</bdi>
      <SaudiRiyalIcon className="h-3 w-auto shrink-0" aria-hidden />
      <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
    </span>
  );
}

function TotalRow({ phases }: { phases: ProjectPhase[] }) {
  const { t } = useTranslation();
  const total = phases.reduce(
    (sum, p) => sum + (typeof p.moneySpent === 'number' ? p.moneySpent : 0),
    0,
  );
  const value = formatBudgetRange(null, null, total);
  return (
    <div className="bg-field-surface flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5">
      <span className="text-phase-amount inline-flex items-center gap-1 text-sm font-semibold">
        <bdi>{value ?? '—'}</bdi>
        <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
        <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
      </span>
      <span className="text-foreground text-sm font-semibold">
        {t('dashboard.customerApproved.review.total')}
      </span>
    </div>
  );
}
