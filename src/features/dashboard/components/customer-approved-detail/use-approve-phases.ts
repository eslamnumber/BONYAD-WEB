'use client';

import { useTranslation } from 'react-i18next';

import { useApproveAllPhases } from '../../api/approve-all-phases';
import { useCreateSignature } from '../../api/create-signature';
import { type ProjectDetail } from '../../schemas/project';
import { type ProjectPhase } from '../../schemas/project-phase';

/**
 * Approve-phases orchestration for the customer's APPROVED screen. `approve()` POSTs
 * /phases/project/:id/approve-all (moving the project → CONTRACT_SIGNING, which
 * re-routes the detail screen to the contract-sent view), then best-effort POSTs
 * /signatures so the contract is emailed to both parties. Mirrors the RN flow
 * (projectContractSigning.ts → SignatureService.createEmailSignatureRequest): the
 * signature body is just projectId + phaseIds + language — the backend auto-fetches
 * both emails — so no technician-profile lookup is needed. The signature is
 * non-blocking; approve-all is the gate, and the contract-sent screen resends if it
 * didn't fire.
 */
export function useApprovePhases(project: ProjectDetail, phases: ProjectPhase[]) {
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'AR' : 'EN';
  const approveAll = useApproveAllPhases(project.id);
  const signature = useCreateSignature();

  const approve = async () => {
    await approveAll.mutateAsync();
    const phaseIds = phaseIdsOf(phases);
    if (phaseIds.length > 0) {
      signature.mutate({ projectId: project.id, phaseIds, language });
    }
  };

  return { approve, isPending: approveAll.isPending, isError: approveAll.isError };
}

/** Positive phase ids only — the backend rejects an empty / zero phase list. */
function phaseIdsOf(phases: ProjectPhase[]): number[] {
  return phases.map((p) => p.id).filter((id): id is number => typeof id === 'number' && id > 0);
}
