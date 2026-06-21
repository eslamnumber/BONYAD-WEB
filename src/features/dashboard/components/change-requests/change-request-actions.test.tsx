import { http, HttpResponse } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import type { ChangeRequest } from '../../schemas/change-request';

import { ChangeRequestActions } from './change-request-actions';

const ACTIVE_CR = {
  id: 101,
  status: 'PENDING',
  requestedBy: 'ahmed farahat user',
  userAgreed: false,
  technicianAgreed: false,
} as ChangeRequest;

const noop = () => undefined;

function renderActions(isTechnician: boolean) {
  renderWithProviders(
    <ChangeRequestActions projectId={5} cr={ACTIVE_CR} isTechnician={isTechnician} onDone={noop} />,
  );
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

/**
 * The party who authored the request can't reject or counter their own proposal
 * (the backend returns "You cannot reject your own change request"), so the bar
 * collapses to the accept panel; the reviewing party gets all three actions.
 */
describe('ChangeRequestActions — author gating', () => {
  it('hides reject / counter-offer for the author, leaving only the accept panel', () => {
    useAuthStore.setState({
      user: { id: 1, name: 'ahmed farahat user', role: 'USER' },
      isAuthenticated: true,
    });
    renderActions(false);

    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Counter-offer' })).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'This is your request — approve and sign to confirm it. The other party must also agree.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agree & sign' })).toBeInTheDocument();
  });

  it('shows reject + counter-offer + agree for the reviewing party', () => {
    useAuthStore.setState({
      user: { id: 2, name: 'ahmed farahat tech', role: 'TECHNICIAN' },
      isAuthenticated: true,
    });
    renderActions(true);

    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Counter-offer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agree' })).toBeInTheDocument();
  });
});

describe('ChangeRequestActions — already agreed', () => {
  it('collapses to the agreed note when a repeat agree is rejected by the backend', async () => {
    server.use(
      http.post('*/change-requests/:id/agree', () =>
        HttpResponse.json(
          { error: 'You have already agreed to this change request' },
          { status: 400 },
        ),
      ),
    );
    useAuthStore.setState({
      user: { id: 1, name: 'ahmed farahat user', role: 'USER' },
      isAuthenticated: true,
    });
    renderActions(false); // author → accept panel with "Agree & sign"

    fireEvent.click(screen.getByRole('button', { name: 'Agree & sign' }));

    expect(
      await screen.findByText("You've agreed — waiting for the other party."),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agree & sign' })).not.toBeInTheDocument();
  });
});
