import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { CardManagementScreen } from './card-management-screen';

const CARD = {
  id: 1,
  paymentBrand: 'VISA',
  cardBin: '424242',
  lastFourDigits: '4242',
  cardHolder: 'Sara Ahmed',
  expiryMonth: '08',
  expiryYear: '27',
  isDefault: true,
  isValidated: true,
  createdAt: '2026-05-01T10:00:00Z',
};

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

function setUser(role: string) {
  useAuthStore.setState({ user: { id: 1, role, name: 'Sara' }, isAuthenticated: true });
}

describe('CardManagementScreen', () => {
  it('renders the technician payout blurb and the saved card from the API', async () => {
    setUser('TECHNICIAN');
    renderWithProviders(<CardManagementScreen />);

    expect(screen.getByRole('heading', { name: 'Payment cards' })).toBeInTheDocument();
    expect(screen.getByText('Add a card to receive payments from clients.')).toBeInTheDocument();
    expect(await screen.findByText('•••• 4242')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('shows the customer payment blurb for a USER', () => {
    setUser('USER');
    renderWithProviders(<CardManagementScreen />);
    expect(screen.getByText('Add a card to pay for services and projects.')).toBeInTheDocument();
  });

  it('renders the role-aware empty state when no cards are saved', async () => {
    server.use(http.get('*/user/cards', () => HttpResponse.json({ success: true, cards: [] })));
    setUser('TECHNICIAN');
    renderWithProviders(<CardManagementScreen />);

    expect(await screen.findByText('No cards registered')).toBeInTheDocument();
    expect(screen.getByText('Add a card to receive payouts.')).toBeInTheDocument();
  });

  it('opens the delete-confirmation modal and confirms a delete', async () => {
    server.use(
      http.get('*/user/cards', () =>
        HttpResponse.json({ success: true, cards: [{ ...CARD, isDefault: false }] }),
      ),
    );
    setUser('TECHNICIAN');
    renderWithProviders(<CardManagementScreen />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete card' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete card' }));
    expect(await screen.findByText('Card deleted.')).toBeInTheDocument();
  });

  it('surfaces a localized error when loading the cards fails', async () => {
    server.use(http.get('*/user/cards', () => HttpResponse.json({}, { status: 500 })));
    setUser('TECHNICIAN');
    renderWithProviders(<CardManagementScreen />);

    expect(await screen.findByText("Couldn't load your cards")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('shows the set-as-default action only on non-default cards', async () => {
    server.use(
      http.get('*/user/cards', () =>
        HttpResponse.json({ success: true, cards: [{ ...CARD, isDefault: false }] }),
      ),
    );
    setUser('TECHNICIAN');
    renderWithProviders(<CardManagementScreen />);

    expect(await screen.findByRole('button', { name: /Set as default/ })).toBeInTheDocument();
  });
});

// The add-card flow navigates away (window.location.assign); asserted here without a
// real redirect so jsdom doesn't throw on navigation.
describe('CardManagementScreen add-card', () => {
  beforeAll(() => {
    vi.spyOn(window.location, 'assign').mockReturnValue(undefined);
  });

  it('prepares a checkout and redirects to the hosted page', async () => {
    server.use(
      http.get('*/user/cards', () => HttpResponse.json({ success: true, cards: [] })),
      http.post('*/user/cards/prepare', () =>
        HttpResponse.json({
          success: true,
          checkoutId: 'CARD_CHK_9',
          redirectUrl: 'https://pay/9',
        }),
      ),
    );
    setUser('TECHNICIAN');
    renderWithProviders(<CardManagementScreen />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add payment card' }));
    await waitFor(() => expect(window.location.assign).toHaveBeenCalledWith('https://pay/9'));
  });
});
