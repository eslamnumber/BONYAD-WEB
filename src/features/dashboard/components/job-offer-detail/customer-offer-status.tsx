'use client';

import { useTranslation } from 'react-i18next';

import { AwaitingOffersIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui';

import { useProjectBids } from '../../api/get-project-bids';

import { CustomerBidList } from './customer-bid-list';
import { CustomerProjectActions } from './customer-project-actions';

/**
 * Customer's offer column on a pending project. Replaces the technician's
 * submit-offer panel and branches on whether bids have arrived: with at least one
 * bid it renders the {@link CustomerBidList} (Figma "Dashboard - Bids Recieved",
 * node 1473:7808); with none, the "no offers yet" card (Figma "Waiting for Bids",
 * node 1394:8565) + the owner's Edit/Delete actions. Rendered only for the project
 * owner via the role gate in {@link JobOfferDetail}.
 */
export function CustomerOfferStatus({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { bids, isPending } = useProjectBids(projectId);

  if (isPending) {
    return <Skeleton className="h-[280px] w-full rounded-xl" />;
  }

  if (bids.length > 0) {
    return <CustomerBidList projectId={projectId} bids={bids} />;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="bg-card border-border flex w-full flex-col items-center justify-center gap-6 rounded-xl border px-6 py-[45px] shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
        <span className="text-awaiting size-[45px] shrink-0">
          <AwaitingOffersIcon className="size-full" />
        </span>
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-foreground text-center text-lg font-medium">
            {t('dashboard.jobOffer.customer.noOffers.title')}
          </p>
          <p dir="auto" className="text-foreground/60 max-w-[250px] text-center text-sm">
            {t('dashboard.jobOffer.customer.noOffers.subtitle')}
          </p>
        </div>
      </section>
      <CustomerProjectActions projectId={projectId} />
    </div>
  );
}
