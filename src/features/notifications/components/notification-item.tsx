'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { NotificationBellIcon } from '@/components/icons';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { type Locale } from '@/types/locale';

import { useMarkNotificationRead } from '../api';
import { notificationHref } from '../notification-href';
import { type Notification } from '../schemas/notification';
import { formatNotificationTime, notificationMessage, notificationTitle } from '../utils';

type NotificationItemProps = { notification: Notification; locale: Locale };

const ROW = 'border-border flex w-full items-center justify-between border-b px-6 py-4';
const ROW_INTERACTIVE = `${ROW} transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-safe:hover:bg-nav-hover`;

/** Unread dot + text block (title / 2-line message / time) + the 48px bell-circle (Figma 1046:7850). */
function NotificationRowBody({
  notification,
  locale,
  unread,
}: NotificationItemProps & { unread: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <span
        className={`size-2.5 shrink-0 rounded-full ${unread ? 'bg-notif-unread' : ''}`}
        aria-hidden={!unread}
      >
        {unread && <span className="sr-only">{t('notifications.unreadStatus')}</span>}
      </span>
      <div className="flex items-start gap-4">
        <div className="flex w-[324px] flex-col items-end gap-4">
          <div className="flex w-full flex-col gap-1 text-end">
            <h3 className="text-foreground w-full text-base font-medium">
              {notificationTitle(notification, locale)}
            </h3>
            <p className="text-foreground/80 line-clamp-2 w-full text-sm">
              {notificationMessage(notification, locale)}
            </p>
          </div>
          <time className="text-notif-muted text-xs font-medium">
            {formatNotificationTime(notification.createdAt, locale)}
          </time>
        </div>
        <div className="bg-notif-icon-bg flex size-12 shrink-0 items-center justify-center rounded-full">
          <NotificationBellIcon className="text-notif-icon-fg size-6" aria-hidden />
        </div>
      </div>
    </>
  );
}

/**
 * One notification row. When the notification resolves to an in-app destination
 * ({@link notificationHref}) the whole row is a `next/link` that marks it read,
 * closes the drawer, and navigates there. Rows with no destination (informational
 * types) render as a static, non-interactive row.
 */
export function NotificationItem({ notification, locale }: NotificationItemProps) {
  const role = useAuthStore((s) => s.user?.role);
  const closeDrawer = useNotificationsStore((s) => s.close);
  const markRead = useMarkNotificationRead();
  const unread = !notification.read;
  const href = notificationHref(notification, role);

  const body = <NotificationRowBody notification={notification} locale={locale} unread={unread} />;

  if (!href) {
    return <article className={ROW}>{body}</article>;
  }
  return (
    <Link
      href={href}
      onClick={() => {
        if (unread) markRead.mutate(notification.id);
        closeDrawer();
      }}
      className={ROW_INTERACTIVE}
    >
      {body}
    </Link>
  );
}
