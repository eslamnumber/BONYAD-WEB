'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

import { daysToWeeks, type SubmittedOffer } from '../../schemas/submit-offer.schema';
import { ProjectStatusBadge } from '../project-status-badge';

import { BidStatusActions } from './bid-status-actions';
import { formatBudgetRange } from './job-offer-format';

/** The three timeline rows (Figma 1103:6260): done → current → upcoming. */
const STEPS = [
  { key: 'sent', dot: 'bg-success', text: 'text-foreground' },
  { key: 'review', dot: 'bg-warning ring-4 ring-warning/20', text: 'text-foreground' },
  { key: 'awaiting', dot: 'bg-muted-foreground/30', text: 'text-foreground/40' },
] as const;

type Props = {
  offer: SubmittedOffer;
  onEdit: () => void;
  onWithdraw: () => void;
};

/**
 * Bid-status card shown in the offer column once the SP has submitted (Figma
 * "Dashboard-SP (Project detail) - Offer sent", node 1103:6247). Replaces the
 * submit-offer form. "Edit offer" re-opens the pre-filled form via {@link onEdit};
 * "Withdraw offer" deletes the bid via {@link onWithdraw} (both PENDING-only).
 */
export function BidStatusCard({ offer, onEdit, onWithdraw }: Props) {
  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6">
      <StatusHeader />
      <SubmittedValues offer={offer} />
      <Timeline />
      <StatusNote />
      <BidStatusActions status={offer.status} onEdit={onEdit} onWithdraw={onWithdraw} />
    </section>
  );
}

function StatusHeader() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center justify-between gap-3">
        <ProjectStatusBadge status="offerSent" />
        <h2 className="text-foreground text-end text-lg font-semibold">
          {t('dashboard.jobOffer.status.title')}
        </h2>
      </div>
      <div className="bg-border h-px w-full" />
    </div>
  );
}

function SubmittedValues({ offer }: { offer: SubmittedOffer }) {
  const { t } = useTranslation();
  const value = formatBudgetRange(null, null, offer.request.proposedBudget);
  return (
    <div className="bg-field-surface flex w-full flex-col gap-3 rounded-lg p-4 text-sm">
      <ValueRow
        label={t('dashboard.jobOffer.status.valueLabel')}
        value={
          <span className="inline-flex items-center gap-1">
            {value}
            <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
            <span className="sr-only">{t('dashboard.jobOffer.status.valueCurrency')}</span>
          </span>
        }
      />
      <ValueRow
        label={t('dashboard.jobOffer.status.durationLabel')}
        value={t('dashboard.jobOffer.status.durationWeeks', {
          count: daysToWeeks(offer.request.estimatedDurationDays),
        })}
      />
    </div>
  );
}

function ValueRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="text-foreground font-medium">
        <bdi>{value}</bdi>
      </span>
      <span className="text-foreground/60">{label}</span>
    </div>
  );
}

function Timeline() {
  const { t } = useTranslation();
  return (
    <ol className="flex w-full flex-col py-2">
      {STEPS.map((step, i) => (
        <li key={step.key} className="flex w-full flex-col items-end">
          <div className="flex w-full items-center justify-end gap-3">
            <span className={`text-end text-sm font-medium ${step.text}`}>
              {t(`dashboard.jobOffer.status.timeline.${step.key}`)}
            </span>
            <span className="flex w-6 shrink-0 justify-center">
              <span className={`size-2.5 rounded-full ${step.dot}`} />
            </span>
          </div>
          {i < STEPS.length - 1 ? (
            <span className="flex w-6 justify-center">
              <span className="bg-border h-6 w-0.5" />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function StatusNote() {
  const { t } = useTranslation();
  return (
    <div className="bg-info/10 flex w-full items-start justify-end rounded-lg p-3">
      <p dir="auto" className="text-info flex-1 text-start text-[13px] leading-[1.4]">
        {t('dashboard.jobOffer.status.note')}
      </p>
    </div>
  );
}
