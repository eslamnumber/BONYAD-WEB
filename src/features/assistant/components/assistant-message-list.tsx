'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAssistantStore } from '../store/assistant-store';

import { AssistantBubble } from './assistant-bubble';
import { AssistantSuggestions } from './assistant-suggestions';
import { AssistantTyping } from './assistant-typing';

/**
 * The conversation transcript: user/assistant bubbles, a typing indicator while a
 * reply is in flight, an error notice, and the latest quick-reply suggestions after an
 * idle reply. Auto-scrolls to the newest content. The empty state is rendered elsewhere.
 */
export function AssistantMessageList({ onPick }: { onPick: (value: string) => void }) {
  const { t } = useTranslation();
  const messages = useAssistantStore((s) => s.messages);
  const status = useAssistantStore((s) => s.status);
  const suggestions = useAssistantStore((s) => s.suggestions);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, status]);

  return (
    <div className="flex flex-col gap-4">
      {messages.map((m, i) => (
        <AssistantBubble
          key={m.id}
          id={m.id}
          role={m.role}
          text={m.text}
          animate={m.role === 'assistant' && i === messages.length - 1}
        />
      ))}
      {status === 'sending' ? <AssistantTyping label={t('assistant.typing')} /> : null}
      {status === 'error' ? (
        <p role="alert" dir="auto" className="text-destructive text-sm">
          {t('assistant.error')}
        </p>
      ) : null}
      {status === 'idle' && suggestions.length > 0 ? (
        <AssistantSuggestions items={suggestions} onPick={onPick} />
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
