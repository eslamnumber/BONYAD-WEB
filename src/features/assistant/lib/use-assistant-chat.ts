'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { type ChatTurn, useSendAssistantMessage } from '../api/send-assistant-message';
import { type AssistantMessage, useAssistantStore } from '../store/assistant-store';

const HISTORY_LIMIT = 20;

let messageSeq = 0;
const nextId = (): string => `m-${(messageSeq += 1)}`;

function toHistory(messages: AssistantMessage[]): ChatTurn[] {
  return messages.slice(-HISTORY_LIMIT).map((m) => ({ role: m.role, content: m.text }));
}

/**
 * Drives one assistant turn: optimistically appends the user message, posts it with
 * the running conversationId + recent history, then appends the reply and refreshes
 * the quick-reply suggestions. Locale → `lang`; auth role → `userType` (anonymous and
 * customers are `USER`, matching the RN assistant). Reads/writes the store via
 * `getState()` so it never re-subscribes (no spurious re-renders).
 */
export function useAssistantChat() {
  const { i18n } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const { mutateAsync } = useSendAssistantMessage();

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      const start = useAssistantStore.getState();
      if (!text || start.status === 'sending') return;

      const history = toHistory(start.messages);
      start.pushMessage({ id: nextId(), role: 'user', text });
      start.setSuggestions([]);
      start.setStatus('sending');

      try {
        const reply = await mutateAsync({
          message: text,
          conversationId: start.conversationId ?? undefined,
          lang: i18n.language?.startsWith('ar') ? 'ar' : 'en',
          userType: role === 'TECHNICIAN' ? 'TECHNICIAN' : 'USER',
          history,
        });
        const store = useAssistantStore.getState();
        if (reply.conversationId) store.setConversationId(reply.conversationId);
        if (reply.answer)
          store.pushMessage({ id: nextId(), role: 'assistant', text: reply.answer });
        store.setSuggestions(reply.suggestions);
        store.setStatus('idle');
      } catch {
        useAssistantStore.getState().setStatus('error');
      }
    },
    [i18n, role, mutateAsync],
  );

  return { send };
}
