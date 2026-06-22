import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { TechnicianDashboard } from '../schemas/technician-dashboard';

export const technicianDashboardQueryKey = () => ['technician', 'dashboard'] as const;

/** Coerce an unknown value into a safe array (backend omissions never crash the UI). */
function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Normalise the raw payload so callers never guard for `null`: the four collections
 * default to `[]`/`{}` while every leaf field stays permissive (hard rule 1). A 4xx/5xx
 * still rejects upstream in `apiClient` as an `ApiError`.
 */
export function normalizeTechnicianDashboard(data: unknown): TechnicianDashboard {
  const raw = (data ?? {}) as Partial<TechnicianDashboard>;
  return {
    technician: raw.technician ?? null,
    summary: raw.summary ?? {},
    active_projects: asArray(raw.active_projects),
    next_payments: asArray(raw.next_payments),
    recent_bids: asArray(raw.recent_bids),
    earnings_chart: raw.earnings_chart ?? { monthly: [] },
  };
}

/**
 * SP home-dashboard snapshot — GET /technicians/me/dashboard. Verified live on the
 * dev backend (technician 444): a single object carrying `summary` KPIs +
 * `active_projects[]` + `next_payments[]` + `recent_bids[]` + `earnings_chart`.
 * Browser calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getTechnicianDashboard(): Promise<TechnicianDashboard> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.TECHNICIANS.ME_DASHBOARD);
  return normalizeTechnicianDashboard(data);
}

export function useTechnicianDashboard() {
  return useQuery({
    queryKey: technicianDashboardQueryKey(),
    queryFn: getTechnicianDashboard,
    staleTime: 1000 * 30,
  });
}
