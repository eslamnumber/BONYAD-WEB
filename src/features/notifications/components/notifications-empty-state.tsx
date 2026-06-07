'use client';

import { useTranslation } from 'react-i18next';

export function NotificationsEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="text-foreground text-base font-medium" dir="auto">
        {t('notifications.empty.title')}
      </p>
      <p className="text-notif-muted text-sm" dir="auto">
        {t('notifications.empty.description')}
      </p>
    </div>
  );
}
