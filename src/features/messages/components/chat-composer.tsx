'use client';

import { useState, type ComponentType, type FormEvent, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

import { PaperclipIcon, SendIcon, SmileIcon } from '@/components/icons';

import { useSendMessage } from '../api/send-message';
import { useImageUpload } from '../lib/use-image-upload';
import type { ChatRoom } from '../schemas/chat';

type Props = {
  room: ChatRoom;
};

/**
 * Composer affordance (attachment / emoji). The paperclip is wired to the image
 * picker; the emoji picker is still deferred (see the 5d gate report).
 */
function AffordanceButton({
  Icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  hint: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={hint}
      className="text-sidebar-link flex size-10 items-center justify-center rounded-full disabled:opacity-50"
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

/** Brand-accent submit button. */
function SendButton({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label={t('messages.send')}
      className="bg-job-accent text-on-media flex size-10 shrink-0 items-center justify-center rounded-[20px] disabled:opacity-50"
    >
      <SendIcon className="size-5" aria-hidden />
    </button>
  );
}

/** The filled input field: attachment + emoji affordances and the text input. */
function ComposerField({
  text,
  onTextChange,
  onAttach,
  isUploading,
}: {
  text: string;
  onTextChange: (value: string) => void;
  onAttach: () => void;
  isUploading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-chat-field flex h-12 flex-1 items-center justify-between gap-2 rounded-3xl ps-2 pe-4">
      <div className="flex items-center gap-2">
        <AffordanceButton
          Icon={PaperclipIcon}
          label={t('messages.attachFile')}
          hint={t('messages.attachFile')}
          onClick={onAttach}
          disabled={isUploading}
        />
        <AffordanceButton
          Icon={SmileIcon}
          label={t('messages.emoji')}
          hint={t('common.comingSoon')}
        />
      </div>
      <input
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder={t('messages.inputPlaceholder')}
        aria-label={t('messages.inputPlaceholder')}
        className="text-foreground placeholder:text-chat-muted min-w-0 flex-1 bg-transparent text-end text-sm outline-none"
      />
    </div>
  );
}

/**
 * Message composer (Figma 1046:7412) — send button + a filled input field with
 * attachment + emoji affordances. Text send goes through `useSendMessage`; image
 * attachments go through `useImageUpload` (POST /chat/send-with-file). The emoji
 * picker is still deferred.
 */
export function ChatComposer({ room }: Props) {
  const [text, setText] = useState('');
  const { mutate: send, isPending } = useSendMessage();
  const { inputRef, error, isUploading, openPicker, onFileChange } = useImageUpload(
    room,
    () => text.trim(),
    () => setText(''),
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = text.trim();
    if (content === '' || room.otherUserId === undefined) return;
    send({
      roomId: room.roomId,
      receiverId: room.otherUserId,
      content,
      projectId: room.projectId ?? undefined,
    });
    setText('');
  }

  return (
    <form onSubmit={handleSubmit} className="border-chat-border flex flex-col gap-2 border-t p-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
        aria-hidden
        tabIndex={-1}
      />
      {error && (
        <p role="alert" className="text-destructive text-end text-xs">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <SendButton disabled={isPending || text.trim() === ''} />
        <ComposerField
          text={text}
          onTextChange={setText}
          onAttach={openPicker}
          isUploading={isUploading}
        />
      </div>
    </form>
  );
}
