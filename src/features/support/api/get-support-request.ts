import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { supportDetailQueryKey } from '../lib/support-format';
import { type SupportRequestDetail } from '../schemas/support';

/**
 * One support request with requester info. Mirrors the iOS call site
 * bonayd-ios/.../Utils/SupportRequestService.swift:429 (`getRequestDetail`) — GET
 * /support/requests/:requestId. Permissive response (rule 1).
 */
export async function getSupportRequest(requestId: number): Promise<SupportRequestDetail> {
  return apiClient.get<SupportRequestDetail>(
    API_ENDPOINTS.SUPPORT.REQUEST_BY_ID.replace(':requestId', String(requestId)),
  );
}

/** Fetches only when a request id is selected (the detail modal is open). */
export function useSupportRequest(requestId: number | null) {
  return useQuery({
    queryKey: supportDetailQueryKey(requestId ?? 0),
    queryFn: () => getSupportRequest(requestId as number),
    enabled: requestId !== null,
    staleTime: 1000 * 30,
  });
}
