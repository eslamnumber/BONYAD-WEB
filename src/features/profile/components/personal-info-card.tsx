'use client';

import { Camera, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { Toast } from '@/components/feedback/toast';
import { ChevronLeftIcon } from '@/components/icons';

import type { ProfileIdentity } from '../lib/identity';

import { useAvatarUpload } from './use-avatar-upload';

const K = 'profile.identity.photo';

/**
 * "Edit photo" inline link (Figma 1682:8416) — the change-photo affordance as a
 * small accent text link rather than a camera badge. Triggers the hidden picker,
 * swaps to a spinner while uploading, pops a top-of-screen {@link Toast} on success
 * and shows a localised validation/network error inline (see {@link useAvatarUpload}).
 */
function PhotoEditLink() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { onPick, isPending, error, updated, dismissUpdated } = useAvatarUpload();

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-busy={isPending}
        className="text-job-accent focus-visible:outline-ring inline-flex items-center gap-1 rounded text-xs font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 motion-safe:hover:opacity-80"
      >
        <span>{t(`${K}.editLink`)}</span>
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Camera className="size-3.5" aria-hidden />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={onPick}
      />
      {error ? (
        <p dir="auto" role="alert" className="text-destructive text-xs font-medium">
          {error}
        </p>
      ) : null}
      <Toast open={updated} message={t(`${K}.updated`)} onClose={dismissUpdated} />
    </>
  );
}

type Props = {
  identity: ProfileIdentity;
  /** Opens the inline "Edit profile" form in the Manage card below. */
  onEditProfile: () => void;
};

/**
 * Personal-info identity card (Figma 1674:7952) — a compact row: a drill-in chevron
 * at the inline-start that opens the Edit-profile form below, the name · role ·
 * change-photo link stacked toward the inline-end, and the avatar at the inline-end.
 * Authored RTL-first; mirrors automatically under the inverted locale mapping.
 */
export function PersonalInfoCard({ identity, onEditProfile }: Props) {
  const { t } = useTranslation();
  const roleLabel = identity.isTechnician
    ? t('profile.myInfo.role.technician')
    : t('profile.myInfo.role.user');

  return (
    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onEditProfile}
          aria-label={t('profile.myInfo.nav.edit.title')}
          className="focus-visible:outline-ring motion-safe:hover:bg-muted/60 -ms-1 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronLeftIcon
            className="text-muted-foreground/50 size-5 rtl:-scale-x-100"
            aria-hidden
          />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-end">
          <p className="text-foreground max-w-full truncate text-xl font-semibold" dir="auto">
            {identity.name ?? t('profile.myInfo.fallbackName')}
          </p>
          <p className="text-muted-foreground max-w-full truncate text-sm">{roleLabel}</p>
          <PhotoEditLink />
        </div>

        <Avatar
          name={identity.name}
          src={identity.profileImage}
          className="ring-border size-16 shrink-0 text-xl shadow-sm ring-1"
        />
      </div>
    </div>
  );
}
