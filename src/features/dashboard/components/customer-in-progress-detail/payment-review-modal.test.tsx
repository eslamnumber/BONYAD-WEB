import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { type ProjectPhase } from '../../schemas/project-phase';

import { PaymentReviewModal } from './payment-review-modal';

const phases: ProjectPhase[] = [
  { id: 1, phaseNumber: 1, title: 'Foundations', remainingAmount: 25000, moneySpent: 25000 },
  { id: 2, phaseNumber: 2, title: 'Finishes', remainingAmount: 50000, moneySpent: 50000 },
];

function setup(selection = { amount: 25000, paymentType: 'FULL' as const }) {
  const onConfirm = vi.fn();
  const onBack = vi.fn();
  renderWithProviders(
    <PaymentReviewModal
      phase={phases[0]!}
      phases={phases}
      selection={selection}
      onBack={onBack}
      onConfirm={onConfirm}
    />,
  );
  return { onConfirm, onBack };
}

describe('PaymentReviewModal', () => {
  it('shows the amount due, details, and the remaining-after breakdown', () => {
    setup();
    expect(screen.getByText('Amount due')).toBeInTheDocument();
    expect(screen.getByText('Operation details')).toBeInTheDocument();
    expect(screen.getByText('Phase 1: Foundations')).toBeInTheDocument();
    // A full payment of phase 1 leaves phase 2 outstanding in the remaining card.
    expect(screen.getByText('Remaining after payment')).toBeInTheDocument();
    expect(screen.getByText('Phase 2 — Finishes')).toBeInTheDocument();
  });

  it('hides the remaining-after card when nothing is left to pay', () => {
    renderWithProviders(
      <PaymentReviewModal
        phase={phases[0]!}
        phases={[phases[0]!]}
        selection={{ amount: 25000, paymentType: 'FULL' }}
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText('Remaining after payment')).not.toBeInTheDocument();
  });

  it('confirms and goes back', () => {
    const { onConfirm, onBack } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm payment' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('has no axe accessibility violations', async () => {
    setup();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
