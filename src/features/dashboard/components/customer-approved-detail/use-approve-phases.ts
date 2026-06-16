'use client';

import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useApproveAllPhases } from '../../api/approve-all-phases';
import { useCreateSignature } from '../../api/create-signature';
import { getUserProfile, userProfileQueryKey } from '../../api/get-user-profile';
import { type ProjectDetail } from '../../schemas/project';
import { type ProjectPhase } from '../../schemas/project-phase';

type SignatureDeps = {
  project: ProjectDetail;
  phases: ProjectPhase[];
  userEmail: string | undefined;
  technicianId: number | undefined;
  technicianEmail: string | undefined;
  language: 'EN' | 'AR';
};

/**
 * Approve-phases orchestration for the customer's APPROVED screen. `approve()` POSTs
 * /phases/project/:id/approve-all (moving the project → CONTRACT_SIGNING, which
 * re-routes the detail screen to the contract-sent view), then best-effort POSTs
 * /signatures so the contract is emailed to both parties. The signature is
 * non-blocking — approve-all is the gate; the contract-sent screen resends if it
 * didn't fire. Mirrors the RN flow (projectContractSigning.ts → usePhaseApprovalData).
 */
export function useApprovePhases(project: ProjectDetail, phases: ProjectPhase[]) {
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'AR' : 'EN';
  const userEmail = useAuthStore((s) => s.user?.email);
  const queryClient = useQueryClient();
  const approveAll = useApproveAllPhases(project.id);
  const signature = useCreateSignature();
  const technicianId = project.assignedTechnicianId ?? undefined;

  const approve = async () => {
    await approveAll.mutateAsync();
    const technicianEmail = await resolveTechnicianEmail(queryClient, technicianId);
    sendSignature(signature.mutate, {
      project,
      phases,
      userEmail,
      technicianId,
      technicianEmail,
      language,
    });
  };

  return { approve, isPending: approveAll.isPending, isError: approveAll.isError };
}

/** Resolve the assigned technician's email (cached profile), or undefined if unavailable. */
async function resolveTechnicianEmail(
  queryClient: QueryClient,
  technicianId: number | undefined,
): Promise<string | undefined> {
  if (typeof technicianId !== 'number' || technicianId <= 0) return undefined;
  try {
    const profile = await queryClient.ensureQueryData({
      queryKey: userProfileQueryKey(technicianId),
      queryFn: () => getUserProfile(technicianId),
      staleTime: 1000 * 60 * 5,
    });
    return profile?.email;
  } catch {
    return undefined;
  }
}

/** Fire the e-sign request only when every required field is present (best effort). */
function sendSignature(
  mutate: ReturnType<typeof useCreateSignature>['mutate'],
  deps: SignatureDeps,
) {
  const phaseIds = deps.phases
    .map((p) => p.id)
    .filter((id): id is number => typeof id === 'number' && id > 0);
  if (
    typeof deps.technicianId !== 'number' ||
    !deps.userEmail ||
    !deps.technicianEmail ||
    phaseIds.length === 0
  ) {
    return;
  }
  mutate({
    projectId: deps.project.id,
    technicianId: deps.technicianId,
    userEmail: deps.userEmail,
    technicianEmail: deps.technicianEmail,
    phaseIds,
    language: deps.language,
  });
}
