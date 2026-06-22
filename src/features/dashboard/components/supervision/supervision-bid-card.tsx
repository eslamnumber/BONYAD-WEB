'use client';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { StarIcon } from '@/components/icons';
import { Button } from '@/components/ui';

import { useAcceptBid, useRejectBid } from '../../api';
import { durationWeeks } from '../../lib/project-format';
import type { BidWithTechnician } from '../../schemas/bid';
import { MoneyAmount } from '../money-amount';

const STATUS_TONE: Record<string, string> = {
  ACCEPTED: 'bg-status-approved-soft text-status-approved',
  REJECTED: 'bg-status-rejected-soft text-status-rejected',
};

/**
 * One bid on the supervisor control panel. PENDING bids get Accept / Reject (the
 * supervisor manages the project's bids via BIDS.ACCEPT / BIDS.REJECT); decided bids
 * show a status pill. Technician identity + rating from the enriched bid.
 */
export function SupervisionBidCard({
  bid,
  projectId,
}: {
  bid: BidWithTechnician;
  projectId: number;
}) {
  const status = (bid.status ?? 'PENDING').toUpperCase();

  return (
    <article className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <BidStatus status={status} />
        <BidIdentity bid={bid} />
      </div>
      <BidDetails bid={bid} />
      {bid.comment ? (
        <p className="text-muted-foreground text-end text-sm leading-6">
          <bdi>{bid.comment}</bdi>
        </p>
      ) : null}
      {status === 'PENDING' && typeof bid.id === 'number' ? (
        <BidActions bidId={bid.id} projectId={projectId} />
      ) : null}
    </article>
  );
}

function BidIdentity({ bid }: { bid: BidWithTechnician }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-foreground text-sm font-semibold">
          <bdi>{bid.technicianName || t('dashboard.supervision.bids.unknownTechnician')}</bdi>
        </span>
        {typeof bid.rating === 'number' ? (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <StarIcon className="text-status-progress size-3.5" aria-hidden />
            {bid.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <Avatar name={bid.technicianName} src={bid.avatarUrl} className="size-11" />
    </div>
  );
}

function BidDetails({ bid }: { bid: BidWithTechnician }) {
  const { t } = useTranslation();
  const weeks = durationWeeks(bid.estimatedDurationDays);
  return (
    <dl className="grid grid-cols-2 gap-4">
      <div className="flex flex-col items-end gap-1">
        <dt className="text-muted-foreground text-xs font-medium">
          {t('dashboard.supervision.bids.amount')}
        </dt>
        <dd className="text-foreground text-sm font-semibold">
          {typeof bid.proposedBudget === 'number' ? (
            <MoneyAmount value={bid.proposedBudget} />
          ) : (
            '—'
          )}
        </dd>
      </div>
      <div className="flex flex-col items-end gap-1">
        <dt className="text-muted-foreground text-xs font-medium">
          {t('dashboard.card.durationLabel')}
        </dt>
        <dd className="text-foreground text-sm font-semibold">
          {weeks !== null ? `${weeks} ${t('dashboard.card.weeksUnit')}` : '—'}
        </dd>
      </div>
    </dl>
  );
}

function BidStatus({ status }: { status: string }) {
  const { t } = useTranslation();
  const tone = STATUS_TONE[status];
  if (!tone) return <span />;
  const key = status === 'ACCEPTED' ? 'accepted' : 'rejected';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {t(`dashboard.supervision.bids.${key}`)}
    </span>
  );
}

function BidActions({ bidId, projectId }: { bidId: number; projectId: number }) {
  const { t } = useTranslation();
  const accept = useAcceptBid(projectId);
  const reject = useRejectBid(projectId);
  const busy = accept.isPending || reject.isPending;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button
        variant="outline"
        size="md"
        disabled={busy}
        onClick={() => reject.mutate(bidId)}
        className="w-full sm:w-auto"
      >
        {reject.isPending
          ? t('dashboard.supervision.bids.rejecting')
          : t('dashboard.supervision.bids.reject')}
      </Button>
      <Button
        size="md"
        disabled={busy}
        onClick={() => accept.mutate(bidId)}
        className="w-full sm:w-auto"
      >
        {accept.isPending
          ? t('dashboard.supervision.bids.accepting')
          : t('dashboard.supervision.bids.accept')}
      </Button>
    </div>
  );
}
