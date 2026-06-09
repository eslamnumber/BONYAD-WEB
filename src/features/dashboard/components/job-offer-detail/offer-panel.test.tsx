import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { OfferPanel } from './offer-panel';

const USER_ID = 445;

const MY_BID = {
  id: 123,
  projectId: 42,
  technicianId: USER_ID,
  proposedBudget: 250000,
  estimatedDurationDays: 30,
  comment: 'My plan.',
  status: 'PENDING',
  createdAt: '2026-06-08T00:00:00Z',
};

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  useAuthStore.setState({ user: { id: USER_ID, role: 'TECHNICIAN' }, isAuthenticated: true });
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText('Offer price (SAR)'), { target: { value: '250000' } });
  fireEvent.change(screen.getByLabelText('Implementation duration'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Application message'), { target: { value: 'Plan.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit offer' }));
}

describe('OfferPanel', () => {
  it('shows the bid-status card on load when the SP already has a bid', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([MY_BID])));
    renderWithProviders(<OfferPanel projectId={42} />);

    expect(await screen.findByText('Your submitted offer')).toBeInTheDocument();
    expect(screen.getByText('250,000')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit offer' })).not.toBeInTheDocument();
  });

  it('swaps the form for the bid-status card after a successful submit', async () => {
    server.use(
      http.get('*/bids/project/:projectId', () => HttpResponse.json([])),
      http.post('*/bids/create', () =>
        HttpResponse.json({ id: 7, status: 'PENDING' }, { status: 201 }),
      ),
    );
    renderWithProviders(<OfferPanel projectId={42} />);

    expect(await screen.findByRole('button', { name: 'Submit offer' })).toBeInTheDocument();
    fillAndSubmit();

    expect(await screen.findByText('Your submitted offer')).toBeInTheDocument();
    expect(screen.getByText('250,000')).toBeInTheDocument();
  });

  it('opens the edit modal pre-filled when "Edit offer" is clicked', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([MY_BID])));
    renderWithProviders(<OfferPanel projectId={42} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit offer' }));

    expect(await screen.findByRole('dialog', { name: 'Edit offer' })).toBeInTheDocument();
    const price = await screen.findByLabelText('Offer value');
    expect((price as HTMLInputElement).value).toBe('250000');
  });

  it('withdraws via the confirm modal and returns to the empty form', async () => {
    let bids: unknown[] = [MY_BID];
    server.use(
      http.get('*/bids/project/:projectId', () => HttpResponse.json(bids)),
      http.delete('*/bids/:id', () => {
        bids = [];
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderWithProviders(<OfferPanel projectId={42} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Withdraw offer' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, withdraw offer' }));

    expect(await screen.findByRole('button', { name: 'Submit offer' })).toBeInTheDocument();
  });
});
