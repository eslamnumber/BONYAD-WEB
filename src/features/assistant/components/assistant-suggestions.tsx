'use client';

import { cn } from '@/lib/utils';

import type { AssistantSuggestion } from '../api/send-assistant-message';

/**
 * Quick-reply chips — starter prompts in the empty state, or the backend's
 * `ui.suggestions` after a reply. Tapping one sends its `value` as the next message
 * (RN `handleSuggestionTap`). Labels are dynamic/punctuated, so they carry `dir="auto"`.
 */
export function AssistantSuggestions({
  items,
  onPick,
  center = false,
}: {
  items: AssistantSuggestion[];
  onPick: (value: string) => void;
  center?: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className={cn('flex flex-wrap gap-2', center ? 'justify-center' : 'justify-start')}>
      {items.map((s, i) => (
        <button
          key={`${s.value}-${i}`}
          type="button"
          dir="auto"
          onClick={() => onPick(s.value)}
          className="border-ai-input-border text-brand-dark-navy hover:bg-dashboard-search-bg focus-visible:outline-ring inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
