import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { myServicesQueryKey } from './get-my-technician-services';

/**
 * Remove one service from the technician's offered set — DELETE
 * /technician/services/remove/:serviceId (no body). Mirrors the RN call site
 * website-bonyad/src/services/TechnicianServiceService.ts:165 (`removeService`).
 * The proxy attaches the session token; a 2xx resolves void, a non-2xx surfaces as
 * `ApiError`.
 */
export async function removeService(serviceId: number): Promise<void> {
  await apiClient.delete<unknown>(
    API_ENDPOINTS.SERVICES.REMOVE_FOR_TECHNICIAN.replace(':serviceId', String(serviceId)),
  );
}

export function useRemoveService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeService,
    onSuccess: () => qc.invalidateQueries({ queryKey: myServicesQueryKey() }),
  });
}
