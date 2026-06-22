import { AssistantOrb } from './assistant-orb';

/**
 * "Assistant is typing" indicator — the orb avatar beside a light bubble with three
 * bouncing dots. The label is screen-reader-only; the dots are decorative and stop
 * for reduced-motion users.
 */
export function AssistantTyping({ label }: { label: string }) {
  return (
    <div className="flex justify-start" role="status" aria-live="polite">
      <div className="flex items-end gap-2.5">
        <AssistantOrb className="size-8 shrink-0" />
        <div className="bg-card border-border flex items-center gap-1.5 rounded-2xl rounded-es-[4px] border px-4 py-4">
          <span className="sr-only">{label}</span>
          <span
            className="bg-foreground/40 size-2 rounded-full [animation-delay:0ms] motion-safe:animate-bounce"
            aria-hidden
          />
          <span
            className="bg-foreground/40 size-2 rounded-full [animation-delay:150ms] motion-safe:animate-bounce"
            aria-hidden
          />
          <span
            className="bg-foreground/40 size-2 rounded-full [animation-delay:300ms] motion-safe:animate-bounce"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
