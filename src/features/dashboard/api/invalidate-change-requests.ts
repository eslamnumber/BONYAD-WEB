import type { QueryClient } from '@tanstack/react-query';

import { activeChangeRequestsQueryKey } from './get-active-change-requests';
import { changeRequestThreadQueryKey } from './get-change-request-thread';
import { changeRequestsQueryKey } from './get-change-requests';
import { projectQueryKey } from './get-project';
import { projectPhasesQueryKey } from './get-project-phases';

/**
 * Refresh everything a change-request mutation can touch: the active + history
 * lists always, plus — because an agreed change rewrites the phase list and the
 * project budget — the project and its phases. When the mutation targets a known
 * request id (respond / agree / reject) its open thread is refreshed too.
 * Shared by all four mutation hooks so they stay consistent.
 */
export function invalidateChangeRequests(
  queryClient: QueryClient,
  projectId: number,
  changeRequestId?: number,
) {
  queryClient.invalidateQueries({ queryKey: activeChangeRequestsQueryKey(projectId) });
  queryClient.invalidateQueries({ queryKey: changeRequestsQueryKey(projectId) });
  queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
  queryClient.invalidateQueries({ queryKey: projectPhasesQueryKey(projectId) });
  if (changeRequestId !== undefined) {
    queryClient.invalidateQueries({ queryKey: changeRequestThreadQueryKey(changeRequestId) });
  }
}
