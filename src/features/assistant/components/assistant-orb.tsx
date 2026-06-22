import { OmdahAvatarIllustration } from '@/components/illustrations';
import { cn } from '@/lib/utils';

/**
 * The Bonyad assistant orb — the glowing blue ball with a gentle idle animation: the
 * container "breathes" (scale) while the gradient slowly swirls (rotate). Both are
 * motion-safe, so reduced-motion users see a static orb. Reuses the shared avatar
 * illustration; used as the launcher glyph, the empty-state hero, and the AI message
 * avatar. Purely decorative (`aria-hidden`).
 */
export function AssistantOrb({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex motion-safe:animate-[omdah-breathe_4s_ease-in-out_infinite]',
        className,
      )}
    >
      <OmdahAvatarIllustration className="size-full motion-safe:animate-[omdah-swirl_16s_linear_infinite]" />
    </span>
  );
}
