'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { addTechnicianServices } from '../api/add-technician-services';
import { completeOnboarding } from '../api/complete-onboarding';
import { technicianStatusQueryKey } from '../api/get-technician-status';
import { subscribePlan } from '../api/subscribe-plan';

export type TechnicianSetupInput = { planId: number; serviceIds: number[] };

/**
 * The setup "Finish" action — runs the three RN onboarding-finish calls in order
 * (assign services → subscribe to the plan → mark onboarding complete), then invalidates
 * the authoritative `technician-status` and lands on the dashboard. Sequential by design:
 * the three are dependent backend steps, not parallel-safe writes. Any step's `ApiError`
 * rejects the mutation so the review step can surface its localized message.
 */
export function useTechnicianSetup() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? 0);

  return useMutation<void, Error, TechnicianSetupInput>({
    mutationFn: async ({ planId, serviceIds }) => {
      await addTechnicianServices(serviceIds);
      await subscribePlan(planId);
      await completeOnboarding(userId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: technicianStatusQueryKey() });
      router.replace(ROUTES.DASHBOARD);
    },
  });
}
