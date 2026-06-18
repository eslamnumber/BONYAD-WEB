import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { type ProjectPhase } from '../../schemas/project-phase';

import { PaymentOptionsModal } from './payment-options-modal';

const phase: ProjectPhase = { id: 1, phaseNumber: 1, remainingAmount: 25000, moneySpent: 25000 };

function setup() {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  renderWithProviders(
    <PaymentOptionsModal phase={phase} onCancel={onCancel} onConfirm={onConfirm} />,
  );
  return { onConfirm, onCancel };
}

describe('PaymentOptionsModal', () => {
  it('renders both phase-scoped options (no whole-project option)', () => {
    setup();
    expect(screen.getByText('How would you like to pay?')).toBeInTheDocument();
    expect(screen.getByText('Pay the full phase')).toBeInTheDocument();
    expect(screen.getByText('Pay part of the phase')).toBeInTheDocument();
    // The custom-amount input is hidden until "partial" is chosen.
    expect(screen.queryByLabelText('Amount (SAR)')).not.toBeInTheDocument();
  });

  it('confirms the full phase amount as FULL by default', () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm payment' }));
    expect(onConfirm).toHaveBeenCalledWith({ amount: 25000, paymentType: 'FULL' });
  });

  it('reveals the amount input on partial and confirms a valid partial as PARTIAL', () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByRole('radio', { name: /Pay part of the phase/i }));
    const input = screen.getByLabelText('Amount (SAR)');
    fireEvent.change(input, { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm payment' }));
    expect(onConfirm).toHaveBeenCalledWith({ amount: 5000, paymentType: 'PARTIAL' });
  });

  it('blocks a partial amount that is not less than the balance, with an error', () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByRole('radio', { name: /Pay part of the phase/i }));
    fireEvent.change(screen.getByLabelText('Amount (SAR)'), { target: { value: '25000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm payment' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText(/must be less than/i)).toBeInTheDocument();
  });

  it('cancels without confirming', () => {
    const { onConfirm, onCancel } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('has no axe accessibility violations', async () => {
    setup();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
