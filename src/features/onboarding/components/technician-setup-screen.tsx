'use client';

import { useTranslation } from 'react-i18next';

import { conventionalDirection, type Locale } from '@/types/locale';

import { useSubscriptionPlans } from '../api/get-subscription-plans';
import { useSetupWizard } from '../hooks/use-setup-wizard';
import { useTechnicianSetup } from '../hooks/use-technician-setup';
import type { SetupService } from '../schemas/setup';

import { OnboardingProgress } from './onboarding-progress';
import { SetupPlanStep } from './setup-plan-step';
import { SetupReviewStep } from './setup-review-step';
import { SetupServicesStep } from './setup-services-step';
import { SetupStepFooter } from './setup-step-footer';
import { SetupStepHeading } from './setup-step-heading';

type Wizard = ReturnType<typeof useSetupWizard>;

/** Post-approval setup wizard (step 4 of onboarding) — choose plan → services → confirm,
 *  then the finish call assigns services, subscribes, marks onboarding complete, and
 *  redirects to the dashboard. */
export function TechnicianSetupScreen() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const wizard = useSetupWizard();
  const setup = useTechnicianSetup();
  const services = [...wizard.selectedServices.values()].map((entry) => entry.service);

  const onFinish = () => {
    if (wizard.planId === null) return;
    setup.mutate({ planId: wizard.planId, serviceIds: services.map((s) => s.id) });
  };

  return (
    // Scope the wizard sub-tree to the locale's NATURAL reading direction (ar → rtl,
    // en → ltr — the opposite of the inverted page map) so plain logical CSS inside
    // (text-start, justify-between, leading element first) mirrors automatically: Arabic
    // content right-anchored, English left-anchored. The same idiom support/feedback/sketch
    // use at their root; see docs/i18n-and-rtl.md §Horizontal icon+label rows.
    <div
      dir={conventionalDirection(locale)}
      className="relative flex w-full max-w-[460px] flex-col gap-7"
    >
      <SetupGlow />
      <OnboardingProgress step={wizard.stepIndex + 1} total={wizard.stepCount} />
      <SetupStepHeading step={wizard.step} />
      <SetupStepContent wizard={wizard} locale={locale} services={services} />
      <SetupStepFooter
        isFirst={wizard.isFirst}
        isLast={wizard.isLast}
        canProceed={wizard.canProceed}
        onBack={wizard.back}
        onNext={wizard.next}
        onFinish={onFinish}
        isSubmitting={setup.isPending}
        error={setup.error}
      />
    </div>
  );
}

function SetupStepContent({
  wizard,
  locale,
  services,
}: {
  wizard: Wizard;
  locale: Locale;
  services: SetupService[];
}) {
  const { data: plans } = useSubscriptionPlans();
  const maxCategories = plans?.find((plan) => plan.id === wizard.planId)?.maxCategories ?? null;

  if (wizard.step === 'plan') {
    return (
      <SetupPlanStep
        locale={locale}
        selectedId={wizard.planId}
        onSelect={(id) => wizard.setPlanId(id)}
      />
    );
  }
  if (wizard.step === 'services') {
    return (
      <SetupServicesStep
        locale={locale}
        isSelected={wizard.isServiceSelected}
        onToggle={wizard.toggleService}
        selectedCount={wizard.selectedServices.size}
        maxCategories={maxCategories}
        selectedCategoryIds={wizard.selectedCategoryIds}
      />
    );
  }
  return (
    <SetupReviewStep
      locale={locale}
      planId={wizard.planId}
      services={services}
      onEditPlan={() => wizard.goTo(0)}
      onEditServices={() => wizard.goTo(1)}
    />
  );
}

/** One signature decorative glow behind the wizard (identity §11). */
function SetupGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-12 -z-10 flex justify-center"
      aria-hidden
    >
      <div className="bg-deco-blob-blue-light size-56 rounded-full opacity-25 blur-[90px]" />
    </div>
  );
}
