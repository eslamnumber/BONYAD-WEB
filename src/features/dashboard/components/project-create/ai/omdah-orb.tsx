import { OmdahAvatarIllustration } from '@/components/illustrations';
import { cn } from '@/lib/utils';

/**
 * The Omdah avatar orb (the glowing blue ball) with a ChatGPT-style idle animation —
 * the container gently "breathes" (scale) while the orb's gradient slowly swirls
 * (rotate). Decorative; both animations are motion-safe so reduced-motion users see a
 * static orb. Used as the AI message avatar in the interview.
 */
export function OmdahOrb({ className }: { className?: string }) {
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
