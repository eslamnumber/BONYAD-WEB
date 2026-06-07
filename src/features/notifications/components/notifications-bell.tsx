'use client';

import { useTranslation } from 'react-i18next';

import { DashboardNotificationsIcon } from '@/components/icons';
import { useNotificationsStore } from '@/stores/notifications-store';

import { useUnreadCount } from '../api';

/** Trigger that opens the notifications drawer, with an unread-count badge. */
export function NotificationsBell() {
  const { t } = useTranslation();
  const open = useNotificationsStore((s) => s.open);
  const { data: count = 0 } = useUnreadCount();
  const label = count > 0 ? t('notifications.openWithCount', { count }) : t('notifications.open');

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      className="text-foreground bg-card border-border motion-safe:hover:bg-nav-hover relative inline-flex size-11 items-center justify-center rounded-full border shadow-sm transition-colors"
    >
      <DashboardNotificationsIcon className="size-6" aria-hidden />
      {count > 0 && (
        <span className="bg-notif-unread text-notif-icon-fg absolute -end-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-5 font-semibold">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
