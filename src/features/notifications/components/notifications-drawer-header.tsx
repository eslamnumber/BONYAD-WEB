'use client';

import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Drawer header — title (labels the dialog) + close button. Figma node 1046:7822 chrome. */
export function NotificationsDrawerHeader({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  // Figma (ar/ltr composition): title hugs the END (right in ar, 24px inset),
  // close X hugs the START (left in ar). DOM order [close, title] + justify-between
  // places each on the correct logical side; mirrors automatically by locale.
  return (
    <div className="border-notif-divider flex h-[70px] shrink-0 items-center justify-between border-b px-6">
      <button
        type="button"
        onClick={onClose}
        aria-label={t('notifications.close')}
        className="text-muted-foreground motion-safe:hover:text-foreground -ms-1 rounded p-1 transition-colors"
      >
        <X className="size-4" aria-hidden />
      </button>
      <h2
        id="notifications-title"
        dir="auto"
        className="text-foreground text-2xl leading-5 font-medium"
      >
        {t('notifications.title')}
      </h2>
    </div>
  );
}
