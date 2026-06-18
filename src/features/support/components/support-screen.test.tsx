import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { SupportScreen } from './support-screen';

// The live conversation subscribes to MQTT — stub the transport so tests never open a socket.
vi.mock('@/lib/mqtt-chat', () => ({
  mqttChat: { connect: () => Promise.resolve(false), subscribe: () => () => undefined },
}));

const TICKET = {
  id: 3,
  subject: 'App crashes on login',
  status: 'OPEN',
  priority: 'HIGH',
  createdAt: '2026-06-10T09:00:00Z',
};
const REQUEST = {
  id: 5,
  subject: 'Need an electrician',
  status: 'ASSIGNED',
  chatRoomRoomId: 'room-1',
  assignedAdminId: 9,
  requestedAt: '2026-06-10T09:00:00Z',
};

const tickets = (body: Parameters<typeof HttpResponse.json>[0]) =>
  http.get('*/support/tickets', () => HttpResponse.json(body));

beforeAll(async () => {
  await i18n.changeLanguage('en');
  useAuthStore.setState({ user: { id: 1, role: 'USER', name: 'Sara' }, isAuthenticated: true });
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('SupportScreen — tickets tab', () => {
  it('defaults to the tickets tab, renders the status filter and a ticket', async () => {
    server.use(tickets([TICKET]));
    renderWithProviders(<SupportScreen />);

    expect(screen.getByRole('heading', { name: 'Support center', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tickets' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Closed' })).toBeInTheDocument();
    expect(await screen.findByText('App crashes on login')).toBeInTheDocument();
  });

  it('opens the new-ticket modal from the CTA', async () => {
    server.use(
      tickets([]),
      http.get('*/support/categories/hierarchy', () => HttpResponse.json([])),
    );
    renderWithProviders(<SupportScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'New ticket' }));
    expect(await screen.findByRole('heading', { name: 'New support ticket' })).toBeInTheDocument();
  });

  it('opens the ticket detail with its message thread', async () => {
    server.use(
      tickets([TICKET]),
      http.get('*/support/tickets/:id', () =>
        HttpResponse.json({
          ...TICKET,
          messages: [{ id: 1, content: 'Thanks for reaching out', isAdminMessage: true }],
        }),
      ),
    );
    renderWithProviders(<SupportScreen />);

    fireEvent.click(await screen.findByText('App crashes on login'));
    expect(await screen.findByRole('heading', { name: 'Ticket' })).toBeInTheDocument();
    expect(await screen.findByText('Thanks for reaching out')).toBeInTheDocument();
  });
});

describe('SupportScreen — conversations tab', () => {
  it('switches tab, shows the request filter, and opens the live conversation', async () => {
    server.use(
      tickets([]),
      http.get('*/support/my-requests', () => HttpResponse.json([REQUEST])),
      http.get('*/chat/room/:roomId/messages', () =>
        HttpResponse.json([{ id: 1, senderId: 9, content: 'How can I help?' }]),
      ),
    );
    renderWithProviders(<SupportScreen />);

    fireEvent.click(screen.getByRole('tab', { name: 'Conversations' }));
    expect(await screen.findByText('Need an electrician')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pending' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New request' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Need an electrician'));
    expect(await screen.findByRole('heading', { name: 'Conversation' })).toBeInTheDocument();
    expect(await screen.findByText('How can I help?')).toBeInTheDocument();
  });
});
