/**
 * Contract-list shapes — GET /contracts/my (the dashboard "Contracts" panel, both
 * roles). Distinct from the per-project {@link Contract} (`/contracts/project/:id`):
 * the list nests `project` + `technician` and carries both document URLs. Field names
 * VERIFIED live on the dev backend (customer 443 had 9 contracts): the envelope is
 * `{ userName, contracts, userId, totalContracts }`.
 *
 * Permissive by hard rule 1: every field optional + nullable; `contractType` widening.
 */
export type MyContractParty = { id?: number | null; name?: string | null };

export type MyContractProject = {
  id?: number | null;
  title?: string | null;
  description?: string | null;
};

/** One row of GET /contracts/my. `id` is the only guaranteed field. A contract is
 *  "signed" once `signedAt` (or `signedDocumentUrl`) is present. */
export type MyContract = {
  id: number;
  contractType?: string | null;
  isFirstContract?: boolean | null;
  previousContractId?: number | null;
  originalDocumentUrl?: string | null;
  signedDocumentUrl?: string | null;
  createdAt?: string | null;
  signedAt?: string | null;
  project?: MyContractProject | null;
  technician?: MyContractParty | null;
};
