import type { ProjectPhase } from './project-phase';

/**
 * Mirrors `Project` from website-bonyad/src/services/ProjectService.ts.
 *
 * Permissive — every field except `id` is optional so a future backend addition
 * doesn't surface as a misleading "Something went wrong". `description` and
 * `address` are single non-localised strings; the service name, however, is a
 * localized split (`serviceNameEn` / `serviceNameAr`, returned by both the list
 * and detail endpoints) — resolve it via `localizedServiceName` (LOCALE_DIRECTION),
 * never render one side directly. Duration is `timeRequiredDays` (whole days).
 */
export type Project = {
  id: number;
  userId?: number;
  userName?: string;
  serviceId?: number;
  serviceNameEn?: string;
  serviceNameAr?: string;
  /** Optional explicit title; the card falls back to the localized service name. */
  title?: string;
  description?: string;
  budget?: number | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  projectType?: string;
  assignedTechnicianId?: number | null;
  files?: string[];
  timeRequiredDays?: number;
  bidsCloseAt?: string;
  createdAt?: string;
  regionId?: number;
  /**
   * AI (Omdah) Scope-of-Work fields — null/absent for manually-created projects.
   * Mirrors the iOS project model (bonayd-ios `ProjectsListView.swift` BackendProject):
   * a project is AI-generated when `hasSow` OR `aiGenerated`; `sowJsonSnapshot` is the
   * full SOW JSON (source of truth for rich rendering); the flat `sow*` columns are a
   * fallback. Surfaced read-only on the status screens via `parseProjectSow`. All
   * optional + permissive — manual projects simply omit them.
   */
  aiGenerated?: boolean;
  hasSow?: boolean;
  sowJsonSnapshot?: string;
  sowScope?: string;
  sowKpis?: string;
  sowResourcesJson?: string;
  sowEstimatedBudget?: number | null;
  sowDurationMonths?: number | null;
  sowQualityTier?: string;
  sowProjectType?: string;
  sowSector?: string;
  sowPropertyType?: string;
  sowCity?: string;
  sowDistrict?: string;
  sowComplexity?: string;
  sowCurrency?: string;
  sowPricingModel?: string;
};

/**
 * The signed-in customer's own project (GET /projects/my). Mirrors RN `MyProject`
 * (website-bonyad/src/services/ProjectService.ts) — {@link Project} plus the
 * assigned technician's display name and the project's phase list. Permissive:
 * both extras are optional so a row that omits them never surfaces as an error.
 * The customer projects table derives its "current phase" column from `phases`
 * (falling back to the localized service name).
 */
/**
 * Supervisor-assignment fields the backend returns on project DTOs (`/projects/my`,
 * `/projects/supervising`). Permissive — all nullable; `supervisorStatus` is a
 * backend-controlled string (INVITED | ACTIVE | DECLINED | REMOVED), never
 * zod-enumerated. `canHireSupervisor` gates the customer's "Hire supervisor" action.
 */
export type SupervisorFields = {
  supervisorId?: number | null;
  supervisorName?: string | null;
  supervisorStatus?: string | null;
  hasActiveSupervisor?: boolean | null;
  canHireSupervisor?: boolean | null;
};

export type MyProject = Project &
  SupervisorFields & {
    assignedTechnicianName?: string;
    phases?: ProjectPhase[];
  };

/**
 * Single-project detail (GET /projects/:id). Mirrors the extra fields the RN
 * detail screen reads (website-bonyad/src/screens/projects/general/ProjectDetailScreen.tsx)
 * on top of {@link Project}. Permissive — every detail-only field is optional so
 * a backend that omits one never surfaces as "Something went wrong". The summary
 * card falls back gracefully (e.g. `budget` when `budgetMin/Max` are absent, and
 * hides the offers stat when no count is returned).
 */
export type ProjectDetail = Project & {
  /** Free-text category chips shown under the description. */
  requirements?: string[];
  /** Expected start date (ISO-8601) shown in the summary stat row. */
  expectedStartDate?: string;
  /** Budget range when the backend splits it; otherwise read the single `budget`. */
  budgetMin?: number | null;
  budgetMax?: number | null;
  /** Offers received — RN derives this from the bids list; surfaced here when the detail includes it. */
  offersCount?: number;
  bidsCount?: number;
  /** Client display location when distinct from the project `address`. */
  clientLocation?: string;
};

/** Spring-style page envelope the list endpoint may return instead of a bare array. */
export type PaginatedProjectsResponse = {
  content?: Project[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  size?: number;
};
