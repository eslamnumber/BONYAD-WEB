/**
 * Off-platform ("external") project shapes — GET /technicians/external-projects (the
 * "المشاريع الخارجية" panel). Mirrors the iOS `ExternalProjectModels.swift` (backend-
 * integration reference only); the field names below are VERIFIED live on the dev
 * backend (technician 444) by creating one — the list returns `{ projects, count,
 * success }`, each item carrying the fields below. `progress` is a 0–100 percent
 * (NOT the 0–1 fraction the dashboard summary uses).
 *
 * Permissive by hard rule 1: every field optional + nullable, `status` a widening union.
 */
export type ExternalProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | (string & {});

/** One off-platform project row. `id` is the only guaranteed field. */
export type ExternalProject = {
  id: number;
  title?: string | null;
  location?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  description?: string | null;
  status?: ExternalProjectStatus | null;
  /** Completion percentage, 0–100. */
  progress?: number | null;
  isPublic?: boolean | null;
  publicUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
};
