import type { SupervisorFields } from '../schemas/project';

/**
 * The supervisor affordance a customer's project row shows. Mirrors the iOS
 * `ProjectSupervisorFields.cardState` decision: an ACTIVE/has-active supervisor →
 * "Supervised by … + Remove"; an INVITED one → "Pending … + Cancel"; otherwise the
 * "Hire supervisor" button when the backend says it's allowed; else nothing.
 */
export type SupervisorCardState = 'active' | 'pending' | 'hireable' | 'none';

export function supervisorCardState(project: SupervisorFields): SupervisorCardState {
  const status = (project.supervisorStatus ?? '').toUpperCase();
  if (status === 'ACTIVE' || project.hasActiveSupervisor === true) return 'active';
  if (status === 'INVITED') return 'pending';
  if (project.canHireSupervisor === true) return 'hireable';
  return 'none';
}
