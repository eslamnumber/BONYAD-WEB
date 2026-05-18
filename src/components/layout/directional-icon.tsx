import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type DirectionalIconProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Wraps a directional icon (arrows, chevrons, back buttons) so it mirrors
 * automatically in RTL layouts. Non-directional icons (search, settings, user)
 * MUST NOT be wrapped — they look identical in both directions.
 *
 * Implementation:
 *   - `dir="ltr"` keeps the inner content LTR-oriented when `<html dir="rtl">`.
 *   - `rtl:-scale-x-100` flips the visual in RTL.
 *   Both are required: dir for assistive tech, scale for the visual.
 */
export function DirectionalIcon({ children, className }: DirectionalIconProps) {
  return (
    <span aria-hidden className={cn('inline-flex rtl:-scale-x-100', className)}>
      {children}
    </span>
  );
}
