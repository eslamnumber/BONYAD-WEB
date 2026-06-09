'use client';

import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

import { paymentState } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';
import { DetailCard } from '../in-progress-project-detail/detail-card';

const formatAmount = (n: number) => new Intl.NumberFormat('en-US').format(n);

/**
 * Payment status card (Figma 1103:6779): one row per phase — a "paid" pill, the
 * phase amount (SAR), and the phase label with a status dot. Backend-driven from
 * `PHASES.LIST`; paid state derives from `paymentState` (PAID/COMPLETED → paid). A
 * completed project's phases are all paid, but a non-paid phase degrades to a muted
 * "pending" pill/dot (the Figma only defines the paid state). Reuses the shared
 * DetailCard chrome.
 */
export function PaymentStatusCard({
  phases,
  pending,
}: {
  phases: ProjectPhase[];
  pending?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <DetailCard heading={t('dashboard.completedProject.payments.heading')}>
      {pending ? (
        <p className="text-foreground/60 text-end text-sm">
          {t('dashboard.jobOffer.phases.loading')}
        </p>
      ) : (
        phases.map((phase, i) => <PaymentRow key={phase.id} phase={phase} index={i} />)
      )}
    </DetailCard>
  );
}

function PaymentRow({ phase, index }: { phase: ProjectPhase; index: number }) {
  const { t } = useTranslation();
  const paid = paymentState(phase.paymentStatus) === 'paid';
  const number = phase.phaseNumber ?? index + 1;

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span
        className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
          paid ? 'bg-paid-soft text-paid' : 'bg-muted text-muted-foreground'
        }`}
      >
        {paid
          ? t('dashboard.completedProject.payments.paid')
          : t('dashboard.completedProject.payments.pending')}
      </span>
      <span className="text-foreground inline-flex shrink-0 items-center gap-1 text-sm font-medium">
        {formatAmount(phase.moneySpent ?? 0)}
        <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
        <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-foreground truncate text-sm">
          <bdi>{t('dashboard.completedProject.payments.phasePayment', { number })}</bdi>
        </span>
        <span
          className={`size-2 shrink-0 rounded-full ${paid ? 'bg-paid' : 'bg-muted-foreground'}`}
          aria-hidden
        />
      </span>
    </div>
  );
}
