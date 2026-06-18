'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { conventionalDir } from '../lib/support-format';
import { type SupportRequest } from '../schemas/support';

import { ConversationThread } from './conversation-thread';
import { SupportModalHeader } from './support-modal-header';

type Props = { request: SupportRequest | null; locale: Locale; onClose: () => void };

const SENDABLE = ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE', 'ACCEPTED'];

/** Live support conversation with the assigned admin (opened from an active request). */
export function ConversationModal({ request, locale, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const roomId = request?.chatRoomRoomId ?? null;
  const canSend = SENDABLE.includes((request?.status ?? '').toUpperCase());

  return (
    <Modal
      open={roomId !== null}
      onClose={onClose}
      labelledBy={titleId}
      className="max-w-2xl"
      dir={conventionalDir(locale)}
    >
      <SupportModalHeader
        titleId={titleId}
        title={t('support.conversation.title')}
        closeLabel={t('support.conversation.close')}
        onClose={onClose}
      />
      {roomId ? (
        <ConversationThread
          roomId={roomId}
          receiverId={request?.assignedAdminId ?? null}
          locale={locale}
          canSend={canSend}
        />
      ) : null}
    </Modal>
  );
}
