import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { type Notification } from '../schemas/notification';

import { NotificationItem } from './notification-item';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

const UNREAD: Notification = {
  id: 1,
  read: false,
  titleEn: 'Offer accepted',
  titleAr: 'تم قبول عرضك',
  messageEn: 'A new project is available.',
  messageAr: 'مشروع جديد متاح.',
  createdAt: '2026-10-15T13:00:00Z',
};
const READ: Notification = {
  id: 2,
  read: true,
  titleEn: 'Offer closed',
  titleAr: 'تم إغلاق العرض',
};

describe('NotificationItem', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the English title + message and a screen-reader unread indicator', () => {
    renderWithProviders(<NotificationItem notification={UNREAD} locale="en" />);
    expect(screen.getByText('Offer accepted')).toBeInTheDocument();
    expect(screen.getByText('A new project is available.')).toBeInTheDocument();
    expect(screen.getByText('Unread')).toBeInTheDocument();
  });

  it('reads the Arabic fields when locale is ar (inverted dir mapping)', () => {
    renderWithProviders(<NotificationItem notification={UNREAD} locale="ar" />);
    expect(screen.getByText('تم قبول عرضك')).toBeInTheDocument();
    expect(screen.getByText('مشروع جديد متاح.')).toBeInTheDocument();
  });

  it('omits the unread indicator for a read notification', () => {
    renderWithProviders(<NotificationItem notification={READ} locale="en" />);
    expect(screen.getByText('Offer closed')).toBeInTheDocument();
    expect(screen.queryByText('Unread')).not.toBeInTheDocument();
  });

  it('formats the timestamp with the Gregorian month', () => {
    renderWithProviders(<NotificationItem notification={UNREAD} locale="en" />);
    expect(screen.getByText(/October/)).toBeInTheDocument();
  });

  it('renders a link to the project detail when the notification targets a project', () => {
    const projectNotification: Notification = {
      id: 9,
      type: 'BID_RECEIVED',
      relatedProjectId: 42,
      titleEn: 'New bid received',
    };
    renderWithProviders(<NotificationItem notification={projectNotification} locale="en" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard/projects/42');
  });

  it('renders a non-interactive row (no link) when the notification has no destination', () => {
    renderWithProviders(<NotificationItem notification={UNREAD} locale="en" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
