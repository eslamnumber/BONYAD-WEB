import { type ReactNode } from 'react';

import { OnboardingHeader } from './onboarding-header';
import { OnboardingImagePanel } from './onboarding-image-panel';

/**
 * Shared chrome for the technician onboarding screens — the auth split-hero layout
 * (form column + desktop image panel) so "Complete profile" and "Waiting for
 * approval" feel like the next steps of sign-up. Screens render their own
 * `max-w-*` card into the centered content area.
 */
export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-login-bg flex min-h-dvh flex-col lg:flex-row">
      <div className="flex flex-1 flex-col lg:max-w-[549px]">
        <OnboardingHeader />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          {children}
        </div>
      </div>
      <OnboardingImagePanel />
    </div>
  );
}
