'use client';

import { useState } from 'react';

import { ROUTES } from '@/config/routes';

import { bestValueBidId } from '../../api/get-project-bids';
import type { BidWithTechnician } from '../../schemas/bid';

import { AcceptBidModal } from './accept-bid-modal';
import { BidCard } from './bid-card';

type Props = {
  projectId: number;
  bids: BidWithTechnician[];
};

/**
 * The customer's bid-received list (Figma node 1473:7834): a stacked column of
 * {@link BidCard}s, the lowest one flagged as "best value". Tapping a card's
 * "Accept" opens the {@link AcceptBidModal} for that bid. Rendered by
 * {@link CustomerOfferStatus} once at least one bid has arrived.
 */
export function CustomerBidList({ projectId, bids }: Props) {
  const [selected, setSelected] = useState<BidWithTechnician | null>(null);
  const bestId = bestValueBidId(bids);

  return (
    <div className="flex w-full flex-col gap-6">
      {bids.map((bid) => (
        <BidCard
          key={bid.id ?? bid.technicianId}
          bid={bid}
          isBestValue={bid.id !== undefined && bid.id === bestId}
          onReview={() => setSelected(bid)}
          chatHref={
            bid.technicianId !== undefined
              ? ROUTES.DASHBOARD_MESSAGE_FOR(bid.technicianId, {
                  projectId,
                  name: bid.technicianName,
                })
              : undefined
          }
        />
      ))}
      <AcceptBidModal
        projectId={projectId}
        bid={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
