'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useNotifications } from '../api';

import { NotificationTabs, type NotificationFilter } from './notification-tabs';
import { NotificationsList } from './notifications-list';

/**
 * Drawer body: fetches notifications (only mounted while the drawer is open),
 * owns the active-filter state, derives the tab counts, and delegates the
 * pending / error / empty / grouped-list states to {@link NotificationsList}.
 */
export function NotificationsDrawerContent() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const { data: notifications = [], isPending, isError, refetch } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const counts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    read: notifications.filter((n) => n.read).length,
  };

  return (
    <>
      <NotificationTabs filter={filter} counts={counts} onChange={setFilter} />
      <div className="flex-1 overflow-y-auto">
        <NotificationsList
          notifications={notifications}
          filter={filter}
          locale={locale}
          isPending={isPending}
          isError={isError}
          onRetry={() => void refetch()}
        />
      </div>
    </>
  );
}
