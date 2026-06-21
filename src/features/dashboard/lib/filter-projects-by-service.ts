import type { Project } from '../schemas/project';
import type { Service } from '../schemas/service';

/**
 * Narrow a biddable-projects list to those whose `serviceId` is one the technician
 * actually offers — mirrors the RN service filter
 * (website-bonyad/src/screens/projects/general/ProjectsScreen.tsx:668). A project
 * with no `serviceId`, or one outside the set, is dropped; an **empty service set
 * therefore yields no projects** (a technician offering nothing sees no offers,
 * matching RN + iOS). The fail-open case — when the services call itself errors —
 * is handled by the caller, not here.
 */
export function filterProjectsByServices(projects: Project[], services: Service[]): Project[] {
  const ids = new Set(services.map((s) => s.id));
  return projects.filter((p) => typeof p.serviceId === 'number' && ids.has(p.serviceId));
}
