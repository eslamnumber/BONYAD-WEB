import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { useNotificationsStore } from '@/stores/notifications-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { NotificationsDrawer } from './notifications-drawer';

const SAMPLE = [
  {
    id: 1,
    read: false,
    titleEn: 'Your offer was accepted',
    messageEn: 'A new project is available.',
    createdAt: '2026-10-15T13:00:00Z',
  },
  {
    id: 2,
    read: true,
    titleEn: 'Offer closed',
    messageEn: 'The offer was closed.',
    createdAt: '2026-10-10T09:00:00Z',
  },
];

describe('NotificationsDrawer', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    // Wildcard matches the browser proxy path the apiClient uses in jsdom.
    server.use(http.get('*/notifications/my-notifications', () => HttpResponse.json(SAMPLE)));
    useNotificationsStore.setState({ isOpen: true });
  });
  afterEach(() => {
    useNotificationsStore.setState({ isOpen: false });
    document.body.style.overflow = '';
  });

  it('renders an accessible modal dialog with tabs + the MSW-backed list', async () => {
    const { container } = renderWithProviders(<NotificationsDrawer />);
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    await waitFor(() => expect(screen.getByText('Your offer was accepted')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /All/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('locks body scroll while open and restores it on close', async () => {
    const { rerender } = renderWithProviders(<NotificationsDrawer />);
    expect(document.body.style.overflow).toBe('hidden');
    useNotificationsStore.setState({ isOpen: false });
    rerender(<NotificationsDrawer />);
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
  });

  it('closes on Escape and via the close button', () => {
    const { rerender } = renderWithProviders(<NotificationsDrawer />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(useNotificationsStore.getState().isOpen).toBe(false);

    useNotificationsStore.setState({ isOpen: true });
    rerender(<NotificationsDrawer />);
    fireEvent.click(screen.getByRole('button', { name: 'Close notifications' }));
    expect(useNotificationsStore.getState().isOpen).toBe(false);
  });
});
