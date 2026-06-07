import type { ChatMessage } from '../schemas/chat';

/**
 * Sent as the message body when an attachment carries no caption. Mirrors the RN
 * call site (website-bonyad/src/screens/chat/ChatDetailScreen.tsx) so the bubble
 * can recognise it and hide the literal text — see `MessageBubble`.
 */
export const ATTACHMENT_PLACEHOLDER = '[Attachment]';

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp|svg|avif|heic|heif)$/i;

/** True when a message's attachment is an image (by MIME type, else extension). */
export function isImageAttachment(message: ChatMessage): boolean {
  if (message.fileType?.toLowerCase().startsWith('image')) return true;
  const path = message.fileUrl?.split('?')[0] ?? '';
  return IMAGE_EXTENSIONS.test(path);
}
