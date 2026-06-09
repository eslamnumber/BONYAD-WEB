'use client';

import { useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';

import { useDeleteBid } from '../../api/delete-bid';
import { useMyBid } from '../../api/get-project-bids';
import { bidToSubmittedOffer, type SubmittedOffer } from '../../schemas/submit-offer.schema';

import { BidStatusCard } from './bid-status-card';
import { EditOfferModal } from './edit-offer-modal';
import { SubmitOfferForm } from './submit-offer-form';
import { WithdrawOfferModal } from './withdraw-offer-modal';

/**
 * Offer column of the project-detail screen. Resolves the SP's bid on this
 * project (fetched via {@link useMyBid}, or just-submitted in this session) and
 * shows the bid-status card (Figma "Offer sent", node 1103:6247); otherwise the
 * submit form. "Edit offer" opens the edit modal (saves via delete-then-create);
 * "Withdraw" opens the confirm modal and deletes the bid — both over the card.
 */
export function OfferPanel({ projectId }: { projectId: number }) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: myBid } = useMyBid(projectId, userId);
  const [submitted, setSubmitted] = useState<SubmittedOffer | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const withdraw = useDeleteBid(projectId);

  const offer: SubmittedOffer | null = submitted ?? (myBid ? bidToSubmittedOffer(myBid) : null);

  if (!offer) {
    return <SubmitOfferForm projectId={projectId} onSubmitted={setSubmitted} />;
  }

  const confirmWithdraw = () => {
    if (offer.id === undefined) return;
    withdraw.mutate(offer.id, {
      onSuccess: () => {
        setSubmitted(null);
        setWithdrawOpen(false);
      },
    });
  };

  return (
    <>
      <BidStatusCard
        offer={offer}
        onEdit={() => setEditOpen(true)}
        onWithdraw={() => setWithdrawOpen(true)}
      />
      {editOpen ? (
        <EditOfferModal
          open
          projectId={projectId}
          offer={offer}
          onClose={() => setEditOpen(false)}
          onSaved={(next) => {
            setSubmitted(next);
            setEditOpen(false);
          }}
        />
      ) : null}
      <WithdrawOfferModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={confirmWithdraw}
        isWithdrawing={withdraw.isPending}
      />
    </>
  );
}
