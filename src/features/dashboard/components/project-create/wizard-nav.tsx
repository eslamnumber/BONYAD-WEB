'use client';

import { useTranslation } from 'react-i18next';

import { ProjectArrowIcon } from '@/components/icons';
import { Button, FieldHint } from '@/components/ui';

import { type WizardStepConfig } from './wizard-state';

const NEXT = 'h-9 rounded-full px-6 text-base font-semibold [&_svg]:size-5';
const GHOST = 'text-foreground/80 h-9 rounded-full px-6 text-base font-semibold';

type Props = {
  config: WizardStepConfig;
  isLast: boolean;
  pending: boolean;
  /** False while the current step's required fields are unmet — disables Next/Create. */
  canProceed: boolean;
  /** True when this step was reached via a review-card Edit link and Next returns to it. */
  returnsToReview: boolean;
  rootError?: string;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
};

/** Primary-button label key: Create on the final step, Save when returning to review, else Next. */
function primaryLabelKey(isLast: boolean, returnsToReview: boolean): string {
  if (isLast) return 'dashboard.createProject.nav.create';
  if (returnsToReview) return 'dashboard.createProject.nav.saveReview';
  return 'dashboard.createProject.nav.next';
}

/**
 * Per-step button row: optional Skip / Back ghost buttons + the primary
 * Next/Create action. The forward arrow points in the reading direction —
 * `rtl:-scale-x-100` flips the left-pointing icon to the right in `en`.
 */
export function WizardNav({
  config,
  isLast,
  pending,
  canProceed,
  returnsToReview,
  rootError,
  onBack,
  onSkip,
  onNext,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-end gap-3">
      <FieldHint tone="error">{rootError ? t(rootError) : undefined}</FieldHint>
      <div className="flex items-center gap-2">
        {config.hasSkip ? (
          <Button type="button" variant="ghost" onClick={onSkip} className={GHOST}>
            {t('dashboard.createProject.nav.skip')}
          </Button>
        ) : null}
        {config.hasBack ? (
          <Button type="button" variant="ghost" onClick={onBack} className={GHOST}>
            {t('dashboard.createProject.nav.back')}
          </Button>
        ) : null}
        <Button type="button" onClick={onNext} disabled={pending || !canProceed} className={NEXT}>
          <ProjectArrowIcon aria-hidden className="rtl:-scale-x-100" />
          {t(primaryLabelKey(isLast, returnsToReview))}
        </Button>
      </div>
    </div>
  );
}
