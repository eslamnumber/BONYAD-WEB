'use client';

import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowUpIcon } from '@/components/icons';

import { useAssistantStore } from '../store/assistant-store';

const PILL =
  'bg-dashboard-search-bg border-ai-input-border flex w-full items-center justify-between gap-2 rounded-full border ps-2 pe-5 py-2 backdrop-blur-[8px]';
const FIELD =
  'text-foreground placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent text-base text-end [direction:inherit] focus-visible:outline-none';
const SEND =
  'bg-brand-dark-navy text-on-media focus-visible:outline-ring flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 motion-safe:transition-opacity motion-safe:enabled:hover:opacity-90';

/**
 * The message input (Figma 1811:3828) — the same glass pill as the Omdah composer: a
 * navy circular send button at the inline start and the text field at the inline end.
 * Enter or the button sends; both are disabled while a reply is in flight or the field
 * is empty.
 */
export function AssistantComposer({ onSend }: { onSend: (text: string) => void }) {
  const { t } = useTranslation();
  const status = useAssistantStore((s) => s.status);
  const [value, setValue] = useState('');
  const id = useId();

  const disabled = !value.trim() || status === 'sending';
  const submit = () => {
    if (disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={PILL}
    >
      <button type="submit" disabled={disabled} aria-label={t('assistant.send')} className={SEND}>
        <ArrowUpIcon className="h-[18px] w-3.5" aria-hidden />
      </button>
      <label htmlFor={id} className="sr-only">
        {t('assistant.inputPlaceholder')}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('assistant.inputPlaceholder')}
        className={FIELD}
      />
    </form>
  );
}
