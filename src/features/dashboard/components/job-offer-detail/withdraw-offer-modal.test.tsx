import { beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { WithdrawOfferModal } from './withdraw-offer-modal';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('WithdrawOfferModal', () => {
  it('renders the confirmation prompt', async () => {
    renderWithProviders(
      <WithdrawOfferModal open onClose={vi.fn()} onConfirm={vi.fn()} isWithdrawing={false} />,
    );

    expect(await screen.findByRole('dialog', { name: 'Withdraw offer' })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to withdraw/i)).toBeInTheDocument();
  });

  it('confirms and cancels via the footer buttons', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(
      <WithdrawOfferModal open onClose={onClose} onConfirm={onConfirm} isWithdrawing={false} />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Yes, withdraw offer' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables actions while withdrawing', async () => {
    renderWithProviders(
      <WithdrawOfferModal open onClose={vi.fn()} onConfirm={vi.fn()} isWithdrawing />,
    );

    expect(await screen.findByRole('button', { name: 'Yes, withdraw offer' })).toBeDisabled();
  });

  it('renders nothing when closed', () => {
    renderWithProviders(
      <WithdrawOfferModal
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isWithdrawing={false}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
