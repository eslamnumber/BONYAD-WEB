'use client';

import { useTranslation } from 'react-i18next';

import { API_ENVIRONMENTS, type ApiEnvironmentKey } from '@/config/api-environments';
import { cn } from '@/lib/utils';

/**
 * Small capsule pill showing the active backend environment. Renders nothing on
 * production (parity with the Android badge, which is hidden on prod).
 */
export function ApiEnvironmentBadge({
  envKey,
  className,
}: {
  envKey: ApiEnvironmentKey;
  className?: string;
}) {
  const { t } = useTranslation();
  if (envKey === 'production') return null;

  const env = API_ENVIRONMENTS[envKey];
  return (
    <span
      className={cn(
        'inline-block rounded-full px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white uppercase',
        className,
      )}
      style={{ backgroundColor: env.badgeColor }}
    >
      {t(env.displayNameKey)}
    </span>
  );
}
