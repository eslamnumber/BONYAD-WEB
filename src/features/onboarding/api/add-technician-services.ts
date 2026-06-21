import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

/**
 * Assign the selected leaf service IDs to the signed-in technician during post-approval
 * onboarding. POST /technician/services/add `{ serviceIds }` (mirrors the RN onboarding
 * finish `saveServices`). The proxy attaches the session token; a 2xx resolves void, a
 * non-2xx surfaces as `ApiError`.
 */
export async function addTechnicianServices(serviceIds: number[]): Promise<void> {
  await apiClient.post<unknown>(API_ENDPOINTS.SERVICES.ADD_FOR_TECHNICIAN, {
    body: { serviceIds },
  });
}
