'use client';

import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUploadProfileImage } from '../api/upload-profile-image';

/** Reject anything over 5 MB before it hits the network (mirrors the iOS compress cap). */
const MAX_BYTES = 5 * 1024 * 1024;
const K = 'profile.identity.photo';

/** Validate the picked file locally; returns the error i18n sub-key, or null when OK. */
function rejectionKey(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'errorType';
  if (file.size > MAX_BYTES) return 'errorSize';
  return null;
}

/**
 * Drives the change-photo control: local type/size validation, the multipart
 * upload, and the success/error surfaces. On success the profile query is
 * invalidated (inside the mutation) and `updated` flips so the host can pop a
 * top-of-screen toast; on failure the localised `error` sits inline under the avatar.
 */
export function useAvatarUpload() {
  const { t } = useTranslation();
  const upload = useUploadProfileImage();
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = ''; // let the user re-pick the same file after an error
    if (!picked) return;
    const rejected = rejectionKey(picked);
    setError(rejected ? t(`${K}.${rejected}`) : null);
    if (rejected) return;
    upload.mutate(picked, {
      onSuccess: () => setUpdated(true),
      onError: () => setError(t(`${K}.errorGeneric`)),
    });
  };

  return {
    onPick,
    isPending: upload.isPending,
    error,
    updated,
    dismissUpdated: () => setUpdated(false),
  };
}
