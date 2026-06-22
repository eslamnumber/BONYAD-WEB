'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AssignmentBiddingIcon } from '@/components/icons';

import { useProjectBids } from '../../api';
import type { BidWithTechnician } from '../../schemas/bid';

import { SupervisionBidCard } from './supervision-bid-card';

/** The bids the supervisor manages — list of bid cards with accept/reject per pending bid. */
export function SupervisionBidsSection({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { bids, isPending, isError } = useProjectBids(projectId);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground text-end text-lg font-semibold tracking-tight">
        {t('dashboard.supervision.bids.title')}
      </h2>
      <BidsBody projectId={projectId} bids={bids} isPending={isPending} isError={isError} />
    </section>
  );
}

type BodyProps = {
  projectId: number;
  bids: BidWithTechnician[];
  isPending: boolean;
  isError: boolean;
};

function BidsBody({ projectId, bids, isPending, isError }: BodyProps): ReactNode {
  const { t } = useTranslation();

  if (isPending) return <LoadingState label={t('common.loading')} />;
  if (isError) {
    return (
      <ErrorState
        title={t('dashboard.supervision.bids.error.title')}
        description={t('dashboard.supervision.bids.error.body')}
      />
    );
  }
  if (bids.length === 0) {
    return (
      <EmptyState
        icon={<AssignmentBiddingIcon className="text-muted-foreground size-8" aria-hidden />}
        title={t('dashboard.supervision.bids.empty.title')}
        description={t('dashboard.supervision.bids.empty.body')}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {bids.map((bid, i) => (
        <SupervisionBidCard key={bid.id ?? i} bid={bid} projectId={projectId} />
      ))}
    </div>
  );
}
