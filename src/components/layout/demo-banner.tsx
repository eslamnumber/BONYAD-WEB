import { cn } from '@/lib/utils';

type DemoBannerProps = {
  /** Pre-translated banner label (caller resolves `common.demoBanner`). */
  label: string;
  /** Layout overrides (e.g. negative margins to break out of padding). */
  className?: string;
};

/**
 * Full-width yellow "demo platform" strip. Presentational + locale-agnostic so it
 * works in both the server-rendered public shell and the client dashboard sidebar.
 */
export function DemoBanner({ label, className }: DemoBannerProps) {
  return (
    <div
      className={cn(
        'bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-semibold',
        className,
      )}
    >
      {label}
    </div>
  );
}
