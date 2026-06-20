import { cn } from '@/lib/utils';

import { OmdahOrb } from './omdah-orb';
import { TypingText } from './typing-text';

const AI_BUBBLE =
  'bg-card border-border text-foreground min-w-0 rounded-2xl rounded-es-[4px] border px-4 py-3 text-[15px] leading-relaxed break-words';
const USER_BUBBLE =
  'bg-brand-dark-navy text-on-media max-w-[85%] rounded-2xl rounded-ee-[4px] px-4 py-3 text-[15px] leading-relaxed break-words';

/**
 * One chat message (Figma 1597:3503 / 1597:3511). AI messages sit at the inline start
 * with the animated Omdah orb avatar and a light bubble (sharp bottom-start corner);
 * the latest AI question types out (`animate`). User messages sit at the inline end in a
 * navy bubble (sharp bottom-end corner).
 */
export function ChatBubble({
  role,
  text,
  animate = false,
}: {
  role: 'ai' | 'user';
  text: string;
  animate?: boolean;
}) {
  if (role === 'ai') {
    return (
      <div className="flex justify-start">
        <div className="flex max-w-[85%] items-end gap-3">
          <OmdahOrb className="size-8 shrink-0" />
          <div className={AI_BUBBLE}>
            <p dir="auto" className="text-start">
              <TypingText text={text} animate={animate} />
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className={cn(USER_BUBBLE)}>
        <p dir="auto" className="text-start">
          {text}
        </p>
      </div>
    </div>
  );
}
