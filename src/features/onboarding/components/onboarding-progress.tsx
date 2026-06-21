'use client';

import { useTranslation } from 'react-i18next';

import { useConventionalDir } from '../hooks/use-conventional-dir';

/**
 * Onboarding step indicator — a genuine sequence (sign up → complete profile →
 * approval), so a numbered cue is warranted. The `dir` scope makes the label and
 * the segment fill read in natural order (step 1 on the reading-start side) with
 * plain logical CSS — right in ar, left in en, no `flex-row-reverse`.
 */
export function OnboardingProgress({ step, total }: { step: number; total: number }) {
  const { t } = useTranslation();
  const dir = useConventionalDir();
  return (
    <div dir={dir} className="flex flex-col gap-2">
      <p className="text-muted-foreground text-start text-sm font-medium">
        {t('onboarding.progress', { step, total })}
      </p>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  );
}
