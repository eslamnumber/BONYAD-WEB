import { z } from 'zod';

import type { Project, SupervisorFields } from './project';
import type { ProjectPhase } from './project-phase';

/**
 * Project-supervision shapes. A customer hires a technician to supervise a project;
 * the SP accepts/declines the invitation and, once ACTIVE, manages its bids. Mirrors
 * the iOS `SupervisorModels.swift` (backend-integration reference only) but the field
 * names below are the ones VERIFIED live on the dev backend (project 213) — the list
 * endpoint returns the full flat project DTO, not the lighter iOS list item, so we
 * extend the existing permissive {@link Project} rather than re-model it.
 *
 * Permissive by rule 1: never a `z.enum` on a backend-controlled string (status); a
 * future status value must not surface as a misleading "Something went wrong".
 */

/** The lifecycle of a supervision assignment. A widening union, not a `z.enum`. */
export type SupervisorStatus = 'INVITED' | 'ACTIVE' | 'DECLINED' | 'REMOVED' | (string & {});

/**
 * One row of GET /projects/supervising?status=invited|active — a full project DTO
 * (same flat shape as the projects list) plus the supervisor* fields and `phases[]`.
 * Every added field is optional + nullable so a backend tweak never breaks parsing.
 */
export type SupervisingProject = Project &
  SupervisorFields & {
    assignedTechnicianName?: string | null;
    regionNameEn?: string | null;
    regionNameAr?: string | null;
    biddingStatus?: string | null;
    budgetUnspecified?: boolean | null;
    phases?: ProjectPhase[] | null;
  };

/**
 * GET /projects/:id/supervisor and the POST …/respond response. Verified live: every
 * field present except `projectTitle` (null on the dev fixture). `active` mirrors
 * `status === 'ACTIVE'`.
 */
export type ProjectSupervisor = {
  projectId: number;
  projectTitle?: string | null;
  supervisorId?: number | null;
  supervisorName?: string | null;
  supervisorPhone?: string | null;
  status?: SupervisorStatus | null;
  assignedAt?: string | null;
  respondedAt?: string | null;
  active?: boolean;
};

/**
 * One entry of GET /projects/:id/supervisor/activity — the supervisor audit log.
 * Shaped from the iOS `SupervisorActivity` model (the dev fixture returned `[]`, so
 * the row fields are not curl-confirmed); kept fully permissive. `action` is a
 * pre-formatted human string (e.g. "[Supervisor] accepted bid 88"); `metadata` is a
 * raw JSON string decoded lazily only if a row needs it.
 */
export type SupervisorActivity = {
  id: number;
  projectId?: number;
  supervisorId?: number | null;
  supervisorName?: string | null;
  action?: string;
  metadata?: string | null;
  timestamp?: string;
};

/** Strict request body for POST /projects/:id/supervisor/respond (hard rule 1). */
export const respondSupervisorSchema = z.object({ accept: z.boolean() });
export type RespondSupervisorRequest = z.infer<typeof respondSupervisorSchema>;

/**
 * A technician eligible to be hired as a project supervisor (GET
 * /projects/hireable-technicians — the customer's picker). Verified live on dev:
 * exactly these fields. `companyName` wins over `name` for the display label.
 */
export type HireableTechnician = {
  id: number;
  name?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  companyName?: string | null;
};

/** Strict request body for POST /projects/:id/supervisor (customer hires a technician). */
export const hireSupervisorSchema = z.object({ technicianId: z.number().int().positive() });
export type HireSupervisorRequest = z.infer<typeof hireSupervisorSchema>;
