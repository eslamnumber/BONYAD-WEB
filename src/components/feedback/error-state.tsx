import { type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorStateProps = HTMLAttributes<HTMLDivElement> & {
  /** Localized headline. */
  title: string;
  /** Optional supporting message. */
  description?: string;
  /** Localized retry button label. Omit to hide the button. */
  retryLabel?: string;
  /** Click handler for retry. */
  onRetry?: () => void;
  /** Optional icon or illustration shown above the title. */
  icon?: ReactNode;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  icon,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}
      {...props}
    >
      {icon ? <div aria-hidden>{icon}</div> : null}
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-muted-foreground text-sm text-balance">{description}</p>
      ) : null}
      {retryLabel && onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
