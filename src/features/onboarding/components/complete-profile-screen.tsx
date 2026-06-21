'use client';

import { useTranslation } from 'react-i18next';

import { CompleteProfileForm } from './complete-profile-form';
import { OnboardingProgress } from './onboarding-progress';

const K = 'onboarding.completeProfile';

/** Technician onboarding step 2 — the "Complete your profile" screen body. */
export function CompleteProfileScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-8">
      <OnboardingProgress step={2} total={3} />
      <header className="flex flex-col gap-2">
        <h1 className="text-foreground text-end text-[32px] leading-normal font-medium">
          {t(`${K}.heading`)}
        </h1>
        <p className="text-muted-foreground text-end text-base leading-normal">
          {t(`${K}.subheading`)}
        </p>
      </header>
      <CompleteProfileForm />
    </div>
  );
}
