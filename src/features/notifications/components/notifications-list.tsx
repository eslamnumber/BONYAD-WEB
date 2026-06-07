'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { type Notification } from '../schemas/notification';

import { NotificationItem } from './notification-item';
import { type NotificationFilter } from './notification-tabs';
import { NotificationsEmptyState } from './notifications-empty-state';

type NotificationsListProps = {
  notifications: Notification[];
  filter: NotificationFilter;
  locale: Locale;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
};

/** Centered "New" divider — a hairline with a chip, between the unread and read groups (All view). */
function NewSeparator() {
  const { t } = useTranslation();
  return (
    <div
      role="separator"
      aria-label={t('notifications.new')}
      className="relative flex items-center justify-center py-3"
    >
      <span aria-hidden className="bg-notif-muted absolute inset-x-0 h-px" />
      <span className="bg-card text-notif-muted relative px-2 text-xs font-semibold">
        {t('notifications.new')}
      </span>
    </div>
  );
}

function PendingState() {
  const { t } = useTranslation();
  return (
    <p role="status" dir="auto" className="text-notif-muted px-6 py-10 text-center text-sm">
      {t('notifications.loading')}
    </p>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p dir="auto" className="text-foreground/80 text-sm">
        {t('notifications.error')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-notif-icon-bg text-sm font-medium underline"
      >
        {t('common.tryAgain')}
      </button>
    </div>
  );
}

export function NotificationsList({
  notifications,
  filter,
  locale,
  isPending,
  isError,
  onRetry,
}: NotificationsListProps) {
  if (isPending) return <PendingState />;
  if (isError) return <ErrorState onRetry={onRetry} />;

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);
  const groups: Record<NotificationFilter, Notification[]> = { all: notifications, unread, read };
  if (groups[filter].length === 0) return <NotificationsEmptyState />;

  if (filter !== 'all') {
    return (
      <div>
        {groups[filter].map((n) => (
          <NotificationItem key={n.id} notification={n} locale={locale} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {unread.map((n) => (
        <NotificationItem key={n.id} notification={n} locale={locale} />
      ))}
      {unread.length > 0 && read.length > 0 && <NewSeparator />}
      {read.map((n) => (
        <NotificationItem key={n.id} notification={n} locale={locale} />
      ))}
    </div>
  );
}
