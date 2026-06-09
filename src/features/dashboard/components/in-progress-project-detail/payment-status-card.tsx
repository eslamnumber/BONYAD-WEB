'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { paymentState, type PaymentState } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

import { DetailCard } from './detail-card';
import { MoneyAmount } from './money-amount';

type Props = { phases: ProjectPhase[]; pending?: boolean };

/** Soft pill (fg + 10% bg) per payment state — Figma node 1103:6649. */
const PILL_CLASS: Record<PaymentState, string> = {
  paid: 'bg-paid-soft text-paid',
  awaiting: 'bg-awaiting-soft text-awaiting',
  upcoming: 'bg-upcoming-soft text-upcoming',
};

/** Status dot colour per payment state (Figma Ellipse 1103:6660). */
const DOT_CLASS: Record<PaymentState, string> = {
  paid: 'bg-paid',
  awaiting: 'bg-awaiting',
  upcoming: 'bg-upcoming',
};

/**
 * Payment status card (Figma node 1103:6649): one row per phase — a state pill
 * (paid / awaiting / upcoming), the phase amount (SAR), and the phase-payment
 * label with a matching status dot. Backend-driven from `PHASES.LIST`; the state
 * is mapped from `phase.paymentStatus` via {@link paymentState}.
 */
export function PaymentStatusCard({ phases, pending }: Props) {
  const { t } = useTranslation();
  return (
    <DetailCard heading={t('dashboard.projectDetail.payments.heading')}>
      <PaymentBody phases={phases} pending={pending} />
    </DetailCard>
  );
}

function PaymentBody({ phases, pending }: Props) {
  const { t } = useTranslation();
  if (pending) return <Note>{t('dashboard.projectDetail.loading')}</Note>;
  if (phases.length === 0) return <Note>{t('dashboard.projectDetail.payments.empty')}</Note>;
  return (
    <>
      {phases.map((phase) => (
        <PaymentRow key={phase.id} phase={phase} />
      ))}
    </>
  );
}

function PaymentRow({ phase }: { phase: ProjectPhase }) {
  const { t } = useTranslation();
  const state = paymentState(phase.paymentStatus);

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${PILL_CLASS[state]}`}
      >
        {t(`dashboard.projectDetail.payments.state.${state}`)}
      </span>
      <span className="text-foreground text-sm font-medium">
        {typeof phase.moneySpent === 'number' ? <MoneyAmount value={phase.moneySpent} /> : '—'}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-foreground text-sm whitespace-nowrap">
          <bdi>
            {t('dashboard.projectDetail.payments.phasePayment', {
              number: phase.phaseNumber ?? '?',
            })}
          </bdi>
        </span>
        <span className={`size-2 shrink-0 rounded-full ${DOT_CLASS[state]}`} aria-hidden />
      </div>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-end text-sm">{children}</p>;
}
