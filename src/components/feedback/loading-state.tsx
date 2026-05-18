import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  /** Localized loading label for screen readers. Defaults to "Loading". */
  label?: string;
};

export function LoadingState({ label = 'Loading', className, ...props }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center gap-3 py-8', className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className="border-muted border-t-primary size-6 rounded-full border-2 motion-safe:animate-spin"
      />
    </div>
  );
}
