'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { BidWithTechnician } from '../../schemas/bid';
import { MoneyAmount } from '../money-amount';

import { FreelancerInfo } from './freelancer-info';
import { daysSince, durationWeeks } from './job-offer-format';

const BTN = 'inline-flex items-center rounded-lg px-4 py-2.5 text-xs font-semibold';

type Props = {
  bid: BidWithTechnician;
  /** Lowest-budget bid — gets the purple highlight border + "best value" pill. */
  isBestValue: boolean;
  /** Opens the accept-bid modal for this bid. */
  onReview: () => void;
  /** Deep-link to the technician's chat thread, when the technician id is known. */
  chatHref?: string;
};

/**
 * One bid on the customer's bid-received screen (Figma "Bid-Card", node 1473:7855):
 * bid time + technician (name / completed-projects / rating / avatar), the bid's
 * duration + value + message, then Chat + Accept. The lowest bid is highlighted
 * with the purple `--status-bid` border and a "best value" pill. "Accept" opens
 * the confirm modal ({@link onReview}); "Chat" deep-links to messages.
 */
export function BidCard({ bid, isBestValue, onReview, chatHref }: Props) {
  const { t } = useTranslation();
  const border = isBestValue ? 'border-2 border-status-bid' : 'border-border border';

  return (
    <article
      className={`bg-card relative flex w-full flex-col items-end gap-6 rounded-xl p-6 ${border}`}
    >
      {isBestValue ? (
        <span className="bg-status-bid-soft text-status-bid border-status-bid absolute end-4 -top-3 rounded-full border px-4 py-1 text-xs font-medium">
          {t('dashboard.jobOffer.customer.bids.bestValue')}
        </span>
      ) : null}
      <BidCardHeader bid={bid} />
      <BidCardDetails bid={bid} />
      <div className="flex items-start gap-2">
        <ChatButton href={chatHref} label={t('dashboard.jobOffer.customer.bids.chat')} />
        <button
          type="button"
          onClick={onReview}
          className={`bg-brand-dark-navy text-on-media motion-safe:hover:opacity-90 ${BTN}`}
        >
          {t('dashboard.jobOffer.customer.bids.accept')}
        </button>
      </div>
    </article>
  );
}

function BidCardHeader({ bid }: { bid: BidWithTechnician }) {
  const { t } = useTranslation();
  const days = daysSince(bid.createdAt);

  return (
    <div className="flex w-full items-start justify-between gap-4">
      {days !== null ? (
        <p dir="auto" className="text-foreground/60 text-[13px]">
          {t('dashboard.jobOffer.customer.bids.timeAgo', { count: days })}
        </p>
      ) : (
        <span />
      )}
      <FreelancerInfo
        name={bid.technicianName}
        reviewCount={bid.reviewCount}
        rating={bid.rating}
        avatarUrl={bid.avatarUrl}
        size="sm"
      />
    </div>
  );
}

function BidCardDetails({ bid }: { bid: BidWithTechnician }) {
  const { t } = useTranslation();
  const weeks = durationWeeks(bid.estimatedDurationDays);

  return (
    <div className="flex w-full flex-col items-end gap-6 text-end">
      <div className="flex w-full flex-wrap items-center justify-end gap-x-4 gap-y-1 text-base">
        {weeks !== null ? (
          <MetaItem label={t('dashboard.jobOffer.customer.bids.durationLabel')}>
            <span className="text-foreground font-semibold">
              {t('dashboard.jobOffer.customer.bids.weeksValue', { count: weeks })}
            </span>
          </MetaItem>
        ) : null}
        {typeof bid.proposedBudget === 'number' ? (
          <MetaItem label={t('dashboard.jobOffer.customer.bids.valueLabel')}>
            <span className="text-job-accent font-semibold">
              <MoneyAmount value={bid.proposedBudget} />
            </span>
          </MetaItem>
        ) : null}
      </div>
      {bid.comment ? (
        <p
          dir="auto"
          className="text-foreground/70 line-clamp-2 w-full text-[13px] leading-relaxed"
        >
          {bid.comment}
        </p>
      ) : null}
    </div>
  );
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-foreground/60 font-medium">{label}</span>
      {children}
    </span>
  );
}

function ChatButton({ href, label }: { href?: string; label: string }) {
  const cls = `border-brand-dark-navy text-brand-dark-navy motion-safe:hover:bg-nav-hover border ${BTN}`;
  return href ? (
    <Link href={href} prefetch={false} className={cls}>
      {label}
    </Link>
  ) : (
    <button type="button" disabled className={`${cls} opacity-50`}>
      {label}
    </button>
  );
}
