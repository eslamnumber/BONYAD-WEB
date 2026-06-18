'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SendIcon } from '@/components/icons';
import { Textarea } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { conventionalDir } from '../lib/support-format';

type Props = {
  pending?: boolean;
  disabled?: boolean;
  locale: Locale;
  onSend: (text: string) => Promise<void>;
};

/** Reply/send input — shared by the ticket thread and the live conversation. */
export function MessageComposer({ pending, disabled, locale, onSend }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || pending) return;
    void onSend(value)
      .then(() => setText(''))
      .catch(() => undefined);
  };

  return (
    <form onSubmit={submit} className="border-border flex items-end gap-2 border-t p-3">
      <Textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={t('support.conversation.placeholder')}
        aria-label={t('support.conversation.placeholder')}
        className="max-h-32 min-h-11 flex-1 resize-none text-start"
      />
      <button
        type="submit"
        disabled={disabled || pending || !text.trim()}
        aria-label={t('support.conversation.send')}
        className="bg-primary text-primary-foreground focus-visible:outline-ring flex size-11 shrink-0 items-center justify-center rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
      >
        <SendIcon
          className={`size-5 ${conventionalDir(locale) === 'rtl' ? '-scale-x-100' : ''}`}
          aria-hidden
        />
      </button>
    </form>
  );
}
