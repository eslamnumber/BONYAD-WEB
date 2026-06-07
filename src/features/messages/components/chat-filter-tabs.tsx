'use client';

import { useTranslation } from 'react-i18next';

export type ChatFilter = 'all' | 'unread' | 'read';

const FILTERS: ChatFilter[] = ['all', 'unread', 'read'];

type Props = {
  value: ChatFilter;
  onChange: (filter: ChatFilter) => void;
};

/**
 * Read/unread filter pills (Figma 1046:7431). Active pill is solid navy with
 * white text; the rest are outlined. Toggle-buttons over a shared list, so they
 * use `aria-pressed` rather than a tablist.
 */
export function ChatFilterTabs({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="border-chat-border flex w-full items-center justify-end gap-2 border-b px-4 py-3">
      {FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter)}
            className={`flex h-8 items-center justify-center rounded-full px-3 text-sm transition-colors ${
              active
                ? 'bg-brand-dark-navy text-on-media font-medium'
                : 'border-chat-border text-sidebar-link bg-background border font-normal'
            }`}
          >
            {t(`messages.filter.${filter}`)}
          </button>
        );
      })}
    </div>
  );
}
