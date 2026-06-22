'use client';

import { AssistantMessageContent } from './assistant-message-content';
import { AssistantOrb } from './assistant-orb';

const AI_BUBBLE =
  'bg-card border-border text-foreground min-w-0 rounded-2xl rounded-es-[4px] border px-4 py-3 text-[15px] leading-relaxed break-words';
const USER_BUBBLE =
  'bg-brand-dark-navy text-on-media max-w-[85%] rounded-2xl rounded-ee-[4px] px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap';

/**
 * One chat message. User messages sit at the inline end in a navy bubble; assistant
 * messages sit at the inline start with the orb avatar and a light bubble that renders
 * the reply as organized markdown (bold, lists, paragraphs) + inline nav links, typed
 * out progressively when it is the latest message ({@link AssistantMessageContent}).
 */
export function AssistantBubble({
  role,
  text,
  id,
  animate = false,
}: {
  role: 'user' | 'assistant';
  text: string;
  id: string;
  animate?: boolean;
}) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className={USER_BUBBLE}>
          <p dir="auto" className="text-start">
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[88%] items-end gap-2.5">
        <AssistantOrb className="size-8 shrink-0" />
        <div className={AI_BUBBLE}>
          <AssistantMessageContent text={text} id={id} animate={animate} />
        </div>
      </div>
    </div>
  );
}
