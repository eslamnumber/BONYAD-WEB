'use client';

import { X } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal } from '@/components/ui';

import { useAcceptBid } from '../../api/accept-bid';
import type { BidWithTechnician } from '../../schemas/bid';
import { MoneyAmount } from '../money-amount';

import { FreelancerInfo } from './freelancer-info';

type Props = {
  projectId: number;
  bid: BidWithTechnician | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Bid-detail / accept-confirm modal (Figma "Accept Bid Modal", node 1485:8696):
 * the technician's price + profile, a divider, the offer message, then "Accept
 * offer". The reject button is intentionally omitted (no backend reject endpoint —
 * accept-only for now). NOTE: unlike the bid card, this modal does not show the
 * execution duration — that field is absent from the Figma modal by design.
 * Accept → POST /bids/:id/accept, then the project moves to the approved phase.
 */
export function AcceptBidModal({ projectId, bid, open, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const [failed, setFailed] = useState(false);
  const accept = useAcceptBid(projectId);

  if (!bid?.id) return null;
  const bidId = bid.id;

  const onAccept = () => {
    setFailed(false);
    accept.mutate(bidId, { onSuccess: onClose, onError: () => setFailed(true) });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-[480px] rounded-2xl">
      <div className="relative flex flex-col gap-6 px-6 py-11">
        <ModalCloseButton onClose={onClose} />
        <h2 id={titleId} className="sr-only">
          {t('dashboard.jobOffer.customer.acceptModal.title')}
        </h2>
        <ModalProviderInfo bid={bid} />
        <hr className="border-border" />
        <ModalProposal comment={bid.comment} />
        <ModalAccept failed={failed} pending={accept.isPending} onAccept={onAccept} />
      </div>
    </Modal>
  );
}

function ModalCloseButton({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={t('dashboard.jobOffer.customer.acceptModal.close')}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute start-6 top-4 rounded-lg p-2 focus-visible:ring-2 focus-visible:outline-none"
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}

function ModalProviderInfo({ bid }: { bid: BidWithTechnician }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {typeof bid.proposedBudget === 'number' ? (
        <span className="text-job-accent text-xl font-semibold">
          <MoneyAmount value={bid.proposedBudget} />
        </span>
      ) : (
        <span />
      )}
      <FreelancerInfo
        name={bid.technicianName}
        reviewCount={bid.reviewCount}
        rating={bid.rating}
        avatarUrl={bid.avatarUrl}
        size="lg"
      />
    </div>
  );
}

function ModalProposal({ comment }: { comment?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-end gap-2">
      <p className="text-foreground text-end text-sm font-medium">
        {t('dashboard.jobOffer.customer.acceptModal.messageLabel')}
      </p>
      <div className="border-border bg-card w-full rounded-lg border p-4">
        <p dir="auto" className="text-foreground/40 w-full text-end text-sm leading-relaxed">
          {comment || '—'}
        </p>
      </div>
    </div>
  );
}

function ModalAccept({
  failed,
  pending,
  onAccept,
}: {
  failed: boolean;
  pending: boolean;
  onAccept: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      {failed ? (
        <p dir="auto" role="alert" className="text-destructive text-center text-sm">
          {t('dashboard.jobOffer.customer.acceptModal.error')}
        </p>
      ) : null}
      <Button
        type="button"
        onClick={onAccept}
        disabled={pending}
        className="bg-brand-dark-navy text-on-media h-12 w-full rounded-lg text-base font-semibold motion-safe:hover:opacity-90"
      >
        {t('dashboard.jobOffer.customer.acceptModal.accept')}
      </Button>
    </div>
  );
}
