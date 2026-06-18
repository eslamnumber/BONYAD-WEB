import { type FeedbackStatusTone } from '../lib/feedback-format';

/** Soft status pill — one colour per tone, every class a `status-*` token pair (each has a
 *  `.dark` value). NEW→offer/blue, REVIEWED→progress/amber, RESOLVED→approved/green. */
const TONE_CLASS: Record<FeedbackStatusTone, string> = {
  new: 'bg-status-offer-soft text-status-offer',
  reviewed: 'bg-status-progress-soft text-status-progress',
  resolved: 'bg-status-approved-soft text-status-approved',
  neutral: 'bg-muted text-muted-foreground',
};

export function StatusPill({ tone, label }: { tone: FeedbackStatusTone; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASS[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
