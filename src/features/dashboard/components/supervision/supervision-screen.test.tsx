import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { SupervisionScreen } from './supervision-screen';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('SupervisionScreen', () => {
  it('renders pending invitations with accept / decline by default', async () => {
    renderWithProviders(<SupervisionScreen />);

    // Invitation card from the default supervision MSW handler (?status=invited).
    expect(await screen.findByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    expect(screen.getByText('Multi-party Project Management')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View details' })).toBeInTheDocument();
  });

  it('switches to the Active tab and surfaces the manage action', async () => {
    renderWithProviders(<SupervisionScreen />);
    await screen.findByRole('button', { name: 'Accept' });

    fireEvent.click(screen.getByRole('tab', { name: 'Active' }));

    expect(await screen.findByRole('link', { name: 'Manage project' })).toBeInTheDocument();
  });

  it('renders the empty state when there are no invitations', async () => {
    server.use(http.get('*/projects/supervising', () => HttpResponse.json([])));
    renderWithProviders(<SupervisionScreen />);

    expect(await screen.findByText('No invitations right now')).toBeInTheDocument();
  });
});
