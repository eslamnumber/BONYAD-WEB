import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { myServicesQueryKey } from './get-my-technician-services';

/**
 * Assign the chosen service IDs to the signed-in technician — POST
 * /technician/services/add `{ serviceIds }`. Mirrors the RN call site
 * website-bonyad/src/services/TechnicianServiceService.ts:132 (`addMultipleServices`).
 * The proxy attaches the session token; a 2xx resolves void, a non-2xx surfaces as
 * `ApiError`.
 */
export async function addServices(serviceIds: number[]): Promise<void> {
  await apiClient.post<unknown>(API_ENDPOINTS.SERVICES.ADD_FOR_TECHNICIAN, {
    body: { serviceIds },
  });
}

export function useAddServices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addServices,
    onSuccess: () => qc.invalidateQueries({ queryKey: myServicesQueryKey() }),
  });
}
