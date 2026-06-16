/**
 * Mirrors `ContractRecord` from website-bonyad/src/services/ContractService.ts
 * (GET /contracts/project/:projectId). Permissive — every field optional — so a
 * backend addition never surfaces as a misleading error (CLAUDE rule 1: response
 * shapes are a TS type, never a strict response schema). The CONTRACT_SIGNING
 * screen reads `createdAt` (→ "sent N ago") and `status`.
 */
export type Contract = {
  id?: number;
  projectId?: number;
  technicianId?: number;
  language?: string;
  documentUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};
