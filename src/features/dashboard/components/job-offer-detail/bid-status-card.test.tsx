import { beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { type SubmittedOffer } from '../../schemas/submit-offer.schema';

import { BidStatusCard } from './bid-status-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const offer: SubmittedOffer = {
  id: 123,
  values: { proposedBudget: '250000', durationWeeks: '4', comment: 'Plan.' },
  request: { projectId: 42, proposedBudget: 250000, estimatedDurationDays: 30, comment: 'Plan.' },
  status: 'PENDING',
};

describe('BidStatusCard', () => {
  it('renders the submitted value, delivery time and timeline steps', () => {
    renderWithProviders(<BidStatusCard offer={offer} onEdit={vi.fn()} onWithdraw={vi.fn()} />);

    expect(screen.getByText('Your submitted offer')).toBeInTheDocument();
    expect(screen.getByText('250,000')).toBeInTheDocument();
    expect(screen.getByText('4 weeks')).toBeInTheDocument();
    expect(screen.getByText('Under review')).toBeInTheDocument();
    expect(screen.getByText("Awaiting the client's response")).toBeInTheDocument();
  });

  it('invokes onEdit when "Edit offer" is clicked', () => {
    const onEdit = vi.fn();
    renderWithProviders(<BidStatusCard offer={offer} onEdit={onEdit} onWithdraw={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit offer' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('invokes onWithdraw directly when "Withdraw offer" is clicked', () => {
    const onWithdraw = vi.fn();
    renderWithProviders(<BidStatusCard offer={offer} onEdit={vi.fn()} onWithdraw={onWithdraw} />);

    fireEvent.click(screen.getByRole('button', { name: 'Withdraw offer' }));
    expect(onWithdraw).toHaveBeenCalledTimes(1);
  });

  it('locks the actions for an accepted bid', () => {
    renderWithProviders(
      <BidStatusCard
        offer={{ ...offer, status: 'ACCEPTED' }}
        onEdit={vi.fn()}
        onWithdraw={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Edit offer' })).not.toBeInTheDocument();
    expect(screen.getByText(/can no longer be edited or withdrawn/i)).toBeInTheDocument();
  });
});
