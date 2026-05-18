import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  /** When true, the separator is purely visual (default). When false, exposes role="separator". */
  decorative?: boolean;
};

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { className, orientation = 'horizontal', decorative = true, ...props },
  ref,
) {
  const role = decorative ? undefined : 'separator';
  const ariaOrientation = decorative ? undefined : orientation;
  return (
    <div
      ref={ref}
      role={role}
      aria-orientation={ariaOrientation}
      data-orientation={orientation}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
});
