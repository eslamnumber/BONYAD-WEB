'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useSendMessageWithFile } from '../api/send-message-with-file';
import type { ChatRoom } from '../schemas/chat';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Drives the composer's attachment button: opens the native file picker, guards
 * type + size client-side, and sends the chosen image with the current text as
 * its caption. Mirrors the RN flow (pick → send immediately).
 */
export function useImageUpload(room: ChatRoom, getCaption: () => string, onSent: () => void) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useSendMessageWithFile();

  function openPicker() {
    setError(null);
    inputRef.current?.click();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || room.otherUserId === undefined) return;
    if (!file.type.startsWith('image/')) {
      setError(t('messages.attachInvalidType'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t('messages.attachTooLarge'));
      return;
    }
    setError(null);
    mutate(
      {
        roomId: room.roomId,
        receiverId: room.otherUserId,
        file,
        content: getCaption() || undefined,
        projectId: room.projectId ?? undefined,
      },
      { onError: () => setError(t('messages.attachError')), onSuccess: onSent },
    );
  }

  return { inputRef, error, isUploading: isPending, openPicker, onFileChange };
}
