import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { type Notification } from '../schemas/notification';

import { NotificationsList } from './notifications-list';

const UNREAD: Notification = {
  id: 1,
  read: false,
  titleEn: 'New offer',
  createdAt: '2026-10-15T13:00:00Z',
};
const READ: Notification = {
  id: 2,
  read: true,
  titleEn: 'Closed offer',
  createdAt: '2026-10-10T09:00:00Z',
};

const base = { locale: 'en' as const, isPending: false, isError: false, onRetry: vi.fn() };

describe('NotificationsList', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('All view renders both groups with a "New" divider between them', () => {
    renderWithProviders(
      <NotificationsList {...base} notifications={[UNREAD, READ]} filter="all" />,
    );
    expect(screen.getByText('New offer')).toBeInTheDocument();
    expect(screen.getByText('Closed offer')).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'New' })).toBeInTheDocument();
  });

  it('Unread view shows only unread and no divider', () => {
    renderWithProviders(
      <NotificationsList {...base} notifications={[UNREAD, READ]} filter="unread" />,
    );
    expect(screen.getByText('New offer')).toBeInTheDocument();
    expect(screen.queryByText('Closed offer')).not.toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('renders the empty state when the active group is empty', () => {
    renderWithProviders(<NotificationsList {...base} notifications={[READ]} filter="unread" />);
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('renders the loading state while pending', () => {
    renderWithProviders(<NotificationsList {...base} notifications={[]} filter="all" isPending />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading notifications');
  });

  it('renders the error state with a retry control', () => {
    renderWithProviders(<NotificationsList {...base} notifications={[]} filter="all" isError />);
    expect(
      screen.getByText("We couldn't load your notifications. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
