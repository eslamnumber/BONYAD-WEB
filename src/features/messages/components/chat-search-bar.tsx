'use client';

import { useTranslation } from 'react-i18next';

import { ChatSearchIcon } from '@/components/icons';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Conversation search field (Figma 1046:7426/7427) — leading search glyph + a
 * filled rounded field. Filters the list by the other participant's name.
 */
export function ChatSearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();
  const placeholder = t('messages.searchPlaceholder');
  return (
    <div className="border-chat-border w-full border-b p-4">
      <div className="bg-chat-field flex h-10 items-center gap-2 rounded-lg px-3">
        <ChatSearchIcon className="text-chat-muted size-4 shrink-0" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="text-foreground placeholder:text-chat-muted min-w-0 flex-1 bg-transparent text-end text-sm outline-none"
        />
      </div>
    </div>
  );
}
