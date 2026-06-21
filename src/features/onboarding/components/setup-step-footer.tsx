'use client';

import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';

const K = 'onboarding.setup.nav';
const PRIMARY =
  'bg-primary text-primary-foreground focus-visible:outline-ring flex h-[52px] flex-1 items-center justify-center rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 disabled:opacity-50 motion-safe:hover:opacity-90';
const GHOST =
  'text-foreground hover:bg-field-surface focus-visible:outline-ring flex h-[52px] items-center justify-center rounded-full px-6 text-base font-semibold transition-colors focus-visible:outline-2 disabled:opacity-50';

type Props = {
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  isSubmitting: boolean;
  error: Error | null;
};

/** Wizard navigation — Back (after step 1) + Continue, or Finish on the review step,
 *  with the finish call's localized error surfaced above the buttons. */
export function SetupStepFooter(props: Props) {
  const { t, i18n } = useTranslation();
  const { isFirst, isLast, canProceed, onBack, onNext, onFinish, isSubmitting, error } = props;

  return (
    <div className="flex flex-col gap-3">
      {isLast && error ? <SubmitError error={error} locale={i18n.language} /> : null}
      <div className="flex items-center gap-3">
        {!isFirst ? (
          <button type="button" onClick={onBack} disabled={isSubmitting} className={GHOST}>
            {t(`${K}.back`)}
          </button>
        ) : null}
        {isLast ? (
          <button type="button" onClick={onFinish} disabled={isSubmitting} className={PRIMARY}>
            {t(isSubmitting ? `${K}.finishing` : `${K}.finish`)}
          </button>
        ) : (
          <button type="button" onClick={onNext} disabled={!canProceed} className={PRIMARY}>
            {t(`${K}.next`)}
          </button>
        )}
      </div>
    </div>
  );
}

function SubmitError({ error, locale }: { error: Error; locale: string }) {
  const { t } = useTranslation();
  const message =
    error instanceof ApiError
      ? (error.localizedMessage(locale) ?? t('onboarding.setup.review.submitError'))
      : t('onboarding.setup.review.submitError');
  return (
    <p role="alert" dir="auto" className="text-destructive text-sm">
      {message}
    </p>
  );
}
