'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { useAcceptedBid } from '../../api/get-project-bids';
import { type ProjectDetail } from '../../schemas/project';
import { formatBudgetRange, formatLongDate } from '../job-offer-detail/job-offer-format';

type Props = { project: ProjectDetail };

/**
 * "Offer accepted" card (Figma node 1103:6446) — the left column of the approved
 * screen. Backend-driven from the project's ACCEPTED bid (`useAcceptedBid` →
 * GET /bids/project/:id): shows the accepted offer value, execution period, and
 * acceptance date, then the "Contact the client" action. The bid carries no
 * `acceptedAt`, so the acceptance date falls back to its `createdAt`. Each value
 * degrades to "—" while the bid loads or if none is present. "Contact the client"
 * deep-links to the chat with the project owner (an existing room, or a fresh one
 * created on first message).
 */
export function OfferAcceptedCard({ project }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const { data: bid } = useAcceptedBid(project.id);

  const value = formatBudgetRange(null, null, bid?.proposedBudget);
  const days = bid?.estimatedDurationDays;
  const date = formatLongDate(bid?.createdAt, locale);

  const contactHref = project.userId
    ? ROUTES.DASHBOARD_MESSAGE_FOR(project.userId, {
        name: project.userName,
        projectId: project.id,
      })
    : ROUTES.DASHBOARD_MESSAGES;

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <header className="flex w-full flex-col gap-2">
        <h2 className="text-foreground text-end text-2xl font-medium">
          {t('dashboard.approvedProject.accepted.title')}
        </h2>
        <p className="text-foreground/60 text-start text-sm" dir="auto">
          {t('dashboard.approvedProject.accepted.description')}
        </p>
      </header>

      <div className="bg-field-surface flex w-full flex-col gap-3 rounded-lg p-4 text-sm">
        <InfoRow label={t('dashboard.approvedProject.accepted.valueLabel')}>
          <CurrencyValue amount={value} currencyLabel={t('dashboard.jobOffer.summary.currency')} />
        </InfoRow>
        <InfoRow label={t('dashboard.approvedProject.accepted.durationLabel')}>
          {typeof days === 'number'
            ? t('dashboard.approvedProject.accepted.days', { count: days })
            : '—'}
        </InfoRow>
        <InfoRow label={t('dashboard.approvedProject.accepted.dateLabel')}>{date ?? '—'}</InfoRow>
      </div>

      <Link
        href={contactHref}
        className="border-brand-dark-navy text-brand-dark-navy focus-visible:outline-ring motion-safe:hover:bg-field-surface flex w-full items-center justify-center rounded-lg border p-3 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.approvedProject.accepted.contactClient')}
      </Link>
    </section>
  );
}

/** A money figure with the Saudi Riyal glyph (the SAR/ريال word is sr-only). */
function CurrencyValue({
  amount,
  currencyLabel,
}: {
  amount: string | null;
  currencyLabel: string;
}) {
  if (!amount) return <>—</>;
  return (
    <span className="inline-flex items-center gap-1">
      {amount}
      <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
      <span className="sr-only">{currencyLabel}</span>
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-foreground font-medium">
        <bdi>{children}</bdi>
      </span>
      <span className="text-foreground/60">{label}</span>
    </div>
  );
}
