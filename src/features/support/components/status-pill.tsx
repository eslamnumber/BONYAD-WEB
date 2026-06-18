import { type StatusTone } from '../lib/support-format';

/** Soft status pill — one colour per tone, every class a `status-*` token pair. */
const TONE_CLASS: Record<StatusTone, string> = {
  pending: 'bg-status-progress-soft text-status-progress',
  progress: 'bg-status-offer-soft text-status-offer',
  resolved: 'bg-status-approved-soft text-status-approved',
  rejected: 'bg-status-rejected-soft text-status-rejected',
  neutral: 'bg-muted text-muted-foreground',
};

export function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASS[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
