'use client';

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';

import { useAssistantChat } from '../lib/use-assistant-chat';
import { usePanelA11y } from '../lib/use-panel-a11y';
import { useAssistantStore } from '../store/assistant-store';

import { AssistantComposer } from './assistant-composer';
import { AssistantEmptyState } from './assistant-empty-state';
import { AssistantMessageList } from './assistant-message-list';

/**
 * The chat panel (Figma 1811:3730) — a full-screen sheet on mobile, a floating
 * inline-end corner card from `sm`. White card, centered title with a close button at
 * the inline start, a scrollable body (empty state or message list) and the composer.
 */
export function AssistantPanel() {
  const { t } = useTranslation();
  const close = useAssistantStore((s) => s.close);
  const hasMessages = useAssistantStore((s) => s.messages.length > 0);
  const panelRef = useRef<HTMLDivElement>(null);
  usePanelA11y(close, panelRef);
  const { send } = useAssistantChat();

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={close}
        className="bg-notif-scrim absolute inset-0 motion-safe:animate-[notif-fade-in_0.2s_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('assistant.title')}
        tabIndex={-1}
        className="bg-card absolute inset-0 flex flex-col overflow-hidden shadow-xl outline-none motion-safe:animate-[notif-fade-in_0.2s_ease-out] sm:inset-auto sm:end-6 sm:bottom-6 sm:h-[min(1024px,calc(100dvh-3rem))] sm:w-[min(672px,calc(100vw-2rem))] sm:rounded-[12px]"
      >
        <header className="border-border/60 relative flex shrink-0 items-center justify-center border-b px-12 py-3.5">
          <button
            type="button"
            onClick={close}
            aria-label={t('assistant.close')}
            className="text-foreground/70 hover:text-foreground focus-visible:outline-ring absolute start-3 inline-flex size-9 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <CloseIcon className="size-4" aria-hidden />
          </button>
          <h2 className="text-foreground/70 text-lg font-medium">{t('assistant.title')}</h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {hasMessages ? (
            <AssistantMessageList onPick={send} />
          ) : (
            <AssistantEmptyState onPick={send} />
          )}
        </div>
        <div className="border-border/60 shrink-0 border-t p-3">
          <AssistantComposer onSend={send} />
        </div>
      </div>
    </div>
  );
}
