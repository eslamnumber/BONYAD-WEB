'use client';

import { useCallback, useMemo, useState } from 'react';

import type { SetupService } from '../schemas/setup';

export type SetupStep = 'plan' | 'services' | 'review';
const STEPS: SetupStep[] = ['plan', 'services', 'review'];

/** A selected leaf service plus the parent category it was chosen under (for the cap). */
export type SelectedService = { service: SetupService; categoryId: number };

/**
 * Client state for the 3-step post-approval wizard: which step is active, the chosen
 * plan, and the selected leaf services (kept as a `Map<id, {service, categoryId}>` so the
 * review step can show names without re-fetching and the services step can cap distinct
 * categories per the plan). `canProceed` gates the footer's Continue button — a plan on
 * step 1, at least one service on step 2, always true on review.
 */
export function useSetupWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [planId, setPlanId] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<Map<number, SelectedService>>(new Map());

  const toggleService = useCallback((service: SetupService, categoryId: number) => {
    setSelectedServices((prev) => {
      const nextMap = new Map(prev);
      if (nextMap.has(service.id)) nextMap.delete(service.id);
      else nextMap.set(service.id, { service, categoryId });
      return nextMap;
    });
  }, []);

  const isServiceSelected = useCallback(
    (id: number) => selectedServices.has(id),
    [selectedServices],
  );

  /** Distinct parent categories among the selected services — the plan cap counts these. */
  const selectedCategoryIds = useMemo(
    () => new Set([...selectedServices.values()].map((entry) => entry.categoryId)),
    [selectedServices],
  );

  const step: SetupStep = STEPS[stepIndex] ?? 'plan';
  const canProceed = useMemo(() => {
    if (step === 'plan') return planId !== null;
    if (step === 'services') return selectedServices.size > 0;
    return true;
  }, [step, planId, selectedServices]);

  const next = useCallback(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), []);
  const back = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);
  const goTo = useCallback(
    (i: number) => setStepIndex(Math.max(0, Math.min(i, STEPS.length - 1))),
    [],
  );

  return {
    step,
    stepIndex,
    stepCount: STEPS.length,
    planId,
    setPlanId,
    selectedServices,
    selectedCategoryIds,
    toggleService,
    isServiceSelected,
    canProceed,
    next,
    back,
    goTo,
    isFirst: stepIndex === 0,
    isLast: stepIndex === STEPS.length - 1,
  };
}
