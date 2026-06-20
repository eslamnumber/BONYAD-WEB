'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import type { ProfileIdentity } from '../lib/identity';

import { EditableAvatar } from './editable-avatar';

/**
 * Horizontal identity row — drill-in chevron (inline-start) + name/role +
 * editable avatar (inline-end), matching Figma 1663:1976 "Personal Row". Renders
 * just the row; the enclosing {@link ProfileSection} supplies the card chrome.
 * The chevron links to the my-info / edit-profile sub-screen (so it carries the
 * "my info" navigation the Figma folds into this card). The avatar keeps its
 * camera-badge photo-upload affordance; the name is user data so it `dir="auto"`.
 */
export function ProfileIdentityRow({ identity }: { identity: ProfileIdentity }) {
  const { t } = useTranslation();
  const roleKey = identity.isTechnician
    ? 'profile.myInfo.role.technician'
    : 'profile.myInfo.role.user';

  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Link
        href={ROUTES.DASHBOARD_SETTINGS_PROFILE}
        aria-label={t('profile.identity.edit')}
        className="focus-visible:outline-ring motion-safe:hover:bg-muted/60 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <ChevronLeft className="text-muted-foreground/50 size-4 rtl:-scale-x-100" aria-hidden />
      </Link>

      <div className="min-w-0 flex-1 text-end">
        <p className="text-foreground truncate text-base font-semibold" dir="auto">
          {identity.name ?? t('profile.myInfo.fallbackName')}
        </p>
        <p className="text-muted-foreground mt-0.5 truncate text-sm">{t(roleKey)}</p>
      </div>

      <EditableAvatar
        name={identity.name}
        src={identity.profileImage}
        tone="default"
        className="size-14 shrink-0 text-lg sm:size-16"
      />
    </div>
  );
}
