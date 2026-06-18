'use client';

import { useTranslation } from 'react-i18next';

import { CloseIcon, PhaseCheckIcon } from '@/components/icons';

import { type CardFeedback } from './use-card-registration-return';

/**
 * Inline success/error banner for card actions (add / set-default / delete). Bonyad
 * has no toast system, so feedback lands here above the list — `role="status"` for a
 * success, `role="alert"` for an error. The message is dynamic (a translated string
 * or a localised backend reason), so it carries `dir="auto"` + `text-start`.
 */
export function CardStatusBanner({
  feedback,
  onDismiss,
}: {
  feedback: CardFeedback;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const isSuccess = feedback.tone === 'success';
  const tone = isSuccess
    ? 'border-success/30 bg-success/10 text-success'
    : 'border-destructive/30 bg-destructive/10 text-destructive';

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${tone}`}
    >
      {isSuccess ? <PhaseCheckIcon className="size-5 shrink-0" aria-hidden /> : null}
      <p dir="auto" className="min-w-0 flex-1 text-start text-sm font-medium">
        {feedback.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('cards.feedback.dismiss')}
        className="focus-visible:outline-ring -me-1 shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <CloseIcon className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
