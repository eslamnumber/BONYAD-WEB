'use client';

import { useState } from 'react';

import { type ProjectPhase } from '../../schemas/project-phase';

import { PaymentOptionsModal, type PaymentSelection } from './payment-options-modal';
import { PaymentReviewModal } from './payment-review-modal';
import { usePhaseCheckout } from './use-phase-checkout';

type Props = {
  /** The phase being paid (the timeline's Approve target), or null when closed. */
  phase: ProjectPhase | null;
  /** All project phases — the review step's "remaining after payment" breakdown. */
  phases: ProjectPhase[];
  projectId: number;
  onClose: () => void;
};

/**
 * Per-phase payment flow — opened from the timeline's **Approve** button:
 * choose-payment (full phase / partial) → review & confirm → HyperPay checkout
 * redirect → success. Figma 1547:7351 / 1553:7685 / 1553:8142. The host keys this
 * by phase id so each Approve starts a fresh flow.
 *
 * 5d.1 choose-payment + 5d.2 review & confirm are wired; confirming the review
 * starts the checkout redirect (5d.3) and the /payment/callback success (5d.4).
 */
export function PhasePaymentFlow({ phase, phases, onClose }: Props) {
  const [selection, setSelection] = useState<PaymentSelection | null>(null);
  const checkout = usePhaseCheckout();
  if (!phase) return null;

  if (selection === null) {
    return <PaymentOptionsModal phase={phase} onCancel={onClose} onConfirm={setSelection} />;
  }

  return (
    <PaymentReviewModal
      phase={phase}
      phases={phases}
      selection={selection}
      onBack={() => setSelection(null)}
      onConfirm={() => checkout.start(phase, selection)}
      pending={checkout.isPending}
      error={checkout.isError}
    />
  );
}
