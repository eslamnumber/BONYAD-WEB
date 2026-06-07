'use client';

import { useTranslation } from 'react-i18next';

export type NotificationFilter = 'all' | 'unread' | 'read';

/** Figma order (1046:7842), DOM left→right: Read, Unread, All. "All" is the default. */
const TAB_ORDER: readonly NotificationFilter[] = ['read', 'unread', 'all'];

type NotificationTabsProps = {
  filter: NotificationFilter;
  counts: Record<NotificationFilter, number>;
  onChange: (filter: NotificationFilter) => void;
};

export function NotificationTabs({ filter, counts, onChange }: NotificationTabsProps) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('notifications.title')}
      className="flex shrink-0 items-center justify-end gap-2 px-6 pt-6 pb-4"
    >
      {TAB_ORDER.map((key) => {
        const active = filter === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(key)}
            className={`rounded-full p-2.5 text-xs whitespace-nowrap transition-colors ${
              active
                ? 'bg-notif-tab-active-bg text-primary-foreground font-medium'
                : 'bg-notif-tab-bg text-notif-tab-fg font-normal motion-safe:hover:opacity-90'
            }`}
          >
            {t(`notifications.tabs.${key}`, { count: counts[key] })}
          </button>
        );
      })}
    </div>
  );
}
