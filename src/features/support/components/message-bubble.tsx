import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  /** Sent by the signed-in user → tinted, inline-end; otherwise the agent's reply. */
  mine: boolean;
  content: string;
  meta?: ReactNode;
};

/** One chat bubble — shared by the ticket thread and the live conversation. */
export function MessageBubble({ mine, content, meta }: Props) {
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
          mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
        )}
      >
        <p dir="auto" className="text-start break-words whitespace-pre-wrap">
          {content}
        </p>
        {meta ? <p className="mt-1 text-[11px] opacity-70">{meta}</p> : null}
      </div>
    </div>
  );
}
