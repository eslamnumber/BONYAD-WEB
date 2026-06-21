import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

/**
 * GET /users/technician-status response — permissive type (rule 1: never `z.enum`
 * on a backend-controlled string). `status` is the approval state; the `has*` flags
 * drive the submitted-info checklist on the waiting screen. Mirrors the iOS
 * `TechnicianStatus` struct (TechnicianStatusService.swift:90).
 */
export type TechnicianStatus = {
  status?: string;
  profileComplete?: boolean;
  hasEmail?: boolean;
  hasDescription?: boolean;
  hasCertificates?: boolean;
  hasRegions?: boolean;
  hasPendingDataRequests?: boolean;
  onboarded?: boolean;
  recommendedPage?: string;
  name?: string;
};

/** Known approval states (the backend may send others — classify, don't enum). */
export const TECHNICIAN_STATUS = {
  PENDING: 'PENDING',
  WAITING_ADMIN_APPROVAL: 'WAITING_ADMIN_APPROVAL',
  APPROVED: 'APPROVED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const isApproved = (status?: string): boolean => status === TECHNICIAN_STATUS.APPROVED;
export const isSuspended = (status?: string): boolean => status === TECHNICIAN_STATUS.SUSPENDED;

export const technicianStatusQueryKey = () => ['technician-status'] as const;

/** Server callers (the onboarding guard) pass the Bearer token + active backend host. */
export type TechnicianStatusFetchOptions = { token?: string; baseUrl?: string };

/**
 * The signed-in technician's onboarding/approval status. Browser calls leave the
 * options unset (the proxy attaches the session JWT); server calls (the onboarding
 * route guard) pass `token` + the runtime `baseUrl`. Mirrors the iOS call site
 * TechnicianStatusService.swift:13.
 */
export async function getTechnicianStatus(
  opts?: TechnicianStatusFetchOptions,
): Promise<TechnicianStatus> {
  return apiClient.get<TechnicianStatus>(API_ENDPOINTS.USERS.TECHNICIAN_STATUS, {
    token: opts?.token,
    baseUrl: opts?.baseUrl,
  });
}

type UseTechnicianStatusOptions = { refetchInterval?: number; enabled?: boolean };

/**
 * Poll the approval status. The waiting screen passes a `refetchInterval` so it
 * advances automatically the moment an admin approves; `staleTime: 0` keeps each
 * read fresh.
 */
export function useTechnicianStatus(options?: UseTechnicianStatusOptions) {
  return useQuery({
    queryKey: technicianStatusQueryKey(),
    queryFn: () => getTechnicianStatus(),
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
    staleTime: 0,
  });
}
