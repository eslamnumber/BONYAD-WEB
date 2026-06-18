'use client';

import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type SubscriptionFeedback = { tone: 'success' | 'error'; message: string };

const TONE = {
  success: 'border-status-approved/30 bg-status-approved-soft text-status-approved',
  error: 'border-destructive/30 bg-destructive/5 text-destructive',
} as const;

/**
 * Transient status banner for the cancel action — success (the subscription was
 * cancelled, screen flips to the empty state) or error. Dismissible.
 */
export function SubscriptionFeedbackBanner({
  feedback,
  onDismiss,
}: {
  feedback: SubscriptionFeedback;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${TONE[feedback.tone]}`}
    >
      <p dir="auto" className="text-start leading-6">
        {feedback.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('subscription.cancel.close')}
        className="focus-visible:outline-ring shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
