'use client';

import { useTranslation } from 'react-i18next';

import type { SetupStep } from '../hooks/use-setup-wizard';

/** Per-step title + subtitle. Both are static translated labels — NO `dir="auto"` (rule
 *  4): the wizard root scopes the natural reading direction, so the subtitle's trailing
 *  punctuation resolves correctly from the inherited dir without a per-leaf override. */
export function SetupStepHeading({ step }: { step: SetupStep }) {
  const { t } = useTranslation();
  const base = `onboarding.setup.steps.${step}`;
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-foreground text-[28px] leading-tight font-medium">
        {t(`${base}.title`)}
      </h1>
      <p className="text-muted-foreground text-base">{t(`${base}.subtitle`)}</p>
    </div>
  );
}
