import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ProjectDetail } from '../schemas/project';

export const projectQueryKey = (id: number) => ['projects', 'detail', id] as const;

/**
 * A single job offer / project detail. GET /projects/:id returns the full entity
 * WRAPPED in `{ project, phases, regionId, regionName* }`, with the client and
 * service as nested objects (`project.user.name`, `project.service.name{En,Ar}`)
 * — unlike the LIST endpoint, which is a flat DTO. {@link normalizeProjectDetail}
 * unwraps + flattens it into the same flat {@link ProjectDetail} the cards expect,
 * tolerating an already-flat body so tests/other shapes still work. Browser calls
 * go through `/api/proxy/*`, which attaches the session token.
 */
export async function getProject(id: number): Promise<ProjectDetail> {
  const path = API_ENDPOINTS.PROJECTS.DETAILS.replace(':id', String(id));
  const data = await apiClient.get<unknown>(path);
  return normalizeProjectDetail(data);
}

function normalizeProjectDetail(data: unknown): ProjectDetail {
  const root = (data ?? {}) as Record<string, unknown>;
  const raw = ((root.project as Record<string, unknown> | undefined) ?? root) as Record<
    string,
    unknown
  >;
  return { ...(raw as ProjectDetail), ...flattenRelations(raw) };
}

/**
 * Flatten the nested relations the detail endpoint returns (`project.user.{id,name}`,
 * `project.service.name{En,Ar}`, `project.assignedTechnician.id`) onto the flat
 * fields the cards read. Each falls back to an already-flat value, so a flat body
 * (tests / other shapes) passes through unchanged. `userId` (the project owner /
 * client) is flattened so the technician's "message the client" deep-link has a
 * real peer — without it the contact buttons fall back to the generic inbox.
 */
function flattenRelations(raw: Record<string, unknown>): Partial<ProjectDetail> {
  const user = raw.user as { id?: number; name?: string } | undefined;
  const service = raw.service as { nameEn?: string; nameAr?: string } | undefined;
  const flat: Partial<ProjectDetail> = {
    userId: (raw.userId as number | undefined) ?? user?.id,
    userName: (raw.userName as string | undefined) ?? user?.name,
    serviceNameEn: (raw.serviceNameEn as string | undefined) ?? service?.nameEn,
    serviceNameAr: (raw.serviceNameAr as string | undefined) ?? service?.nameAr,
  };
  const technicianId = resolveTechnicianId(raw);
  if (technicianId !== undefined) flat.assignedTechnicianId = technicianId;
  return flat;
}

/** Flat `assignedTechnicianId` if present, else the nested `assignedTechnician.id`. */
function resolveTechnicianId(raw: Record<string, unknown>): number | undefined {
  if (typeof raw.assignedTechnicianId === 'number') return raw.assignedTechnicianId;
  const nested = (raw.assignedTechnician as { id?: number } | undefined)?.id;
  return typeof nested === 'number' ? nested : undefined;
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectQueryKey(id),
    queryFn: () => getProject(id),
    staleTime: 1000 * 60 * 5,
  });
}
