'use client';

import { useTranslation } from 'react-i18next';

import { NotificationBellIcon } from '@/components/icons';
import { type Locale } from '@/types/locale';

import { type Notification } from '../schemas/notification';
import { formatNotificationTime, notificationMessage, notificationTitle } from '../utils';

type NotificationItemProps = { notification: Notification; locale: Locale };

/**
 * One notification row (Figma 1046:7850): unread dot at the start, then the
 * text block (title / 2-line message / time) and a 48px bell-circle at the end.
 * The design's one un-iconned mock row is treated as a placeholder — every type
 * renders the bell-circle (see Phase 3 notes).
 */
export function NotificationItem({ notification, locale }: NotificationItemProps) {
  const { t } = useTranslation();
  const unread = !notification.read;

  return (
    <article className="border-border flex w-full items-center justify-between border-b px-6 py-4">
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
    </article>
  );
}
