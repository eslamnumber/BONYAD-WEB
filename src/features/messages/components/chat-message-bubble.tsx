'use client';

import { useTranslation } from 'react-i18next';

import { FileIcon } from '@/components/icons';
import { buildAssetUrl } from '@/lib/backend';
import { type Locale } from '@/types/locale';

import { ATTACHMENT_PLACEHOLDER, isImageAttachment } from '../lib/attachment';
import { formatMessageTime } from '../lib/format-chat-time';
import type { ChatMessage } from '../schemas/chat';

type Props = {
  message: ChatMessage;
  isMine: boolean;
  locale: Locale;
};

/**
 * Renders a message's attachment: an image inline, or any other file as an
 * open-in-new-tab link. `cornerClass` keeps the sharp corner consistent with the
 * text bubble. Returns null when the message carries no file.
 */
function AttachmentBlock({ message, cornerClass }: { message: ChatMessage; cornerClass: string }) {
  const { t } = useTranslation();
  const url = buildAssetUrl(message.fileUrl);
  if (!url) return null;

  if (isImageAttachment(message)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`block overflow-hidden rounded-2xl ${cornerClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={message.fileName ?? t('messages.imageAttachment')}
          className="max-h-72 w-full max-w-[280px] object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`bg-chat-bubble-received text-foreground flex max-w-[280px] items-center gap-2 rounded-2xl px-4 py-3 text-sm ${cornerClass}`}
    >
      <FileIcon className="size-5 shrink-0" aria-hidden />
      <span dir="auto" className="truncate">
        {message.fileName ?? t('messages.openAttachment')}
      </span>
    </a>
  );
}

/**
 * One message bubble (Figma 1046:7392 received / 1046:7397 sent). Sent messages
 * are the brand-accent bubble aligned to the inline-start with a sharp bottom-end
 * corner; received are the light bubble aligned to the inline-end with a sharp
 * bottom-start corner. Image / file attachments render above the text (the text
 * is hidden when it is only the `[Attachment]` placeholder).
 */
export function ChatMessageBubble({ message, isMine, locale }: Props) {
  const time = formatMessageTime(message.createdAt, locale);
  const cornerClass = isMine ? 'rounded-ee-[4px]' : 'rounded-es-[4px]';
  const showText =
    Boolean(message.content && message.content.trim().length > 0) &&
    message.content !== ATTACHMENT_PLACEHOLDER;

  return (
    <div className={`flex w-full ${isMine ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[80%] flex-col gap-1 ${isMine ? 'items-start' : 'items-end'}`}>
        {message.fileUrl && <AttachmentBlock message={message} cornerClass={cornerClass} />}
        {showText && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              isMine
                ? 'bg-job-accent text-on-media rounded-ee-[4px]'
                : 'bg-chat-bubble-received text-foreground rounded-es-[4px]'
            }`}
          >
            <p dir="auto" className="break-words whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}
        <span className="text-chat-muted text-[11px]">{time}</span>
      </div>
    </div>
  );
}
